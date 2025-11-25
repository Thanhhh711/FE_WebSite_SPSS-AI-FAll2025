import React, { useEffect, useState } from 'react'

import { toast } from 'react-toastify'
import { Brand, BrandForm } from '../../types/brands.type'
import { Country } from '../../types/contries.type'

interface BrandModalProps {
  isOpen: boolean
  onClose: () => void
  brand: Brand | null
  onSave: (data: BrandForm & { id?: string }) => void
  isViewMode: boolean
  countries: Country[]
}

const initialFormState: BrandForm = {
  name: '',
  title: '',
  description: '',
  imageUrl: '',
  countryId: 0
}

export default function BrandModal({ isOpen, onClose, brand, onSave, isViewMode, countries }: BrandModalProps) {
  const [form, setForm] = useState<BrandForm>(initialFormState)

  useEffect(() => {
    if (brand) {
      setForm({
        name: brand.name,
        title: brand.title,
        description: brand.description,
        imageUrl: brand.imageUrl,
        countryId: brand.countryId
      })
    } else {
      setForm(initialFormState)
    }
  }, [brand])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'countryId' ? Number(value) : value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (form.countryId === 0) {
      toast.error('Please select a country.')
      return
    }

    const dataToSave = { ...form, id: brand?.id }

    onSave(dataToSave)
  }

  if (!isOpen) return null

  const title = isViewMode ? `View Brand: ${brand?.name}` : brand ? `Edit Brand: ${brand?.name}` : 'Create New Brand'

  const isReadOnly = isViewMode

  const baseInputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-gray-50'

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col'>
        <div className='p-6 border-b border-gray-200'>
          <h3 className='text-xl font-bold text-gray-900'>{title}</h3>
        </div>

        <form onSubmit={handleSubmit} className='flex-grow overflow-y-auto p-6 space-y-5'>
          {/* Name and Title */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>Name</label>
              <input
                type='text'
                name='name'
                value={form.name}
                onChange={handleChange}
                className={baseInputClass}
                required
                readOnly={isReadOnly}
              />
            </div>
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>Title</label>
              <input
                type='text'
                name='title'
                value={form.title}
                onChange={handleChange}
                className={baseInputClass}
                required
                readOnly={isReadOnly}
              />
            </div>
          </div>

          {/* Image URL and Country */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>Image URL</label>
              <input
                type='url'
                name='imageUrl'
                value={form.imageUrl}
                onChange={handleChange}
                className={baseInputClass}
                placeholder='e.g., https://example.com/logo.png'
                readOnly={isReadOnly}
              />
            </div>
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>Country</label>
              <select
                name='countryId'
                value={form.countryId}
                onChange={handleChange}
                className={baseInputClass}
                required
                disabled={isReadOnly} // Use disabled for select
              >
                <option value={0} disabled>
                  Select Country
                </option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.countryName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className='mb-1.5 block text-sm font-medium text-gray-700'>Description</label>
            <textarea
              name='description'
              rows={5}
              value={form.description}
              onChange={handleChange}
              placeholder='Detailed description of the brand.'
              className={`${baseInputClass} resize-none`}
              required
              readOnly={isReadOnly}
            />
          </div>

          {/* Modal Footer */}
          <div className='pt-6 border-t border-gray-200 flex justify-end space-x-3'>
            <button
              onClick={onClose}
              type='button'
              className='px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100'
            >
              {isReadOnly ? 'Close' : 'Cancel'}
            </button>
            {!isReadOnly && (
              <button
                type='submit'
                className='px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700'
              >
                {brand ? 'Update Brand' : 'Create Brand'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
