import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
// Assuming types are imported from types file
import { SchedulePayload } from '../../types/registration.type'
import ModalRegistration from './ModalRegistration'
import { ScheduleRegistrationComponent } from '../tables/BasicTables/BasicTableRegistration'
import { useQuery } from '@tanstack/react-query'
import userApi from '../../api/user.api'
import { formatDateToDDMMYYYY, formatDateValue } from '../../utils/validForm'
import { Role } from '../../constants/Roles'
import { ScheduleTemplate } from '../../types/templete.type'

// Interfaces used in this component

interface Slot {
  id: string
  slotMinutes: number
  breakMinutes: number
}
// Định nghĩa kiểu dữ liệu cho Beauty Advisor
interface BeautyAdvisor {
  userId: string
  emailAddress: string
}

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  registration: ScheduleRegistrationComponent | null
  // Cập nhật onSave để nhận RegistrationForm (có staffId)
  onSave: (data: RegistrationForm) => void
  isViewMode: boolean
  templates: ScheduleTemplate[]
  slots: Slot[]
  // THÊM: Danh sách BA để chọn
  beautyAdvisors: BeautyAdvisor[]
  // THÊM: ID của nhân viên hiện tại/được chọn từ BasicTable (chỉ dùng trong Create)
  initialStaffId?: string
  // THÊM: Role của người dùng hiện tại
  userRole?: string
}

export const WEEKDAY_NAMES: { [key: number]: string } = {
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat'
}

// Cập nhật: Thêm staffId vào RegistrationForm
type RegistrationForm = SchedulePayload & { id?: string; staffId: string }
// Cập nhật: Thêm staffId vào RegistrationErrors
type RegistrationErrors = Partial<Record<keyof SchedulePayload | 'general' | 'staffId', string>>

const initialErrors: RegistrationErrors = {}

