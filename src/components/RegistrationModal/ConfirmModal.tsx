import { useEffect, useState } from 'react'
import { SchedulePayload, ScheduleRegistration } from '../../types/registration.type'
import ModalRegistration from './ModalRegistration'
import { WEEKDAY_NAMES } from './RegistrationModal'

type RegistrationForm = SchedulePayload & { id?: string }

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  registration: ScheduleRegistration | null // Dữ liệu cho Edit/View, null cho Create
  onSave: (data: RegistrationForm) => void
  isViewMode: boolean
}

export const RegistrationModal = ({ isOpen, onClose, registration, onSave, isViewMode }: RegistrationModalProps) => {
  const isEditing = !!registration && !isViewMode
  const isCreating = !registration && !isViewMode

  // Khởi tạo form state từ registration hoặc giá trị mặc định
  const [form, setForm] = useState<SchedulePayload>({
    startDate: registration?.startDate || '',
    endDate: registration?.endDate || '',
    startTime: registration?.startTime || '',
    endTime: registration?.endTime || '',
    templateId: registration?.templateId || '',
    slotId: registration?.slotId || '',
    notes: registration?.notes || '',
    weekdays: registration?.registrationWeekdays.map((w) => w.weekday) || []
  })

  // Cập nhật state khi prop registration thay đổi (ví dụ: khi mở modal mới)
  useEffect(() => {
    if (registration) {
      setForm({
        startDate: registration.startDate,
        endDate: registration.endDate,
        startTime: registration.startTime,
        endTime: registration.endTime,
        templateId: registration.templateId,
        slotId: registration.slotId,
        notes: registration.notes,
        weekdays: registration.registrationWeekdays.map((w) => w.weekday)
      })
    } else {
      // Reset form cho chế độ Create
      setForm({
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        templateId: '',
        slotId: '',
        notes: '',
        weekdays: []
      })
    }
  }, [registration])

  const handleSave = () => {
    const dataToSave: RegistrationForm = {
      ...form,
      id: isEditing ? registration?.id : undefined
    }
    // Giả định có Staff ID trong form nếu cần, nhưng tạm thời dùng logic trong mutation
    onSave(dataToSave)
    // onClose() // Không đóng ở đây, để mutation xử lý
  }

  const title = isCreating ? 'Tạo Đăng ký Lịch mới' : isEditing ? 'Chỉnh sửa Đăng ký Lịch' : 'Chi tiết Đăng ký Lịch'

  return (
    <ModalRegistration isOpen={isOpen} onClose={onClose} title={title}>
      <div className='p-6'>
        {/* HIỂN THỊ CHI TIẾT */}
        {registration && isViewMode && (
          <div className='space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Staff ID:</span> {registration.staffId}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Template Name:</span> {registration.template.name}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Slot Minutes:</span> {registration.slot.slotMinutes} / Break:{' '}
              {registration.slot.breakMinutes}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Time Range:</span> {registration.startDate} - {registration.endDate} (
              {registration.startTime} - {registration.endTime})
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Weekdays:</span>{' '}
              {registration.registrationWeekdays.map((w) => WEEKDAY_NAMES[w.weekday]).join(', ')}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Notes:</span> {registration.notes || 'N/A'}
            </p>
          </div>
        )}

        {!isViewMode && (
          <div className='space-y-4'>
            <input
              type='date'
              value={form.startDate}
              onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
              placeholder='Ngày Bắt đầu'
              className='w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90'
            />
            <input
              type='date'
              value={form.endDate}
              onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
              placeholder='Ngày Kết thúc'
              className='w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90'
            />
            <input
              type='time'
              value={form.startTime}
              onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
              placeholder='Giờ Bắt đầu'
              className='w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90'
            />
            <input
              type='time'
              value={form.endTime}
              onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
              placeholder='Giờ Kết thúc'
              className='w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90'
            />
            {/* Mock cho Weekdays */}
            <div className='flex flex-wrap gap-2 pt-2'>
              <span className='font-semibold text-gray-700 dark:text-gray-300'>Chọn các ngày trong tuần:</span>
              {Object.entries(WEEKDAY_NAMES).map(([key, name]) => {
                const day = parseInt(key, 10)
                const isSelected = form.weekdays.includes(day)
                return (
                  <button
                    key={day}
                    type='button'
                    onClick={() => {
                      setForm((p) => ({
                        ...p,
                        weekdays: isSelected ? p.weekdays.filter((w) => w !== day) : [...p.weekdays, day].sort()
                      }))
                    }}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      isSelected
                        ? 'bg-brand-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
      <div className='flex items-center gap-3 p-6 border-t border-gray-100 dark:border-gray-800 modal-footer sm:justify-end'>
        <button
          onClick={onClose}
          type='button'
          className='flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto'
        >
          {isViewMode ? 'Đóng' : 'Hủy'}
        </button>
        {!isViewMode && (
          <button
            onClick={handleSave}
            type='button'
            className='flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-brand-xs hover:bg-brand-600 sm:w-auto'
          >
            Lưu Đăng ký
          </button>
        )}
      </div>
    </ModalRegistration>
  )
}
