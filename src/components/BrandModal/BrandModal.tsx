/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Brand, BrandForm } from '../../types/brands.type'
import { Country } from '../../types/contries.type'
import { uploadFile } from '../../utils/supabaseStorage'
import ModalPhotoViewer from '../ProductModal/ModalPhotoViewer'

// Định nghĩa kiểu cho lỗi validation
interface BrandFormErrors {
  name?: string
  title?: string
  description?: string
  countryId?: string
  imageFile?: string
}

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<BrandFormErrors>({})

  // State mới để quản lý việc xem ảnh phóng to
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false)

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
    setValidationErrors({})
    setSelectedFile(null)
  }, [brand, isOpen])

  const validate = (): boolean => {
    const errors: BrandFormErrors = {}
    if (!form.name.trim()) errors.name = 'Brand name is required'
    if (!form.title.trim()) errors.title = 'Title is required'
    if (!form.description.trim()) errors.description = 'Description is required'
    if (form.countryId === 0) errors.countryId = 'Please select a country'
    if (!brand && !selectedFile) errors.imageFile = 'Brand image is required'

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'countryId' ? Number(value) : value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isViewMode) return

    if (!validate()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setIsUploading(true)
    try {
      let imageUrl = form.imageUrl as string
      if (selectedFile) {
        imageUrl = (await uploadFile('brands', selectedFile, 'images')).publicUrl
      }
      onSave({ ...form, imageUrl, id: brand?.id })
    } catch (error) {
      toast.error('Failed to save brand')
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  const isReadOnly = isViewMode
  const isFormDisabled = isUploading || isReadOnly

  const baseInputClass =
    'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all dark:bg-gray-800 dark:border-gray-700'

  const renderError = (field: keyof BrandFormErrors) =>
    validationErrors[field] && <p className='mt-1 text-xs text-red-500'>{validationErrors[field]}</p>

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
      <div className='bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]'>
        {/* Modal Header */}
        <div className='p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center'>
          <h2 className='text-xl font-bold text-gray-800 dark:text-white'>
            {isReadOnly ? 'Brand Details' : brand ? 'Edit Brand' : 'Create New Brand'}
          </h2>
          <button onClick={onClose} className='text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'>
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className='flex-1 overflow-y-auto p-6 space-y-6'>
          {/* Image Upload/Preview */}
          <div className='flex flex-col items-center space-y-4'>
            <div
              className='relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-800 cursor-zoom-in group'
              onClick={() => (form.imageUrl || selectedFile) && setIsPhotoViewerOpen(true)}
            >
              {selectedFile || form.imageUrl ? (
                <>
                  <img
                    src={selectedFile ? URL.createObjectURL(selectedFile) : form.imageUrl}
                    alt='Brand'
                    className='w-full h-full object-cover transition-opacity group-hover:opacity-80'
                  />
                  <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10'>
                    <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7'
                      />
                    </svg>
                  </div>
                </>
              ) : (
                <div className='text-gray-400 flex flex-col items-center'>
                  <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                  <span className='text-xs mt-2'>No Image</span>
                </div>
              )}
            </div>
            {!isReadOnly && (
              <label className='cursor-pointer bg-brand-50 text-brand-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-100 transition-colors'>
                <span>{brand || selectedFile ? 'Change Image' : 'Upload Image'}</span>
                <input
                  type='file'
                  className='hidden'
                  accept='image/*'
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
            )}
            {renderError('imageFile')}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'>Brand Name</label>
              <input
                name='name'
                type='text'
                value={form.name}
                onChange={handleChange}
                placeholder='Enter brand name'
                className={`dark:text-gray-300  ${baseInputClass} ${validationErrors.name ? 'border-red-500' : ''}`}
                readOnly={isReadOnly}
              />
              {renderError('name')}
            </div>

            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'>Country</label>
              <select
                name='countryId'
                value={form.countryId}
                onChange={handleChange}
                className={`dark:text-gray-300 ${baseInputClass} ${validationErrors.countryId ? 'border-red-500' : ''}`}
                disabled={isFormDisabled}
              >
                <option value={0}>Select a country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.countryName}
                  </option>
                ))}
              </select>
              {renderError('countryId')}
            </div>
          </div>

          <div>
            <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'>Title</label>
            <input
              name='title'
              type='text'
              value={form.title}
              onChange={handleChange}
              placeholder='Brand slogan or short title'
              className={`dark:text-gray-300 ${baseInputClass} ${validationErrors.title ? 'border-red-500' : ''}`}
              readOnly={isReadOnly}
            />
            {renderError('title')}
          </div>

          <div>
            <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'>Description</label>
            <textarea
              name='description'
              rows={5}
              value={form.description}
              onChange={handleChange}
              placeholder='Detailed description of the brand.'
              className={`dark:text-gray-300 ${baseInputClass} resize-none ${validationErrors.description ? 'border-red-500' : ''}`}
              readOnly={isReadOnly}
            />
            {renderError('description')}
          </div>

          {/* Modal Footer */}
          <div className='pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3'>
            <button
              onClick={onClose}
              type='button'
              className='px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800'
            >
              {isReadOnly ? 'Close' : 'Cancel'}
            </button>
            {!isReadOnly && (
              <button
                type='submit'
                className='px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:bg-brand-400 transition-colors'
                disabled={isFormDisabled}
              >
                {isUploading ? 'Uploading...' : brand ? 'Update Brand' : 'Create Brand'}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Component phóng to ảnh */}
      <ModalPhotoViewer
        isOpen={isPhotoViewerOpen}
        onClose={() => setIsPhotoViewerOpen(false)}
        imageUrl={selectedFile ? URL.createObjectURL(selectedFile) : form.imageUrl}
      />
    </div>
  )
}
