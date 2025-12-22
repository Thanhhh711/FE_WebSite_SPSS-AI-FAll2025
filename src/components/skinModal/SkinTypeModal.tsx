import { CheckCircle2, FileText, Layers } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { SkinType, SkinTypeForm } from '../../types/skin.type'
import ModalRegistration from '../RegistrationModal/ModalRegistration'
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

  const getInputClass = (fieldName: keyof SkinTypeForm) => {
    return `${baseInputClass} ${errors[fieldName] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`
  }

  return (
    <ModalRegistration isOpen={isOpen} onClose={onClose} title={title}>
      <div className='w-full bg-white dark:bg-gray-900 overflow-hidden'>
        {/* CONTENT SECTION */}
        <div className='p-8'>
          {skinType && isViewMode ? (
            // VIEW MODE GIAO DIỆN SANG TRỌNG
            <div className='space-y-6'>
              <div className='flex items-center gap-5 p-5 bg-slate-50 dark:bg-gray-800/50 rounded-[1.5rem] border border-slate-100 dark:border-gray-700'>
                <div className='w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600'>
                  <Layers size={28} />
                </div>
                <div>
                  <p className='text-[10px] font-black uppercase tracking-[0.2em] text-slate-400'>
                    Skin Type Classification
                  </p>
                  <p className='text-xl font-black text-slate-800 dark:text-white tracking-tight'>{skinType.name}</p>
                </div>
              </div>

              <div className='p-6 bg-slate-50 dark:bg-gray-800/50 rounded-[1.5rem] border border-slate-100 dark:border-gray-700'>
                <div className='flex items-center gap-2 mb-3'>
                  <FileText size={16} className='text-indigo-500' />
                  <p className='text-[10px] font-black uppercase tracking-[0.2em] text-slate-400'>
                    Detailed Description
                  </p>
                </div>
                <p className='text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap italic'>
                  "{skinType.description}"
                </p>
              </div>
            </div>
          ) : (
            // EDIT / CREATE MODE
            <div className='space-y-7'>
              {/* Type Name Field */}
              <div className='space-y-2.5'>
                <label className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1'>
                  <Layers size={14} /> Skin Type Name
                </label>
                <input
                  id='name'
                  type='text'
                  placeholder='E.g., Oily, Dry, Combination, Sensitive'
                  value={form.name}
                  onChange={handleChange}
                  className={`${getInputClass('name')} w-full px-5 py-4 bg-slate-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl transition-all outline-none font-bold text-sm dark:text-white`}
                  maxLength={50}
                />
                {errors.name && (
                  <p className='text-[10px] font-black text-rose-500 uppercase ml-1 tracking-wider animate-pulse'>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div className='space-y-2.5'>
                <label className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1'>
                  <FileText size={14} /> Clinical Characteristics
                </label>
                <textarea
                  id='description'
                  placeholder='Detailed description of the skin type and its characteristics...'
                  rows={5}
                  value={form.description}
                  onChange={handleChange}
                  className={`${getInputClass('description')} w-full px-5 py-4 bg-slate-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl transition-all outline-none font-bold text-sm dark:text-white min-h-[140px] resize-none leading-relaxed`}
                  maxLength={500}
                />
                {errors.description && (
                  <p className='text-[10px] font-black text-rose-500 uppercase ml-1 tracking-wider animate-pulse'>
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER SECTION */}
        <div className='flex flex-col sm:flex-row items-center gap-3 p-8 border-t border-slate-50 dark:border-gray-800 bg-slate-50/30 dark:bg-transparent sm:justify-end'>
          <button
            onClick={onClose}
            type='button'
            className='w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-gray-800 transition-all'
          >
            {isViewMode ? 'Exit Detail' : 'Discard'}
          </button>

          {!isViewMode && (
            <button
              onClick={handleSave}
              type='button'
              className='w-full sm:w-auto px-10 py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3'
            >
              <CheckCircle2 size={16} />
              {isEditing ? 'Save Changes' : 'Create Skin Type'}
            </button>
          )}
        </div>
      </div>
    </ModalRegistration>
  )
}
