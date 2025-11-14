import { DateSelectArg, EventClickArg, EventInput } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { appointmentApi } from '../api/appointment.api'
import PageMeta from '../components/common/PageMeta'

import { toast } from 'react-toastify'
import userApi from '../api/user.api'
import { useModal } from '../hooks/useModal'
import { AppointmentResponse } from '../types/appoinment.type'
import { useNavigate } from 'react-router'
import { AppPath } from '../constants/Paths'
import EventModalForm from '../components/CalendarModelDetail/AppointmentModal'
import { APPOINTMENT_STATUS_MAP } from '../constants/AppointmentConstants'

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
  const navigate = useNavigate()

  const calendarRef = useRef<FullCalendar>(null)
  const { isOpen, openModal, closeModal } = useModal()

  const selectedUserId = selectedEvent?.extendedProps.userId
  const selectedStaffId = selectedEvent?.extendedProps.staffId

  const { data: appointments } = useQuery<AppointmentResponse>({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await appointmentApi.getAppoinments()
      return res.data
    }
  })

  console.log('appoiment', appointments)

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
    if (selectedEvent) {
      const logPayload = {
        userId: selectedUserId, // State patientId (tương đương selectedUserId)
        staffId: selectedStaffId, // State doctorId (tương đương selectedStaffId)
        appointmentDate,
        startDateTime,
        durationMinutes,
        status,
        serviceId: selectedServiceIdState, // State selectedServiceId
        scheduleId: selectedScheduleIdState, // State selectedScheduleId
        sessionId, // State sessionId
        notes // State notes
      }

      // Logic gọi API CẬP NHẬT
      console.log('Cập nhật Event với Payload:', logPayload)
    } else {
      console.log('Tạo Event mới với Payload:', {
        selectedServiceIdState,
        appointmentDate,
        startDateTime,
        status,
        sessionId,
        notes,
        eventRoom,
        eventLocation
      })
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

              // Lấy map màu từ code status
              const statusMap = APPOINTMENT_STATUS_MAP[statusCode] || APPOINTMENT_STATUS_MAP[0] // Fallback Pending

              // Lấy color name string (Primary, Success, Danger)
              const color = statusMap.calendar.toLowerCase()
              // Lấy dot color class (bg-...)
              // const dotColorClass = statusMap.dotColor

              // ... (logic colorMap và dotColorMap, bạn có thể giữ nguyên hoặc đơn giản hóa)
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
          // --- ACTION & NAVIGATION ---
          onSave={handleAddOrUpdateEvent}
          patientName={isPatientLoading ? 'Đang tải...' : patientData || 'Bệnh nhân (N/A)'}
          patientId={selectedUserId || ''}
          doctorName={isDoctorLoading ? 'Đang tải...' : doctorData || 'Bác sĩ (N/A)'}
          doctorId={selectedStaffId || ''}
          onNavigate={(id) => handleNavigateToDetail(id)}
        />
      </div>
    </>
  )
}

export default AppointmentCalendar
