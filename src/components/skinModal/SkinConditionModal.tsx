/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import ModalRegistration from '../RegistrationModal/ModalRegistration'
import { SkinCondition, SkinConditionForm } from '../../types/skin.type'

interface SkinConditionModalProps {
  isOpen: boolean
  onClose: () => void
  condition: SkinCondition | null
  onSave: (data: SkinConditionForm & { id?: string }) => void
  isViewMode: boolean
}

type SkinConditionFormData = SkinConditionForm & { id?: string }
type SkinConditionErrors = Partial<Record<keyof SkinConditionForm, string>>

const initialErrors: SkinConditionErrors = {}

export default function SkinConditionModal({
  isOpen,
  onClose,
  condition,
  onSave,
  isViewMode
}: SkinConditionModalProps) {
  const isEditing = !!condition && !isViewMode
  const isCreating = !condition && !isViewMode

  const [form, setForm] = useState<SkinConditionForm>({
    name: condition?.name || '',
    description: condition?.description || '',
    severityLevel: condition?.severityLevel || 1,
    isChronic: condition?.isChronic || false
  })
  const [errors, setErrors] = useState<SkinConditionErrors>(initialErrors)

  useEffect(() => {
    if (condition) {
      setForm({
        name: condition.name,
        description: condition.description,
        severityLevel: condition.severityLevel,
        isChronic: condition.isChronic
      })
    } else {
      setForm({
        name: '',
        description: '',
        severityLevel: 1,
        isChronic: false
      })
    }
    setErrors(initialErrors)
  }, [condition])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target
    const name = id as keyof SkinConditionForm

    setForm((p) => {
      let newValue: any = value

      if (type === 'number') {
        const numValue = parseInt(value)

        if (name === 'severityLevel') {
          if (numValue < 1 || isNaN(numValue)) newValue = 1
          else if (numValue > 10) newValue = 10
          else newValue = numValue
        } else {
          newValue = isNaN(numValue) ? 0 : numValue
        }
      }

      return { ...p, [name]: newValue }
    })

    if (errors[name]) {
      setErrors((p) => ({ ...p, [name]: undefined }))
    }
  }

  const handleToggleChronic = (checked: boolean) => {
    setForm((p) => ({ ...p, isChronic: checked }))
  }

  const validateForm = (data: SkinConditionForm): boolean => {
    const newErrors: SkinConditionErrors = {}
    let isValid = true

    if (!data.name.trim()) {
      newErrors.name = 'Condition Name is required.'
      isValid = false
    } else if (data.name.trim().length < 3) {
      newErrors.name = 'Condition Name must be at least 3 characters.'
      isValid = false
    } else if (data.name.trim().length > 50) {
      newErrors.name = 'Condition Name must not exceed 50 characters.'
      isValid = false
    }

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

    if (typeof data.severityLevel !== 'number' || data.severityLevel < 1 || data.severityLevel > 10) {
      newErrors.severityLevel = 'Severity Level must be between 1 and 10.'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSave = () => {
    if (!validateForm(form)) {
      toast.error('Please correct the form errors.')
      return
    }

    const dataToSave: SkinConditionFormData = {
      ...form,
      id: isEditing ? condition?.id : undefined
    }
    onSave(dataToSave)
    toast.success(`${isEditing ? 'Updated' : 'Created'} Skin Condition successfully!`)
  }

  const title = isCreating
    ? 'Create New Skin Condition'
    : isEditing
      ? 'Edit Skin Condition Details'
      : 'Skin Condition Details'

  const baseInputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'

  const errorClass = 'mt-1 text-xs text-red-500'
  const getInputClass = (fieldName: keyof SkinConditionForm) => {
    return `${baseInputClass} ${errors[fieldName] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`
  }

  return (
    <ModalRegistration isOpen={isOpen} onClose={onClose} title={title}>
      <div className='p-6'>
        {condition && isViewMode && (
          <div className='space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Condition Name:</span> {condition.name}
            </p>

            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Severity Level:</span> {condition.severityLevel} / 10
            </p>

            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Is Chronic:</span> {condition.isChronic ? 'Yes' : 'No'}
            </p>

            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Description:</span> {condition.description}
            </p>
            {/* <p className='text-sm text-gray-700 dark:text-gray-300'>
 <span className='font-semibold'>Created By: </span>
 <StaffEmailLookup staffId={condition.createdBy} />
 </p> */}
          </div>
        )}
        {!isViewMode && (
          <div className='space-y-4'>
            <div>
              <label htmlFor='name' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'></label>

              <input
                id='name'
                type='text'
                placeholder='E.g., Acne, Eczema'
                value={form.name}
                onChange={handleChange}
                className={getInputClass('name')}
                maxLength={50}
              />
              {errors.name && <p className={errorClass}>{errors.name}</p>}
            </div>
            <div>
              <label
                htmlFor='severityLevel'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
              ></label>

              <input
                id='severityLevel'
                type='number'
                placeholder='E.g., 5'
                min={1}
                max={10}
                step={1}
                value={form.severityLevel}
                onChange={handleChange}
                className={getInputClass('severityLevel')}
              />
              {errors.severityLevel && <p className={errorClass}>{errors.severityLevel}</p>}
            </div>
            <div className='flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-800'>
              <label htmlFor='isChronic' className='block text-sm font-medium text-gray-700 dark:text-gray-300'></label>

              <input
                id='isChronic'
                type='checkbox'
                checked={form.isChronic}
                onChange={(e) => handleToggleChronic(e.target.checked)}
                className='h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500'
              />
            </div>
            {/* Description */}
            <div>
              <label
                htmlFor='description'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
              ></label>

              <textarea
                id='description'
                placeholder='Detailed description of the condition...'
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
            {isEditing ? 'Save Changes' : 'Create Condition'}
          </button>
        )}
      </div>
    </ModalRegistration>
  )
}
