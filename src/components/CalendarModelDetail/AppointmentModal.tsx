/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react'
import { Modal } from '../ui/modal'
import { useQuery } from '@tanstack/react-query'
import { APPOINTMENT_STATUS_LIST } from '../../constants/AppointmentConstants'
import { scheduleApi } from '../../api/schedulars.api'
import { ScheduleWork, Service } from '../../types/appoinment.type'
import { serviceApi } from '../../api/services.api'
// GIẢ ĐỊNH: Import API từ các file liên quan (serviceApi, scheduleApi)
// Bạn cần đảm bảo các import này tồn tại trong môi trường của bạn
// import { serviceApi } from '../api/services.api'
// import { scheduleApi } from '../api/schedulars.api'

// Định nghĩa các Interface cần thiết
// interface Service {
//   id: string
//   name: string
//   durationMinutes: number
//   price: number
// }
interface Schedule {
  id: string
  startTime: string
  room: { roomName: string; location: string }
}

// GIẢ ĐỊNH: Định nghĩa hàm mock API để component có thể compile và hiển thị
// Bạn CẦN thay thế chúng bằng các hàm useQuery thực tế của bạn.
// Dữ liệu Mock cho Dịch vụ
const mockServiceData = {
  data: {
    items: [
      { id: 'service-1', name: 'Khám tổng quát', durationMinutes: 60, price: 500000 },
      { id: 'service-2', name: 'Siêu âm', durationMinutes: 30, price: 300000 }
    ]
  }
}

// Dữ liệu Mock cho Lịch trình/Slots
const mockAllScheduleSlots = [
  // Slots cho service-1 (Khám tổng quát)
  {
    id: 'slot-1',
    serviceId: 'service-1',
    startTime: '2025-11-14T09:00:00Z',
    room: { roomName: 'A1', location: 'Tầng 1' }
  },
  {
    id: 'slot-2',
    serviceId: 'service-1',
    startTime: '2025-11-14T10:00:00Z',
    room: { roomName: 'A2', location: 'Tầng 1' }
  },
  // Slots cho service-2 (Siêu âm)
  {
    id: 'slot-3',
    serviceId: 'service-2',
    startTime: '2025-11-14T11:00:00Z',
    room: { roomName: 'B1', location: 'Tầng 2' }
  }
]

const mockApi = {
  getServiceList: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockServiceData
  },

  getScheduleList: async (params?: { date: string; serviceId: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    // ✅ FIX: Chỉ cần có serviceId là lọc, bỏ qua date để đơn giản hóa Mock
    if (params?.serviceId) {
      const filteredByService = mockAllScheduleSlots.filter((slot) => slot.serviceId === params.serviceId)
      return { data: { items: filteredByService } }
    }

    return { data: { items: [] } }
  }
}
// const serviceApi = { getList: () => mockApi.getServiceList() }
// const scheduleApi = { getList: (params: any) => mockApi.getScheduleList(params) }

// --- 1. INTERFACES PROPS (ĐÃ GIẢM THIỂU & TẬP TRUNG VÀO DỮ LIỆU) ---
interface EventModalFormProps {
  // Metadata & Control
  isOpen: boolean
  onClose: () => void
  selectedEvent: any | null
  onSave: () => void
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

