import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify' // Added toast for notifications
// Assuming types are imported from types file
import { SchedulePayload } from '../../types/registration.type'
import ModalRegistration from './ModalRegistration'
import { ScheduleRegistrationComponent } from '../tables/BasicTables/BasicTableRegistration'
import { useQuery } from '@tanstack/react-query'
import userApi from '../../api/user.api'
import { formatDateToDDMMYYYY, formatDateValue } from '../../utils/validForm'

// Interfaces used in this component (Keep these for context)
interface Template {
  id: string
  name: string
}
interface Slot {
  id: string
  slotMinutes: number
  breakMinutes: number
}

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  registration: ScheduleRegistrationComponent | null
  onSave: (data: RegistrationForm) => void
  isViewMode: boolean
  templates: Template[]
  slots: Slot[]
}

export const WEEKDAY_NAMES: { [key: number]: string } = {
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
  7: 'Sun'
}

type RegistrationForm = SchedulePayload & { id?: string }
type RegistrationErrors = Partial<Record<keyof SchedulePayload | 'general', string>>

const initialErrors: RegistrationErrors = {}

export default function RegistrationModal({
  isOpen,
  onClose,
  registration,
  onSave,
  isViewMode,
  templates,
  slots
}: RegistrationModalProps) {
  const isEditing = !!registration && !isViewMode
  const isCreating = !registration && !isViewMode

  const today = new Date().toISOString().split('T')[0] // Get default ID for Create mode (take the first item if available)
  const defaultTemplateId = templates.length > 0 ? templates[0].id : ''
  const defaultSlotId = slots.length > 0 ? slots[0].id : ''

  const { data: userData } = useQuery({
    queryKey: ['userName'],
    queryFn: () => userApi.getUsersById(registration?.staffId as string),
    enabled: isOpen && !!registration?.staffId,
    select: (data) => data.data.data.emailAddress
  })

  const [form, setForm] = useState<SchedulePayload>({
    startDate: registration ? formatDateValue(registration.startDate) : today,
    endDate: registration ? formatDateValue(registration.endDate) : today,
    startTime: registration?.startTime || '',
    endTime: registration?.endTime || '',
    templateId: registration?.templateId || defaultTemplateId,
    slotId: registration?.slotId || defaultSlotId,
    notes: registration?.notes || '',
    weekdays: registration?.registrationWeekdays.map((w) => w.weekday) || []
  })
  const [errors, setErrors] = useState<RegistrationErrors>(initialErrors) // Reset form/errors when prop 'registration' changes (when opening modal)

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
      // Reset form for Create mode, using default IDs
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
    setErrors(initialErrors) // Reset errors
  }, [registration, defaultTemplateId, defaultSlotId, today])

  const validateForm = (data: SchedulePayload): boolean => {
    const newErrors: RegistrationErrors = {}
    let isValid = true

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

    setErrors(newErrors)
    return isValid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    const name = id as keyof SchedulePayload

    setForm((p) => ({ ...p, [name]: value }))

    // Clear error on change for the specific field
    if (errors[name]) {
      setErrors((p) => ({ ...p, [name]: undefined }))
    }
  }

  const handleWeekdayToggle = (day: number) => {
    setForm((p) => {
      const isSelected = p.weekdays.includes(day)
      const newWeekdays = isSelected ? p.weekdays.filter((w) => w !== day) : [...p.weekdays, day].sort()

      // Clear weekday error if at least one is selected after the change
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

    const dataToSave: RegistrationForm = {
      ...form,
      id: isEditing ? registration?.id : undefined
    }
    onSave(dataToSave)
    toast.success(`${isEditing ? 'Updated' : 'Created'} Schedule Registration successfully!`)
  }

  const title = isCreating
    ? 'Create New Schedule Registration'
    : isEditing
      ? 'Edit Schedule Registration'
      : 'Schedule Registration Details'

  const baseInputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90'

  const errorClass = 'mt-1 text-xs text-red-500'
  const getInputClass = (fieldName: keyof SchedulePayload) => {
    return `${baseInputClass} ${errors[fieldName] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-brand-500 focus:ring-1 focus:ring-brand-500'}`
  }

  return (
    <ModalRegistration isOpen={isOpen} onClose={onClose} title={title}>
      <div className='p-6'>
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
              <span className='font-semibold'>Slot Configuration:</span> {registration.slot.slotMinutes} minutes /
              Break: {registration.slot.breakMinutes} minutes
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Time Range:</span> {formatDateToDDMMYYYY(registration.startDate)} -
              {formatDateToDDMMYYYY(registration.endDate)} ({registration.startTime} - {registration.endTime})
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Weekdays:</span>
              {registration.registrationWeekdays.map((w) => WEEKDAY_NAMES[w.weekday]).join(', ')}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Notes:</span> {registration.notes || 'N/A'}
            </p>
          </div>
        )}
        {/* EDIT/CREATE MODE */}
        {!isViewMode && (
          <div className='space-y-4'>
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
                  --- Select Schedule Template ---
                </option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {errors.templateId && <p className={errorClass}>{errors.templateId}</p>}
            </div>
            <div>
              <label htmlFor='slotId' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Slot Configuration *
              </label>
              <select id='slotId' value={form.slotId} onChange={handleChange} className={getInputClass('slotId')}>
                <option value='' disabled>
                  --- Choose Slot ---
                </option>
                {slots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.slotMinutes} minutes / Break: {s.breakMinutes} minutes
                  </option>
                ))}
              </select>
              {errors.slotId && <p className={errorClass}>{errors.slotId}</p>}
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label htmlFor='startDate' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Start Date *
                </label>

                <input
                  id='startDate'
                  type='date'
                  value={form.startDate}
                  onChange={handleChange}
                  className={getInputClass('startDate')}
                />
                {errors.startDate && <p className={errorClass}>{errors.startDate}</p>}
              </div>
              <div>
                <label htmlFor='endDate' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  End Date *
                </label>

                <input
                  id='endDate'
                  type='date'
                  value={form.endDate}
                  onChange={handleChange}
                  className={getInputClass('endDate')}
                />
                {errors.endDate && <p className={errorClass}>{errors.endDate}</p>}
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label htmlFor='startTime' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Start Time *
                </label>

                <input
                  id='startTime'
                  type='time'
                  value={form.startTime}
                  onChange={handleChange}
                  className={getInputClass('startTime')}
                />
                {errors.startTime && <p className={errorClass}>{errors.startTime}</p>}
              </div>
              <div>
                <label htmlFor='endTime' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  End Time *
                </label>

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
            {/* WEEKDAYS */}
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
          </div>
        )}
      </div>
      {/* FOOTER */}
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
