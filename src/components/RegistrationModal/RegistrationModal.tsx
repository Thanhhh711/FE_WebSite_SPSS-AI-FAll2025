import React, { useEffect, useState } from 'react'
// Giả định các types này được import từ file type (như bạn đã cung cấp)
import { SchedulePayload } from '../../types/registration.type'
import ModalRegistration from './ModalRegistration'
import { ScheduleRegistrationComponent } from '../tables/BasicTables/BasicTableRegistration'
import { useQuery } from '@tanstack/react-query'
import userApi from '../../api/user.api'
import { formatDateToDDMMYYYY, formatDateValue } from '../../utils/utils.type'

// Đã loại bỏ interface trùng lặp và mock data cứng

interface Template {
  id: string
  name: string
}
interface Slot {
  id: string
  slotMinutes: number
  breakMinutes: number
}
// ... (Các interfaces khác như RegistrationWeekday, ScheduleRegistrationComponent, SchedulePayload)

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  registration: ScheduleRegistrationComponent | null
  onSave: (data: RegistrationForm) => void
  isViewMode: boolean
  // Dữ liệu API được truyền qua props
  templates: Template[]
  slots: Slot[]
}

export const WEEKDAY_NAMES: { [key: number]: string } = {
  1: 'T2',
  2: 'T3',
  3: 'T4',
  4: 'T5',
  5: 'T6',
  6: 'T7',
  7: 'CN'
}

type RegistrationForm = SchedulePayload & { id?: string }

export default function RegistrationModal({
  isOpen,
  onClose,
  registration,
  onSave,
  isViewMode,
  // Bóc tách props mới
  templates,
  slots
}: RegistrationModalProps) {
  const isEditing = !!registration && !isViewMode
  const isCreating = !registration && !isViewMode

  const today = new Date().toISOString().split('T')[0]
  // Lấy ID mặc định cho chế độ Create (lấy item đầu tiên nếu có)
  const defaultTemplateId = templates.length > 0 ? templates[0].id : ''
  const defaultSlotId = slots.length > 0 ? slots[0].id : ''

  const { data: userData } = useQuery({
    queryKey: ['userName'],
    queryFn: () => userApi.getUsersById(registration?.staffId as string),
    enabled: isOpen && !!registration?.staffId,
    select: (data) => data.data.data.emailAddress
  })

  // Khởi tạo form state
  const [form, setForm] = useState<SchedulePayload>({
    startDate: registration ? formatDateValue(registration.startDate) : today,
    endDate: registration ? formatDateValue(registration.endDate) : today,
    startTime: registration?.startTime || '',
    endTime: registration?.endTime || '',
    // Sử dụng registration ID hoặc giá trị mặc định/đầu tiên của list
    templateId: registration?.templateId || defaultTemplateId,
    slotId: registration?.slotId || defaultSlotId,
    notes: registration?.notes || '',
    weekdays: registration?.registrationWeekdays.map((w) => w.weekday) || []
  })

  // Đặt lại form khi prop 'registration' thay đổi (khi mở modal ở chế độ View/Edit)
  useEffect(() => {
    if (registration) {
      setForm({
        startDate: formatDateValue(registration.startDate),
        endDate: formatDateValue(registration.endDate),
        startTime: registration.startTime,
        endTime: registration.endTime,
        templateId: registration.templateId,
        slotId: registration.slotId,
        notes: registration.notes,
        weekdays: registration.registrationWeekdays.map((w) => w.weekday)
      })
    } else {
      // Reset form cho chế độ Create, sử dụng ID mặc định
      setForm({
        startDate: today,
        endDate: today,
        startTime: '',
        endTime: '',
        templateId: defaultTemplateId,
        slotId: defaultSlotId,
        notes: '',
        weekdays: []
      })
    }
  }, [registration, defaultTemplateId, defaultSlotId]) // Thêm dependencies

  const handleSave = () => {
    const dataToSave: RegistrationForm = {
      ...form,
      id: isEditing ? registration?.id : undefined
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

  return (
    <ModalRegistration isOpen={isOpen} onClose={onClose} title={title}>
      <div className='p-6'>
        {/* Phần VIEW MODE (Không đổi) */}
        {registration && isViewMode && (
          <div className='space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Staff Email:</span>
              {registration.staffId ? userData || registration.staffId : 'N/A'}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Template Name:</span> {registration.template.name}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Slot Minutes:</span> {registration.slot.slotMinutes} / Break:{' '}
              {registration.slot.breakMinutes}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Time Range:</span> {formatDateToDDMMYYYY(registration.startDate)} -{' '}
              {formatDateToDDMMYYYY(registration.endDate)}/ ({registration.startTime} - {registration.endTime})
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

        {/* Phần EDIT/CREATE MODE */}
        {!isViewMode && (
          <div className='space-y-4'>
            {/* SELECT CHO TEMPLATE (Sử dụng props.templates) */}
            <select
              value={form.templateId}
              onChange={(e) => setForm((p) => ({ ...p, templateId: e.target.value }))}
              className={baseInputClass}
            >
              <option value='' disabled>
                --- Select Schedule Template ---
              </option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* SELECT CHO SLOT (Sử dụng props.slots) */}
            <select
              value={form.slotId}
              onChange={(e) => setForm((p) => ({ ...p, slotId: e.target.value }))}
              className={baseInputClass}
            >
              <option value='' disabled>
                --- Schoose Slot ---
              </option>
              {slots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.slotMinutes} phút / Break: {s.breakMinutes} phút
                </option>
              ))}
            </select>

            <input
              type='date'
              value={form.startDate}
              onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
              placeholder='Start Date'
              className={baseInputClass}
            />
            <input
              type='date'
              value={form.endDate}
              onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
              placeholder='End Date'
              className={baseInputClass}
            />
            <input
              type='time'
              value={form.startTime}
              onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
              placeholder='Start Time'
              className={baseInputClass}
            />
            <input
              type='time'
              value={form.endTime}
              onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
              placeholder='End Time'
              className={baseInputClass}
            />

            {/* TEXTAREA CHO NOTES */}
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder='Notes'
              className={baseInputClass}
            />

            {/* WEEKDAYS GIỮ NGUYÊN */}
            <div className='flex flex-wrap gap-2 pt-2'>
              <span className='font-semibold text-gray-700 dark:text-gray-300'>Select days of the week:</span>

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
          {isViewMode ? 'Close' : 'Cancell'}
        </button>
        {!isViewMode && (
          <button
            onClick={handleSave}
            type='button'
            className='flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-brand-xs hover:bg-brand-600 sm:w-auto'
          >
            Save
          </button>
        )}
      </div>
    </ModalRegistration>
  )
}
