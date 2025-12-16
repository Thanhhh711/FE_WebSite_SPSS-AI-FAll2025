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
import { sessionApi } from '../api/treatmentSession.api'
import userApi from '../api/user.api'
import EventModalForm from '../components/CalendarModelDetail/AppointmentModal'
import ConfirmModal from '../components/CalendarModelDetail/ConfirmModal'
import { APPOINTMENT_STATUS_MAP, AppointmentStatusCode } from '../constants/AppointmentConstants'
import { AppPath } from '../constants/Paths'
import { Role } from '../constants/Roles'
import { useAppContext } from '../context/AuthContext'
import { useModal } from '../hooks/useModal'
import { AppointmentForm, AppointmentResponse } from '../types/appoinment.type'
import { TreatmentSession } from '../types/treatmentSession.type'
import { AuthUser } from '../types/user.type'

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

const STATUS_CLASS_MAP: Record<number, string> = {
  // Nền Pastel + Viền đậm + CHỮ RẤT ĐẬM (Tone 800/900)

  // 0: Pending (Amber)
  [AppointmentStatusCode.Pending]: 'bg-amber-100 border-amber-600 text-amber-900',

  // 1: Confirmed (Emerald)
  [AppointmentStatusCode.Confirmed]: 'bg-emerald-100 border-emerald-600 text-emerald-900',

  // 2: In Progress (Blue)
  [AppointmentStatusCode.InProgress]: 'bg-blue-100 border-blue-600 text-blue-800',

  // 3: Completed (Violet)
  [AppointmentStatusCode.Completed]: 'bg-violet-100 border-violet-600 text-violet-800',

  // 4: Cancelled (Ngoại lệ: Nền đậm + Chữ trắng cho độ tương phản tối đa)
  [AppointmentStatusCode.Cancelled]: 'bg-red-700 border-red-700 text-white shadow-md',

  // 5: Absent (Stone/Gray)
  [AppointmentStatusCode.Absent]: 'bg-stone-100 border-stone-600 text-stone-800',

  // 6: Rescheduled (Orange)
  [AppointmentStatusCode.Rescheduled]: 'bg-orange-100 border-orange-600 text-orange-900'
}
const DEFAULT_COLOR_CLASS = 'bg-gray-100 border-gray-500 text-gray-800'

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
  const [endDateTime, setEndDateTime] = useState('')
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
  const selectedSessionId = selectedEvent?.extendedProps.sessionId || ''
  const slectedAppoimentId = selectedEvent?.id || ''

  console.log('selectedSessionId', selectedSessionId)

  const { data: appointments, refetch } = useQuery<AppointmentResponse>({
    queryKey: ['appointments', profile?.role, profile?.userId], // thêm vào key để tránh cache sai
    queryFn: async () => {
      if (isBeautyAdvisor) {
        const res = await appointmentApi.getAppoinmentByBeatyAdvisorId(profile?.userId)
        console.log('res', res.data.data)

        return res.data
      }

      if (isAdmin) {
        const res = await appointmentApi.getAppoinments()
        console.log('res', res.data.data)

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

  const AppoinmentStatusUpdateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) => appointmentApi.updateStatusAppoiment(id, status)
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

  const { data: sessionData } = useQuery({
    queryKey: ['session', selectedSessionId],
    queryFn: () => sessionApi.getSessionsById((selectedSessionId as string) || ''),
    enabled: isOpen && !!selectedSessionId,
    select: (data) => data.data.data
  })

  console.log('sessionId', selectedSessionId)

  // const { data: sesionData } = useQuery({
  //   queryKey: ['sessionData'],
  //   queryFn: () => sessionApi.getSessions(),

  //   select: (data) => data.data
  // })

  const calendarsEvents = {
    Danger: 'danger',
    Success: 'success',
    Primary: 'primary',
    Warning: 'warning',
    Pending: 'pending',
    InProgress: 'inprogress',
    Completed: 'completed',
    Cancelled: 'cancelled'
  }

  useEffect(() => {
    if (!appointments) return

    if (appointments.message) {
      toast.success(appointments.message)
    }

    if (!appointments.data) return

    const events = appointments.data.map((item) => {
      const statusMap = APPOINTMENT_STATUS_MAP[item.status as keyof typeof APPOINTMENT_STATUS_MAP]

      console.log('statusMap', statusMap)

      const defaultMap = { calendar: 'Danger', dotColor: 'bg-red-500' }

      return {
        id: item.id,
        title: item.service?.name || 'Appointment',
        start: item.startDateTime,
        end: item.endDateTime,
        extendedProps: {
          calendar: statusMap ? statusMap.calendar : defaultMap.calendar,
          room: item.schedule?.room?.roomName || '',
          location: item.schedule?.room?.location || '',
          price: item.service?.price,
          duration: item.durationMinutes,
          notes: item.notes || '',
          userId: item.userId,
          staffId: item.staffId,
          scheduleId: item.schedule?.id,
          serviceId: item.service?.id,
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

    const end = event.end
    if (end) {
      console.log('end', end)

      setEndDateTime(end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })) // HH:MM
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

    console.log('payload', payload)

    if (selectedEvent) {
      console.log('payload', payload)

      AppoinmentStatusUpdateMutation.mutate(
        { id: selectedEvent.id as string, status: payload.status as number },
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
        <div>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            slotEventOverlap={false}
            initialView='dayGridMonth'
            headerToolbar={{
              left: 'prev,next',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            // Logic gán class trạng thái (GIỮ NGUYÊN)
            eventClassNames={(arg) => {
              const status = Number(arg.event.extendedProps.status)

              switch (status) {
                case 0:
                  return ['status-pending']
                case 1:
                  return ['status-confirmed']
                case 2:
                  return ['status-inprogress']
                case 3:
                  return ['status-completed']
                case 4:
                  return ['status-cancelled']
                case 5:
                  return ['status-absent']
                case 6:
                  return ['status-rescheduled']
                default:
                  // Class mặc định
                  return ['status-default']
              }
            }}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={(eventInfo) => {
              const statusCode = Number(eventInfo.event.extendedProps.status) as number // Dùng number thay vì AppointmentStatus

              // Lấy class màu từ map (đã định nghĩa ở ngoài component)
              const colorClass = STATUS_CLASS_MAP[statusCode] || DEFAULT_COLOR_CLASS

              return (
                <div
                  className={`
                    flex items-center gap-1 p-1 rounded-xl border-l-4 h-full
                    shadow-sm
                    ${colorClass}  
                    hover:scale-[1.03] hover:shadow-lg transition duration-200
                    min-w-0
                  `}
                >
                  {/* Loại bỏ các class màu chữ cố định ở đây, để nó thừa hưởng từ div cha */}
                  <span className='fc-event-time text-xs font-bold'>{eventInfo.timeText}</span>

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
            customButtons={{}}
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
          endDateTime={endDateTime}
          setStartDateTime={setStartDateTime}
          status={status}
          setStatus={setStatus}
          sessionId={sessionId}
          setSessionId={setSessionId}
          setDurationMinutes={setDurationMinutes}
          pagingData={[]}
          sesionData={(sessionData as TreatmentSession) || ''}
          onSave={handleAddOrUpdateEvent}
          onDeleted={handleDeleteEvent}
          patientName={isPatientLoading ? 'Đang tải...' : patientData || 'Bệnh nhân (N/A)'}
          patientId={selectedUserId || patientIdState}
          setPatientId={setPatientIdState}
          setDoctorId={setDoctorId}
          doctorName={isDoctorLoading ? 'Đang tải...' : doctorData || 'Bác sĩ (N/A)'}
          doctorId={selectedStaffId || doctorId}
          onNavigate={(id) => handleNavigateToDetail(id)}
          profile={profile as AuthUser}
          appoimentId={slectedAppoimentId as string}
        />

        <ConfirmModal
          isOpen={isConfirmDeleteOpen}
          onClose={() => setIsConfirmDeleteOpen(false)}
          onConfirm={confirmDeleteAction}
          title='Confirm Delete Appointment'
          message={`Are you sure you want to delete the appointment "${eventTitle}"? This action cannot be undone.`}
        />
      </div>
    </>
  )
}

export default AppointmentCalendar
