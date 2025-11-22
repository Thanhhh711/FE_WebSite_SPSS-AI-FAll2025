/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import { ScheduleTemplate, TemplateForm } from '../../types/templete.type'
import ModalRegistration from '../RegistrationModal/ModalRegistration'
import StaffEmailLookup from '../../utils/StaffEmailLookup'

interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
  template: ScheduleTemplate | null // Data for Edit/View, null for Create
  onSave: (data: TemplateForm & { id?: string }) => void
  isViewMode: boolean
}

type TemplateFormData = TemplateForm & { id?: string }

export default function TemplateModal({ isOpen, onClose, template, onSave, isViewMode }: TemplateModalProps) {
  const isEditing = !!template && !isViewMode
  const isCreating = !template && !isViewMode

  // --- Initialize Form State ---
  const [form, setForm] = useState<TemplateForm>({
    name: template?.name || '',
    description: template?.description || ''
  })

  // Update form state when 'template' prop changes (open modal)
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
  }, [template])

  const handleSave = () => {
    const dataToSave: TemplateFormData = {
      ...form,
      id: isEditing ? template?.id : undefined
    }
    onSave(dataToSave)
  }

  const title = isCreating ? 'Create New Template' : isEditing ? 'Edit Template Details' : 'Template Details'

  const baseInputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90'

  return (
    <ModalRegistration isOpen={isOpen} onClose={onClose} title={title}>
      <div className='p-6'>
        {/* VIEW MODE */}
        {template && isViewMode && (
          <div className='space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Template Name:</span> {template.name}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Description:</span> {template.description || 'N/A'}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Created Time:</span> {new Date(template.createdTime).toLocaleString()}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Created By:</span>

              <StaffEmailLookup staffId={template.createdBy} />
            </p>
          </div>
        )}

        {/* EDIT/CREATE MODE */}
        {!isViewMode && (
          <div className='space-y-4'>
            <p>Name</p>
            <input
              type='text'
              placeholder='Template Name (e.g., Full-time Staff Schedule)'
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className={baseInputClass}
            />

            <p>Descrition</p>

            <textarea
              placeholder='Description'
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={4}
              className={`${baseInputClass} resize-none`}
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
            Save Template
          </button>
        )}
      </div>
    </ModalRegistration>
  )
}
