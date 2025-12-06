import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Brand, BrandForm } from '../../types/brands.type'
import { Country } from '../../types/contries.type'
import { uploadFile } from '../../utils/supabaseStorage'

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

  useEffect(() => {
    if (brand) {
      setForm({
        name: brand.name,
        title: brand.title,
        description: brand.description,
        imageUrl: brand.imageUrl,
        countryId: brand.countryId
      })
      setSelectedFile(null)
    } else {
      setForm(initialFormState)
      setSelectedFile(null)
    }
    setValidationErrors({})
  }, [brand])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: name === 'countryId' ? Number(value) : value
    }))

    if (validationErrors[name as keyof BrandFormErrors]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null

    if (file) {
      let error: string | undefined = undefined
      const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
      const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']

      if (!acceptedTypes.includes(file.type)) {
        error = 'Invalid file type. Only JPEG, PNG, or WebP images are allowed.'
      } else if (file.size > MAX_FILE_SIZE) {
        error = 'File size exceeds 5MB limit.'
      }

      if (error) {
        toast.error(error)
        setSelectedFile(null)
        setValidationErrors((prev) => ({ ...prev, imageFile: error }))
        return
      }

      setValidationErrors((prev) => ({ ...prev, imageFile: undefined }))
    } else if (validationErrors.imageFile) {
      setValidationErrors((prev) => ({ ...prev, imageFile: undefined }))
    }

    setSelectedFile(file)
  }

  // Cập nhật hàm Validation
  const validateForm = (): boolean => {
    const errors: BrandFormErrors = {}

    // 1. Validation cơ bản (Name, Title, Description)
    if (!form.name.trim()) {
      errors.name = 'Brand name is required.'
    } else if (form.name.trim().length < 2) {
      errors.name = 'Brand name must be at least 2 characters.'
    }

    if (!form.title.trim()) {
      errors.title = 'Brand title is required.'
    }

    if (!form.description.trim()) {
      errors.description = 'Description is required.'
    } else if (form.description.trim().length > 500) {
      errors.description = 'Description must not exceed 500 characters.'
    }

    if (form.countryId === 0) {
      errors.countryId = 'Please select a country.'
    }

    const isImageMissing = !selectedFile && !form.imageUrl

    if (isImageMissing && !brand) {
      errors.imageFile = 'An image is required for a new brand.'
    }

    setValidationErrors(errors)

    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please correct the validation errors before submitting.')
      return
    }

    let finalImageUrl = form.imageUrl

    if (selectedFile) {
      try {
        setIsUploading(true)
        // Upload file sử dụng bucket 'brands'
        const uploadResult = await uploadFile('brands', selectedFile, 'brand-logos')
        finalImageUrl = uploadResult.publicUrl
        toast.success('Image uploaded successfully!')
      } catch (error) {
        console.error('Error during file upload:', error)
        toast.error('Failed to upload image. Please try again.')
        return // Dừng submit nếu upload thất bại
      } finally {
        setIsUploading(false)
      }
    }

    const dataToSave = { ...form, imageUrl: finalImageUrl, id: brand?.id }

    onSave(dataToSave)
    setSelectedFile(null)
    setValidationErrors({})
  }

  if (!isOpen) return null

  const title = isViewMode ? `View Brand: ${brand?.name}` : brand ? `Edit Brand: ${brand?.name}` : 'Create New Brand'

  const isReadOnly = isViewMode
  const isFormDisabled = isReadOnly || isUploading

  const baseInputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-gray-50'

  const renderError = (fieldName: keyof BrandFormErrors) => {
    return validationErrors[fieldName] ? (
      <p className='mt-1 text-xs text-red-600'>{validationErrors[fieldName]}</p>
    ) : null
  }

  return (
    <div className=' fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4'>
      <div className='bg-white dark:bg-gray-800  rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col'>
        <div className='p-6 border-b border-gray-200'>
          <h3 className='text-xl font-bold text-gray-900 dark:text-white '>{title}</h3>
        </div>

        <form onSubmit={handleSubmit} className='flex-grow overflow-y-auto p-6 space-y-5'>
          {/* Name and Title */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'>Name</label>
              <input
                type='text'
                name='name'
                value={form.name}
                onChange={handleChange}
                className={`${baseInputClass} ${validationErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                required
                readOnly={isReadOnly}
              />
              {renderError('name')}
            </div>
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'>Title</label>
              <input
                type='text'
                name='title'
                value={form.title}
                onChange={handleChange}
                className={`${baseInputClass} ${validationErrors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                required
                readOnly={isReadOnly}
              />
              {renderError('title')}
            </div>
          </div>

          {/* Image Upload and Country */}
          <div className='grid grid-cols-2 gap-4'>
            {/* Image Upload */}
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Brand Logo (Optional when editing)
              </label>
              <input
                type='file'
                accept='image/jpeg,image/png,image/webp'
                name='imageFile'
                onChange={handleFileChange}
                className={`${baseInputClass.replace('px-4 py-2.5', 'px-3 py-2')} ${validationErrors.imageFile ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                disabled={isReadOnly}
              />
              {renderError('imageFile')}

              {/* Hiển thị ảnh hiện tại hoặc file đang chọn */}
              {(form.imageUrl || selectedFile) && (
                <div className='mt-2'>
                  {selectedFile ? (
                    <p className='text-sm text-gray-500'>Selected: **{selectedFile.name}**</p>
                  ) : (
                    <>
                      <p className='text-sm text-gray-500 mb-1 dark:text-gray-300'>Current Image:</p>
                      <img
                        src={form.imageUrl}
                        alt='Current Brand Logo'
                        className='w-20 h-20 object-contain border rounded-lg'
                      />
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Country */}
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'>Country</label>
              <select
                name='countryId'
                value={form.countryId}
                onChange={handleChange}
                className={`${baseInputClass} ${validationErrors.countryId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                required
                disabled={isFormDisabled}
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
              {renderError('countryId')}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'>Description</label>
            <textarea
              name='description'
              rows={5}
              value={form.description}
              onChange={handleChange}
              placeholder='Detailed description of the brand.'
              className={`${baseInputClass} resize-none ${validationErrors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              required
              readOnly={isReadOnly}
            />
            {renderError('description')}
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
                className='px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:bg-brand-400'
                disabled={isFormDisabled}
              >
                {isUploading ? 'Uploading...' : brand ? 'Update Brand' : 'Create Brand'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
