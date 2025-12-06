/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'

// Giả định import các components UI tương tự mẫu BasicTableRoom.tsx
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'

import { scheduleApi } from '../../../api/schedulars.api'
import userApi from '../../../api/user.api'
import { Role } from '../../../constants/Roles'
import { WorkScheduleStatus } from '../../../constants/SchedularConstants'
import { useAppContext } from '../../../context/AuthContext'
import { ScheduleWork } from '../../../types/appoinment.type'
import StaffEmailLookup from '../../../utils/StaffEmailLookup'
import { formatDateToDDMMYYYY } from '../../../utils/validForm'
import AppointmentDetailModal from '../../SchedulaModal/AppointmentDetailModal'
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import ScheduleFormModal from '../../SchedulaModal/ScheduleFormModal'
import Pagination from '../../pagination/Pagination'
import { GenerateScheduleFromRegistrationModal } from '../../SchedulaModal/GenerateScheduleFromRegistrationModal'

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

  // CẬP NHẬT LOGIC LỌC
  const filteredAndPaginatedSchedules = useMemo(() => {
    const schedules = allSchedules as ScheduleWork[]

    const lowercasedSearchTerm = searchTerm.toLowerCase()
    let filtered = schedules.filter((schedule) => schedule.room.roomName.toLowerCase().includes(lowercasedSearchTerm))

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
  }, [allSchedules, searchTerm, filterStatus, filterDate, currentPage]) // THÊM filterDate vào dependency

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

  const { mutate: deleteSchedule, isPending: isDeleting } = useMutation({
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
      <h2 className='text-2xl font-bold mb-5 dark:text-white'>Work Schedule Management</h2>

      <div className='flex justify-between items-center mb-5'>
        <div className='flex items-center gap-3'>
          {/* Thanh Tìm kiếm */}
          <input
            type='text'
            placeholder='Search by Room...'
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className=' dark:text-gray-300 w-1/3 min-w-[200px] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          />

          {/* SELECT CHỌN BEAUTY ADVISOR */}
          {CURRENT_USER_ROLE !== Role.BEAUTY_ADVISOR && (
            <select
              className='w-[200px] dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none'
              value={selectedBAId || 'all'}
              onChange={(e) => {
                setSelectedBAId(e.target.value)
                setCurrentPage(1)
              }}
              disabled={!beautyAdvisors.length || selectedBAId === undefined}
            >
              {!beautyAdvisors.length && <option value='all'>Loading Beauty Advisors...</option>}
              {beautyAdvisors.map((ba) => (
                <option key={ba.userId} value={ba.userId}>
                  {ba.emailAddress}
                </option>
              ))}
            </select>
          )}

          {/* INPUT LỌC THEO NGÀY */}
          <input
            type='date'
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value)
              setCurrentPage(1)
            }}
            className='dark:text-gray-300 w-[150px] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          />

          {/* Lọc Trạng thái */}
          <select
            className='dark:text-gray-300 w-[150px] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none'
            value={filterStatus === undefined ? '' : filterStatus.toString()}
            onChange={(e) => {
              const value = e.target.value
              setFilterStatus(value === '' ? undefined : (parseInt(value) as WorkScheduleStatus))
              setCurrentPage(1)
            }}
          >
            <option value='' disabled={filterStatus !== undefined}>
              Filter by Status
            </option>
            <option value={WorkScheduleStatus.Active.toString()}>Active</option>
            <option value={WorkScheduleStatus.Booked.toString()}>Booked</option>
            <option value={WorkScheduleStatus.InActive.toString()}>InActive</option>
          </select>
        </div>

        {/* Create New Button */}
        {canModify && (
          <div className='flex gap-3'>
            <button
              onClick={() => handleOpenModal(null)}
              className='flex justify-center rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:bg-blue-600 transition-colors'
            >
              Add New Schedule
            </button>
            {/* NÚT MỚI: Generate from Registration */}
            <button
              onClick={handleOpenGenerateModal}
              className='flex justify-center rounded-lg bg-green-500 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:bg-green-600 transition-colors'
            >
              Generate from Registration
            </button>
          </div>
        )}
      </div>

      {/* ... (Phần hiển thị bảng và pagination giữ nguyên) ... */}
      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-lg'>
        <div className='flex items-center justify-end mb-4'>
          <div className='px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg'>
            <span className='text-sm font-semibold text-indigo-700 dark:text-indigo-400'>
              Total: **{allSchedules.length}**
            </span>
          </div>
        </div>
        <div className='max-w-full overflow-x-auto'>
          <Table>
            {/* Table Header */}
            <TableHeader className='dark:text-gray-300 border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.05]'>
              <TableRow>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Staff Email
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Date
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Time Slot
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Room
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Status
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Notes
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-end'>
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody>
              {filteredAndPaginatedSchedules.data.length === 0 ? (
                <TableRow>
                  <TableCell className='py-4 text-center text-gray-500'>No schedules found.</TableCell>
                </TableRow>
              ) : (
                filteredAndPaginatedSchedules.data.map((schedule) => (
                  <TableRow key={schedule.id} className='dark:text-white'>
                    <TableCell className='px-5 py-4 font-medium truncate max-w-[150px]'>
                      <StaffEmailLookup staffId={schedule.staffId} />
                    </TableCell>

                    {/* Định dạng ngày (Giữ nguyên Moment) */}
                    <TableCell className='px-4 py-3 text-start'>{formatDateToDDMMYYYY(schedule.shiftDate)}</TableCell>

                    <TableCell className='px-4 py-3 text-start'>
                      {schedule.startTime} - {schedule.endTime}
                    </TableCell>
                    <TableCell className='px-4 py-3 text-start'>{schedule.room.roomName}</TableCell>
                    <TableCell className='px-4 py-3 text-start'>{getStatusTag(schedule)}</TableCell>
                    <TableCell className='px-4 py-3 text-start truncate max-w-[100px]'>{schedule.notes}</TableCell>

                    <TableCell className='px-4 py-3 text-end'>
                      <div className='flex justify-end gap-2'>
                        {/* 🔑 Nút gọi Modal AppointmentDetailModal */}
                        <button
                          onClick={() => handleViewAppointmentsClick(schedule)}
                          className='text-sky-500 hover:text-sky-700 text-sm p-1'
                          title='View Appointments'
                        >
                          View Appts ({schedule.appointments ? schedule.appointments.length : 0})
                        </button>

                        {/* Nút Edit/Delete (Thay thế Button và Popconfirm) */}
                        {canModify && (
                          <>
                            <button
                              onClick={() => handleOpenModal(schedule)}
                              className='text-blue-500 hover:text-blue-700 text-sm p-1'
                              title='Edit Schedule'
                            >
                              Edit
                            </button>

                            {/* Thay thế Popconfirm bằng logic gọi ConfirmModal */}
                            <button
                              onClick={() => handleDeleteClick(schedule)}
                              className='text-red-500 hover:text-red-700 text-sm p-1'
                              title='Delete Schedule'
                              disabled={isDeleting && selectedSchedule?.id === schedule.id}
                            >
                              {isDeleting && selectedSchedule?.id === schedule.id ? 'Deleting...' : 'Delete'}
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
          <div className='p-4 border-t border-gray-100 dark:border-white/[0.05] flex justify-center'>
            <Pagination
              currentPage={currentPage}
              // Truyền tổng số trang đã tính toán
              totalPages={totalPages}
              // Truyền hàm cập nhật trang
              onPageChange={setCurrentPage}
            />
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
        selectedBAId={selectedBAId === 'all' ? undefined : selectedBAId} // Truyền ID BA đang được chọn (trừ 'all')
        onScheduleGenerated={refetch}
      />
    </>
  )
}
