// AssignRoomModal.tsx

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { roomApi } from '../../api/room.api'
import { BookingPayload } from '../../types/schedula.type'
import userApi from '../../api/user.api'
import { Room } from '../../types/room.type'
import { User } from '../../types/user.type'

interface AssignRoomModalProps {
  isOpen: boolean
  onClose: () => void
  onAssign: (data: BookingPayload) => void // Hàm mutate từ BasicTableRoom
}

export default function AssignRoomModal({ isOpen, onClose, onAssign }: AssignRoomModalProps) {
  // Lấy danh sách Phòng
  const { data: roomsQuery } = useQuery({
    queryKey: ['allRoomsForAssignment'],
    queryFn: roomApi.getRooms
  })

  // Lấy danh sách Nhân viên (Beauty Advisor)
  const { data: staffQuery } = useQuery({
    queryKey: ['beatyAdvisors'],
    queryFn: userApi.getBeatyAdvisor
  })

  const availableRooms: Room[] = roomsQuery?.data.data || []
  const staffList: User[] = staffQuery?.data.data || [] // Giả định User[]

  // Trạng thái Form
  const [formData, setFormData] = useState<BookingPayload>({
    roomId: '',
    staffId: '',
    startDate: new Date().toISOString().split('T')[0], // Mặc định là ngày hiện tại
    endDate: new Date().toISOString().split('T')[0] // Mặc định là ngày hiện tại
  })

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Kiểm tra validation đơn giản
    if (!formData.roomId || !formData.staffId || !formData.startDate || !formData.endDate) {
      // Hiển thị toast lỗi hoặc thông báo
      return
    }

    onAssign(formData) // Gọi mutation từ component cha
    // Không đóng modal ở đây, để mutation onSuccess đóng sau khi thành công
  }

  if (!isOpen) return null // Dùng cơ chế render có điều kiện thay vì modal component nội bộ

  return (
    // Thay thế bằng Modal UI Component thực tế của bạn
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white p-6 rounded-lg w-full max-w-md'>
        <h2 className='text-xl font-bold mb-4'>Assign Room to Staff</h2>

        <form onSubmit={handleSubmit}>
          {/* Room Selection */}
          <div className='mb-4'>
            <label htmlFor='roomId' className='block text-sm font-medium text-gray-700'>
              Room Name
            </label>
            <select
              id='roomId'
              name='roomId'
              value={formData.roomId}
              onChange={handleChange}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm'
              required
            >
              <option value=''>Select a Room</option>
              {availableRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {`${room.roomName} (${room.location} - Floor ${room.floorNumber})`}
                </option>
              ))}
            </select>
          </div>

          {/* Staff Selection */}
          <div className='mb-4'>
            <label htmlFor='staffId' className='block text-sm font-medium text-gray-700'>
              Staff (Beauty Advisor)
            </label>
            <select
              id='staffId'
              name='staffId'
              value={formData.staffId}
              onChange={handleChange}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm'
              required
            >
              <option value=''>Select a Staff</option>
              {staffList.map((staff) => (
                <option key={staff.userId} value={staff.userId}>
                  {staff.firstName || staff.emailAddress} {/* Giả định User có fullName/email */}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className='mb-4'>
            <label htmlFor='startDate' className='block text-sm font-medium text-gray-700'>
              Start Date
            </label>
            <input
              type='date'
              id='startDate'
              name='startDate'
              value={formData.startDate}
              onChange={handleChange}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm'
              required
            />
          </div>

          {/* End Date */}
          <div className='mb-6'>
            <label htmlFor='endDate' className='block text-sm font-medium text-gray-700'>
              End Date
            </label>
            <input
              type='date'
              id='endDate'
              name='endDate'
              value={formData.endDate}
              onChange={handleChange}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm'
              required
            />
          </div>

          <div className='flex justify-end gap-3'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg shadow-brand-xs hover:bg-brand-600 transition-colors'
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
