import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify' // Import toast
import { ScheduleTemplate, TemplateForm } from '../../types/templete.type'
import ModalRegistration from '../RegistrationModal/ModalRegistration'
import StaffEmailLookup from '../../utils/StaffEmailLookup'

interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
  template: ScheduleTemplate | null
  onSave: (data: TemplateForm & { id?: string }) => void
  isViewMode: boolean
}

type TemplateFormData = TemplateForm & { id?: string }
type TemplateErrors = Partial<Record<keyof TemplateForm, string>> // Define error type

const initialErrors: TemplateErrors = {}

export default function TemplateModal({ isOpen, onClose, template, onSave, isViewMode }: TemplateModalProps) {
  const isEditing = !!template && !isViewMode
  const isCreating = !template && !isViewMode

  const [form, setForm] = useState<TemplateForm>({
    name: template?.name || '',
    description: template?.description || ''
  })
  const [errors, setErrors] = useState<TemplateErrors>(initialErrors)

  useEffect(() => {
    if (template) {
      setForm({
        name: template.name,
        description: template.description
      })
    } else {
      // Reset form for Create mode
      setForm({
        name: '',
        description: ''
      })
    }
    setErrors(initialErrors) // Reset errors on template change
  }, [template])

  const validateForm = (data: TemplateForm): boolean => {
    const newErrors: TemplateErrors = {}
    let isValid = true

    // 1. Name Validation
    if (!data.name.trim()) {
      newErrors.name = 'Template Name is required.'
      isValid = false
    } else if (data.name.trim().length < 3) {
      newErrors.name = 'Template Name must be at least 3 characters.'
      isValid = false
    } else if (data.name.trim().length > 50) {
      newErrors.name = 'Template Name must not exceed 50 characters.'
      isValid = false
    }

    // 2. Description Validation
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
    const name = id as keyof TemplateForm

    setForm((p) => ({ ...p, [name]: value }))

    // Clear error on change for the specific field
    if (errors[name]) {
      setErrors((p) => ({ ...p, [name]: undefined }))
    }
  }

  const handleSave = () => {
    if (!validateForm(form)) {
      toast.error('Please correct the form errors before saving.')
      return
    }

    const dataToSave: TemplateFormData = {
      ...form,
      id: isEditing ? template?.id : undefined
    }
    onSave(dataToSave)
    toast.success(`${isEditing ? 'Updated' : 'Created'} Template successfully!`)
  }

  const title = isCreating ? 'Create New Template' : isEditing ? 'Edit Template Details' : 'Template Details'

  const baseInputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'

  const errorClass = 'mt-1 text-xs text-red-500'
  const getInputClass = (fieldName: keyof TemplateForm) => {
    return `${baseInputClass} ${errors[fieldName] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`
  }

  return (
    <ModalRegistration isOpen={isOpen} onClose={onClose} title={title}>
      <div className='p-6'>
        {template && isViewMode && (
          <div className='space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Template Name:</span> {template.name}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Description:</span> {template.description || 'N/A'}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Created Time:</span>
              {new Date(template.createdTime).toLocaleString()}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Created By:</span>
              <StaffEmailLookup staffId={template.createdBy} />
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
                placeholder='Template Name (e.g., Full-time Staff Schedule)'
                value={form.name}
                onChange={handleChange}
                className={getInputClass('name')}
                maxLength={50}
              />
              {errors.name && <p className={errorClass}>{errors.name}</p>}
            </div>
            <div>
              <label htmlFor='description' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Description *
              </label>

              <textarea
                id='description'
                placeholder='Detailed description of the template and its intended use.'
                value={form.description}
                onChange={handleChange}
                rows={4}
                className={`${getInputClass('description')} resize-none`}
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
            {isEditing ? 'Save Changes' : 'Create Template'}
          </button>
        )}
      </div>
    </ModalRegistration>
  )
}
