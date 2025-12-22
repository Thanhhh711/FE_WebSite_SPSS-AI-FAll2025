/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'

// Giả định import các components UI tương tự mẫu BasicTableRoom.tsx
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'

import { CalendarIcon, Edit3, Filter, MapPin, Plus, Search, Trash2, User, Zap } from 'lucide-react'
import { scheduleApi } from '../../../api/schedulars.api'
import userApi from '../../../api/user.api'
import { Role } from '../../../constants/Roles'
import { WorkScheduleStatus } from '../../../constants/SchedularConstants'
import { useAppContext } from '../../../context/AuthContext'
import { ScheduleWork } from '../../../types/appoinment.type'
import StaffEmailLookup from '../../../utils/StaffEmailLookup'
import { formatDateToDDMMYYYY } from '../../../utils/validForm'
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import Pagination from '../../pagination/Pagination'
import AppointmentDetailModal from '../../SchedulaModal/AppointmentDetailModal'
import { GenerateScheduleFromRegistrationModal } from '../../SchedulaModal/GenerateScheduleFromRegistrationModal'
import ScheduleFormModal from '../../SchedulaModal/ScheduleFormModal'

const ITEMS_PER_PAGE = 10

// Giả định các hàm toast/message đơn giản (không dùng Ant Design)
const showToast = (msg: string, type: 'success' | 'error') => {
  console.log(`${type.toUpperCase()}: ${msg}`)
}

// Định nghĩa kiểu dữ liệu cho Beauty Advisor (giả định)
interface BeautyAdvisor {
  userId: string
  emailAddress: string
  // ... các trường khác
}

// HÀM TIỆN ÍCH MỚI: Trích xuất ngày YYYY-MM-DD để so sánh
const getYYYYMMDD = (dateString: string) => {
  if (!dateString) return ''
  // Giả định dateString là ISO format: YYYY-MM-DDTHH:MM:SSZ
  return dateString.substring(0, 10)
}

