import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { roomApi } from '../../api/room.api'
import { scheduleApi } from '../../api/schedulars.api'
import { sessionApi } from '../../api/treatmentSession.api'
import userApi from '../../api/user.api'
import { Role } from '../../constants/Roles'
import { useAppContext } from '../../context/AuthContext'
import { ScheduleWork } from '../../types/appoinment.type'
import { TreatmentSession, TreatmentSessionForm, TreatmentSessionStatus } from '../../types/treatmentSession.type'
import { treatmentPlanApi } from '../../api/treatmentPlan.api'

const SESSION_STATUS_NAMES: { [key: number]: string } = {
  [TreatmentSessionStatus.Scheduled]: 'Scheduled',
  // [TreatmentSessionStatus.InProgress]: 'In Progress',
  [TreatmentSessionStatus.Completed]: 'Completed'
  // [TreatmentSessionStatus.Cancelled]: 'Cancelled',
  // [TreatmentSessionStatus.Rescheduled]: 'Rescheduled'
  // [TreatmentSessionStatus.NoShow]: 'No Show'
}

export const initialFormState: TreatmentSessionForm = {
  planId: '',
  sessionNumber: 1,
  staffId: '',
  sessionDate: '',
  startTime: '',
  endTime: '',
  treatmentProcedure: '',
  resultSummary: '',
  status: TreatmentSessionStatus.Scheduled,
  devices: '',
  kits: '',
  roomId: '',
  scheduleId: '' // Khởi tạo scheduleId rỗng
}

// ----------------------------------------------------------------------
// COMPONENT PROPS
// ----------------------------------------------------------------------

interface TreatmentSessionModalProps {
  isOpen: boolean
  onClose: () => void
  session: TreatmentSession | null // Dữ liệu cho Edit/View, null cho Create
  planId: string // ID bắt buộc
  onSave: () => void
  refetch: () => void
  refetchPlan: () => void
}

