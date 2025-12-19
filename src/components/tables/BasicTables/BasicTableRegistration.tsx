/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Calendar, Clock, Edit, Eye, Plus, Search, Trash2, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { registrationApi } from '../../../api/registration.api'
import { slotApi } from '../../../api/slot.api'
import { templateApi } from '../../../api/template.api'
import userApi from '../../../api/user.api'
import { Role } from '../../../constants/Roles'
import { useAppContext } from '../../../context/AuthContext'
import StaffEmailLookup from '../../../utils/StaffEmailLookup'
import { formatDateToDDMMYYYY } from '../../../utils/validForm'
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import RegistrationModal, { WEEKDAY_NAMES } from '../../RegistrationModal/RegistrationModal'

// Giữ nguyên các Interface cũ của bạn...
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
  weekday: number
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
type RegistrationForm = any
export const ITEMS_PER_PAGE = 8

const getDatePart = (isoString: string) => (isoString ? isoString.substring(0, 10) : '')

export default function BasicTableRegistration() {
  const queryClient = useQueryClient()
  const { profile } = useAppContext()
  const isBeautyAdvisor = profile?.role === Role.BEAUTY_ADVISOR

  const [beautyAdvisors, setBeautyAdvisors] = useState<any[]>([])
  const [selectedBAId, setSelectedBAId] = useState<string | undefined>('all')
  const [filterStartDate, setFilterStartDate] = useState<string>('')
  const [filterEndDate, setFilterEndDate] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState<ScheduleRegistrationComponent | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)

  // Fetch dữ liệu API (Giữ nguyên logic của bạn)
  useEffect(() => {
    const fetchBAs = async () => {
      try {
        const response = await userApi.getBeatyAdvisor()
        setBeautyAdvisors([{ userId: 'all', emailAddress: 'All Staff Members' }, ...response.data.data])
      } catch (error) {
        toast.error('Error fetching staff list')
      }
    }
    if (!isBeautyAdvisor) fetchBAs()
    else if (profile?.userId) setSelectedBAId(profile.userId)
  }, [isBeautyAdvisor, profile?.userId])

  const { data: slotsData } = useQuery({
    queryKey: ['slots'],
    queryFn: () => slotApi.getSlots().then((res) => res.data.data)
  })
  const { data: templatesData } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templateApi.getTemplates().then((res) => res.data.data)
  })
  const { data: registrationsResponse, isLoading } = useQuery({
    queryKey: ['registrations', profile?.userId],
    queryFn: async () => {
      const res = isBeautyAdvisor
        ? await registrationApi.getRegistrationByBeatyAdvisorId(profile!.userId)
        : await registrationApi.getRegistration()
      return res.data.data as ScheduleRegistrationComponent[]
    },
    enabled: !!profile
  })

  const allRegistrations = registrationsResponse || []

  // Logic lọc dữ liệu (Giữ nguyên)
  const filteredAndPaginatedData = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase()

    // Bước 1: Lọc theo tên Template (Search bar)
    let filtered = allRegistrations.filter((reg) => reg.template.name.toLowerCase().includes(lowercasedSearchTerm))

    // Bước 2: Lọc theo Beauty Advisor (Dropdown lọc nhân viên)
    // Đảm bảo selectedBAId không phải là 'all' thì mới lọc theo staffId
    if (selectedBAId && selectedBAId !== 'all') {
      filtered = filtered.filter((reg) => reg.staffId === selectedBAId)
    }

    // Bước 3: Lọc theo khoảng ngày (Nếu có)
    if (filterStartDate) {
      filtered = filtered.filter((reg) => getDatePart(reg.startDate) >= filterStartDate)
    }
    if (filterEndDate) {
      filtered = filtered.filter((reg) => getDatePart(reg.endDate) <= filterEndDate)
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return {
      totalItems: filtered.length,
      data: filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    }
  }, [allRegistrations, searchTerm, currentPage, selectedBAId, filterStartDate, filterEndDate])
  // Mutation (Giữ nguyên logic của bạn)
  const { mutate: deleteRegistration } = useMutation({
    mutationFn: (id: string) => registrationApi.deleteRegistration(id),
    onSuccess: () => {
      toast.success('Deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
    }
  })

  const { mutate: saveRegistration } = useMutation({
    mutationFn: (data: RegistrationForm) => {
      const { staffId, id, ...payload } = data // Tách staffId và id ra

      if (id) {
        // Cập nhật: Luôn dùng API update, truyền cả staffId
        return registrationApi.updateRegistration(id, data)
      }

      // Tạo mới:
      if (profile?.role === Role.BEAUTY_ADVISOR) {
        // BA tự tạo cho mình (staffId đã có trong context, API này giả định lấy từ đó)
        return registrationApi.createRegistration(payload)
      }

      // Admin/Manager tạo cho nhân viên khác: Truyền staffId đã chọn
      // SỬA: Truyền staffId đã chọn thay vì profile?.userId
      return registrationApi.createRegistrationByStaff(staffId, payload)
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

  if (isLoading)
    return (
      <div className='h-96 flex items-center justify-center text-indigo-500 animate-pulse font-medium'>
        Loading workspace...
      </div>
    )

  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      {/* 1. Header & Quick Actions */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-slate-800 dark:text-white'>Schedule Registrations</h1>
          <p className='text-slate-500 text-sm'>Manage and monitor staff work shifts and templates</p>
        </div>
        {profile?.role !== Role.ADMIN && (
          <button
            onClick={() => {
              setSelectedRegistration(null)
              setIsViewMode(false)
              setIsModalOpen(true)
            }}
            className='flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95'
          >
            <Plus size={18} />
            <span className='font-semibold text-sm'>New Registration</span>
          </button>
        )}
      </div>

      {/* 2. Filter Bar Container */}
      <div className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {/* Search */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' size={16} />
            <input
              type='text'
              placeholder='Search template...'
              className='w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 ring-indigo-500 dark:text-white'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* BA Selector */}
          {!isBeautyAdvisor && (
            <div className='relative'>
              <User className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' size={16} />
              <select
                className='w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 ring-indigo-500 dark:text-white appearance-none cursor-pointer'
                value={selectedBAId}
                onChange={(e) => setSelectedBAId(e.target.value)}
              >
                {beautyAdvisors.map((ba) => (
                  <option key={ba.userId} value={ba.userId}>
                    {ba.emailAddress}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Range */}
          <div className='lg:col-span-2 flex items-center gap-2'>
            <div className='flex-1 relative'>
              <Calendar className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' size={16} />
              <input
                type='date'
                className='w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 ring-indigo-500 dark:text-white'
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>
            <span className='text-slate-400'>to</span>
            <div className='flex-1 relative'>
              <Calendar className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' size={16} />
              <input
                type='date'
                className='w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 ring-indigo-500 dark:text-white'
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Data Table */}
      <div className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-bold'>
                <th className='px-6 py-4'>Staff Member</th>
                <th className='px-6 py-4'>Work Template</th>
                <th className='px-6 py-4'>Configuration</th>
                <th className='px-6 py-4'>Duration</th>
                <th className='px-6 py-4'>Weekly Schedule</th>
                <th className='px-6 py-4 text-right'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
              {filteredAndPaginatedData.data.length > 0 ? (
                filteredAndPaginatedData.data.map((reg) => (
                  <tr key={reg.id} className='hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group'>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-xs'>
                          {reg.staffId.substring(0, 2).toUpperCase()}
                        </div>
                        <div className='text-sm font-semibold text-slate-700 dark:text-slate-200'>
                          <StaffEmailLookup staffId={reg.staffId} />
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <span className='px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700'>
                        {reg.template.name}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex flex-col'>
                        <span className='text-sm text-slate-700 dark:text-slate-300 font-medium'>
                          {reg.slot.slotMinutes} mins/slot
                        </span>
                        <span className='text-[11px] text-slate-400'>{reg.slot.breakMinutes} mins break</span>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400'>
                        <Clock size={14} className='text-slate-300' />
                        <span>
                          {formatDateToDDMMYYYY(reg.startDate)} - {formatDateToDDMMYYYY(reg.endDate)}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex flex-wrap gap-1'>
                        {reg.registrationWeekdays.map((w) => (
                          <span
                            key={w.weekday}
                            className='px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                          >
                            {WEEKDAY_NAMES[w.weekday].substring(0, 3)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <div className='flex justify-end items-center gap-1'>
                        <button
                          onClick={() => {
                            setSelectedRegistration(reg)
                            setIsViewMode(true)
                            setIsModalOpen(true)
                          }}
                          className='p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-all'
                          title='Quick View'
                        >
                          <Eye size={16} />
                        </button>

                        {profile?.role !== Role.ADMIN && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedRegistration(reg)
                                setIsViewMode(false)
                                setIsModalOpen(true)
                              }}
                              className='p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all'
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRegistration(reg)
                                setIsConfirmOpen(true)
                              }}
                              className='p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all'
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className='px-6 py-20 text-center'>
                    <div className='flex flex-col items-center gap-2 text-slate-400'>
                      <Search size={40} className='opacity-20' />
                      <p className='text-sm'>No registrations found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Pagination (Modern style) */}
        {allRegistrations.length > ITEMS_PER_PAGE && (
          <div className='px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between'>
            <p className='text-xs text-slate-500'>
              Showing{' '}
              <span className='font-bold text-slate-700 dark:text-slate-300'>
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{' '}
              to{' '}
              <span className='font-bold text-slate-700 dark:text-slate-300'>
                {Math.min(currentPage * ITEMS_PER_PAGE, allRegistrations.length)}
              </span>{' '}
              of {allRegistrations.length} results
            </p>
            <div className='flex gap-2'>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className='px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-800 transition-all'
              >
                Previous
              </button>
              <button
                disabled={currentPage >= Math.ceil(allRegistrations.length / ITEMS_PER_PAGE)}
                onClick={() => setCurrentPage((p) => p + 1)}
                className='px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all'
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals - Giữ nguyên logic truyền props của bạn */}
      <RegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        registration={selectedRegistration}
        onSave={saveRegistration}
        isViewMode={isViewMode}
        templates={templatesData ?? []}
        slots={slotsData || []}
        beautyAdvisors={beautyAdvisors}
        initialStaffId={isBeautyAdvisor ? profile?.userId : selectedBAId === 'all' ? undefined : selectedBAId}
        userRole={profile?.role}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          if (selectedRegistration) deleteRegistration(selectedRegistration.id)
          setIsConfirmOpen(false)
        }}
        title='Confirm Deletion'
        message={`Are you sure you want to delete this schedule registration?`}
      />
    </div>
  )
}