export default function WorkSchedulesManagement() {
  const queryClient = useQueryClient()

  // STATE MỚI: Lọc theo ngày
  const [filterDate, setFilterDate] = useState<string>('') // Định dạng YYYY-MM-DD

  // STATE ĐÃ CÓ: Danh sách Beauty Advisor và ID được chọn
  const [beautyAdvisors, setBeautyAdvisors] = useState<BeautyAdvisor[]>([])
  const [selectedBAId, setSelectedBAId] = useState<string | undefined>(undefined)

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  // ... (State Management - Giữ nguyên) ...
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<WorkScheduleStatus | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleWork | null>(null)
  const [isApptDetailOpen, setIsApptDetailOpen] = useState(false)
  const [selectedScheduleForAppt, setSelectedScheduleForAppt] = useState<ScheduleWork | null>(null)

  const [staffEmail, setStaffEmail] = useState('')
  const { profile } = useAppContext()

  const CURRENT_USER_ROLE = profile?.role
  const CURRENT_USER_ID = profile?.userId as string

  const canModify =
    profile?.role !== Role.STORE_STAFF && profile?.role !== Role.ADMIN && profile?.role !== Role.BEAUTY_ADVISOR

  // FETCH DANH SÁCH BEAUTY ADVISOR
  useEffect(() => {
    const fetchBAs = async () => {
      try {
        const response = await userApi.getBeatyAdvisor()

        const allOption = { userId: 'all', emailAddress: 'All Beauty Advisors' }
        setBeautyAdvisors([allOption, ...response.data.data])

        setSelectedBAId('all')
      } catch (error) {
        showToast('Error fetching Beauty Advisors.', 'error')
        setBeautyAdvisors([{ userId: 'all', emailAddress: 'All Beauty Advisors' }])
        setSelectedBAId('all')
      }
    }

    if (CURRENT_USER_ROLE === Role.BEAUTY_ADVISOR) {
      setSelectedBAId(CURRENT_USER_ID)
    } else {
      fetchBAs()
    }
  }, [CURRENT_USER_ROLE, CURRENT_USER_ID])

  // LOGIC FETCH DỰA TRÊN VAI TRÒ VÀ SELECTED_BA_ID
  const fetchFn = useCallback(() => {
    if (CURRENT_USER_ROLE === Role.BEAUTY_ADVISOR) {
      return scheduleApi.getScheduleByIdBeautyAdvisor(CURRENT_USER_ID)
    }

    if (selectedBAId && selectedBAId !== 'all') {
      return scheduleApi.getScheduleByIdBeautyAdvisor(selectedBAId)
    }

    return scheduleApi.getSchedule()
  }, [CURRENT_USER_ROLE, CURRENT_USER_ID, selectedBAId])

  const {
    data: schedulesResponse,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['workSchedules', CURRENT_USER_ROLE, CURRENT_USER_ID, selectedBAId],
    queryFn: fetchFn,
    staleTime: 1000 * 60
  })
  const allSchedules = schedulesResponse?.data.data || []

  const filteredAndPaginatedSchedules = useMemo(() => {
    const schedules = allSchedules as ScheduleWork[]

    const lowercasedSearchTerm = searchTerm.toLowerCase()

    let filtered = schedules.filter((schedule) =>
      (schedule.room?.roomName ?? '').toLowerCase().includes(lowercasedSearchTerm)
    )

    if (filterStatus !== undefined) {
      filtered = filtered.filter((schedule) => schedule.status === filterStatus)
    }

    // LOGIC LỌC MỚI THEO NGÀY
    if (filterDate) {
      filtered = filtered.filter((schedule) => getYYYYMMDD(schedule.shiftDate) === filterDate)
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    return {
      totalItems: filtered.length,
      data: filtered.slice(startIndex, endIndex)
    }
  }, [allSchedules, searchTerm, filterStatus, filterDate, currentPage])

  const totalPages = Math.ceil(filteredAndPaginatedSchedules.totalItems / ITEMS_PER_PAGE)

  // ... (các hàm handle khác giữ nguyên)

  const handleOpenGenerateModal = () => {
    setIsGenerateModalOpen(true)
  }

  const handleOpenModal = (schedule: ScheduleWork | null) => {
    setSelectedSchedule(schedule)
    setIsModalOpen(true)
  }
  const handleDeleteClick = (schedule: ScheduleWork) => {
    setSelectedSchedule(schedule)
    setIsConfirmOpen(true)
  }
  const handleConfirmDelete = () => {
    if (selectedSchedule?.id) {
      deleteSchedule(selectedSchedule.id)
    }
  }

  useEffect(() => {
    if (selectedSchedule?.staffId) {
      userApi.getUsersById(selectedSchedule.staffId).then((res) => {
        setStaffEmail(res.data.data.emailAddress)
      })
    }
  }, [selectedSchedule?.staffId])

  const { mutate: deleteSchedule } = useMutation({
    mutationFn: (id: string) => scheduleApi.deleteSchedule(id),
    onSuccess: (data) => {
      showToast(data.data.message, 'success')
      queryClient.invalidateQueries({ queryKey: ['workSchedules'] })
      refetch()
      setIsConfirmOpen(false)
      setSelectedSchedule(null)
    },
    onError: (error: any) => {
      showToast(error.data?.res || 'Error deleting schedule.', 'error')
    }
  })

  // Hàm hiển thị Tag trạng thái (Giữ nguyên)
  const getStatusTag = (record: ScheduleWork) => {
    const appointmentCount = record.appointments ? record.appointments.length : 0
    let colorClass = ''
    let statusText = ''

    switch (record.status) {
      case WorkScheduleStatus.Active:
        colorClass = 'bg-green-100 text-green-800'
        statusText = 'Active'
        break
      case WorkScheduleStatus.Booked:
        colorClass = 'bg-blue-100 text-blue-800'
        statusText = `Booked (${appointmentCount})`
        break
      case WorkScheduleStatus.InActive:
        colorClass = 'bg-red-100 text-red-800'
        statusText = 'InActive'
        break
      default:
        colorClass = 'bg-gray-100 text-gray-800'
        statusText = 'Unknown'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {statusText}
      </span>
    )
  }

  const handleViewAppointmentsClick = (schedule: ScheduleWork) => {
    setSelectedScheduleForAppt(schedule)
    setIsApptDetailOpen(true)
  }

  // --- RENDERING ---

  if (isLoading || selectedBAId === undefined)
    return (
      <div className='p-6 text-center text-lg text-blue-500'>
        <div className='animate-spin inline-block w-8 h-8 border-4 border-t-4 border-blue-500 border-gray-200 rounded-full'></div>{' '}
        Loading work schedules...
      </div>
    )
  if (isError) return <div className='p-6 text-center text-lg text-red-500'>Error loading work schedules.</div>

  return (
    <>
      {/* HEADER SECTION: Title & Main Filters */}
      <div className='flex flex-col gap-6 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-gray-800 transition-all mb-6'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
          <div className='flex items-center gap-5'>
            <div>
              <h1 className='text-2xl font-black text-slate-800 dark:text-white tracking-tight'>Work Schedules</h1>
              <p className='text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1'>
                Shift Management • {allSchedules.length} Total Slots
              </p>
            </div>
          </div>

          {canModify && (
            <div className='flex flex-wrap gap-3'>
              <button
                onClick={handleOpenGenerateModal}
                className='bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all active:scale-95 border border-emerald-100 dark:border-emerald-800'
              >
                <Zap size={18} /> Auto-Generate
              </button>
              <button
                onClick={() => handleOpenModal(null)}
                className='bg-slate-900 dark:bg-blue-600 hover:scale-[1.02] text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95'
              >
                <Plus size={18} /> Add Schedule
              </button>
            </div>
          )}
        </div>

        {/* FILTER BAR */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-slate-50 dark:border-gray-800'>
          <div className='relative group'>
            <Search
              className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors'
              size={18}
            />
            <input
              type='text'
              placeholder='Search by Room...'
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className='pl-12 pr-4 py-3 bg-slate-50 dark:bg-gray-800/50 border-none rounded-xl focus:ring-4 ring-blue-500/10 w-full transition-all text-sm font-bold dark:text-white outline-none'
            />
          </div>

          {CURRENT_USER_ROLE !== Role.BEAUTY_ADVISOR && (
            <div className='relative'>
              <User size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none' />
              <select
                className='pl-12 pr-4 py-3 bg-slate-50 dark:bg-gray-800/50 border-none rounded-xl focus:ring-4 ring-blue-500/10 w-full transition-all text-sm font-bold dark:text-white outline-none appearance-none'
                value={selectedBAId || 'all'}
                onChange={(e) => {
                  setSelectedBAId(e.target.value)
                  setCurrentPage(1)
                }}
                disabled={!beautyAdvisors.length || selectedBAId === undefined}
              >
                {!beautyAdvisors.length && <option value='all'>Loading Staff...</option>}
                {beautyAdvisors.map((ba) => (
                  <option key={ba.userId} value={ba.userId}>
                    {ba.emailAddress}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className='relative'>
            <CalendarIcon
              size={18}
              className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none'
            />
            <input
              type='date'
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value)
                setCurrentPage(1)
              }}
              className='pl-12 pr-4 py-3 bg-slate-50 dark:bg-gray-800/50 border-none rounded-xl focus:ring-4 ring-blue-500/10 w-full transition-all text-sm font-bold dark:text-white outline-none'
            />
          </div>

          <div className='relative'>
            <Filter size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none' />
            <select
              className='pl-12 pr-4 py-3 bg-slate-50 dark:bg-gray-800/50 border-none rounded-xl focus:ring-4 ring-blue-500/10 w-full transition-all text-sm font-bold dark:text-white outline-none appearance-none'
              value={filterStatus === undefined ? '' : filterStatus.toString()}
              onChange={(e) => {
                const value = e.target.value
                setFilterStatus(value === '' ? undefined : (parseInt(value) as WorkScheduleStatus))
                setCurrentPage(1)
              }}
            >
              <option value=''>All Statuses</option>
              <option value={WorkScheduleStatus.Active.toString()}>Active</option>
              <option value={WorkScheduleStatus.Booked.toString()}>Booked</option>
              <option value={WorkScheduleStatus.InActive.toString()}>InActive</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className='bg-white dark:bg-gray-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-gray-800 overflow-hidden'>
        <div className='max-w-full overflow-x-auto'>
          <Table>
            <TableHeader className='bg-slate-50/50 dark:bg-gray-800/50'>
              <TableRow className='border-none'>
                <TableCell
                  isHeader
                  className='px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'
                >
                  Staff
                </TableCell>
                <TableCell
                  isHeader
                  className='px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'
                >
                  Schedule
                </TableCell>
                <TableCell
                  isHeader
                  className='px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'
                >
                  Location
                </TableCell>
                <TableCell
                  isHeader
                  className='px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className='px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right'
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredAndPaginatedSchedules.data.length === 0 ? (
                <TableRow>
                  <TableCell className='py-20 text-center text-slate-400 font-bold italic uppercase tracking-widest'>
                    No schedules match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndPaginatedSchedules.data.map((schedule) => (
                  <TableRow
                    key={schedule.id}
                    className='group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all border-b border-slate-50 dark:border-gray-800 last:border-0'
                  >
                    <TableCell className='px-8 py-7'>
                      <div className='font-black text-slate-800 dark:text-white text-sm'>
                        <StaffEmailLookup staffId={schedule.staffId} />
                      </div>
                    </TableCell>

                    <TableCell className='px-8 py-7'>
                      <div className='flex flex-col gap-1'>
                        <span className='font-bold text-slate-700 dark:text-slate-200 text-sm'>
                          {formatDateToDDMMYYYY(schedule.shiftDate)}
                        </span>
                        <span className='text-[11px] font-black text-blue-500 uppercase tracking-tighter bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md w-fit italic'>
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className='px-8 py-7'>
                      <div className='flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium text-sm'>
                        <MapPin size={14} className='text-slate-300' />
                        {schedule.room?.roomName || 'N/A'}
                      </div>
                    </TableCell>

                    <TableCell className='px-8 py-7'>{getStatusTag(schedule)}</TableCell>

                    <TableCell className='px-8 py-7 text-right'>
                      <div className='flex justify-end gap-2.5'>
                        <button
                          onClick={() => handleViewAppointmentsClick(schedule)}
                          className='px-4 py-2 text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-900/40 rounded-xl hover:bg-blue-100 transition-all border border-blue-100 dark:border-blue-800'
                        >
                          Appts ({schedule.appointments?.length || 0})
                        </button>
                        {canModify && (
                          <>
                            <button
                              onClick={() => handleOpenModal(schedule)}
                              className='p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-2xl transition-all shadow-sm bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700'
                              title='Edit'
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(schedule)}
                              className='p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-800 rounded-2xl transition-all shadow-sm bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700'
                              title='Delete'
                            >
                              <Trash2 size={16} />
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

        {filteredAndPaginatedSchedules.totalItems > ITEMS_PER_PAGE && (
          <div className='p-10 flex justify-center bg-slate-50/30 dark:bg-transparent border-t dark:border-gray-800'>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {/* Modal Thêm/Cập nhật */}
      <ScheduleFormModal
        refetch={refetch}
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        scheduleToEdit={selectedSchedule}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['workSchedules'] })}
      />

      {/* Modal Xác nhận Xóa */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Confirm Schedule Deletion'
        message={
          selectedSchedule
            ? `Are you sure you want to delete the schedule for Staff Email ${staffEmail} on ${formatDateToDDMMYYYY(selectedSchedule.shiftDate)}?`
            : ''
        }
      />

      <AppointmentDetailModal
        isOpen={isApptDetailOpen}
        onClose={() => setIsApptDetailOpen(false)}
        scheduleId={selectedScheduleForAppt?.id || null}
        staffId={selectedScheduleForAppt?.staffId || 'N/A'}
        shiftDate={selectedScheduleForAppt?.shiftDate || ''}
      />

      <GenerateScheduleFromRegistrationModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        // selectedBAId={selectedBAId === 'all' ? undefined : selectedBAId} // Truyền ID BA đang được chọn (trừ 'all')
        onScheduleGenerated={refetch}
      />
    </>
  )
}
