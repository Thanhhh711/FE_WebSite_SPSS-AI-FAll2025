/* eslint-disable @typescript-eslint/no-explicit-any */
import { Calendar, Clock, Info } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { slotApi } from '../../api/slot.api'
import { Slot } from '../../types/slot.type'
import { ScheduleTemplate, TemplateForm } from '../../types/templete.type'
import StaffEmailLookup from '../../utils/StaffEmailLookup'
import ModalRegistration from '../RegistrationModal/ModalRegistration'

interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
  template: ScheduleTemplate | null
  onSave: (data: TemplateForm & { id?: string }) => void
  isViewMode: boolean
}

type TemplateErrors = Partial<Record<keyof TemplateForm, string>>

export default function TemplateModal({ isOpen, onClose, template, onSave, isViewMode }: TemplateModalProps) {
  const isEditing = !!template && !isViewMode
  const isCreating = !template && !isViewMode

  // --- STATE ---
  const [slots, setSlots] = useState<Slot[]>([])
  const [form, setForm] = useState<TemplateForm>({
    name: template?.name || '',
    description: template?.description || '',
    startTime: template?.startTime || '',
    endTime: template?.endTime || '',
    slotId: template?.slotId || ''
  })
  const [errors, setErrors] = useState<TemplateErrors>({})

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await slotApi.getSlots()
        setSlots(res.data.data) // Lấy danh sách slot từ API
      } catch (error) {
        console.error('Failed to fetch slots:', error)
      }
    }
    fetchSlots()
  }, [])

  useEffect(() => {
    if (template) {
      setForm({
        name: template.name,
        description: template.description,
        startTime: template.startTime,
        endTime: template.endTime,
        slotId: template.slotId
      })
    } else {
      setForm({ name: '', description: '', startTime: '', endTime: '', slotId: '' })
    }
    setErrors({})
  }, [template])

  // --- LOGIC ---
  const validateForm = (): boolean => {
    const newErrors: TemplateErrors = {}
    if (!form.name.trim()) newErrors.name = 'Template Name is required.'
    if (!form.startTime) newErrors.startTime = 'Start Time is required.'
    if (!form.endTime) newErrors.endTime = 'End Time is required.'
    if (!form.slotId) newErrors.slotId = 'Please select a Slot duration.'
    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      newErrors.endTime = 'End Time must be after Start Time.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) {
      toast.error('Please check the required fields.')
      return
    }
    onSave({ ...form, id: template?.id })
  }

  const getSlotInfo = (slotId: string) => {
    return slots.find((s) => s.id === slotId)
  }

  // --- UI HELPERS ---
  const inputClass = (field: keyof TemplateForm) => `
    w-full rounded-xl border px-4 py-2.5 text-sm transition-all outline-none
    ${errors[field] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'}
    bg-white dark:bg-gray-900 dark:text-white
  `

  const labelClass = 'flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5'

  return (
    <ModalRegistration
      isOpen={isOpen}
      onClose={onClose}
      title={isCreating ? 'Create Template' : isEditing ? 'Edit Template' : 'Template Details'}
    >
      <div className='p-6 max-h-[75vh] overflow-y-auto custom-scrollbar'>
        {isViewMode && template ? (
          /* VIEW MODE UI */
          <div className='space-y-4'>
            <div className='bg-brand-50 dark:bg-brand-500/10 p-4 rounded-2xl border border-brand-100 dark:border-brand-500/20'>
              <h3 className='text-lg font-bold text-brand-600 dark:text-brand-400'>{template.name}</h3>
              <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>{template.description}</p>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='p-3 bg-gray-50 dark:bg-gray-800 rounded-xl'>
                <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Duration</p>
                <p className='text-sm font-semibold dark:text-gray-300'>
                  {template.startTime} - {template.endTime}
                </p>
              </div>
              <div className='p-3 bg-gray-50 dark:bg-gray-800 rounded-xl'>
                <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Slot Assigned</p>
                <span className='text-xs font-bold whitespace-nowrap dark:text-gray-300'>
                  {(() => {
                    const slotDetail = getSlotInfo(template.slotId)
                    return slotDetail ? `${slotDetail.slotMinutes}m / ${slotDetail.breakMinutes}m break` : 'Loading...'
                  })()}
                </span>
              </div>
            </div>

            <div className='flex items-center justify-between px-2 pt-2 text-xs text-gray-500'>
              <span className='flex items-center gap-1'>
                <Calendar size={12} /> {new Date(template.createdTime).toLocaleDateString()}
              </span>
              <span>
                By: <StaffEmailLookup staffId={template.createdBy} />
              </span>
            </div>
          </div>
        ) : (
          /* EDIT/CREATE MODE UI */
          <div className='space-y-5'>
            {/* Name field */}
            <div>
              <label className={labelClass}>Template Name *</label>
              <input
                type='text'
                className={inputClass('name')}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder='Morning Shift / Full-time...'
              />
              {errors.name && <p className='text-xs text-red-500 mt-1'>{errors.name}</p>}
            </div>

            {/* Slot Dropdown - Lấy từ API */}
            <div>
              <label className={labelClass}>Configuration Slot *</label>
              <select
                className={inputClass('slotId')}
                value={form.slotId}
                onChange={(e) => setForm({ ...form, slotId: e.target.value })}
              >
                <option value=''>-- Select Slot (Minutes / Break) --</option>
                {slots.map((s) => (
                  <option key={s.id} value={s.id}>
                    Slot: {s.slotMinutes} mins | Break: {s.breakMinutes} mins
                  </option>
                ))}
              </select>
              {errors.slotId && <p className='text-xs text-red-500 mt-1'>{errors.slotId}</p>}
            </div>

            {/* Time Grid */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className={labelClass}>
                  <Clock size={16} /> Start Time
                </label>
                <input
                  type='time'
                  className={inputClass('startTime')}
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>
                  <Clock size={16} /> End Time
                </label>
                <input
                  type='time'
                  className={inputClass('endTime')}
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
              {errors.endTime && <p className='text-xs text-red-500 col-span-2'>{errors.endTime}</p>}
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>
                <Info size={16} /> Description
              </label>
              <textarea
                className={`${inputClass('description')} resize-none`}
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder='Details about this schedule...'
              />
            </div>
          </div>
        )}
      </div>

      <div className='flex items-center gap-3 p-6 border-t border-gray-100 dark:border-gray-800 modal-footer sm:justify-end'>
        <button
          onClick={onClose}
          className='px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50'
        >
          {isViewMode ? 'Close' : 'Cancel'}
        </button>
        {!isViewMode && (
          <button
            onClick={handleSave}
            className='px-5 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-xl hover:bg-brand-600 shadow-lg shadow-brand-500/20'
          >
            {isEditing ? 'Update Changes' : 'Create Template'}
          </button>
        )}
      </div>
    </ModalRegistration>
  )
}
