/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query'
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { scheduleApi } from '../../api/schedulars.api'
import { serviceApi } from '../../api/services.api'
import { APPOINTMENT_STATUS_LIST } from '../../constants/AppointmentConstants'
import { AppPath } from '../../constants/Paths'
import { Role } from '../../constants/Roles'
import { WorkScheduleStatus } from '../../constants/SchedularConstants'
import { ScheduleWork } from '../../types/appoinment.type'
import { Service } from '../../types/service.type'
import { TreatmentSession } from '../../types/treatmentSession.type'
import { AuthUser, User } from '../../types/user.type'
import { Modal } from '../ui/modal'
import { AuthResponse } from '../../types/auth.type'

interface Schedule {
  id: string
  startTime: string
  room: { roomName: string; location: string }
}

interface EventModalFormProps {
  // Metadata & Control
  isOpen: boolean
  onClose: () => void
  selectedEvent: any | null
  onSave: () => void
  onDeleted: () => void
  calendarsEvents: { [key: string]: any }
  setDurationMinutes: React.Dispatch<React.SetStateAction<number>>
  // State/Setters cho API Payload Fields
  selectedServiceId: string
  setSelectedServiceId: (id: string) => void
  selectedScheduleId: string
  setSelectedScheduleId: (id: string) => void
  appointmentDate: string
  setAppointmentDate: (date: string) => void
  startDateTime: string
  endDateTime: string
  setStartDateTime: (time: string) => void
  status: number
  setStatus: (status: number) => void
  sessionId: string
  setSessionId: (id: string) => void
  notes: string
  setNotes: (notes: string) => void

  // UI Fields (vẫn cần setters để đồng bộ UI và State)
  eventTitle: string
  setEventTitle: (title: string) => void
  eventRoom: string
  setEventRoom: (room: string) => void
  eventLocation: string
  setEventLocation: (location: string) => void
  pagingData: User[]
  sesionData: TreatmentSession
  // Navigation & Display Info
  patientName: string
  patientId: string
  setPatientId: (id: string) => void
  profile: AuthUser
  doctorName: string
  doctorId: string
  setDoctorId: (id: string) => void
  onNavigate: (id: string) => void
}

