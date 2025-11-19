/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { ReactNode, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { registrationApi } from '../../../api/registration.api'
import { slotApi } from '../../../api/slot.api'
import { templateApi } from '../../../api/template.api'
import { Role } from '../../../constants/Roles'
import { useAppContext } from '../../../context/AuthContext'
import { ScheduleTemplate } from '../../../types/templete.type'
import { formatDateToDDMMYYYY } from '../../../utils/utils.type'
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import RegistrationModal, { WEEKDAY_NAMES } from '../../RegistrationModal/RegistrationModal'
import StaffEmailLookup from '../../RegistrationModal/StaffEmailLookup'

interface Template {
  id: string
  name: string
}
interface Slot {
  id: string
  slotMinutes: number
  breakMinutes: number
}
interface RegistrationWeekday {
  id: string
  weekday: number
}

interface TableHeaderProps {
  children: ReactNode
  className?: string // optional, nếu muốn
}

export interface ScheduleRegistrationComponent {
  id: string
  staffId: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  notes: string
  templateId: string
  slotId: string
  template: Template
  slot: Slot
  registrationWeekdays: RegistrationWeekday[]
}

interface SchedulePayload {
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  templateId: string
  slotId: string
  notes: string
  weekdays: number[] // Sử dụng số cho các ngày (1=T2, 7=CN)
}

export const ITEMS_PER_PAGE = 10

// 1. Table components
const Table = ({ children }: { children: React.ReactNode }) => <table className='w-full table-auto'>{children}</table>
const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => (
  <thead className={className ?? 'text-left'}>{children}</thead>
)
const TableBody: React.FC<TableHeaderProps> = ({ children, className }) => (
  <thead className={className ?? 'text-left'}>{children}</thead>
)
const TableRow = ({ children }: { children: React.ReactNode }) => (
  <tr className='hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors duration-150 border-b border-gray-100 dark:border-white/[0.05] last:border-b-0'>
    {children}
  </tr>
)

const TableCell: React.FC<React.PropsWithChildren<{ isHeader?: boolean; colSpan?: number; className?: string }>> = ({
  children,
  isHeader,
  colSpan,
  className
}) => {
  const baseClasses = 'p-4 text-sm'
  const headerClasses = isHeader
    ? 'font-medium text-gray-500 text-theme-xs dark:text-gray-400'
    : 'text-gray-800 dark:text-white/90'
  const Tag = isHeader ? 'th' : 'td'
  return (
    <Tag colSpan={colSpan} className={`${baseClasses} ${headerClasses} ${className || ''}`}>
      {children}
    </Tag>
  )
}

// 2. Pagination (Simple Mock)
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}
const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <div className='flex space-x-2'>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          disabled={page === currentPage}
          className={`px-3 py-1 rounded-lg text-sm transition-colors duration-150 disabled:cursor-default disabled:opacity-50 ${
            page === currentPage
              ? 'bg-brand-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {page}
        </button>
      ))}
    </div>
  )
}

// 3. Modal (Simple Mock)

type RegistrationForm = SchedulePayload & { id?: string }

export default function BasicTableRegistration() {
  const queryClient = useQueryClient()
  const { profile } = useAppContext() // Lấy profile từ context
  const isBeautyAdvisor = profile?.role === Role.BEAUTY_ADVISOR

  // --- STATE QUẢN LÝ ---
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState<ScheduleRegistrationComponent | null>(null)
  const [isViewMode, setIsViewMode] = useState(false) // State cho chế độ View Detail

  const { data: slotsData } = useQuery<Slot[]>({
    queryKey: ['slots'],
    queryFn: async () => {
      const res = await slotApi.getSlots()
      console.log('slot', res.data.data)

      return res.data.data // data.data là mảng ScheduleTemplate[]
    }
  })

  const { data: templatesData } = useQuery<ScheduleTemplate[]>({
    queryKey: ['templates'],
    queryFn: async () => {
      const res = await templateApi.getTemplates()
      console.log('templates', res.data.data)

      return res.data.data // data.data là mảng ScheduleTemplate[]
    }
  })

  // --- HÀM TRUY VẤN DỰA TRÊN VAI TRÒ ---
  const fetchRegistrations = async () => {
    // Nếu là BeautyAdvisor, chỉ lấy lịch của mình
    if (isBeautyAdvisor && profile?.userId) {
      console.log(`Fetching registrations for Staff ID: ${profile.userId}`)
      const res = await registrationApi.getRegistrationByBeatyAdvisorId(profile.userId)
      return res.data.data
    }

    // Nếu là ScheduleManager hoặc vai trò khác, lấy tất cả
    console.log('Fetching all registrations...')
    const res = await registrationApi.getRegistration()
    return res.data.data
  }

  // --- API READ (R) ---
  const {
    data: registrationsResponse,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['registrations', profile?.role, profile?.userId],
    queryFn: fetchRegistrations,
    enabled: !!profile,
    staleTime: 1000 * 60 * 5
  })

  const allRegistrations = registrationsResponse || []

  // --- LỌC VÀ PHÂN TRANG ---
  const filteredAndPaginatedData = useMemo(() => {
    // 1. Lọc theo tên Template
    const lowercasedSearchTerm = searchTerm.toLowerCase()
    const filtered = allRegistrations.filter((reg) => reg.template.name.toLowerCase().includes(lowercasedSearchTerm))

    // 2. Phân trang
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    return {
      totalItems: filtered.length,
      data: filtered.slice(startIndex, endIndex)
    }
  }, [allRegistrations, searchTerm, currentPage])

  // --- API MUTATIONS (C, U, D) ---

  // Mutation cho Create và Update
  const { mutate: saveRegistration } = useMutation({
    mutationFn: (data: RegistrationForm) => {
      // Logic mặc định: nếu không phải BA, cần thêm staffId vào form.
      // ⚠️ Giả định StaffId được chọn trong form nếu là Schedule Manager.

      if (data.id) {
        // Update
        return registrationApi.updateRegistration(data.id, data)
      }
      // Create
      // Thêm StaffId của người tạo (nếu cần) hoặc BAId nếu tạo cho người khác
      const payload: SchedulePayload = data
      return registrationApi.createRegistration(payload)
    },
    onSuccess: (res) => {
      toast.success(res.data.message || 'Registration saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      setIsModalOpen(false) // Đóng modal sau khi thành công
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error saving registration.')
    }
  })

  // Mutation cho Delete
  const { mutate: deleteRegistration } = useMutation({
    mutationFn: (id: string) => registrationApi.deleteRegistration(id),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Registration deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error deleting registration.')
    }
  })

  // --- HÀM XỬ LÝ SỰ KIỆN ---

  const handleOpenDetailModal = (reg: ScheduleRegistrationComponent, mode: 'view' | 'edit') => {
    setSelectedRegistration(reg)
    setIsViewMode(mode === 'view')
    setIsModalOpen(true)
  }

  const handleCreateNew = () => {
    setSelectedRegistration(null) // Reset để mở chế độ Create
    setIsViewMode(false)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (reg: ScheduleRegistrationComponent) => {
    setSelectedRegistration(reg)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedRegistration?.id) {
      deleteRegistration(selectedRegistration.id)
      setIsConfirmOpen(false)
      setSelectedRegistration(null)
    }
  }

  if (isLoading)
    return <div className='p-6 text-center text-lg text-brand-500'>Loading Work Schedule Registrations...</div>

  if (isError)
    return <div className='p-6 text-center text-lg text-red-500'>Failed to load Work Schedule Registrations.</div>

  return (
    <>
      <div className='flex justify-between items-center mb-5'>
        {/* Thanh Tìm kiếm */}
        <input
          type='text'
          placeholder='Search by Template Name...'
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1) // Reset trang khi tìm kiếm
          }}
          className='w-1/3 min-w-[200px] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
        />

        {/* Nút Tạo mới */}
        <button
          onClick={handleCreateNew}
          className='btn btn-primary flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-brand-xs hover:bg-brand-600 transition-colors'
        >
          Add new registration
        </button>
      </div>

      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-lg'>
        <div className='max-w-full overflow-x-auto'>
          <Table>
            {/* Table Header */}
            <TableHeader className='border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.05]'>
              <TableRow>
                <TableCell
                  isHeader
                  className='px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
                >
                  Staff Email
                </TableCell>
                <TableCell
                  isHeader
                  className='px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
                >
                  Template
                </TableCell>
                <TableCell
                  isHeader
                  className='px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
                >
                  Slot (Phút)
                </TableCell>
                <TableCell
                  isHeader
                  className='px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
                >
                  Time Range
                </TableCell>
                <TableCell
                  isHeader
                  className='px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
                >
                  Weekdays
                </TableCell>
                <TableCell
                  isHeader
                  className='px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400'
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className='divide-y divide-gray-100 dark:divide-white/[0.05]'>
              {filteredAndPaginatedData.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className='py-4 text-center text-gray-500'>
                    {searchTerm ? 'Không tìm thấy đăng ký nào.' : 'Chưa có đăng ký lịch làm việc nào.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndPaginatedData.data.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell className='px-5 py-4 sm:px-6 text-start font-medium text-gray-800 dark:text-white/90 truncate max-w-[100px]'>
                      <StaffEmailLookup staffId={reg.staffId} />
                    </TableCell>
                    <TableCell className='px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 font-semibold'>
                      {reg.template.name}
                    </TableCell>
                    <TableCell className='px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400'>
                      {reg.slot.slotMinutes}p ({reg.slot.breakMinutes}p nghỉ)
                    </TableCell>
                    <TableCell className='px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400'>
                      {formatDateToDDMMYYYY(reg.startDate)} - {formatDateToDDMMYYYY(reg.endDate)}
                    </TableCell>
                    <TableCell className='px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400'>
                      {reg.registrationWeekdays.map((w) => WEEKDAY_NAMES[w.weekday]).join(', ')}
                    </TableCell>
                    <TableCell className='px-4 py-3 text-end'>
                      <div className='flex justify-end gap-2'>
                        {/* Nút View Detail */}
                        <button
                          onClick={() => handleOpenDetailModal(reg as any, 'view')}
                          className='text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 text-sm p-1'
                          title='View Details'
                        >
                          View
                        </button>
                        {/* Nút Edit */}
                        <button
                          onClick={() => handleOpenDetailModal(reg as any, 'edit')}
                          className='text-brand-500 hover:text-brand-700 dark:hover:text-brand-300 text-sm p-1'
                          title='Edit Registration'
                        >
                          Edit
                        </button>
                        {/* Nút Delete */}
                        <button
                          onClick={() => handleDeleteClick(reg as any)}
                          className='text-red-500 hover:text-red-700 dark:hover:text-red-300 text-sm p-1'
                          title='Delete Registration'
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredAndPaginatedData.totalItems > ITEMS_PER_PAGE && (
          <div className='p-4 border-t border-gray-100 dark:border-white/[0.05] flex justify-center'>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredAndPaginatedData.totalItems / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <RegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        registration={selectedRegistration}
        onSave={saveRegistration}
        isViewMode={isViewMode}
        templates={templatesData ?? []}
        slots={slotsData || []}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Xác nhận Xóa Đăng ký Lịch'
        message={`Bạn có chắc muốn xóa đăng ký lịch làm việc cho template "${selectedRegistration?.template.name}"? Hành động này không thể hoàn tác.`}
      />
    </>
  )
}
