import { useEffect, useState } from 'react'
import { Room, RoomForm } from '../../types/room.type'
import StaffEmailLookup from '../../utils/StaffEmailLookup'
import ModalRegistration from '../RegistrationModal/ModalRegistration'

interface RoomModalProps {
  isOpen: boolean
  onClose: () => void
  room: Room | null
  onSave: (data: RoomForm & { id?: string }) => void
  isViewMode: boolean
}

type RoomFormData = RoomForm & { id?: string }

export default function RoomModal({ isOpen, onClose, room, onSave, isViewMode }: RoomModalProps) {
  const isEditing = !!room && !isViewMode
  const isCreating = !room && !isViewMode

  const [form, setForm] = useState<RoomForm>({
    roomName: room?.roomName || '',
    location: room?.location || '',
    floorNumber: room?.floorNumber || 0,
    capacity: room?.capacity || 0
  })

  const [errors, setErrors] = useState({
    roomName: '',
    location: '',
    floorNumber: '',
    capacity: ''
  })

  useEffect(() => {
    if (room) {
      setForm({
        roomName: room.roomName,
        location: room.location,
        floorNumber: room.floorNumber,
        capacity: room.capacity
      })
    } else {
      setForm({
        roomName: '',
        location: '',
        floorNumber: 0,
        capacity: 0
      })
    }

    setErrors({
      roomName: '',
      location: '',
      floorNumber: '',
      capacity: ''
    })
  }, [room])

  const validate = () => {
    let valid = true
    const newErrors = { roomName: '', location: '', floorNumber: '', capacity: '' }

    if (!form.roomName.trim()) {
      newErrors.roomName = 'Room name is required.'
      valid = false
    }

    if (!form.location.trim()) {
      newErrors.location = 'Location is required.'
      valid = false
    }

    if (form.floorNumber < 0 || Number.isNaN(form.floorNumber)) {
      console.log(11)

      newErrors.floorNumber = 'Floor number cannot be negative.'
      valid = false
    }

    if (form.capacity <= 0 || Number.isNaN(form.capacity)) {
      newErrors.capacity = 'Capacity must be greater than 0.'
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSave = () => {
    if (!validate()) return

    const dataToSave: RoomFormData = {
      ...form,
      id: isEditing ? room?.id : undefined
    }
    onSave(dataToSave)
  }

  const title = isCreating ? 'Create New Room' : isEditing ? 'Edit Room Details' : 'Room Details'

  const baseInputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90'

  const errorClass = 'text-red-500 text-xs mt-1'

  return (
    <ModalRegistration isOpen={isOpen} onClose={onClose} title={title}>
      <div className='p-6'>
        {/* VIEW MODE */}
        {room && isViewMode && (
          <div className='space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <p>
              <span className='font-semibold'>Room Name:</span> {room.roomName}
            </p>
            <p>
              <span className='font-semibold'>Location:</span> {room.location}
            </p>
            <p>
              <span className='font-semibold'>Floor:</span> {room.floorNumber}
            </p>
            <p>
              <span className='font-semibold'>Capacity:</span> {room.capacity} people
            </p>
            <p>
              <span className='font-semibold'>Created Date:</span> {new Date(room.createdTime).toLocaleDateString()}
            </p>
            <p>
              <span className='font-semibold'>Created By: </span>
              <StaffEmailLookup staffId={room.createdBy} />
            </p>
          </div>
        )}

        {/* EDIT / CREATE MODE */}
        {!isViewMode && (
          <div className='space-y-4'>
            {/* Room Name */}
            <div>
              <input
                type='text'
                placeholder='Room Name (e.g., Meeting Room A)'
                value={form.roomName}
                onChange={(e) => setForm((p) => ({ ...p, roomName: e.target.value }))}
                className={baseInputClass}
              />
              {errors.roomName && <p className={errorClass}>{errors.roomName}</p>}
            </div>

            {/* Location */}
            <div>
              <input
                type='text'
                placeholder='Location (e.g., East Wing)'
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                className={baseInputClass}
              />
              {errors.location && <p className={errorClass}>{errors.location}</p>}
            </div>

            {/* Floor Number */}
            <div>
              <input
                type='number'
                placeholder='Floor Number'
                value={form.floorNumber === 0 ? '' : form.floorNumber}
                onChange={(e) => setForm((p) => ({ ...p, floorNumber: parseInt(e.target.value) || 0 }))}
                className={baseInputClass}
              />
              {errors.floorNumber && <p className={errorClass}>{errors.floorNumber}</p>}
            </div>

            {/* Capacity */}
            <div>
              <input
                type='number'
                placeholder='Capacity (people)'
                value={form.capacity === 0 ? '' : form.capacity}
                onChange={(e) => setForm((p) => ({ ...p, capacity: parseInt(e.target.value) || 0 }))}
                className={baseInputClass}
              />
              {errors.capacity && <p className={errorClass}>{errors.capacity}</p>}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className='flex items-center gap-3 p-6 border-t border-gray-100 dark:border-gray-800 sm:justify-end'>
        <button
          onClick={onClose}
          type='button'
          className='flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sm:w-auto dark:hover:bg-white/[0.03]'
        >
          {isViewMode ? 'Close' : 'Cancel'}
        </button>

        {!isViewMode && (
          <button
            onClick={handleSave}
            type='button'
            className='flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto'
          >
            Save Room
          </button>
        )}
      </div>
    </ModalRegistration>
  )
}
