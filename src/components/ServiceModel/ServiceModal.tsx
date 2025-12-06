// File: ServiceModal.tsx

import React, { useState, useEffect } from 'react'
import { Service, ServiceForm } from '../../types/service.type'
import { Modal } from '../ui/modal'
import { useAppContext } from '../../context/AuthContext'
import { Role } from '../../constants/Roles'
import { formatVND, parseNumber } from '../../utils/validForm'

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

  // Reset form when opening modal
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
      newErrors.durationMinutes = 'Duration must be greater than 0.'
      valid = false
    }

    if (!form.description.trim()) {
      newErrors.durationMinutes = 'Description name is required.'
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
    'w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 dark:bg-gray-800 dark:text-white/90 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition duration-150'
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
  const errorClass = 'text-xs text-red-500 mt-1'

  const modalTitle = service ? 'Edit Service' : 'Create New Service'

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {/* HEADER */}
        <div className='px-6 pt-10 pb-2 sm:pt-14 sm:pb-4 border-b border-gray-100 dark:border-gray-800'>
          <h3 className='text-2xl font-bold text-gray-900  '>{modalTitle}</h3>
          <p className='text-sm text-gray-500   mt-1'>
            {service ? 'Update the information of this service.' : 'Add a new service to the system.'}
          </p>
        </div>

        {/* BODY */}
        <div className='space-y-5 px-6 pt-8 pb-6'>
          {/* SERVICE NAME */}
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

          {/* DESCRIPTION */}
          <div>
            <label htmlFor='description' className={labelClass}>
              Description
            </label>
            <textarea
              id='description'
              placeholder='Detailed description of steps and benefits'
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
            />

            {errors.name && <p className={errorClass}>{errors.name}</p>}
          </div>

          {/* DURATION & PRICE */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {/* DURATION */}
            <div>
              <label htmlFor='durationMinutes' className={labelClass}>
                Duration (minutes) <span className='text-red-500'>*</span>
              </label>
              <input
                id='durationMinutes'
                type='number'
                placeholder='Service duration (minutes)'
                value={form.durationMinutes || ''}
                onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 0 })}
                className={inputClass}
                min={1}
              />
              {errors.durationMinutes && <p className={errorClass}>{errors.durationMinutes}</p>}
            </div>

            {/* PRICE */}

            <div>
              <label htmlFor='price' className={labelClass}>
                Price (VND) <span className='text-red-500'>*</span>
              </label>

              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-semibold'>
                  ₫
                </span>

                <input
                  id='price'
                  type='text'
                  placeholder='Service price'
                  value={formatVND(form.price)}
                  onChange={(e) => {
                    const raw = parseNumber(e.target.value)
                    setForm({ ...form, price: raw })
                  }}
                  className={`${inputClass} pl-6`}
                />
              </div>

              {errors.price && <p className={errorClass}>{errors.price}</p>}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className='flex justify-end gap-3 p-4 border-t border-gray-100 dark:border-gray-800'>
          <button
            type='button'
            onClick={onClose}
            className='flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]'
          >
            Cancel
          </button>

          {profile?.role === Role.ADMIN && (
            <button
              type='submit'
              className='flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-brand-xs hover:bg-brand-600'
            >
              {service ? 'Update' : 'Create'}
            </button>
          )}
        </div>
      </form>
    </Modal>
  )
}

export default ServiceModal