  // Navigation & Display Info
  patientName: string
  patientId: string
  doctorName: string
  doctorId: string
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
  eventRoom,
  setEventRoom,
  eventLocation,
  setEventLocation
}) => {
  const isEditing = !!selectedEvent

  // --- GỌI API NỘI BỘ BẰNG useQuery (Để lấy dữ liệu Service và Slot) ---

  // 1. Fetch Danh sách Service
  const { data: servicesData, isLoading: isServicesLoading } = useQuery({
    queryKey: ['allServices'],
    queryFn: () => serviceApi.getServices(),
    staleTime: 1000 * 60 * 5,
    enabled: isOpen
  })

  console.log('ServicesData', servicesData?.data.data)

  const allServices: Service[] = servicesData?.data.data || []

  // 2. Fetch Danh sách Schedule Slots
  const { data: schedulesData, isLoading: isSlotsLoading } = useQuery({
    queryKey: ['allSchedules', appointmentDate, selectedServiceId],
    queryFn: () => scheduleApi.getScheduleByIdBeautyAdvisor(doctorId),
    staleTime: 1000 * 60,
    enabled: isOpen && !!appointmentDate && !!selectedServiceId
  })

  console.log('schedulesData', schedulesData?.data.data)

  const allSchedules: ScheduleWork[] = schedulesData?.data.data
    ? schedulesData.data.data.filter((schedule) => schedule.appointments.length === 0)
    : []

  const selectedService = useMemo(() => {
    return allServices.find((s) => s.id === selectedServiceId)
  }, [allServices, selectedServiceId])

  const servicePrice = selectedService?.price
  const durationMinutes = selectedService?.durationMinutes || 0

  // Hàm setter cho Service ID
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

  // Hàm setter cho Schedule Slot
  const handleScheduleChange = (id: string) => {
    // 1. Tìm schedule
    const schedule = allSchedules.find((s) => s.id === id)

    if (schedule) {
      console.log('schedule', schedule.startTime)

      // 2. Chuyển đổi thời gian
      const start = new Date(schedule.startTime)

      // Cập nhật Date/Time/Location khi Slot thay đổi
      setAppointmentDate(start.toISOString().split('T')[0])
      setStartDateTime(
        `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`
      )

      // ✅ FIX: SỬ DỤNG OPTIONAL CHAINING (?. ) ĐỂ TRUY CẬP AN TOÀN
      setEventRoom(schedule.room?.roomName || 'N/A')
      setEventLocation(schedule.room?.location || 'N/A')
    }
    setSelectedScheduleId(id)
  }

  // --- LOGIC MAPPING VÀ UI CÒN LẠI ---

  const STATUS_API_MAP: { [key: string]: number } = {
    Primary: 1,
    Success: 10,
    Warning: 20,
    Danger: 30
  }

  const dotColorMap: { [key: number]: string } = {
    1: 'bg-blue-500',
    10: 'bg-green-500',
    20: 'bg-yellow-500',
    30: 'bg-red-500'
  }

  const getStatusColor = (num: number) => {
    return dotColorMap[num] || 'bg-gray-500'
  }

  const IconPlaceholder = ({ color }: { color: string }) => <div className={`w-4 h-4 rounded-full ${color}`}></div>

  return (
    <Modal isOpen={isOpen} onClose={onClose} className='max-w-[800px] p-0'>
      <div className='flex flex-col h-full bg-white dark:bg-gray-900 rounded-xl'>
        {/* HEADER */}
        <div className='flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800'>
          <div>
            <h5 className='mb-1 font-bold text-gray-800 modal-title text-xl lg:text-2xl dark:text-white'>
              {isEditing ? 'Chỉnh Sửa Lịch Hẹn' : 'Thêm Lịch Hẹn Mới'}
            </h5>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Quản lý chi tiết, dịch vụ và lịch trình cuộc hẹn.
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
          {/* 1. SECTION: THÔNG TIN CHỦ THỂ & DỊCH VỤ */}
          <div className='p-5 border border-gray-200 rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'>
            <h6 className='mb-4 text-lg font-semibold text-gray-700 dark:text-white'>Thông tin chính</h6>

            {/* Service Selection */}
            <div className='mb-6'>
              <label className='flex items-center mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400'>
                <IconPlaceholder color='bg-blue-500' />
                <span className='ml-2'>Dịch vụ (*serviceId)</span>
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                className='h-11 w-full rounded-lg border border-gray-300 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                disabled={isServicesLoading}
              >
                <option value=''>{isServicesLoading ? 'Đang tải Dịch vụ...' : 'Chọn Dịch vụ'}</option>
                {allServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({service.durationMinutes} phút)
                  </option>
                ))}
              </select>
            </div>

            {/* Tên Bác sĩ và Bệnh nhân */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {/* Tên Bác sĩ */}
              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>Bác sĩ</label>
                <p
                  onClick={() => doctorId && onNavigate(doctorId)}
                  className={`h-11 w-full rounded-lg border border-brand-300 bg-brand-50/50 dark:bg-brand-900/50 px-4 py-2.5 text-sm font-semibold text-brand-700 dark:text-brand-300 transition duration-150 flex items-center ${
                    doctorId ? 'cursor-pointer hover:bg-brand-100 dark:hover:bg-brand-900' : 'cursor-default'
                  }`}
                  title={`Xem chi tiết Bác sĩ ${doctorName}`}
                >
                  <IconPlaceholder color='bg-brand-500' />
                  <span className='ml-2'>{doctorName || 'N/A'}</span>
                </p>
              </div>
              {/* Tên Bệnh nhân */}
              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>Bệnh nhân</label>
                <p
                  onClick={() => patientId && onNavigate(patientId)}
                  className={`h-11 w-full rounded-lg border border-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/50 px-4 py-2.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300 transition duration-150 flex items-center ${
                    patientId ? 'cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900' : 'cursor-default'
                  }`}
                  title={`Xem chi tiết Bệnh nhân ${patientName}`}
                >
                  <IconPlaceholder color='bg-indigo-500' />
                  <span className='ml-2'>{patientName || 'N/A'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* 2. SECTION: LỊCH TRÌNH (DATE, TIME, SCHEDULE, DURATION) */}
          <div className='p-5 border border-gray-200 rounded-lg dark:border-gray-700'>
            <h6 className='mb-4 text-lg font-semibold text-gray-700 dark:text-white'>Lịch trình & Thời gian</h6>

            {/* Schedule Slot Selection */}
            <div className='mb-6'>
              <label className='flex items-center mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400'>
                <IconPlaceholder color='bg-orange-500' />
                <span className='ml-2'>Khung giờ/Slot </span>
              </label>
              <select
                value={selectedScheduleId}
                onChange={(e) => handleScheduleChange(e.target.value)}
                className='h-11 w-full rounded-lg border border-gray-300 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                disabled={isSlotsLoading || !selectedServiceId || !appointmentDate}
              >
                <option value=''>
                  {isSlotsLoading
                    ? 'Đang tải Slots...'
                    : !selectedServiceId || !appointmentDate
                      ? 'Chọn Dịch vụ & Ngày'
                      : allSchedules.length === 0
                        ? 'Không có Slot khả dụng'
                        : 'Chọn Slot'}
                </option>
                {allSchedules.map((schedule) => {
                  const startTime = schedule.startTime
                  const endTime = schedule.endTime

                  // ✅ FIX: Định nghĩa biến với giá trị dự phòng an toàn (N/A hoặc rỗng)
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

            {/* DATE, TIME, DURATION */}
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
              {/* Ngày (*appointmentDate) */}
              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>Ngày Hẹn</label>
                <input
                  type='date'
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className='h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500'
                />
              </div>
              {/* Giờ Bắt đầu (*startDateTime) */}
              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>Giờ Bắt đầu</label>
                <input
                  type='time'
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className='h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500'
                />
              </div>
              {/* Thời lượng (Tính toán nội bộ) */}
              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>
                  Thời lượng (phút)
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

          {/* TRẠNG THÁI (Status: *status) */}
          {/* 3. SECTION: TRẠNG THÁI (STATUS) */}
          <div className='p-5 border border-gray-200 rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'>
            <h6 className='mb-4 text-lg font-semibold text-gray-700 dark:text-white'>Trạng thái cuộc hẹn (*status)</h6>

            {/* ✅ FIX: Sử dụng Grid để phân bố gọn gàng hơn ✅ */}
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
              {APPOINTMENT_STATUS_LIST.map((s) => (
                <label
                  key={s.code}
                  htmlFor={`status-${s.code}`}
                  // Sử dụng Conditional Styling để làm nổi bật lựa chọn đang chọn
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
                    // Ẩn Radio Dot mặc định, chỉ dùng lớp CSS cho hiệu ứng
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
            <div className='p-5 border border-gray-200 rounded-lg dark:border-gray-700'>
              <h6 className='mb-4 text-base font-semibold text-gray-700 dark:text-white'>Session ID</h6>
              <div className=''>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>
                  Session ID (Tùy chọn)
                </label>
                <input
                  type='text'
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className='h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500'
                  placeholder='Ví dụ: 3fa85f64-...'
                />
              </div>
            </div>
          </div>

          {/* 4. SECTION: PHÒNG, GIÁ VÀ GHI CHÚ */}
          <div className='p-5 border border-gray-200 rounded-lg dark:border-gray-700'>
            <h6 className='mb-4 text-lg font-semibold text-gray-700 dark:text-white'>Phòng & Ghi chú</h6>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6'>
              {/* Tên Phòng */}
              <div className=''>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>Tên Phòng</label>
                <input
                  type='text'
                  value={eventRoom}
                  onChange={(e) => setEventRoom(e.target.value)}
                  className='h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500'
                  placeholder='Ví dụ: Room A1'
                />
              </div>

              {/* Khu vực/Tầng */}
              <div className=''>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>
                  Khu vực/Tầng
                </label>
                <input
                  type='text'
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className='h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500'
                  placeholder='Ví dụ: Tầng 3, Khu D'
                />
              </div>
              {/* Giá (Chỉ đọc) */}
              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>Giá Dịch vụ</label>
                <input
                  type='text'
                  value={servicePrice !== undefined ? `${servicePrice.toLocaleString('vi-VN')} VND` : 'N/A'}
                  disabled
                  className='h-10 w-full rounded-lg border border-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-white/90 cursor-not-allowed'
                />
              </div>
            </div>

            {/* Ghi chú (*notes) */}
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className='w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
              placeholder='Thêm ghi chú đặc biệt cho cuộc hẹn này...'
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className='flex items-center gap-3 p-6 border-t border-gray-100 dark:border-gray-800 modal-footer sm:justify-end'>
          <button
            onClick={onClose}
            type='button'
            className='flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto'
          >
            Đóng
          </button>
          <button
            onClick={onSave}
            type='button'
            className='btn btn-success flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-brand-xs hover:bg-brand-600 sm:w-auto'
          >
            {isEditing ? 'Cập Nhật Lịch Hẹn' : 'Thêm Lịch Hẹn'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default EventModalForm
