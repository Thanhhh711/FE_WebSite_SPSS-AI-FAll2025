import { useEffect, useState } from 'react'
import { Slot, SlotForm } from '../../types/slot.type'
import StaffEmailLookup from '../../utils/StaffEmailLookup'
import ModalRegistration from '../RegistrationModal/ModalRegistration'

interface SlotModalProps {
  isOpen: boolean
  onClose: () => void
  slot: Slot | null // Data for Edit/View, null for Create
  onSave: (data: SlotForm & { id?: string }) => void
  isViewMode: boolean
}

type SlotFormData = SlotForm & { id?: string }

export default function SlotModal({ isOpen, onClose, slot, onSave, isViewMode }: SlotModalProps) {
  const isEditing = !!slot && !isViewMode
  const isCreating = !slot && !isViewMode

  // --- Initialize Form State ---
  const [form, setForm] = useState<SlotForm>({
    slotMinutes: slot?.slotMinutes || 30, // Default to 30 minutes
    breakMinutes: slot?.breakMinutes || 5 // Default to 5 minutes
  })

  // Update form state when 'slot' prop changes (open modal)
  useEffect(() => {
    if (slot) {
      setForm({
        slotMinutes: slot.slotMinutes,
        breakMinutes: slot.breakMinutes
      })
    } else {
      // Reset form for Create mode
      setForm({
        slotMinutes: 30, // Reset to default create values
        breakMinutes: 5
      })
    }
  }, [slot])

  const handleSave = () => {
    const dataToSave: SlotFormData = {
      ...form,
      id: isEditing ? slot?.id : undefined
    }
    onSave(dataToSave)
  }

  const title = isCreating ? 'Create New Slot' : isEditing ? 'Edit Slot Details' : 'Slot Details'

  const baseInputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90'

  return (
    <ModalRegistration isOpen={isOpen} onClose={onClose} title={title}>
      <div className='p-6'>
        {/* VIEW MODE */}
        {slot && isViewMode && (
          <div className='space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Slot Duration:</span> {slot.slotMinutes} minutes
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Break Duration:</span> {slot.breakMinutes} minutes
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Created Time:</span> {new Date(slot.createdTime).toLocaleString()}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Created By:</span>
              <StaffEmailLookup staffId={slot.createdBy} />
            </p>
          </div>
        )}

        {/* EDIT/CREATE MODE */}
        {!isViewMode && (
          <div className='space-y-4'>
            <p>Slot Duration</p>
            <input
              type='number'
              placeholder='Slot Minutes (e.g., 30)'
              value={form.slotMinutes}
              onChange={(e) => setForm((p) => ({ ...p, slotMinutes: parseInt(e.target.value) || 0 }))}
              min='5' // Minimum sensible value
              className={baseInputClass}
            />

            <p>Break Minutes</p>
            <input
              type='number'
              placeholder='Break Minutes (e.g., 5)'
              value={form.breakMinutes}
              onChange={(e) => setForm((p) => ({ ...p, breakMinutes: parseInt(e.target.value) || 0 }))}
              min='0' // Minimum sensible value
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
            Save Slot
          </button>
        )}
      </div>
    </ModalRegistration>
  )
}
