import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import ModalRegistration from '../RegistrationModal/ModalRegistration'
import { SkinType, SkinTypeForm } from '../../types/skin.type'
// import StaffEmailLookup from '../../utils/StaffEmailLookup'

interface SkinTypeModalProps {
  isOpen: boolean
  onClose: () => void
  skinType: SkinType | null
  onSave: (data: SkinTypeForm & { id?: string }) => void
  isViewMode: boolean
}

type SkinTypeFormData = SkinTypeForm & { id?: string }
type SkinTypeErrors = Partial<Record<keyof SkinTypeForm, string>>

const initialErrors: SkinTypeErrors = {}

export default function SkinTypeModal({ isOpen, onClose, skinType, onSave, isViewMode }: SkinTypeModalProps) {
  const isEditing = !!skinType && !isViewMode
  const isCreating = !skinType && !isViewMode

  const [form, setForm] = useState<SkinTypeForm>({
    name: skinType?.name || '',
    description: skinType?.description || ''
  })
  const [errors, setErrors] = useState<SkinTypeErrors>(initialErrors) // State to store validation errors

  useEffect(() => {
    if (skinType) {
      setForm({
        name: skinType.name,
        description: skinType.description
      })
    } else {
      setForm({
        name: '',
        description: ''
      })
    }
    setErrors(initialErrors) // Reset errors on change or close/open
  }, [skinType])

  const validateForm = (data: SkinTypeForm): boolean => {
    const newErrors: SkinTypeErrors = {}
    let isValid = true // 1. Name Validation

    if (!data.name.trim()) {
      newErrors.name = 'Skin Type Name is required.'
      isValid = false
    } else if (data.name.trim().length < 3) {
      newErrors.name = 'Skin Type Name must be at least 3 characters.'
      isValid = false
    } else if (data.name.trim().length > 50) {
      newErrors.name = 'Skin Type Name must not exceed 50 characters.'
      isValid = false
    } // 2. Description Validation

    if (!data.description.trim()) {
      newErrors.description = 'Description is required.'
      isValid = false
    } else if (data.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters.'
      isValid = false
    } else if (data.description.trim().length > 500) {
      newErrors.description = 'Description must not exceed 500 characters.'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    const name = id as keyof SkinTypeForm

    setForm((p) => ({ ...p, [name]: value })) // Clear error on change for the specific field

    if (errors[name]) {
      setErrors((p) => ({ ...p, [name]: undefined }))
    }
  }

  const handleSave = () => {
    if (!validateForm(form)) {
      toast.error('Please correct the form errors.')
      return
    }

    const dataToSave: SkinTypeFormData = {
      ...form,
      id: isEditing ? skinType?.id : undefined
    }
    onSave(dataToSave)
    toast.success(`${isEditing ? 'Updated' : 'Created'} Skin Type successfully!`)
  }

  const title = isCreating ? 'Create New Skin Type' : isEditing ? 'Edit Skin Type Details' : 'Skin Type Details'

  const baseInputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'

  const errorClass = 'mt-1 text-xs text-red-500'
  const getInputClass = (fieldName: keyof SkinTypeForm) => {
    return `${baseInputClass} ${errors[fieldName] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`
  }

  return (
    <ModalRegistration isOpen={isOpen} onClose={onClose} title={title}>
      <div className='p-6'>
        {skinType && isViewMode && (
          <div className='space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300'>
            <p className='text-sm'>
              <span className='font-semibold'>Type Name:</span> {skinType.name}
            </p>
            <p className='text-sm whitespace-pre-wrap'>
              <span className='font-semibold'>Description:</span> {skinType.description}
            </p>
          </div>
        )}
        {!isViewMode && (
          <div className='space-y-4'>
            <div>
              <label htmlFor='name' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'></label>

              <input
                id='name'
                type='text'
                placeholder='E.g., Oily, Dry, Combination, Sensitive'
                value={form.name}
                onChange={handleChange}
                className={getInputClass('name')}
                maxLength={50}
              />
              {errors.name && <p className={errorClass}>{errors.name}</p>}
            </div>
            <div>
              <label
                htmlFor='description'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
              ></label>

              <textarea
                id='description'
                placeholder='Detailed description of the skin type and its characteristics...'
                rows={4}
                value={form.description}
                onChange={handleChange}
                className={getInputClass('description') + ' min-h-[100px]'}
                maxLength={500}
              />
              {errors.description && <p className={errorClass}>{errors.description}</p>}
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
            {isEditing ? 'Save Changes' : 'Create Skin Type'}
          </button>
        )}
      </div>
    </ModalRegistration>
  )
}
