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
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import ScheduleFormModal from '../../SchedulaModal/ScheduleFormModal'
import Pagination from '../../pagination/Pagination'
import AppointmentDetailModal from '../../SchedulaModal/AppointmentDetailModal'

const ITEMS_PER_PAGE = 10

// Giả định các hàm toast/message đơn giản (không dùng Ant Design)
const showToast = (msg: string, type: 'success' | 'error') => {
  console.log(`${type.toUpperCase()}: ${msg}`)
}

export default function WorkSchedulesManagement() {
  const queryClient = useQueryClient()

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

  console.log('CURRENT_USER_ROLE', CURRENT_USER_ROLE)
  console.log('CURRENT_USER_ID', CURRENT_USER_ID)

  const canModify =
    profile?.role !== Role.STORE_STAFF && profile?.role !== Role.ADMIN && profile?.role !== Role.BEAUTY_ADVISOR
  const fetchFn = useCallback(() => {
    if (CURRENT_USER_ROLE === Role.BEAUTY_ADVISOR) {
      return scheduleApi.getScheduleByIdBeautyAdvisor(CURRENT_USER_ID)
    }

    return scheduleApi.getSchedule()
  }, [])

  const {
    data: schedulesResponse,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['workSchedules', CURRENT_USER_ROLE, CURRENT_USER_ID],
    queryFn: fetchFn,
    staleTime: 1000 * 60
  })
  const allSchedules = schedulesResponse?.data.data || []

  console.log('allSchedules', allSchedules)

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

  const handleViewAppointmentsClick = (schedule: ScheduleWork) => {
    setSelectedScheduleForAppt(schedule)
    setIsApptDetailOpen(true)
  }

  const filteredAndPaginatedSchedules = useMemo(() => {
    const schedules = allSchedules as ScheduleWork[]

    const lowercasedSearchTerm = searchTerm.toLowerCase()
    let filtered = schedules.filter((schedule) =>
      // schedule.staffId.toLowerCase().includes(lowercasedSearchTerm) ||
      schedule.room.roomName.toLowerCase().includes(lowercasedSearchTerm)
    )

    if (filterStatus !== undefined) {
      filtered = filtered.filter((schedule) => schedule.status === filterStatus)
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    return {
      totalItems: filtered.length,
      data: filtered.slice(startIndex, endIndex)
    }
  }, [allSchedules, searchTerm, filterStatus, currentPage])

  const totalPages = Math.ceil(filteredAndPaginatedSchedules.totalItems / ITEMS_PER_PAGE)

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

  // Hàm hiển thị Tag trạng thái (Chuyển sang Tailwind)
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

  // --- RENDERING ---

  if (isLoading)
    return (
      <div className='p-6 text-center text-lg text-blue-500'>
        <div className='animate-spin inline-block w-8 h-8 border-4 border-t-4 border-blue-500 border-gray-200 rounded-full'></div>{' '}
        Loading work schedules...
      </div>
    )
  if (isError) return <div className='p-6 text-center text-lg text-red-500'>Error loading work schedules.</div>

  return (
    <>
      <h2 className='text-2xl font-bold mb-5'>Work Schedule Management</h2>

      <div className='flex justify-between items-center mb-5'>
        <div className='flex items-center gap-3'>
          {' '}
          {/* Thay thế cho <Space> */}
          {/* Thanh Tìm kiếm (Thay thế Input Ant Design) */}
          <input
            type='text'
            placeholder='Search by Room...'
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className='w-1/3 min-w-[200px] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          />
          {/* Lọc Trạng thái (Thay thế Select Ant Design) */}
          <select
            className='w-[150px] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none' // appearance-none để control style
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

        {/* Create New Button (Thay thế Button Ant Design) */}
        {canModify && (
          <button
            onClick={() => handleOpenModal(null)}
            className='flex justify-center rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:bg-blue-600 transition-colors'
          >
            Add New Schedule
          </button>
        )}
      </div>

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
            <TableHeader className='border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.05]'>
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
                  <TableRow key={schedule.id}>
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

      {/* Modal Thêm/Cập nhật (Bạn cần đảm bảo component này cũng chỉ dùng Tailwind) */}
      <ScheduleFormModal
        refetch={refetch}
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        scheduleToEdit={selectedSchedule}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['workSchedules'] })}
      />

      {/* Modal Xác nhận Xóa (Bạn cần đảm bảo component này cũng chỉ dùng Tailwind) */}
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
    </>
  )
}