export default function TreatmentSessionModal({
  isOpen,
  onClose,
  session,
  planId,
  refetch
}: TreatmentSessionModalProps) {
  const { profile } = useAppContext()
  const [form, setForm] = useState<TreatmentSessionForm>(initialFormState)

  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleWork | null>(null)

  const isEditing = !!session
  console.log('isEditing', isEditing)

  const title = isEditing ? `Session #${session.sessionNumber} Details` : 'Schedule New Session'

  const queryClient = useQueryClient()

  const { data: roomsResponse, isFetching: isRoomsLoading } = useQuery({
    queryKey: ['availableRooms', form.sessionDate, form.startTime, form.endTime],
    queryFn: () =>
      roomApi.getRoomsAvailable({
        startDate: form.sessionDate,
        endDate: form.sessionDate, // Vì đây là session đơn lẻ nên start/end date giống nhau
        startTime: form.startTime,
        endTime: form.endTime
      }),
    // Chỉ kích hoạt khi có đủ ngày và giờ, và đang ở chế độ Create (hoặc tùy bạn cho phép Edit)
    enabled: !!form.sessionDate && !!form.startTime && !!form.endTime && isOpen && !isEditing,
    staleTime: 0 // Reset liên tục để đảm bảo tính khả dụng
  })

  // Thêm API vào treatmentPlanApi nếu chưa có (theo file bạn cung cấp ở trên)
  // const { data: planResponse } = useQuery({
  //   queryKey: ['treatmentPlan', planId],
  //   queryFn: () => treatmentPlanApi.getTreateMentsById(planId),
  //   enabled: !!planId
  // })

  const { data: planDetail } = useQuery({
    queryKey: ['treatmentPlan', planId],
    queryFn: () => treatmentPlanApi.getTreateMentsById(planId),
    enabled: !!planId && isOpen // Chỉ chạy khi mở modal
  })

  const planData = planDetail?.data.data
  const planMinDate = planData?.startDate?.substring(0, 10)
  const planMaxDate = planData?.endDate?.substring(0, 10)

  const isAdmin = profile?.role === Role.ADMIN
  const userId = profile?.userId

  const { data: pagingData } = useQuery({
    queryKey: ['users', profile?.role, userId],
    queryFn: async () => {
      if (isAdmin) {
        const res = await userApi.getUsers()
        return res.data
      } else {
        const res = await userApi.getUsersById(userId!)
        return {
          message: res.data.message,
          data: [res.data.data] // ép thành mảng cho đồng nhất
        }
      }
    },
    enabled: !!profile, // tránh chạy trước khi load profile
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false
  })

  console.log('session', session)

  const queryStartDate = form.sessionDate

  const queryEndDate = form.sessionDate

  console.log('queryStartDate', queryStartDate)
  console.log('queryEndDate', queryEndDate)

  const { data: scheduleResponse, isLoading: isScheduleLoading } = useQuery({
    queryKey: ['staffSchedules', form.staffId, queryStartDate, queryEndDate],
    queryFn: () => scheduleApi.getScheduleByStaffIdAndDateRange(form.staffId, queryStartDate, queryEndDate),

    enabled: !!form.staffId && !!form.sessionDate && !isEditing
  })

  console.log('scheduleResponse', scheduleResponse)

  const availableSchedules = scheduleResponse?.data.data.filter(
    (s) => s.status === 1 && (!s.appointments || s.appointments.length === 0)
  )

  useEffect(() => {
    if (session) {
      const scheduleIdFromAppointment = session.appointments[0]?.scheduleId || ''

      setForm({
        planId: session.planId,
        sessionNumber: session.sessionNumber,
        staffId: session.staffId,
        sessionDate: session.sessionDate?.substring(0, 10) || '',
        startTime: session.startTime?.substring(0, 5) || '',
        endTime: session.endTime?.substring(0, 5) || '',
        treatmentProcedure: session.treatmentProcedure,
        resultSummary: session.resultSummary,
        status: session.status,
        devices: session.devices,
        kits: session.kits,
        roomId: session.room.id,

        scheduleId: scheduleIdFromAppointment
      })
      setSelectedSchedule(null)
    } else {
      // CREATE MODE
      setForm((prev) => ({
        ...prev,
        ...initialFormState,
        planId
      }))
      setSelectedSchedule(null)
    }
  }, [session, planId])

  useEffect(() => {
    if (!isEditing && form.staffId && form.sessionDate) {
      if (availableSchedules && availableSchedules.length === 1) {
        const singleSchedule = availableSchedules[0]
        setSelectedSchedule(singleSchedule)

        setForm((prev) => ({
          ...prev,

          startTime: singleSchedule.startTime.substring(0, 5),
          endTime: singleSchedule.endTime.substring(0, 5),

          scheduleId: singleSchedule.id
        }))
        toast.info('Schedule automatically filled in.')
      } else if (availableSchedules && availableSchedules.length > 1) {
        setSelectedSchedule(null)
        setForm((prev) => ({
          ...prev,

          startTime: '',
          endTime: '',
          roomId: '',

          scheduleId: ''
        }))
        toast.warn(
          `Found ${availableSchedules.length} available schedules. Please select one from the dropdown or enter manually.`
        )
      } else if (availableSchedules && availableSchedules.length === 0) {
        setSelectedSchedule(null)
        setForm((prev) => ({
          ...prev,

          startTime: '',
          endTime: '',
          roomId: '',

          scheduleId: ''
        }))
        toast.warn('No available schedules found for this staff on this date. Please enter time and room manually.')
      }
    }
  }, [scheduleResponse, isEditing, form.staffId, form.sessionDate, setForm])

  useEffect(() => {
    if (selectedSchedule && !isEditing) {
      setForm((prev) => ({
        ...prev,
        sessionDate: selectedSchedule.shiftDate.substring(0, 10),
        startTime: selectedSchedule.startTime.substring(0, 5),
        endTime: selectedSchedule.endTime.substring(0, 5),
        roomId: selectedSchedule.roomId,

        scheduleId: selectedSchedule.id
      }))
    } else if (!isEditing && !selectedSchedule && form.staffId && form.sessionDate) {
      setForm((prev) => ({
        ...prev,
        startTime: '',
        endTime: '',
        roomId: '',

        scheduleId: ''
      }))
    }
  }, [selectedSchedule, isEditing, form.staffId, form.sessionDate])

  const saveMutation = useMutation({
    mutationFn: (data: TreatmentSessionForm) => {
      if (isEditing && session?.id) {
        return sessionApi.updateSession(session.id, data)
      } else {
        console.log('dataCreate', data)

        const form = {
          ...data,
          scheduleId: data.scheduleId === '' ? null : data.scheduleId
        }

        console.log('form', form)

        return sessionApi.createSession(form)
      }
    },
    onSuccess: (data) => {
      toast.success(data.data.message)
      refetch()
      queryClient.invalidateQueries({ queryKey: ['treatmentPlans', planId] })
      onClose()
    },
    onError: (error) => {
      toast.error(isEditing ? 'Lỗi khi cập nhật phiên điều trị.' : 'Lỗi khi tạo phiên điều trị.')
      console.error(error)
    }
  })
  if (!isOpen) return null

  const handleScheduleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const scheduleId = e.target.value
    if (scheduleId === '') {
      setSelectedSchedule(null)
    } else {
      const schedule = availableSchedules?.find((s) => s.id === scheduleId)
      setSelectedSchedule(schedule || null)
    }

    setForm((prev) => ({
      ...prev,
      scheduleId: scheduleId
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    const isTimeOrRoomField = name === 'startTime' || name === 'endTime' || name === 'roomId'
    if (!isEditing && selectedSchedule && isTimeOrRoomField) {
      return
    }

    if (name === 'sessionDate' || name === 'staffId') {
      setSelectedSchedule(null)

      setForm((prev) => ({
        ...prev,
        startTime: '',
        endTime: '',
        roomId: '',
        scheduleId: '',
        [name]: value
      }))
      return
    }

    setForm((prev) => ({
      ...prev,
      [name]: name === 'sessionNumber' || name === 'status' ? Number(value) : value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Kiểm tra ràng buộc ngày
    if (planMinDate && planMaxDate) {
      if (form.sessionDate < planMinDate || form.sessionDate > planMaxDate) {
        toast.error(`Ngày phiên điều trị phải nằm trong khoảng từ ${planMinDate} đến ${planMaxDate}`)
        return
      }
    }

    if (!form.roomId || !form.sessionDate || !form.startTime || !form.endTime) {
      toast.error('Vui lòng chọn lịch làm việc hoặc điền đầy đủ thông tin ngày/giờ/phòng.')
      return
    }

    const body: TreatmentSessionForm = {
      ...form,
      planId: planId
    }

    saveMutation.mutate(body)
  }

  const baseInputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-gray-50 disabled:cursor-not-allowed'

  const isFieldsLocked = !isEditing && !!selectedSchedule

  // Lấy thông tin Room đã chọn
  // Dòng 268-269:
  // Lấy thông tin Room đã chọn
  const currentRoom = roomsResponse?.data.data.find((room) => room.id === form.roomId)
  console.log('formRoon', form.roomId)

  console.log('currentRoom', currentRoom)

  const currentRoomDisplayName = currentRoom
    ? `${currentRoom.roomName} - Floor ${currentRoom.floorNumber}`
    : 'Select Room'

  return (
    <div className='fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Modal Header */}
        <div className='p-6 border-b border-gray-200'>
          <h3 className='text-xl font-bold text-gray-900'>{title}</h3>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className='flex-grow overflow-y-auto p-6 space-y-5'>
          {/* Status and Session Number */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>Session Number</label>
              <input
                type='number'
                name='sessionNumber'
                value={form.sessionNumber}
                onChange={handleChange}
                className={baseInputClass}
                min='1'
                required
              />
            </div>
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>Status</label>
              <select name='status' value={form.status} onChange={handleChange} className={baseInputClass} required>
                {Object.entries(SESSION_STATUS_NAMES).map(([key, name]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Staff ID - Di chuyển lên trên */}
          <div>
            <label className='mb-1.5 block text-sm font-medium text-gray-700'>Staff Performing Treatment</label>
            <select
              name='staffId'
              value={form.staffId}
              onChange={handleChange}
              className={baseInputClass}
              required
              disabled={isEditing} // Không đổi staff khi edit
            >
              <option value=''>-- Select Staff --</option>
              {pagingData?.data
                .filter((u) => u.roleName === Role.BEAUTY_ADVISOR)
                .map((staff) => (
                  <option key={staff.userId} value={staff.userId}>
                    {staff.surName} {staff.firstName}
                  </option>
                ))}
            </select>
          </div>

          {/* Date, Time, Room (Locked if schedule is selected in Create mode) */}
          <div className='grid grid-cols-4 gap-4'>
            {/* Date */}
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>Date</label>
              <input
                type='date'
                name='sessionDate'
                value={form.sessionDate}
                onChange={handleChange}
                className={baseInputClass}
                required
                // Ràng buộc ngày ở đây
                min={planMinDate}
                max={planMaxDate}
                readOnly={isEditing}
                disabled={isEditing}
              />
            </div>
            {/* Start Time */}
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>Start Time</label>
              <input
                type='time'
                name='startTime'
                value={form.startTime}
                onChange={handleChange}
                className={baseInputClass}
                required
                readOnly={isFieldsLocked || isEditing}
                disabled={isFieldsLocked || isEditing}
              />
            </div>
            {/* End Time */}
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>End Time</label>
              <input
                type='time'
                name='endTime'
                value={form.endTime}
                onChange={handleChange}
                className={baseInputClass}
                required
                // readOnly={isFieldsLocked}
                // disabled={isFieldsLocked}
                readOnly={isFieldsLocked || isEditing}
                disabled={isFieldsLocked || isEditing}
              />
            </div>
            {/* Room */}
            {/* Room */}
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>
                Room {isRoomsLoading && <span className='text-brand-500 text-xs'>(Checking...)</span>}
              </label>
              <select
                name='roomId'
                value={form.roomId}
                onChange={handleChange}
                className={`${baseInputClass} ${!isRoomsLoading && currentRoomDisplayName.length === 0 && !isEditing ? 'border-red-500' : ''}`}
                required
                // Khóa trường Room nếu đang load, hoặc đã có schedule cố định, hoặc đang edit
                disabled={isRoomsLoading || isFieldsLocked || isEditing}
              >
                {isEditing && currentRoom ? (
                  <option value={currentRoom.id}>{currentRoomDisplayName}</option>
                ) : (
                  <>
                    <option value=''>{isRoomsLoading ? 'Loading available rooms...' : 'Select Room'}</option>
                    {roomsResponse?.data.data.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.roomName} - Floor {room.floorNumber}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {!isRoomsLoading &&
                !isEditing &&
                form.sessionDate &&
                form.startTime &&
                roomsResponse?.data.data.length === 0 && (
                  <p className='mt-1 text-[10px] text-red-500 font-medium'>No rooms available for this time slot.</p>
                )}
            </div>
          </div>

          {!isEditing && form.staffId && form.sessionDate && (
            <div className='col-span-4'>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>
                Available Schedule
                {isScheduleLoading && form.staffId && ' (Loading...)'}
              </label>
              <select
                name='scheduleId'
                value={form.scheduleId || ''}
                onChange={handleScheduleChange}
                className={baseInputClass}
                disabled={!form.staffId || !form.sessionDate || isScheduleLoading}
              >
                <option value=''>-- Select a Schedule (or fill manually) --</option>
                {availableSchedules && availableSchedules.length > 0 ? (
                  availableSchedules?.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.shiftDate.substring(0, 10)} | {schedule.startTime.substring(0, 5)} -{' '}
                      {schedule.endTime.substring(0, 5)} ({schedule.room.roomName})
                    </option>
                  ))
                ) : (
                  <option value='' disabled={!form.staffId || !form.sessionDate}>
                    {form.staffId && form.sessionDate
                      ? 'No available schedules found.'
                      : 'Enter Staff and Date to load schedules.'}
                  </option>
                )}
              </select>
            </div>
          )}

          {/* Devices and Kits */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>Devices Used</label>
              <input
                type='text'
                name='devices'
                value={form.devices}
                onChange={handleChange}
                placeholder='Laser, Ultrasound, etc.'
                className={baseInputClass}
              />
            </div>
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>Kits/Materials Used</label>
              <input
                type='text'
                name='kits'
                value={form.kits}
                onChange={handleChange}
                placeholder='Gauze, Serum X, etc.'
                className={baseInputClass}
              />
            </div>
          </div>

          {/* Treatment Procedure */}
          <div>
            <label className='mb-1.5 block text-sm font-medium text-gray-700'>Treatment Procedure Details</label>
            <textarea
              name='treatmentProcedure'
              rows={4}
              value={form.treatmentProcedure}
              onChange={handleChange}
              placeholder='Detailed steps taken during the session.'
              className={`${baseInputClass} resize-none`}
              required
            />
          </div>

          {/* Result Summary */}
          <div>
            <label className='mb-1.5 block text-sm font-medium text-gray-700'>Result Summary</label>
            <textarea
              name='resultSummary'
              rows={3}
              value={form.resultSummary}
              onChange={handleChange}
              placeholder='Patient response, immediate outcome, and any notes.'
              className={`${baseInputClass} resize-none`}
              required
            />
          </div>

          {/* Modal Footer */}
          <div className='pt-6 border-t border-gray-200 flex justify-end space-x-3'>
            <button
              onClick={onClose}
              type='button'
              className='px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:bg-brand-400'
              disabled={saveMutation.isPending || form.staffId === '' || form.sessionDate === ''}
            >
              {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update Session' : 'Schedule Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
