import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react' // Đảm bảo import React
import { roomApi } from '../../api/room.api'
import { BookingPayload } from '../../types/schedula.type'
import userApi from '../../api/user.api'
import { Room } from '../../types/room.type'
import { User } from '../../types/user.type'
import { toast } from 'react-toastify' // Import toast cho thông báo lỗi
// GIẢ ĐỊNH: Import ModalRegistration từ đúng đường dẫn
import ModalRegistration from '../RegistrationModal/ModalRegistration'

interface AssignRoomModalProps {
  isOpen: boolean
  onClose: () => void
  onAssign: (data: BookingPayload) => void // Hàm mutate từ BasicTableRoom
}

export default function AssignRoomModal({ isOpen, onClose, onAssign }: AssignRoomModalProps) {
  // Trạng thái Form
  const [formData, setFormData] = useState({
    roomId: '',
    staffId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    startTime: '08:00', // Giá trị mặc định hoặc để trống
    endTime: '17:00' // Giá trị mặc định hoặc để trống
  })
  // Lấy danh sách Phòng
  const { data: roomsQuery, isFetching: isRoomsLoading } = useQuery({
    queryKey: ['availableRooms', formData.startDate, formData.endDate, formData.startTime, formData.endTime],
    queryFn: () =>
      roomApi.getRoomsAvailable({
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime
      }),
    enabled: !!formData.startDate && !!formData.endDate && isOpen, // Chỉ gọi khi modal mở và có đủ ngày
    placeholderData: (previousData) => previousData // Giữ dữ liệu cũ trong khi load dữ liệu mới để UI không bị giật
  })
  // Lấy danh sách Nhân viên (Beauty Advisor)
  const { data: staffQuery } = useQuery({
    queryKey: ['beatyAdvisors'],
    queryFn: userApi.getBeatyAdvisor
  })

  const availableRooms: Room[] = roomsQuery?.data.data || []
  const staffList: User[] = staffQuery?.data.data || [] // Giả định User[]

  // State quản lý lỗi (tuỳ chọn)
  const [errors, setErrors] = useState<Partial<Record<keyof BookingPayload, string>>>({})

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (errors[name as keyof BookingPayload]) {
      setErrors((p) => ({ ...p, [name]: undefined }))
    }
  }

  const validateForm = (data: BookingPayload) => {
    const newErrors: Partial<Record<keyof BookingPayload, string>> = {}
    let isValid = true

    if (!data.roomId) {
      newErrors.roomId = 'Room is required.'
      isValid = false
    }
    if (!data.staffId) {
      newErrors.staffId = 'Staff is required.'
      isValid = false
    }
    if (!data.startDate) {
      newErrors.startDate = 'Start Date is required.'
      isValid = false
    }
    if (!data.endDate) {
      newErrors.endDate = 'End Date is required.'
      isValid = false
    }
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      newErrors.endDate = 'End Date cannot be before Start Date.'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm(formData)) {
      toast.error('Please correct the form errors before assigning.')
      return
    }

    onAssign(formData) // Gọi mutation từ component cha
    // Không đóng modal ở đây, để mutation onSuccess đóng sau khi thành công
  }

  // --- UI/UX improvements ---

  const baseInputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90'
  const errorClass = 'mt-1 text-xs text-red-500'
  // const getInputClass = (fieldName: keyof BookingPayload) => {
  //   return `${baseInputClass} ${errors[fieldName] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-brand-500 focus:ring-1 focus:ring-brand-500'}`
  // }

  // Thay thế div modal nội bộ bằng ModalRegistration component
  return (
    <ModalRegistration isOpen={isOpen} onClose={onClose} title='Assign Room to Staff'>
      <form onSubmit={handleSubmit} className='p-6 space-y-4'>
        {/* Date Selection First - Vì phòng phụ thuộc vào ngày */}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Start Date *</label>
            <input
              type='date'
              name='startDate'
              value={formData.startDate}
              onChange={handleChange}
              className={baseInputClass}
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>End Date *</label>
            <input
              type='date'
              name='endDate'
              value={formData.endDate}
              onChange={handleChange}
              className={baseInputClass}
              required
            />
          </div>
        </div>

        {/* Room Selection */}
        <div>
          <label htmlFor='roomId' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            Available Room * {isRoomsLoading && <span className='text-blue-500 text-xs'>(Updating...)</span>}
          </label>
          <select
            id='roomId'
            name='roomId'
            value={formData.roomId}
            onChange={handleChange}
            className={`${baseInputClass} ${errors.roomId ? 'border-red-500' : ''}`}
            required
            disabled={isRoomsLoading}
          >
            <option value=''>
              {isRoomsLoading ? 'Loading available rooms...' : '--- Select an Available Room ---'}
            </option>
            {availableRooms.map((room) => (
              <option key={room.id} value={room.id}>
                {`${room.roomName} (${room.location} - Floor ${room.floorNumber})`}
              </option>
            ))}
          </select>
          {errors.roomId && <p className={errorClass}>{errors.roomId}</p>}
          {!isRoomsLoading && availableRooms.length === 0 && (
            <p className='mt-1 text-xs text-amber-600'>No rooms available for the selected dates.</p>
          )}
        </div>

        {/* Staff Selection */}
        <div>
          <label htmlFor='staffId' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            Staff (Beauty Advisor) *
          </label>
          <select
            id='staffId'
            name='staffId'
            value={formData.staffId}
            onChange={handleChange}
            className={baseInputClass}
            required
          >
            <option value=''>--- Select a Staff ---</option>
            {staffList.map((staff) => (
              <option key={staff.userId} value={staff.userId}>
                {staff.surName && staff.firstName ? `${staff.surName} ${staff.firstName}` : staff.userId}
              </option>
            ))}
          </select>
        </div>

        <div className='flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={isRoomsLoading}
            className='px-4 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50'
          >
            Confirm Assignment
          </button>
        </div>
      </form>
    </ModalRegistration>
  )
}