const EventModalForm: React.FC<EventModalFormProps> = ({
  isOpen,
  onClose,
  selectedEvent,
  onSave,
  calendarsEvents,
  notes,
  setNotes,
  patientName,
  patientId,
  doctorName,
  doctorId,
  onNavigate,
  setDurationMinutes,
  // State/Setters còn lại
  selectedServiceId,
  pagingData,
  sesionData,
  setSelectedServiceId,
  selectedScheduleId,
  setSelectedScheduleId,
  appointmentDate,
  setAppointmentDate,
  startDateTime,
  setStartDateTime,
  status,
  setStatus,
  sessionId,
  setSessionId,
  eventTitle,
  setEventTitle,
  setPatientId,
  eventRoom,
  setEventRoom,
  eventLocation,
  setDoctorId,
  onDeleted,
  setEventLocation,

  endDateTime,
  profile
}) => {
  const isEditing = !!selectedEvent

  console.log('Data User', pagingData)

  console.log('sessionData', sesionData)

  const { data: servicesData, isLoading: isServicesLoading } = useQuery({
    queryKey: ['allServices'],
    queryFn: () => serviceApi.getServices(),
    staleTime: 1000 * 60 * 5,
    enabled: isOpen
  })

  const allServices: Service[] = servicesData?.data.data || []

  const { data: schedulesData, isLoading: isSlotsLoading } = useQuery({
    queryKey: ['allSchedules', appointmentDate, selectedServiceId, doctorId],

    queryFn: () => scheduleApi.getScheduleByIdBeautyAdvisor(doctorId),

    staleTime: 1000 * 60,

    enabled: isOpen && !!appointmentDate && !!selectedServiceId && !!doctorId
  })

  const allSchedules: ScheduleWork[] = schedulesData?.data.data
    ? schedulesData.data.data.filter(
        (schedule) => schedule.appointments.length === 0 && schedule.status !== WorkScheduleStatus.Booked
      )
    : []

  const selectedService = useMemo(() => {
    return allServices.find((s) => s.id === selectedServiceId)
  }, [allServices, selectedServiceId])

  const servicePrice = selectedService?.price
  const durationMinutes = selectedService?.durationMinutes || 0
  const navigate = useNavigate()

  const handleServiceChange = (id: string) => {
    setSelectedServiceId(id)
    const selected = allServices.find((s) => s.id === id)
    if (selected) {
      setDurationMinutes(selected.durationMinutes)
      setEventTitle(selected.name)
    } else {
      setEventTitle('')
    }
  }

  const handleScheduleChange = (id: string) => {
    console.log('id', id)

    setSelectedScheduleId(id)

    if (!id) {
      setEventRoom('')
      setEventLocation('')

      return
    }

    const schedule = allSchedules.find((s) => s.id === id)

    if (schedule) {
      const start = new Date(schedule.startTime)

      setAppointmentDate(start.toISOString().split('T')[0])
      setStartDateTime(
        `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`
      )

      setEventRoom(schedule.room?.roomName || 'N/A')
      setEventLocation(schedule.room?.location || 'N/A')
    }
  }

  const handleViewMedicalRecord = (id: string) => {
    navigate(`${AppPath.PROFILE}/${id}`)
  }

  const IconPlaceholder = ({ color }: { color: string }) => <div className={`w-4 h-4 rounded-full ${color}`}></div>

  return (
    <Modal isOpen={isOpen} onClose={onClose} className='max-w-[800px] p-0'>
      <div className='flex flex-col h-full bg-white dark:bg-gray-900 rounded-xl'>
        {/* HEADER */}
        <div className='flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800'>
          <div>
            {profile.role === Role.CUSTOMER && (
              <h5 className='mb-1 font-bold text-gray-800 modal-title text-xl lg:text-2xl dark:text-white'>
                {isEditing ? 'Edit Appointment' : 'Add New Appointment'}
              </h5>
            )}

            <p className='text-sm text-gray-500 dark:text-gray-4  00'>
              Manage appointment details, services, and schedules.
            </p>
          </div>
          <button onClick={onClose} className='p-2 text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'>
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12'></path>
            </svg>
          </button>
        </div>

        {/* BODY */}
        <div
          className='p-6 space-y-8 overflow-y-auto custom-scrollbar lg:p-8 overflow-y-auto'
          style={{ maxHeight: '80vh' }}
        >
          <div className='p-5 border border-gray-200 rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'>
            <h6 className='mb-4 text-lg font-semibold text-gray-700 dark:text-white'> Main Information</h6>

            <div className='mb-6'>
              <label className='flex items-center mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400'>
                <IconPlaceholder color='bg-blue-500' />
                <span className='ml-2'>Service</span>
              </label>
              {/* Lấy thông tin dịch vụ đã chọn */}
              {selectedServiceId &&
                allServices.length > 0 &&
                // Tìm dịch vụ phù hợp với ID đã chọn
                (() => {
                  const selectedService = allServices.find((service) => service.id === selectedServiceId)

                  // Hiển thị tên dịch vụ nếu tìm thấy
                  if (selectedService) {
                    return (
                      <div className='h-11 w-full rounded-lg border border-gray-300 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90'>
                        {selectedService.name} ({selectedService.durationMinutes} phút)
                      </div>
                    )
                  }
                  return null
                })()}

              {!selectedServiceId && (
                <div className='h-11 w-full rounded-lg border border-gray-300 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400'>
                  {isServicesLoading ? 'Loading services...' : 'No service selected'}
                </div>
              )}
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {/* Tên Bác sĩ */}

              <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>Beaty Advisor</label>
              {doctorId ? (
                (() => {
                  const currentDoctor = pagingData?.find((u) => u.userId === doctorId)
                  const displayedDoctorName = currentDoctor?.firstName || currentDoctor?.emailAddress || doctorName

                  return (
                    <div
                      className={`h-11 w-full rounded-lg border border-brand-300 bg-brand-50/50 dark:bg-brand-900/50 px-4 py-2.5 text-sm font-semibold text-brand-700 dark:text-brand-300 transition duration-150 flex items-center justify-between`}
                    >
                      <div className='flex items-center flex-grow cursor-default'>
                        <IconPlaceholder color='bg-brand-500' />
                        <span className='ml-2 truncate' title={displayedDoctorName}>
                          {displayedDoctorName || 'N/A'}
                        </span>
                      </div>

                      <button
                        onClick={() => setDoctorId('')}
                        type='button'
                        className='ml-2 text-brand-500 hover:text-brand-700 dark:hover:text-brand-300'
                        title='Re-select Beaty Advisor'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                        </svg>
                      </button>
                    </div>
                  )
                })()
              ) : (
                <select
                  className='h-11 w-full rounded-lg border border-brand-300 bg-brand-50/50 dark:bg-brand-900/50 px-4 py-2.5 text-sm text-brand-700 dark:text-brand-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                >
                  <option value=''>--Choose Beaty Advisor--</option>
                  {pagingData
                    ?.filter((u) => u.roleName === Role.BEAUTY_ADVISOR)
                    .map((u) => (
                      <option key={u.userId} value={u.userId}>
                        {u.emailAddress}
                      </option>
                    ))}
                </select>
              )}
            </div>
            {/* Tên Bệnh nhân */}
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>Customer</label>
              {patientId ? (
                (() => {
                  const currentPatient = pagingData?.find((u) => u.userId === patientId)
                  const displayedPatientName = currentPatient?.firstName || currentPatient?.emailAddress || patientName

                  return (
                    <div
                      className={`h-11 w-full rounded-lg border border-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/50 px-4 py-2.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300 transition duration-150 flex items-center justify-between`}
                    >
                      <div className='flex items-center flex-grow cursor-default'>
                        <IconPlaceholder color='bg-indigo-500' />
                        <span className='ml-2 truncate' title={displayedPatientName}>
                          {displayedPatientName || 'N/A'}
                        </span>
                      </div>

                      {/* ACTIONS: View Record & Change Button */}
                      <div className='flex items-center space-x-3'>
                        <button
                          onClick={() => handleViewMedicalRecord(patientId)} // 🚨 Cần định nghĩa hàm này
                          type='button'
                          className='text-sm font-medium text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors'
                          title='View Medical Record'
                        >
                          View Record
                        </button>

                        {/* <button
                          onClick={() => setPatientId('')}
                          type='button'
                          className='text-sm font-medium text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors'
                          title='Change/Re-select Customer'
                        >
                          Change
                        </button> */}
                      </div>
                    </div>
                  )
                })()
              ) : (
                <select
                  className='h-11 w-full rounded-lg border border-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/50 px-4 py-2.5 text-sm text-indigo-700 dark:text-indigo-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                >
                  <option value=''>-- Select Customer--</option>
                  {pagingData
                    ?.filter((u) => u.roleName === Role.CUSTOMER)
                    .map((u) => (
                      <option key={u.userId} value={u.userId}>
                        {u.emailAddress}
                      </option>
                    ))}
                </select>
              )}
            </div>
          </div>

          <div className='p-5 border border-gray-200 rounded-lg dark:border-gray-700'>
            <h6 className='mb-4 text-lg font-semibold text-gray-700 dark:text-white'>Schedule & Time</h6>

            <div className='mb-6'>
              <label className='flex items-center mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400'>
                <IconPlaceholder color='bg-orange-500' />
                <span className='ml-2'>Time Slot</span>
              </label>
              <select
                value={selectedScheduleId}
                onChange={(e) => handleScheduleChange(e.target.value)}
                className='h-11 w-full rounded-lg border border-gray-300 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                disabled={isSlotsLoading || !selectedServiceId || !appointmentDate}
              >
                <option value=''>
                  {isSlotsLoading
                    ? 'Loading slots...'
                    : !selectedServiceId || !appointmentDate
                      ? 'Select service & date'
                      : allSchedules.length === 0
                        ? 'No available slots'
                        : 'Select a slot'}
                </option>
                {allSchedules.map((schedule) => {
                  const startTime = schedule.startTime
                  const endTime = schedule.endTime

                  const roomName = schedule.room?.roomName || 'N/A'
                  const location = schedule.room?.location || 'N/A'

                  return (
                    <option key={schedule.id} value={schedule.id}>
                      {startTime} - {endTime} | Phòng: {roomName} ({location})
                    </option>
                  )
                })}
              </select>
            </div>

            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>
                  Appointment Date
                </label>
                <input
                  type='date'
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className='h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500'
                />
              </div>

              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>Start Time</label>
                <input
                  type='time'
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className='h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500'
                />
              </div>

              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>End Time</label>
                <input
                  type='time'
                  value={endDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className='h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500'
                />
              </div>
              {/* Thời lượng (Tính toán nội bộ) */}
              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>
                  Duration (minutes)
                </label>
                <input
                  type='number'
                  value={durationMinutes}
                  disabled
                  className='h-10 w-full rounded-lg border border-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-white/90 cursor-not-allowed'
                />
              </div>
            </div>
          </div>

          <div className='p-5 border border-gray-200 rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'>
            <h6 className='mb-4 text-lg font-semibold text-gray-700 dark:text-white'>Appointment Status </h6>

            <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
              {APPOINTMENT_STATUS_LIST.map((s) => (
                <label
                  key={s.code}
                  htmlFor={`status-${s.code}`}
                  className={`
                    relative flex items-center justify-center p-3 rounded-lg text-sm font-medium border cursor-pointer 
                    transition duration-150 ease-in-out
                    ${s.dotColor.replace('bg-', 'text-')}-700 
                    ${s.dotColor.replace('bg-', 'bg-')}-50/50 
                    ${
                      status === s.code
                        ? 'border-brand-500 ring-2 ring-brand-500 shadow-sm'
                        : 'border-gray-300 dark:border-gray-600 hover:border-brand-300'
                    }
                `}
                >
                  <input
                    id={`status-${s.code}`}
                    name='status'
                    type='radio'
                    value={s.code}
                    checked={status === s.code}
                    onChange={() => setStatus(s.code)}
                    className='sr-only'
                  />
                  <span className='flex items-center'>
                    {/* Dot màu */}
                    <span className={`h-2.5 w-2.5 rounded-full mr-2 ${s.dotColor}`}></span>
                    {/* Tên Status */}
                    {s.name}
                  </span>
                </label>
              ))}
            </div>

            {/* SESSION ID */}
            <div className='p-5 border border-gray-200 rounded-lg dark:border-gray-700 mt-6'>
              <h6 className='mb-4 text-base font-semibold text-gray-700 dark:text-white'>Treatment Session</h6>
              <div className=''>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>
                  Select Session
                </label>
                <div
                  className='h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 
                bg-gray-100 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 
                dark:text-white/90'
                >
                  [Kits: {(sesionData.kits as string) || 'N/A'}] - Session #{sesionData.sessionNumber} (
                  {new Date(sesionData.sessionDate).toLocaleDateString()})
                </div>
              </div>
            </div>
          </div>

          {/* 4. SECTION: PHÒNG, GIÁ VÀ GHI CHÚ */}
          <div className='p-5 border border-gray-200 rounded-lg dark:border-gray-700'>
            <h6 className='mb-4 text-lg font-semibold text-gray-700 dark:text-white'>Room & Notes</h6>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6'>
              {/* Tên Phòng */}
              <div className=''>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>Room Name</label>
                <input
                  type='text'
                  value={eventRoom}
                  onChange={(e) => setEventRoom(e.target.value)}
                  className='h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500'
                  placeholder='e.g.: Room A1'
                />
              </div>

              {/* Khu vực/Tầng */}
              <div className=''>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>Area/Floor</label>
                <input
                  type='text'
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className='h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500'
                  placeholder='e.g.: 3rd Floor, Zone D'
                />
              </div>
              {/* Giá  */}
              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>
                  Service Price
                </label>
                <input
                  type='text'
                  value={servicePrice !== undefined ? `${servicePrice.toLocaleString('vi-VN')} VND` : 'N/A'}
                  disabled
                  className='h-10 w-full rounded-lg border border-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-white/90 cursor-not-allowed'
                />
              </div>
            </div>

            {/* (*notes) */}
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className='w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
              placeholder='Add special notes for this appointment...'
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className='flex items-center gap-3 p-6 border-t border-gray-100 dark:border-gray-800 modal-footer sm:justify-end'>
          {isEditing && (
            <button
              onClick={onDeleted}
              type='button'
              className='flex w-full justify-center rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/[0.03] sm:w-auto'
            >
              Delete Appointment
            </button>
          )}
          <button
            onClick={onClose}
            type='button'
            className='flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto'
          >
            Close
          </button>

          {profile.role === Role.CUSTOMER && (
            <button
              onClick={onSave}
              type='button'
              className='btn btn-success flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-brand-xs hover:bg-brand-600 sm:w-auto'
            >
              {isEditing ? 'Update Appointment' : 'Add Appointment'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default EventModalForm
