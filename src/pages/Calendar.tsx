/* eslint-disable @typescript-eslint/no-explicit-any */
import { DateSelectArg, EventClickArg, EventInput } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { appointmentApi } from '../api/appointment.api'
import PageMeta from '../components/common/PageMeta'

import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import userApi from '../api/user.api'
import EventModalForm from '../components/CalendarModelDetail/AppointmentModal'
import ConfirmModal from '../components/CalendarModelDetail/ConfirmModal'
import { APPOINTMENT_STATUS_MAP } from '../constants/AppointmentConstants'
import { AppPath } from '../constants/Paths'
import { Role } from '../constants/Roles'
import { useAppContext } from '../context/AuthContext'
import { useModal } from '../hooks/useModal'
import { AppointmentForm, AppointmentResponse } from '../types/appoinment.type'
import { PaginaResponse } from '../types/auth.type'
import { User } from '../types/user.type'

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string // status color
    room: string
    location: string
    price?: number
    duration?: number
    notes: string
    userId: string
    staffId: string
    scheduleId: string
    serviceId: string

    status: number
    sessionId: string
  }
}

const AppointmentCalendar: React.FC = () => {
  const { profile } = useAppContext()
  const isBeautyAdvisor = profile?.role === Role.BEAUTY_ADVISOR
  const isAdmin = profile?.role === Role.ADMIN

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [eventTitle, setEventTitle] = useState('')

  const [eventRoom, setEventRoom] = useState('')
  const [eventLocation, setEventLocation] = useState('')
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [durationMinutes, setDurationMinutes] = useState<number>(0)
  const [selectedServiceIdState, setSelectedServiceIdState] = useState('')
  const [selectedScheduleIdState, setSelectedScheduleIdState] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [startDateTime, setStartDateTime] = useState('')
  const [status, setStatus] = useState<number>(0)
  const [sessionId, setSessionId] = useState('')
  const [notes, setNotes] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [patientIdState, setPatientIdState] = useState('')
  const navigate = useNavigate()
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)

  const calendarRef = useRef<FullCalendar>(null)
  const { isOpen, openModal, closeModal } = useModal()

  const selectedUserId = selectedEvent?.extendedProps.userId
  const selectedStaffId = selectedEvent?.extendedProps.staffId

  const { data: appointments, refetch } = useQuery<AppointmentResponse>({
    queryKey: ['appointments', profile?.role, profile?.userId], // thêm vào key để tránh cache sai
    queryFn: async () => {
      // Nếu là Beauty Advisor => gọi API theo userId
      if (isBeautyAdvisor) {
        const res = await appointmentApi.getAppoinmentByBeatyAdvisorId(profile?.userId)
        return res.data
      }

      // Nếu là Admin => lấy toàn bộ
      if (isAdmin) {
        const res = await appointmentApi.getAppoinments()
        return res.data
      }

      // Default fallback (optional)
      const res = await appointmentApi.getAppoinments()
      return res.data
    },
    enabled: !!profile?.role // tránh gọi API trước khi load xong profile
  })

  const AppoinmentMutation = useMutation({
    mutationFn: (body: AppointmentForm) => appointmentApi.createAppoinments(body)
  })

  const AppoinmentUpdateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: AppointmentForm }) => appointmentApi.updateAppoinments(id, body)
  })

  const { data: pagingData } = useQuery<PaginaResponse<User>>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await userApi.getUsers()
      console.log('resQuery', res.data.data.items)
      return res.data // Trả về data bên trong
    },
    enabled: !isBeautyAdvisor
  })

  const { data: patientData, isLoading: isPatientLoading } = useQuery({
    queryKey: ['patientName', selectedUserId],
    queryFn: () => userApi.getUsersById(selectedUserId!),
    enabled: isOpen && !!selectedUserId,
    select: (data) => data.data.data.emailAddress
  })

  const { data: doctorData, isLoading: isDoctorLoading } = useQuery({
    queryKey: ['doctorName', selectedStaffId],
    queryFn: () => userApi.getUsersById(selectedStaffId!),
    enabled: isOpen && !!selectedStaffId,
    select: (data) => data.data.data.emailAddress
  })

  // Mapping màu sự kiện
  const calendarsEvents = {
    Danger: 'danger',
    Success: 'success',
    Primary: 'primary',
    Warning: 'warning'
  }

  useEffect(() => {
    if (!appointments) return

    if (appointments.message) {
      toast.success(appointments.message)
    }

    if (!appointments.data) return

    const events = appointments.data.map((item) => {
      // 1. Ánh xạ status code (0-6) sang thuộc tính hiển thị (calendar color name)
      const statusMap = APPOINTMENT_STATUS_MAP[item.status as keyof typeof APPOINTMENT_STATUS_MAP]

      // 2. Định nghĩa fallback nếu status code không tìm thấy
      const defaultMap = { calendar: 'Danger', dotColor: 'bg-red-500' }

      return {
        id: item.id,
        title: item.service?.name || 'Appointment',
        start: item.startDateTime,
        end: item.endDateTime,
        extendedProps: {
          // ✅ FIX: Lấy color name string (Primary/Success/Danger) từ MAP
          calendar: statusMap ? statusMap.calendar : defaultMap.calendar,
          room: item.schedule?.room?.roomName || '',
          location: item.schedule?.room?.location || '',
          price: item.service?.price,
          duration: item.durationMinutes,
          notes: item.notes || '',
          userId: item.userId,
          staffId: item.staffId,
          scheduleId: item.schedule?.id, // Dùng ?. an toàn
          serviceId: item.service?.id, // Dùng ?. an toàn
          status: item.status,
          sessionId: item.sessionId || ''
        }
      }
    })

    setEvents(events as CalendarEvent[])
  }, [appointments])

  const handleDeleteEvent = () => {
    if (!selectedEvent) return
    // Mở popup xác nhận
    setIsConfirmDeleteOpen(true)
  }

  const confirmDeleteAction = async () => {
    if (!selectedEvent) return

    const res = await appointmentApi.deleteAppoiment(selectedEvent.id as string)

    refetch()
    toast.success(res.data.message)

    setIsConfirmDeleteOpen(false)
    closeModal()
    resetModalFields()
  }

  const resetModalFields = () => {
    setEventTitle('')

    setEventRoom('')
    setEventLocation('')
    setNotes('')
    setSelectedEvent(null)

    setSelectedServiceIdState('')
    setSelectedScheduleIdState('')
    setAppointmentDate('')
    setStartDateTime('')
    setStatus(0)
    setSessionId('')
    setDoctorId('')
    setPatientIdState('')
  }

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields()

    const start = new Date(selectInfo.startStr)
    setAppointmentDate(start.toISOString().split('T')[0]) // YYYY-MM-DD
    setStartDateTime(start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })) // HH:MM

    openModal()
  }

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event
    const extendedProps = event.extendedProps as CalendarEvent['extendedProps']

    setSelectedEvent(event as unknown as CalendarEvent)
    setEventTitle(event.title)

    const start = event.start
    if (start) {
      setAppointmentDate(start.toISOString().split('T')[0])
      setStartDateTime(start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })) // HH:MM
    }

    setSelectedServiceIdState(extendedProps.serviceId || '')
    setSelectedScheduleIdState(extendedProps.scheduleId || '')
    setStatus(extendedProps.status || 0)
    setSessionId(extendedProps.sessionId || '')

    setDoctorId(extendedProps.staffId || '')
    setPatientIdState(extendedProps.userId || '')

    setEventRoom(extendedProps.room)
    setEventLocation(extendedProps.location)
    setNotes(extendedProps.notes)

    openModal()
  }

  const handleNavigateToDetail = (id: string) => {
    closeModal()
    if (id) {
      navigate(`${AppPath.PROFILE}/${id}`)
    }
  }

  const handleAddOrUpdateEvent = () => {
    const [hours, minutes] = startDateTime.split(':').map(Number)
    const date = new Date(appointmentDate)
    date.setHours(hours, minutes, 0, 0)

    const payload = {
      userId: patientIdState,
      staffId: doctorId,
      appointmentDate,
      startDateTime: date.toISOString(),
      durationMinutes,
      status,
      serviceId: selectedServiceIdState,
      scheduleId: selectedScheduleIdState,
      sessionId: sessionId || null,
      notes
    }

    if (selectedEvent) {
      // Logic gọi API CẬP NHẬT

      AppoinmentUpdateMutation.mutate(
        { id: selectedEvent.id as string, body: payload },
        {
          onSuccess: (data) => {
            refetch()
            resetModalFields()
            toast.success(data.data.message)
          }
        }
      )

      console.log('Cập nhật Event với Payload:', payload)
    } else {
      console.log('create', payload)

      AppoinmentMutation.mutate(payload, {
        onSuccess: (data) => {
          refetch()
          resetModalFields()
          toast.success(data.data.message)
        },
        onError: (error: any) => {
          console.log('er', error)

          toast.error(error.data.res)
        }
      })
      // Logic TẠO MỚI
      console.log('Tạo Event với Payload:', payload)
    }

    closeModal()
    resetModalFields()
  }

  return (
    <>
      <PageMeta
        title='React.js Calendar Dashboard | TailAdmin - Next.js Admin Dashboard Template'
        description='This is React.js Calendar Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template'
      />
      <div className='rounded-2xl border  border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]'>
        <div className='custom-calendar'>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView='dayGridMonth'
            headerToolbar={{
              left: 'prev,next addEventButton',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={(eventInfo) => {
              const statusCode = eventInfo.event.extendedProps.status as keyof typeof APPOINTMENT_STATUS_MAP

              const statusMap = APPOINTMENT_STATUS_MAP[statusCode] || APPOINTMENT_STATUS_MAP[0]

              const color = statusMap.calendar.toLowerCase()

              const colorMap: { [key: string]: string } = {
                danger: 'bg-danger-500/10 border-danger-500',
                success: 'bg-success-500/10 border-success-500',
                primary: 'bg-primary-500/10 border-primary-500',
                warning: 'bg-warning-500/10 border-warning-500'
              }
              return (
                <div
                  className={`
                  flex items-center gap-1 p-1 rounded-md border-l-4
                  ${colorMap[color] || 'bg-gray-500/10 border-gray-500'}
                  hover:scale-105 hover:shadow-md transition duration-150
                  min-w-0
                `}
                >
                  <span className='fc-event-time text-xs font-semibold text-gray-700 dark:text-gray-200'>
                    {eventInfo.timeText}
                  </span>

                  <span
                    className='fc-event-title text-xs font-medium truncate flex-1 min-w-0'
                    title={eventInfo.event.title}
                  >
                    {eventInfo.event.title}
                  </span>
                </div>
              )
            }}
            moreLinkContent={(args) => (
              <span
                className='
                inline-block
                bg-indigo-600 text-white text-xs font-semibold
                px-2 py-0.5 rounded-md
                hover:bg-indigo-700 transition duration-150
              '
              >
                +{args.num} more
              </span>
            )}
            dayMaxEventRows={1}
            dayMaxEvents={true}
            customButtons={{
              addEventButton: {
                text: 'Add Event +',
                click: openModal
              }
            }}
          />
        </div>

        <EventModalForm
          isOpen={isOpen}
          onClose={closeModal}
          selectedEvent={selectedEvent}
          eventTitle={eventTitle}
          setEventTitle={setEventTitle}
          eventRoom={eventRoom}
          setEventRoom={setEventRoom}
          eventLocation={eventLocation}
          setEventLocation={setEventLocation}
          notes={notes}
          setNotes={setNotes}
          calendarsEvents={calendarsEvents}
          selectedServiceId={selectedServiceIdState}
          setSelectedServiceId={setSelectedServiceIdState}
          selectedScheduleId={selectedScheduleIdState}
          setSelectedScheduleId={setSelectedScheduleIdState}
          appointmentDate={appointmentDate}
          setAppointmentDate={setAppointmentDate}
          startDateTime={startDateTime}
          setStartDateTime={setStartDateTime}
          status={status}
          setStatus={setStatus}
          sessionId={sessionId}
          setSessionId={setSessionId}
          setDurationMinutes={setDurationMinutes}
          pagingData={pagingData?.data.items || []}
          onSave={handleAddOrUpdateEvent}
          onDeleted={handleDeleteEvent}
          patientName={isPatientLoading ? 'Đang tải...' : patientData || 'Bệnh nhân (N/A)'}
          patientId={selectedUserId || patientIdState}
          setPatientId={setPatientIdState}
          setDoctorId={setDoctorId}
          doctorName={isDoctorLoading ? 'Đang tải...' : doctorData || 'Bác sĩ (N/A)'}
          doctorId={selectedStaffId || doctorId}
          onNavigate={(id) => handleNavigateToDetail(id)}
        />

        <ConfirmModal
          isOpen={isConfirmDeleteOpen}
          onClose={() => setIsConfirmDeleteOpen(false)}
          onConfirm={confirmDeleteAction} // Khi người dùng xác nhận, gọi hàm xóa API
          title='Confirm Delete Appointment'
          // Sử dụng eventTitle để làm message
          message={`Are you sure you want to delete the appointment "${eventTitle}"? This action cannot be undone.`}
        />
      </div>
    </>
  )
}

export default AppointmentCalendar
