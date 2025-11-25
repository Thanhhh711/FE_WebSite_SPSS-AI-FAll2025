/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'

import ModalRegistration from '../RegistrationModal/ModalRegistration'
import { toast } from 'react-toastify'
import { Country, CountryForm } from '../../types/contries.type'

// --- 1. Định nghĩa Props cho Modal ---
interface CountryModalProps {
  isOpen: boolean
  onClose: () => void
  country: Country | null
  onSave: (data: CountryForm & { id?: number }) => void
  isViewMode: boolean
}

type CountryFormData = CountryForm & { id?: number }

export default function CountryModal({ isOpen, onClose, country, onSave, isViewMode }: CountryModalProps) {
  const isEditing = !!country && !isViewMode
  const isCreating = !country && !isViewMode

  const [form, setForm] = useState<CountryForm>({
    countryCode: country?.countryCode || '',
    countryName: country?.countryName || ''
  })
  const [errors, setErrors] = useState<Partial<Record<keyof CountryForm, string>>>({}) // State lưu lỗi

  useEffect(() => {
    if (country) {
      setForm({
        countryCode: country.countryCode,
        countryName: country.countryName
      })
    } else {
      setForm({
        countryCode: '',
        countryName: ''
      })
    }
    setErrors({})
  }, [country])

  const baseInputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'

  const validateForm = (data: CountryForm): boolean => {
    const newErrors: Partial<Record<keyof CountryForm, string>> = {}
    let isValid = true

    if (!data.countryCode.trim()) {
      newErrors.countryCode = 'Country Code cannot be empty.'
      isValid = false
    } else if (data.countryCode.trim().length < 2 || data.countryCode.trim().length > 3) {
      newErrors.countryCode = 'Country Code must be 2 or 3 characters.'
      isValid = false
    } else if (!/^[A-Z0-9]+$/.test(data.countryCode.trim())) {
      newErrors.countryCode = 'Code must be alphanumeric and uppercase.'
      isValid = false
    }

    if (!data.countryName.trim()) {
      newErrors.countryName = 'Country Name cannot be empty.'
      isValid = false
    } else if (data.countryName.trim().length < 3) {
      newErrors.countryName = 'Country Name must be at least 3 characters.'
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

    const dataToSave: CountryFormData = {
      ...form,
      id: isEditing ? country?.id : undefined
    }
    onSave(dataToSave)
  }

  const title = isCreating ? 'Tạo Quốc gia mới' : isEditing ? 'Chỉnh sửa Chi tiết Quốc gia' : 'Chi tiết Quốc gia'

  return (
    <ModalRegistration isOpen={isOpen} onClose={onClose} title={title}>
      <div className='p-6'>
        {country && isViewMode && (
          <div className='space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>ID:</span> {country.id}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Country Code:</span> {country.countryCode}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Country Name:</span> {country.countryName}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Associated Brands:</span> {country.brands?.length || 0}
            </p>
          </div>
        )}

        {!isViewMode && (
          <div className='space-y-4'>
            <div>
              <label htmlFor='countryCode' className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block'>
                Country Code
              </label>
              <input
                id='countryCode'
                type='text'
                placeholder='Code (2-3 chars, e.g., VN)'
                value={form.countryCode}
                onChange={(e) => setForm((p) => ({ ...p, countryCode: e.target.value.toUpperCase() }))}
                className={`${baseInputClass} ${errors.countryCode ? 'border-red-500' : ''}`}
                maxLength={3}
              />
              {errors.countryCode && <p className='mt-1 text-xs text-red-500'>{errors.countryCode}</p>}
            </div>

            <div>
              <label htmlFor='countryName' className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block'>
                Country Name
              </label>
              <input
                id='countryName'
                type='text'
                placeholder='Full country name'
                value={form.countryName}
                onChange={(e) => setForm((p) => ({ ...p, countryName: e.target.value }))}
                className={`${baseInputClass} ${errors.countryName ? 'border-red-500' : ''}`}
              />
              {errors.countryName && <p className='mt-1 text-xs text-red-500'>{errors.countryName}</p>}
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
          {isViewMode ? 'Close' : 'Cancel'}
        </button>
        {!isViewMode && (
          <button
            onClick={handleSave}
            type='button'
            className='flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-brand-xs hover:bg-brand-600 sm:w-auto'
          >
            {isEditing ? 'Update Country' : 'Create Country'}
          </button>
        )}
      </div>
    </ModalRegistration>
  )
}