export default function RegistrationModal({
  isOpen,
  onClose,
  registration,
  onSave,
  isViewMode,
  templates,
  slots,
  beautyAdvisors,
  initialStaffId,
  userRole
}: RegistrationModalProps) {
  const isEditing = !!registration && !isViewMode
  const isCreating = !registration && !isViewMode
  const isBA = userRole === Role.BEAUTY_ADVISOR // Kiểm tra role

  const today = new Date().toISOString().split('T')[0]
  const defaultTemplateId = templates.length > 0 ? templates[0].id : ''
  const defaultSlotId = slots.length > 0 ? slots[0].id : ''

  // Lấy staffId ban đầu: nếu đang edit thì dùng của registration, nếu create thì dùng initialStaffId (từ BasicTable truyền vào)
  const defaultStaffId = registration?.staffId || initialStaffId || ''

  const { data: userData } = useQuery({
    queryKey: ['userName'],
    queryFn: () => userApi.getUsersById(registration?.staffId as string),
    enabled: isOpen && !!registration?.staffId,
    select: (data) => data.data.data.emailAddress
  })

  // Cập nhật: Thêm staffId vào state form
  const [form, setForm] = useState<SchedulePayload & { staffId: string }>({
    startDate: registration ? formatDateValue(registration.startDate) : today,
    endDate: registration ? formatDateValue(registration.endDate) : today,
    startTime: registration?.startTime || '',
    endTime: registration?.endTime || '',
    templateId: registration?.templateId || defaultTemplateId,
    slotId: registration?.slotId || defaultSlotId,
    notes: registration?.notes || '',
    weekdays: registration?.registrationWeekdays.map((w) => w.weekday) || [],
    staffId: defaultStaffId // THÊM staffId
  })
  const [errors, setErrors] = useState<RegistrationErrors>(initialErrors)

  // useEffect(() => {
  //   if (registration) {
  //     setForm({
  //       startDate: formatDateValue(registration.startDate),
  //       endDate: formatDateValue(registration.endDate),
  //       startTime: registration.startTime,
  //       endTime: registration.endTime,
  //       templateId: registration.templateId,
  //       slotId: registration.slotId,
  //       notes: registration.notes,
  //       weekdays: registration.registrationWeekdays.map((w) => w.weekday),
  //       staffId: registration.staffId // THÊM staffId khi edit
  //     })
  //   } else {
  //     // Reset form for Create mode, using default IDs và initialStaffId
  //     setForm({
  //       startDate: today,
  //       endDate: today,
  //       startTime: '',
  //       endTime: '',
  //       templateId: defaultTemplateId,
  //       slotId: defaultSlotId,
  //       notes: '',
  //       weekdays: [],
  //       staffId: initialStaffId || '' // THÊM staffId khi tạo mới
  //     })
  //   }
  //   setErrors(initialErrors) // Reset errors
  // }, [registration, defaultTemplateId, defaultSlotId, today, initialStaffId])

  useEffect(() => {
    // Chỉ tự động fill khi đang ở chế độ Tạo mới hoặc Chỉnh sửa (không phải View)
    if (form.templateId && !isViewMode) {
      const selectedTemplate = templates.find((t) => t.id === form.templateId) as ScheduleTemplate | undefined

      if (selectedTemplate) {
        setForm((prev) => ({
          ...prev,
          // Tự động gán giá trị từ template vào form
          slotId: selectedTemplate.slotId || prev.slotId,
          startTime: selectedTemplate.startTime || prev.startTime,
          endTime: selectedTemplate.endTime || prev.endTime
        }))

        // Xóa thông báo lỗi của các trường này nếu có
        setErrors((prev) => ({
          ...prev,
          templateId: undefined,
          slotId: undefined,
          startTime: undefined,
          endTime: undefined
        }))
      }
    }
  }, [form.templateId, templates, isViewMode])
  // Validate form (Logic này giữ nguyên)
  const validateForm = (data: SchedulePayload & { staffId: string }): boolean => {
    const newErrors: RegistrationErrors = {}
    let isValid = true

    // 0. Staff ID (Chỉ cần kiểm tra nếu không phải BA)
    if (!isBA && !data.staffId) {
      newErrors.staffId = 'Staff is required.'
      isValid = false
    }

    // 1. Template ID
    if (!data.templateId) {
      newErrors.templateId = 'Schedule Template is required.'
      isValid = false
    }

    // 2. Slot ID
    if (!data.slotId) {
      newErrors.slotId = 'Slot configuration is required.'
      isValid = false
    }

    // 3. Dates (Start/End)
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

    // 4. Times (Start/End)
    if (!data.startTime) {
      newErrors.startTime = 'Start Time is required.'
      isValid = false
    }
    if (!data.endTime) {
      newErrors.endTime = 'End Time is required.'
      isValid = false
    }
    // Time comparison only needed if dates are the same
    if (
      data.startDate &&
      data.endDate &&
      data.startDate === data.endDate &&
      data.startTime &&
      data.endTime &&
      data.startTime >= data.endTime
    ) {
      newErrors.endTime = 'End Time must be later than Start Time on the same day.'
      isValid = false
    }

    // 5. Weekdays
    if (!data.weekdays || data.weekdays.length === 0) {
      newErrors.weekdays = 'At least one weekday must be selected.'
      isValid = false
    }

    // 6. Notes (Max length)
    if (data.notes && data.notes.length > 500) {
      newErrors.notes = 'Notes cannot exceed 500 characters.'
      isValid = false
    }

    const now = new Date()
    now.setSeconds(0, 0)

    if (data.startDate) {
      const startDate = new Date(data.startDate)
      startDate.setHours(0, 0, 0, 0)

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (startDate < today) {
        newErrors.startDate = 'Start date cannot be in the past.'
        isValid = false
      }
    }

    if (data.endDate) {
      const endDate = new Date(data.endDate)
      endDate.setHours(0, 0, 0, 0)

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (endDate < today) {
        newErrors.endDate = 'End date cannot be in the past.'
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  // Các hàm handleChange, handleWeekdayToggle, handleSave giữ nguyên
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    const name = id as keyof (SchedulePayload & { staffId: string })

    setForm((p) => ({ ...p, [name]: value }))

    if (errors[name]) {
      setErrors((p) => ({ ...p, [name]: undefined }))
    }
  }

  const handleWeekdayToggle = (day: number) => {
    setForm((p) => {
      const isSelected = p.weekdays.includes(day)
      const newWeekdays = isSelected ? p.weekdays.filter((w) => w !== day) : [...p.weekdays, day].sort()

      if (newWeekdays.length > 0 && errors.weekdays) {
        setErrors((p) => ({ ...p, weekdays: undefined }))
      }

      return {
        ...p,
        weekdays: newWeekdays
      }
    })
  }

  const handleSave = () => {
    if (!validateForm(form)) {
      toast.error('Please correct the form errors before saving.')
      return
    }

    const { staffId, ...schedulePayload } = form

    const dataToSave: RegistrationForm = {
      ...schedulePayload,
      id: isEditing ? registration?.id : undefined,
      staffId: staffId
    }
    onSave(dataToSave)
  }

  const title = isCreating
    ? 'Create New Schedule Registration'
    : isEditing
      ? 'Edit Schedule Registration'
      : 'Schedule Registration Details'

  const baseInputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90'

  const errorClass = 'mt-1 text-xs text-red-500'

  const getInputClass = (
    fieldName: keyof SchedulePayload | 'staffId' | 'startDate' | 'endDate' | 'startTime' | 'endTime'
  ) => {
    return `${baseInputClass} ${errors[fieldName] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-brand-500 focus:ring-1 focus:ring-brand-500'}`
  }

  return (
    <ModalRegistration isOpen={isOpen} onClose={onClose} title={title}>
      <div className='p-6'>
        {/* VIEW MODE (Giữ nguyên) */}
        {registration && isViewMode && (
          <div className='space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Staff Email: </span>
              {registration.staffId ? userData || registration.staffId : 'N/A'}
            </p>
            {/* ... View mode content ... */}
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Template Name: </span> {registration.template.name}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Slot Configuration: </span> {registration.slot.slotMinutes} minutes /
              Break: {registration.slot.breakMinutes} minutes
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Time Range: </span> {formatDateToDDMMYYYY(registration.startDate)} -
              {formatDateToDDMMYYYY(registration.endDate)} ({registration.startTime} - {registration.endTime})
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Weekdays: </span>
              {registration.registrationWeekdays.map((w) => WEEKDAY_NAMES[w.weekday]).join(', ')}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Notes: </span> {registration.notes || 'N/A'}
            </p>
          </div>
        )}
        {/* EDIT/CREATE MODE */}
        {!isViewMode && (
          <div className='space-y-4'>
            {/* 1. TRƯỜNG CHỌN STAFF (Chỉ hiển thị nếu không phải Beauty Advisor) */}
            {!isBA && (
              <div>
                <label htmlFor='staffId' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Staff Email *
                </label>

                <select
                  id='staffId'
                  value={form.staffId}
                  onChange={handleChange}
                  className={getInputClass('staffId')}
                  disabled={isEditing} // Không cho đổi BA khi chỉnh sửa
                >
                  <option value='' disabled>
                    --- Select Staff ---
                  </option>
                  {beautyAdvisors
                    .filter((ba) => ba.userId !== 'all')
                    .map((ba) => (
                      <option key={ba.userId} value={ba.userId}>
                        {ba.emailAddress}
                      </option>
                    ))}
                </select>
                {errors.staffId && <p className={errorClass}>{errors.staffId}</p>}
              </div>
            )}

            {/* 2. TEMPLATE & SLOT (Gộp lại) */}
            {/* 2. TEMPLATE & SLOT */}
            <div className='grid grid-cols-2 gap-4'>
              {/* Template */}
              <div>
                <label htmlFor='templateId' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Schedule Template *
                </label>
                <select
                  id='templateId'
                  value={form.templateId}
                  onChange={handleChange}
                  className={getInputClass('templateId')}
                >
                  <option value='' disabled>
                    --- Select Template ---
                  </option>
                  {Array.isArray(templates) &&
                    templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
                {errors.templateId && <p className={errorClass}>{errors.templateId}</p>}
              </div>

              {/* Slot - Sẽ tự động được chọn khi chọn Template bên trên */}
              <div>
                <label htmlFor='slotId' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Slot Configuration *
                </label>
                <select id='slotId' value={form.slotId} onChange={handleChange} className={getInputClass('slotId')}>
                  <option value='' disabled>
                    --- Choose Slot ---
                  </option>
                  {Array.isArray(slots) &&
                    slots.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.slotMinutes} min / Break: {s.breakMinutes} min
                      </option>
                    ))}
                </select>
                {errors.slotId && <p className={errorClass}>{errors.slotId}</p>}
              </div>
            </div>

            {/* 3. START DATE & TIME (Gộp lại) */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Start (Date & Time) *
              </label>
              <div className='grid grid-cols-2 gap-4'>
                {/* Start Date */}
                <div>
                  <input
                    id='startDate'
                    type='date'
                    value={form.startDate}
                    onChange={handleChange}
                    className={getInputClass('startDate')}
                  />
                  {errors.startDate && <p className={errorClass}>{errors.startDate}</p>}
                </div>
                {/* Start Time */}
                <div>
                  <input
                    id='startTime'
                    type='time'
                    value={form.startTime}
                    onChange={handleChange}
                    className={getInputClass('startTime')}
                  />
                  {errors.startTime && <p className={errorClass}>{errors.startTime}</p>}
                </div>
              </div>
            </div>

            {/* 4. END DATE & TIME (Gộp lại) */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                End (Date & Time) *
              </label>
              <div className='grid grid-cols-2 gap-4'>
                {/* End Date */}
                <div>
                  <input
                    id='endDate'
                    type='date'
                    value={form.endDate}
                    onChange={handleChange}
                    className={getInputClass('endDate')}
                  />
                  {errors.endDate && <p className={errorClass}>{errors.endDate}</p>}
                </div>
                {/* End Time */}
                <div>
                  <input
                    id='endTime'
                    type='time'
                    value={form.endTime}
                    onChange={handleChange}
                    className={getInputClass('endTime')}
                  />
                  {errors.endTime && <p className={errorClass}>{errors.endTime}</p>}
                </div>
              </div>
            </div>

            {/* 5. WEEKDAYS (Giữ nguyên) */}
            <div>
              <span className='font-semibold text-gray-700 dark:text-gray-300 block mb-2'>
                Select Days of the Week *
              </span>

              <div className='flex flex-wrap gap-2 pt-1'>
                {Object.entries(WEEKDAY_NAMES).map(([key, name]) => {
                  const day = parseInt(key, 10)
                  const isSelected = form.weekdays.includes(day)
                  return (
                    <button
                      key={day}
                      type='button'
                      onClick={() => handleWeekdayToggle(day)}
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
              {errors.weekdays && <p className={errorClass}>{errors.weekdays}</p>}
            </div>

            {/* 6. NOTES (Giữ nguyên) */}
            <div>
              <label htmlFor='notes' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Notes
              </label>

              <textarea
                id='notes'
                rows={3}
                maxLength={500}
                value={form.notes}
                onChange={handleChange}
                placeholder='Add any necessary notes for this schedule registration...'
                className={`${getInputClass('notes')} resize-none`}
              />
              {errors.notes && <p className={errorClass}>{errors.notes}</p>}
            </div>
          </div>
        )}
      </div>
      {/* FOOTER giữ nguyên */}
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
            {isEditing ? 'Save Changes' : 'Create Registration'}
          </button>
        )}
      </div>
    </ModalRegistration>
  )
}
