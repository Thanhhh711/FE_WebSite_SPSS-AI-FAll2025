/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { ReactNode, useMemo, useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { registrationApi } from '../../../api/registration.api'
import { slotApi } from '../../../api/slot.api'
import { templateApi } from '../../../api/template.api'
import { Role } from '../../../constants/Roles'
import { useAppContext } from '../../../context/AuthContext'
import { ScheduleTemplate } from '../../../types/templete.type'
import { formatDateToDDMMYYYY } from '../../../utils/validForm'
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import RegistrationModal, { WEEKDAY_NAMES } from '../../RegistrationModal/RegistrationModal'
import StaffEmailLookup from '../../../utils/StaffEmailLookup'
import userApi from '../../../api/user.api' // Đảm bảo import userApi

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
  weekdays: number[]
}

// Định nghĩa kiểu dữ liệu cho Beauty Advisor (giả định)
interface BeautyAdvisor {
  userId: string
  emailAddress: string
  // ... các trường khác
}

// HÀM TIỆN ÍCH: Trích xuất phần ngày (YYYY-MM-DD) từ chuỗi ISO Date
const getDatePart = (isoString: string) => (isoString ? isoString.substring(0, 10) : '')

export const ITEMS_PER_PAGE = 10

const Table = ({ children }: { children: React.ReactNode }) => <table className='w-full table-auto'>{children}</table>
const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => (
  <thead className={className ?? 'text-left'}>{children}</thead>
)
const TableBody: React.FC<TableHeaderProps> = ({ children, className }) => (
  <tbody className={className ?? 'text-left'}>{children}</tbody> // FIX: Sửa lại thành tbody
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

type RegistrationForm = SchedulePayload & { id?: string }

export default function BasicTableRegistration() {
  const queryClient = useQueryClient()
  const { profile } = useAppContext()
  const isBeautyAdvisor = profile?.role === Role.BEAUTY_ADVISOR

  // STATE LỌC MỚI
  const [beautyAdvisors, setBeautyAdvisors] = useState<BeautyAdvisor[]>([])
  const [selectedBAId, setSelectedBAId] = useState<string | undefined>(undefined)
  const [filterStartDate, setFilterStartDate] = useState<string>('') // YYYY-MM-DD
  const [filterEndDate, setFilterEndDate] = useState<string>('') // YYYY-MM-DD

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState<ScheduleRegistrationComponent | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)

  // FETCH DANH SÁCH BEAUTY ADVISOR
  useEffect(() => {
    const fetchBAs = async () => {
      try {
        const response = await userApi.getBeatyAdvisor()
        const allOption = { userId: 'all', emailAddress: 'All Staff' }
        setBeautyAdvisors([allOption, ...response.data.data])
        setSelectedBAId('all')
      } catch (error) {
        toast.error('Error fetching Staff list.')
        setBeautyAdvisors([{ userId: 'all', emailAddress: 'All Staff' }])
        setSelectedBAId('all')
      }
    }

    if (!isBeautyAdvisor) {
      fetchBAs()
    } else if (profile?.userId) {
      // Nếu là BA, mặc định chỉ xem lịch của mình
      setSelectedBAId(profile.userId)
    }
  }, [isBeautyAdvisor, profile?.userId])

  const { data: slotsData } = useQuery<Slot[]>({
    queryKey: ['slots'],
    queryFn: async () => {
      const res = await slotApi.getSlots()
      console.log('slot', res.data.data)

      return res.data.data
    }
  })

  const { data: templatesData } = useQuery<ScheduleTemplate[]>({
    queryKey: ['templates'],
    queryFn: async () => {
      const res = await templateApi.getTemplates()
      console.log('templates', res.data.data)

      return res.data.data
    }
  })

  const fetchRegistrations = async () => {
    // Logic fetch giữ nguyên, lọc theo BA/Ngày sẽ xử lý client-side trong useMemo
    if (isBeautyAdvisor && profile?.userId) {
      console.log(`Fetching registrations for Staff ID: ${profile.userId}`)
      // Giả định API này fetch lịch cho BA hiện tại
      const res = await registrationApi.getRegistrationByBeatyAdvisorId(profile.userId)
      return res.data.data
    }

    console.log('Fetching all registrations...')
    const res = await registrationApi.getRegistration()
    return res.data.data
  }

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

  // CẬP NHẬT LOGIC LỌC
  const filteredAndPaginatedData = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase()
    let filtered = allRegistrations.filter((reg) => reg.template.name.toLowerCase().includes(lowercasedSearchTerm))

    // 1. Lọc theo Beauty Advisor
    if (selectedBAId && selectedBAId !== 'all') {
      filtered = filtered.filter((reg) => reg.staffId === selectedBAId)
    }

    // 2. Lọc theo Ngày Bắt đầu
    if (filterStartDate) {
      // Đảm bảo registration startDate (ISO string) >= filterStartDate (YYYY-MM-DD string)
      filtered = filtered.filter((reg) => getDatePart(reg.startDate) >= filterStartDate)
    }

    // 3. Lọc theo Ngày Kết thúc
    if (filterEndDate) {
      // Đảm bảo registration endDate (ISO string) <= filterEndDate (YYYY-MM-DD string)
      filtered = filtered.filter((reg) => getDatePart(reg.endDate) <= filterEndDate)
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    return {
      totalItems: filtered.length,
      data: filtered.slice(startIndex, endIndex)
    }
  }, [allRegistrations, searchTerm, currentPage, selectedBAId, filterStartDate, filterEndDate]) // Thêm dependencies

  const { mutate: saveRegistration } = useMutation({
    mutationFn: (data: RegistrationForm) => {
      if (data.id) {
        return registrationApi.updateRegistration(data.id, data)
      }

      const payload: SchedulePayload = data

      if (profile?.role === Role.BEAUTY_ADVISOR) {
        return registrationApi.createRegistration(payload)
      }

      return registrationApi.createRegistrationByStaff(profile?.userId as string, payload)
    },
    onSuccess: (res) => {
      toast.success(res.data.message || 'Registration saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      setIsModalOpen(false)
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error saving registration.')
    }
  })

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

  const handleOpenDetailModal = (reg: ScheduleRegistrationComponent, mode: 'view' | 'edit') => {
    setSelectedRegistration(reg)
    setIsViewMode(mode === 'view')
    setIsModalOpen(true)
  }

  const handleCreateNew = () => {
    setSelectedRegistration(null)
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

  if (isLoading || selectedBAId === undefined)
    return <div className='p-6 text-center text-lg text-brand-500'>Loading Work Schedule Registrations...</div>

  if (isError)
    return <div className='p-6 text-center text-lg text-red-500'>Failed to load Work Schedule Registrations.</div>

  return (
    <>
      <div className='flex justify-between items-center mb-5'>
        <div className='flex items-center gap-3'>
          {/* Thanh Tìm kiếm */}
          <input
            type='text'
            placeholder='Search by Template Name...'
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className='dark:text-white w-1/3 min-w-[200px] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
          />

          {/* SELECT CHỌN BEAUTY ADVISOR */}
          {!isBeautyAdvisor && (
            <select
              className='w-[200px] dark:text-white rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none'
              value={selectedBAId || 'all'}
              onChange={(e) => {
                setSelectedBAId(e.target.value)
                setCurrentPage(1)
              }}
              disabled={!beautyAdvisors.length}
            >
              {!beautyAdvisors.length && <option value='all'>Loading Staff...</option>}
              {beautyAdvisors.map((ba) => (
                <option key={ba.userId} value={ba.userId}>
                  {ba.emailAddress}
                </option>
              ))}
            </select>
          )}

          {/* START DATE */}

          <label className='mb-1 text-sm font-medium text-gray-700 dark:text-gray-300'>Start Date</label>
          <input
            type='date'
            placeholder='Start Date'
            value={filterStartDate}
            onChange={(e) => {
              setFilterStartDate(e.target.value)
              setCurrentPage(1)
            }}
            className='dark:text-white  w-[150px] rounded-lg border border-gray-300 dark:border-gray-700 
      bg-white dark:bg-gray-900 px-4 py-2.5 text-sm 
      focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          />

          {/* END DATE */}

          <label className='mb-1 text-sm font-medium text-gray-700 dark:text-gray-300'>End Date</label>
          <input
            type='date'
            placeholder='End Date'
            value={filterEndDate}
            onChange={(e) => {
              setFilterEndDate(e.target.value)
              setCurrentPage(1)
            }}
            className='dark:text-white w-[150px] rounded-lg border border-gray-300 dark:border-gray-700 
      bg-white dark:bg-gray-900 px-4 py-2.5 text-sm 
      focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          />
        </div>

        {/* Nút Tạo mới */}
        {profile?.role !== Role.ADMIN && (
          <button
            onClick={handleCreateNew}
            className='btn btn-primary flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-brand-xs hover:bg-brand-600 transition-colors'
          >
            Add new registration
          </button>
        )}
      </div>

      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-lg'>
        <div className='px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-end'>
          <span className='text-sm font-semibold text-indigo-700 dark:text-indigo-400'>
            Total Registration Found: **{filteredAndPaginatedData.totalItems}**
          </span>
        </div>
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
                        {profile?.role !== Role.ADMIN && (
                          <>
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
                          </>
                        )}
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
        title='Confirm Schedule Registration Deletion'
        message={`Are you sure you want to delete the schedule registration for template "${selectedRegistration?.template.name}"? This action cannot be undone.`}
      />
    </>
  )
}
