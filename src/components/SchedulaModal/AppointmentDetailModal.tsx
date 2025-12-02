import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { AppointmentStatusCode } from '../../constants/AppointmentConstants'
import { appointmentApi } from '../../api/appointment.api'
import { Appointment } from '../../types/appoinment.type'
import { formatDateToDDMMYYYY } from '../../utils/validForm'
import StaffEmailLookup from '../../utils/StaffEmailLookup'

interface AppointmentDetailModalProps {
  isOpen: boolean
  onClose: () => void
  scheduleId: string | null
  staffId: string
  shiftDate: string
}

// Hàm chuyển đổi Status Code sang Text
const getAppointmentStatusText = (status: number): string => {
  const statusMap: { [key: number]: string } = {
    0: 'Pending',
    1: 'Confirmed',
    2: 'In Progress',
    3: 'Completed',
    4: 'Cancelled',
    5: 'No Show',
    6: 'Rescheduled'
  }
  return statusMap[status] || 'Unknown'
}

// Hàm chuyển đổi Status Code sang Class CSS (dùng cho Tailwind)
const getStatusClass = (status: number): string => {
  switch (status) {
    case AppointmentStatusCode.Confirmed:
    case AppointmentStatusCode.InProgress:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
    case AppointmentStatusCode.Completed:
      return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
    case AppointmentStatusCode.Cancelled:
    case AppointmentStatusCode.NoShow:
      return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
    case AppointmentStatusCode.Pending:
    case AppointmentStatusCode.Rescheduled:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
  }
}

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  isOpen,
  onClose,
  scheduleId,
  staffId,
  shiftDate
}) => {
  // 🔑 Tải dữ liệu lịch hẹn bằng React Query
  const { data, isLoading, isError } = useQuery({
    queryKey: ['scheduleAppointments', scheduleId],
    queryFn: () => appointmentApi.getAppoinmentScheduleId(scheduleId!),
    enabled: isOpen && !!scheduleId, // Chỉ chạy query khi modal mở và có scheduleId
    staleTime: 1000 * 60 * 5 // Cache trong 5 phút
  })

  const appointments: Appointment[] = data?.data.data || []

  if (!isOpen) return null

  const baseCellClasses = 'px-4 py-2 text-sm border-b border-gray-100 dark:border-gray-700'

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm'>
      <div className='bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl mx-4'>
        {/* Modal Header */}
        <div className='flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0'>
          <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>Appointment Details</h3>
          <button
            onClick={onClose}
            className='text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg w-8 h-8 flex items-center justify-center transition-colors'
          >
            <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        {/* Info Block */}
        <div className='p-5 bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-700'>
          <p className='text-sm text-gray-700 dark:text-gray-300 font-medium'>
            Schedule for:{' '}
            <span className='font-semibold text-blue-600 dark:text-blue-400'>
              <StaffEmailLookup staffId={staffId} />
            </span>
          </p>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Date: <span className='font-medium'>{formatDateToDDMMYYYY(shiftDate)}</span>
          </p>
        </div>

        {/* Modal Body (Table of Appointments) - Có thanh cuộn */}
        <div className='max-h-[70vh] overflow-y-auto'>
          {isLoading && (
            <div className='p-6 text-center text-blue-500'>
              <div className='animate-spin inline-block w-6 h-6 border-3 border-t-3 border-blue-500 border-gray-200 rounded-full'></div>
              <p className='mt-2'>Loading appointments...</p>
            </div>
          )}

          {isError && <div className='p-6 text-center text-red-500'>Error loading appointment details.</div>}

          {!isLoading && appointments.length === 0 && (
            <div className='p-6 text-center text-gray-500'>No appointments found for this schedule.</div>
          )}

          {!isLoading && appointments.length > 0 && (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                <thead className='bg-gray-50 dark:bg-gray-700/50 sticky top-0'>
                  <tr>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Time
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Service
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      User Email
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Duration
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                  {appointments.map((appt) => (
                    <tr key={appt.id} className='hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-colors my-5'>
                      {/* Time Slot (Start Time + End Time) */}
                      <td className={baseCellClasses}>
                        {new Date(appt.startDateTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })}
                        <span className='text-gray-400 mx-1'>-</span>
                        {new Date(appt.endDateTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })}
                      </td>
                      {/* Service Name */}
                      <td className={baseCellClasses + ' font-medium'}>{appt.service.name}</td>
                      {/* User ID */}
                      <td className={baseCellClasses}>
                        <StaffEmailLookup staffId={appt.userId} />
                      </td>

                      <td className={baseCellClasses}>{appt.durationMinutes} mins</td>
                      {/* Status */}
                      <td className={baseCellClasses}>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(appt.status)}`}
                        >
                          {getAppointmentStatusText(appt.status)}
                        </span>
                      </td>
                      {/* Notes */}
                      <td
                        className={baseCellClasses + ' truncate max-w-[150px]'}
                        title={appt.notes || 'N/A'} // Nội dung ghi chú đầy đủ sẽ hiện ra khi di chuột
                      >
                        {appt.notes || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className='flex justify-end p-5 border-t border-gray-200 dark:border-gray-700 flex-shrink-0'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppointmentDetailModal
