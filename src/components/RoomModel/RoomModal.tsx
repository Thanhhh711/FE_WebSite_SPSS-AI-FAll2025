import { useEffect, useState } from 'react'
import { Room, RoomForm } from '../../types/room.type'
import StaffEmailLookup from '../../utils/StaffEmailLookup'
import ModalRegistration from '../RegistrationModal/ModalRegistration'
// THÊM: Icon cho giao diện mới
import { Home, MapPin, Layers, Users, Edit3, PlusCircle, Calendar, User } from 'lucide-react'

interface RoomModalProps {
  isOpen: boolean
  onClose: () => void
  room: Room | null
  onSave: (data: RoomForm & { id?: string }) => void
  isViewMode: boolean
}

type RoomFormData = RoomForm & { id?: string }
// Cập nhật kiểu Errors để hỗ trợ Partial
type RoomErrors = Partial<Record<keyof RoomForm, string>>

export default function RoomModal({ isOpen, onClose, room, onSave, isViewMode }: RoomModalProps) {
  const isEditing = !!room && !isViewMode
  const isCreating = !room && !isViewMode

  const [form, setForm] = useState<RoomForm>({
    roomName: room?.roomName || '',
    location: room?.location || '',
    floorNumber: room?.floorNumber || 0,
    capacity: room?.capacity || 0
  })

  // Cập nhật kiểu errors
  const [errors, setErrors] = useState<RoomErrors>({})

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

    setErrors({}) // Reset errors
  }, [room, isOpen]) // Thêm isOpen vào dependency array để reset khi mở modal

  const validate = () => {
    let valid = true
    const newErrors: RoomErrors = {}

    if (!form.roomName.trim()) {
      newErrors.roomName = 'Room name is required.'
      valid = false
    }

    if (!form.location.trim()) {
      newErrors.location = 'Location is required.'
      valid = false
    }

    if (form.floorNumber < 0 || Number.isNaN(form.floorNumber) || form.floorNumber === null) {
      newErrors.floorNumber = 'Floor number must be 0 or positive.'
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
  const HeaderIcon = isEditing ? Edit3 : PlusCircle

  // --- MODERN UI CLASSES ---
  const baseInputClass =
    'w-full border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-800 dark:text-white/90 text-base shadow-sm transition duration-200 ease-in-out'
  const labelClass = 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'
  const errorClass = 'text-xs text-red-500 font-medium mt-1'
  const iconWrapperClass =
    'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none w-4 h-4'

  const getInputClass = (fieldName: keyof RoomForm) => {
    const errorState = errors[fieldName]
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50'
    return `${baseInputClass} ${errorState} pl-10`
  }

  const renderHeader = () => (
    // HEADER: Sử dụng flex và padding lớn hơn để làm nổi bật
    <div className='flex items-center justify-between p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800'>
      <div className='flex items-center space-x-3'>
        <HeaderIcon className='w-6 h-6 text-brand-500' />
        <h3 className='text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white'>{title}</h3>
      </div>
      {/* Nút đóng tùy chỉnh */}
    </div>
  )

  const renderInputGroup = (
    id: keyof RoomForm,
    label: string,
    Icon: React.ElementType,
    placeholder: string,
    inputType: 'text' | 'number' = 'text'
  ) => {
    const isNumber = inputType === 'number'
    const value = form[id]

    // Đảm bảo trường số hiển thị trống khi giá trị là 0 trong chế độ tạo/chỉnh sửa
    const inputValue = isNumber && (isCreating || isEditing) && value === 0 ? '' : value

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = isNumber ? parseInt(e.target.value) || 0 : e.target.value
      setForm((p) => ({ ...p, [id]: newValue }))
      if (errors[id]) {
        setErrors((p) => ({ ...p, [id]: undefined }))
      }
    }

    return (
      <div>
        <label htmlFor={id} className={labelClass}>
          {label} <span className='text-red-500'>*</span>
        </label>
        <div className='relative'>
          <Icon className={iconWrapperClass} />
          <input
            id={id}
            type={inputType}
            placeholder={placeholder}
            value={inputValue}
            onChange={handleChange}
            className={getInputClass(id)}
            min={isNumber ? (id === 'floorNumber' ? 0 : 1) : undefined}
          />
        </div>
        {errors[id] && <p className={errorClass}>{errors[id]}</p>}
      </div>
    )
  }

  return (
    // Thay đổi ModalRegistration để loại bỏ header cũ và cho phép sử dụng header tùy chỉnh
    <ModalRegistration isOpen={isOpen} onClose={onClose} title={title}>
      {renderHeader()}
      <div className='p-6 sm:p-8'>
        {/* VIEW MODE */}
        {room && isViewMode && (
          // Cải thiện View Mode với nền và icon
          <div className='space-y-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-inner text-sm'>
            <p className='text-gray-700 dark:text-gray-300 flex items-center space-x-2'>
              <Home className='w-4 h-4 text-brand-500' />
              <span className='font-semibold'>Room Name:</span> <span>{room.roomName}</span>
            </p>
            <p className='text-gray-700 dark:text-gray-300 flex items-center space-x-2'>
              <MapPin className='w-4 h-4 text-brand-500' />
              <span className='font-semibold'>Location:</span> <span>{room.location}</span>
            </p>
            <p className='text-gray-700 dark:text-gray-300 flex items-center space-x-2'>
              <Layers className='w-4 h-4 text-brand-500' />
              <span className='font-semibold'>Floor:</span> <span>{room.floorNumber}</span>
            </p>
            <p className='text-gray-700 dark:text-gray-300 flex items-center space-x-2'>
              <Users className='w-4 h-4 text-brand-500' />
              <span className='font-semibold'>Capacity:</span> <span>{room.capacity} people</span>
            </p>
            {/* Metadata (Ngày tạo, Người tạo) */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-2 pt-2 border-t border-gray-200 dark:border-gray-700 mt-4'>
              <p className='text-gray-700 dark:text-gray-300 flex items-center space-x-2'>
                <Calendar className='w-4 h-4 text-gray-500' />
                <span className='font-semibold'>Created Date:</span>{' '}
                <span>{new Date(room.createdTime).toLocaleDateString()}</span>
              </p>
              <div className='text-gray-700 dark:text-gray-300 flex items-start space-x-2'>
                <User className='flex-shrink-0 w-4 h-4 text-gray-500 mt-0.5' />
                <span className='font-semibold flex-shrink-0'>Created By:</span>
                {/* Phần StaffEmailLookup được bọc trong <span> có thuộc tính xử lý từ dài */}
                <span className='min-w-0 break-words'>
                  <StaffEmailLookup staffId={room.createdBy} />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* EDIT / CREATE MODE */}
        {!isViewMode && (
          <div className='space-y-6'>
            {/* Room Name */}
            {renderInputGroup('roomName', 'Room Name', Home, 'Example: Spa Room 1')}

            {/* Location */}
            {renderInputGroup('location', 'Location', MapPin, 'Example: East Wing')}

            {/* Floor Number & Capacity (Gộp lại) */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
              {/* Floor Number */}
              {renderInputGroup('floorNumber', 'Floor Number', Layers, 'Example: 3', 'number')}
              {/* Capacity */}
              {renderInputGroup('capacity', 'Capacity (people)', Users, 'Example: 5', 'number')}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className='flex items-center gap-3 p-6 border-t border-gray-100 dark:border-gray-800 sm:justify-end'>
        <button
          onClick={onClose}
          type='button'
          // Cải thiện style nút Hủy/Đóng
          className='flex w-full justify-center rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-3 text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150 sm:w-auto'
        >
          {isViewMode ? 'Close' : 'Cancel'}
        </button>

        {!isViewMode && (
          <button
            onClick={handleSave}
            type='button'
            // Cải thiện style nút Lưu/Tạo
            className='flex w-full justify-center rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition duration-150 sm:w-auto'
          >
            {isEditing ? 'Save Changes' : 'Create Room'}
          </button>
        )}
      </div>
    </ModalRegistration>
  )
}
