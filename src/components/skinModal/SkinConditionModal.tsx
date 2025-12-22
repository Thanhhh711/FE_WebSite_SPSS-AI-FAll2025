/* eslint-disable @typescript-eslint/no-explicit-any */
import { Activity, CheckCircle2, FileText, Layers, ShieldAlert } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { SkinCondition, SkinConditionForm } from '../../types/skin.type'
import ModalRegistration from '../RegistrationModal/ModalRegistration'

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

  const getInputClass = (fieldName: keyof SkinConditionForm) => {
    return `${baseInputClass} ${errors[fieldName] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`
  }

  return (
    <ModalRegistration isOpen={isOpen} onClose={onClose} title={title}>
      <div className='w-full bg-white dark:bg-gray-900 overflow-hidden'>
        {/* CONTENT SECTION */}
        <div className='p-8'>
          {condition && isViewMode ? (
            // VIEW MODE GIAO DIỆN SANG TRỌNG
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-6 md:col-span-2'>
                <div className='flex items-center gap-4 p-4 bg-slate-50 dark:bg-gray-800/50 rounded-[1.25rem] border border-slate-100 dark:border-gray-700'>
                  <div className='w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600'>
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className='text-[10px] font-black uppercase tracking-widest text-slate-400'>Condition Name</p>
                    <p className='text-lg font-black text-slate-800 dark:text-white'>{condition.name}</p>
                  </div>
                </div>
              </div>

              <div className='p-4 bg-slate-50 dark:bg-gray-800/50 rounded-[1.25rem] border border-slate-100 dark:border-gray-700'>
                <p className='text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1'>Severity Level</p>
                <div className='flex items-center gap-2'>
                  <span className='text-xl font-black text-slate-800 dark:text-white'>{condition.severityLevel}</span>
                  <span className='text-slate-400 font-bold'>/ 10</span>
                  <div className='flex-1 h-2 bg-slate-200 dark:bg-gray-700 rounded-full ml-2 overflow-hidden'>
                    <div
                      className='h-full bg-rose-500 rounded-full'
                      style={{ width: `${(condition.severityLevel / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className='p-4 bg-slate-50 dark:bg-gray-800/50 rounded-[1.25rem] border border-slate-100 dark:border-gray-700 flex items-center justify-between'>
                <div>
                  <p className='text-[10px] font-black uppercase tracking-widest text-slate-400'>Condition Type</p>
                  <p className='text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider'>
                    {condition.isChronic ? 'Chronic Case' : 'Acute / Normal'}
                  </p>
                </div>
                {condition.isChronic && <ShieldAlert className='text-amber-500' size={24} />}
              </div>

              <div className='md:col-span-2 p-4 bg-slate-50 dark:bg-gray-800/50 rounded-[1.25rem] border border-slate-100 dark:border-gray-700'>
                <p className='text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2'>
                  Clinical Description
                </p>
                <p className='text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic'>
                  "{condition.description}"
                </p>
              </div>
            </div>
          ) : (
            // EDIT / CREATE MODE
            <div className='space-y-6'>
              {/* Name Field */}
              <div className='space-y-2'>
                <label className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1'>
                  <Layers size={14} /> Skin Condition Name
                </label>
                <input
                  id='name'
                  type='text'
                  placeholder='E.g., Acne, Eczema'
                  value={form.name}
                  onChange={handleChange}
                  className={`${getInputClass('name')} w-full px-5 py-4 bg-slate-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 rounded-2xl transition-all outline-none font-bold text-sm dark:text-white`}
                  maxLength={50}
                />
                {errors.name && (
                  <p className='text-[10px] font-black text-rose-500 uppercase ml-1 tracking-wider'>{errors.name}</p>
                )}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Severity Level */}
                <div className='space-y-2'>
                  <label className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1'>
                    <ShieldAlert size={14} /> Severity (1-10)
                  </label>
                  <input
                    id='severityLevel'
                    type='number'
                    placeholder='E.g., 5'
                    min={1}
                    max={10}
                    value={form.severityLevel}
                    onChange={handleChange}
                    className={`${getInputClass('severityLevel')} w-full px-5 py-4 bg-slate-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 rounded-2xl transition-all outline-none font-bold text-sm dark:text-white`}
                  />
                  {errors.severityLevel && (
                    <p className='text-[10px] font-black text-rose-500 uppercase ml-1 tracking-wider'>
                      {errors.severityLevel}
                    </p>
                  )}
                </div>

                {/* Is Chronic Toggle Style */}
                <div className='space-y-2'>
                  <label className='text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1'>
                    Case Status
                  </label>
                  <div
                    onClick={() => handleToggleChronic(!form.isChronic)}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      form.isChronic
                        ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/10 dark:border-rose-900/30 dark:text-rose-400'
                        : 'bg-slate-50 border-transparent text-slate-500 dark:bg-gray-800/50'
                    }`}
                  >
                    <span className='text-xs font-black uppercase tracking-wider'>Chronic Condition</span>
                    <input type='checkbox' id='isChronic' className='hidden' checked={form.isChronic} readOnly />
                    <div
                      className={`w-10 h-5 rounded-full relative transition-colors ${form.isChronic ? 'bg-rose-500' : 'bg-slate-300 dark:bg-gray-600'}`}
                    >
                      <div
                        className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${form.isChronic ? 'left-6' : 'left-1'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className='space-y-2'>
                <label className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1'>
                  <FileText size={14} /> Clinical Notes
                </label>
                <textarea
                  id='description'
                  placeholder='Detailed description of the condition...'
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                  className={`${getInputClass('description')} w-full px-5 py-4 bg-slate-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 rounded-2xl transition-all outline-none font-bold text-sm dark:text-white min-h-[120px] resize-none`}
                  maxLength={500}
                />
                {errors.description && (
                  <p className='text-[10px] font-black text-rose-500 uppercase ml-1 tracking-wider'>
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
            {isViewMode ? 'Exit Portal' : 'Discard'}
          </button>

          {!isViewMode && (
            <button
              onClick={handleSave}
              type='button'
              className='w-full sm:w-auto px-10 py-4 bg-slate-900 dark:bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2'
            >
              <CheckCircle2 size={16} />
              {isEditing ? 'Update Record' : 'Confirm & Save'}
            </button>
          )}
        </div>
      </div>
    </ModalRegistration>
  )
}
