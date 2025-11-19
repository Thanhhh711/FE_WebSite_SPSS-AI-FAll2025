/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import { Room, RoomForm } from '../../types/room.type'
import ModalRegistration from '../RegistrationModal/ModalRegistration'
import StaffEmailLookup from '../RegistrationModal/StaffEmailLookup'

interface RoomModalProps {
  isOpen: boolean
  onClose: () => void
  room: Room | null // Dữ liệu cho Edit/View, null cho Create
  onSave: (data: RoomForm & { id?: string }) => void
  isViewMode: boolean
}

type RoomFormData = RoomForm & { id?: string }

export default function RoomModal({ isOpen, onClose, room, onSave, isViewMode }: RoomModalProps) {
  const isEditing = !!room && !isViewMode
  const isCreating = !room && !isViewMode

  // --- Khởi tạo Form State ---
  const [form, setForm] = useState<RoomForm>({
    roomName: room?.roomName || '',
    location: room?.location || '',
    floorNumber: room?.floorNumber || 0, // Khởi tạo số là 0
    capacity: room?.capacity || 0 // Khởi tạo số là 0
  })

  // Cập nhật form state khi 'room' thay đổi (mở modal)
  useEffect(() => {
    if (room) {
      setForm({
        roomName: room.roomName,
        location: room.location,
        floorNumber: room.floorNumber,
        capacity: room.capacity
      })
    } else {
      // Reset form cho chế độ Create
      setForm({
        roomName: '',
        location: '',
        floorNumber: 0,
        capacity: 0
      })
    }
  }, [room])

  const handleSave = () => {
    const dataToSave: RoomFormData = {
      ...form,
      id: isEditing ? room?.id : undefined
    }
    onSave(dataToSave)
  }

  const title = isCreating ? 'Tạo Phòng mới' : isEditing ? 'Chỉnh sửa Chi tiết Phòng' : 'Chi tiết Phòng'

  const baseInputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90'

  return (
    <ModalRegistration isOpen={isOpen} onClose={onClose} title={title}>
      <div className='p-6'>
        {/* Phần VIEW MODE */}
        {room && isViewMode && (
          <div className='space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Room Name:</span> {room.roomName}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Location:</span> {room.location}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Floor:</span> {room.floorNumber}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Capacity:</span> {room.capacity} people
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Created Date:</span> {new Date(room.createdTime).toLocaleDateString()}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Created By: </span>
              <StaffEmailLookup staffId={room.createdBy} />
            </p>
          </div>
        )}

        {/* Phần EDIT/CREATE MODE */}
        {!isViewMode && (
          <div className='space-y-4'>
            <input
              type='text'
              placeholder='Room Name (e.g., Meeting Room A)'
              value={form.roomName}
              onChange={(e) => setForm((p) => ({ ...p, roomName: e.target.value }))}
              className={baseInputClass}
            />
            <input
              type='text'
              placeholder='Location/Area (e.g., East Wing)'
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              className={baseInputClass}
            />
            <input
              type='number'
              placeholder='Floor Number'
              value={form.floorNumber === 0 ? '' : form.floorNumber} // Handle initial 0 value
              onChange={(e) => setForm((p) => ({ ...p, floorNumber: parseInt(e.target.value) || 0 }))}
              className={baseInputClass}
            />
            <input
              type='number'
              placeholder='Capacity (people)'
              value={form.capacity === 0 ? '' : form.capacity} // Handle initial 0 value
              onChange={(e) => setForm((p) => ({ ...p, capacity: parseInt(e.target.value) || 0 }))}
              className={baseInputClass}
            />
          </div>
        )}
      </div>

      <div className='flex items-center gap-3 p-6 border-t border-gray-100 dark:border-gray-800 modal-footer sm:justify-end'>
        <button
          onClick={onClose}
          type='button'
          className='flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto'
        >
          {isViewMode ? 'Close' : 'Cancel'}
        </button>
        {!isViewMode && (
          <button
            onClick={handleSave}
            type='button'
            className='flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-brand-xs hover:bg-brand-600 sm:w-auto'
          >
            Save Room
          </button>
        )}
      </div>
    </ModalRegistration>
  )
}
