// File: ServiceModal.tsx (Cleaned and Styled)

import React, { useState, useEffect } from 'react'
import { Service, ServiceForm } from '../../types/service.type'
import { Modal } from '../ui/modal'
import { useAppContext } from '../../context/AuthContext'
import { Role } from '../../constants/Roles'
import { formatVND, parseNumber } from '../../utils/validForm'
import { X, Clock, DollarSign, Edit3, PlusCircle } from 'lucide-react'

interface ServiceModalProps {
  isOpen: boolean
  onClose: () => void
  service: Service | null
  onSave: (data: { form: ServiceForm; id?: string }) => void
}

const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, service, onSave }) => {
  const { profile } = useAppContext()

  const [form, setForm] = useState<ServiceForm>({
    name: '',
    description: '',
    durationMinutes: 0,
    price: 0
  })

  const [errors, setErrors] = useState({
    name: '',
    durationMinutes: '',
    description: '',
    price: ''
  })

  useEffect(() => {
    if (service) {
      setForm({
        name: service.name,
        description: service.description,
        durationMinutes: service.durationMinutes,
        price: service.price
      })
    } else {
      setForm({ name: '', description: '', durationMinutes: 0, price: 0 })
    }
    setErrors({ name: '', durationMinutes: '', price: '', description: '' })
  }, [service, isOpen])

  const validate = () => {
    let valid = true
    const newErrors = { name: '', durationMinutes: '', price: '', description: '' }

    if (!form.name.trim()) {
      newErrors.name = 'Service name is required.'
      valid = false
    }

    if (form.durationMinutes <= 0) {
      newErrors.durationMinutes = 'Duration must be greater than 0 minutes.'
      valid = false
    }

    if (!form.description.trim()) {
      newErrors.description = 'Service description is required.'
      valid = false
    }

    if (typeof form.price !== 'number' || Number.isNaN(form.price)) {
      newErrors.price = 'Price is required.'
      valid = false
    } else if (form.price < 0) {
      newErrors.price = 'Price cannot be negative.'
      valid = false
    } else if (form.price < 1000) {
      newErrors.price = 'Price must be at least 1,000 VND.'
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSave({ form, id: service?.id })
  }

  const inputClass =
    'w-full border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-800 dark:text-white/90 text-base shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition duration-200 ease-in-out'
  const labelClass = 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'
  const errorClass = 'text-xs text-red-500 font-medium mt-1'

  const modalTitle = service ? 'Edit Service' : 'Create New Service'
  const HeaderIcon = service ? Edit3 : PlusCircle

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
      <form onSubmit={handleSubmit} className='divide-y divide-gray-100 dark:divide-gray-800'>
        <div className='relative p-6 sm:p-8 flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <HeaderIcon className='w-6 h-6 text-brand-500' />
            <div>
              <h3 className='text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white'>{modalTitle}</h3>
              <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                {service
                  ? 'Update the detailed information for this service.'
                  : 'Add a new service to the system list.'}
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-white transition'
            aria-label='Close modal'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='space-y-6 p-6 sm:p-8'>
          <div>
            <label htmlFor='name' className={labelClass}>
              Service Name <span className='text-red-500'>*</span>
            </label>
            <input
              id='name'
              placeholder='Example: Deep facial skincare treatment'
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
            {errors.name && <p className={errorClass}>{errors.name}</p>}
          </div>

          <div>
            <label htmlFor='description' className={labelClass}>
              Description
            </label>
            <textarea
              id='description'
              placeholder='Detailed description of steps and benefits...'
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`${inputClass} resize-y`}
            />
            {errors.description && <p className={errorClass}>{errors.description}</p>}
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
            <div>
              <label htmlFor='durationMinutes' className={labelClass}>
                Duration (minutes) <span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <Clock className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500' />
                <input
                  id='durationMinutes'
                  type='number'
                  placeholder='Example: 60'
                  value={form.durationMinutes || ''}
                  onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 0 })}
                  className={`${inputClass} pl-10`}
                  min={1}
                />
              </div>
              {errors.durationMinutes && <p className={errorClass}>{errors.durationMinutes}</p>}
            </div>

            <div>
              <label htmlFor='price' className={labelClass}>
                Price (VND) <span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <DollarSign className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500' />
                <input
                  id='price'
                  type='text'
                  placeholder='Example: 500,000'
                  value={formatVND(form.price)}
                  onChange={(e) => {
                    const raw = parseNumber(e.target.value)
                    setForm({ ...form, price: raw })
                  }}
                  className={`${inputClass} pl-10`}
                />
              </div>
              {errors.price && <p className={errorClass}>{errors.price}</p>}
            </div>
          </div>
        </div>

        <div className='flex justify-end gap-3 p-6 sm:p-8'>
          <button
            type='button'
            onClick={onClose}
            className='flex items-center justify-center rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-3 text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150'
          >
            Cancel
          </button>

          {profile?.role === Role.ADMIN && (
            <button
              type='submit'
              className='flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition duration-150'
            >
              {service ? 'Update' : 'Create'} Service
            </button>
          )}
        </div>
      </form>
    </Modal>
  )
}

export default ServiceModal
