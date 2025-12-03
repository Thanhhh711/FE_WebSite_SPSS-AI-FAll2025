// BlogFormModal.tsx

import { useState, useEffect } from 'react'
import { Blog, BlogForm } from '../../types/media.type'
import { blogsApi } from '../../api/media.api'
import { uploadFile, UploadResult } from '../../utils/supabaseStorage'

// Define validation error type
interface FormErrors {
  title?: string
  description?: string
  thumbnail?: string
  sections?: string // General section error
  sectionDetails?: { [key: number]: { subtitle?: string; content?: string } }
}

// Define props
interface BlogFormModalProps {
  blogId: string | null
  onClose: () => void
  onSuccess: () => void
}

const initialFormState: BlogForm = {
  title: '',
  description: '',
  thumbnail: '',
  sections: [{ contentType: 'text', subtitle: 'Introduction', content: '', order: 1 }]
}

const BlogFormModal: React.FC<BlogFormModalProps> = ({ blogId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<BlogForm>(initialFormState)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // NEW: State to store validation errors
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const isEditMode = blogId !== null
  const modalTitle = isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'

  // --- VALIDATION FUNCTION ---
  const validateForm = (data: BlogForm, file: File | null): boolean => {
    const errors: FormErrors = {}
    let isValid = true

    // 1. Title Validation
    if (!data.title || data.title.trim().length === 0) {
      errors.title = 'Title is required.'
      isValid = false
    } else if (data.title.length < 5) {
      errors.title = 'Title must be at least 5 characters.'
      isValid = false
    } else if (data.title.length > 100) {
      errors.title = 'Title must be less than 100 characters.'
      isValid = false
    }

    // 2. Description Validation
    if (!data.description || data.description.trim().length === 0) {
      errors.description = 'Description is required.'
      isValid = false
    } else if (data.description.length < 10) {
      errors.description = 'Description must be at least 10 characters.'
      isValid = false
    } else if (data.description.length > 300) {
      errors.description = 'Description must be less than 300 characters.'
      isValid = false
    }

    // 3. Thumbnail Validation
    // Required if: (Create mode) OR (Edit mode AND no existing thumbnail AND no new file selected)
    if (!data.thumbnail && !file) {
      errors.thumbnail = 'Thumbnail image is required.'
      isValid = false
    }

    // 4. Sections Validation (Structure)
    if (data.sections.length === 0) {
      errors.sections = 'At least one section is required.'
      isValid = false
    }

    // 5. Section Content Validation
    const sectionDetailErrors: { [key: number]: { subtitle?: string; content?: string } } = {}
    data.sections.forEach((section, index) => {
      let sectionValid = true
      const detailError: { subtitle?: string; content?: string } = {}

      if (!section.subtitle || section.subtitle.trim().length < 3) {
        detailError.subtitle = 'Subtitle is required (min 3 chars).'
        sectionValid = false
      }

      if (!section.content || section.content.trim().length < 10) {
        detailError.content = 'Content is required (min 10 chars).'
        sectionValid = false
      }

      if (!sectionValid) {
        sectionDetailErrors[index] = detailError
        isValid = false
      }
    })

    if (Object.keys(sectionDetailErrors).length > 0) {
      errors.sectionDetails = sectionDetailErrors
    }

    setFormErrors(errors)
    return isValid
  }

  // --- EXISTING LOGIC FOR DATA FETCHING (KEEPING IT CONCISE) ---
  useEffect(() => {
    if (isEditMode) {
      const fetchBlogData = async () => {
        setIsLoadingData(true)
        try {
          const response = await blogsApi.getBlogById(blogId as string)
          const blogData: Blog = response.data.data

          setFormData({
            title: blogData.title,
            description: blogData.description,
            thumbnail: blogData.thumbnail,
            sections: blogData.sections.sort((a, b) => a.order - b.order)
          })
          setError(null)
        } catch (err) {
          console.log('err', err)

          setError('Failed to load blog data for editing.')
        } finally {
          setIsLoadingData(false)
        }
      }
      fetchBlogData()
    } else {
      setFormData(initialFormState)
      setSelectedFile(null)
    }
    setFormErrors({}) // Clear errors on mode change
  }, [blogId, isEditMode])

  // --- HANDLERS (Simplified) ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files ? e.target.files[0] : null)
  }

  const handleAddSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [...prev.sections, { contentType: 'text', subtitle: '', content: '', order: prev.sections.length + 1 }]
    }))
  }

  const handleRemoveSection = (index: number) => {
    if (formData.sections.length > 1) {
      setFormData((prev) => ({
        ...prev,
        sections: prev.sections.filter((_, i) => i !== index)
      }))
    }
  }

  const handleSectionChange = (index: number, field: 'subtitle' | 'content', value: string) => {
    const newSections = formData.sections.map((section, i) => (i === index ? { ...section, [field]: value } : section))
    setFormData({ ...formData, sections: newSections })
  }

  // --- SUBMIT LOGIC (WITH VALIDATION INTEGRATION) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // --- INTEGRATE VALIDATION HERE ---
    if (!validateForm(formData, selectedFile)) {
      // Validation failed, stop submission. Errors are already set in state.
      return
    }

    setError(null)
    setIsSubmitting(true)

    // STEP 1: HANDLE IMAGE UPLOAD
    let thumbnailUrl = formData.thumbnail

    if (selectedFile) {
      setIsUploading(true)
      try {
        const uploadResult: UploadResult = await uploadFile('blogs', selectedFile, 'thumbnails')
        thumbnailUrl = uploadResult.publicUrl
      } catch (err) {
        console.error('Upload failed:', err)
        setError('Image upload error. Please check Supabase configuration.')
        setIsSubmitting(false)
        setIsUploading(false)
        return
      }
      setIsUploading(false)
    }

    // STEP 2: CALL API CREATE/UPDATE
    const finalData: BlogForm = {
      ...formData,
      thumbnail: thumbnailUrl,
      sections: formData.sections.map((s, index) => ({ ...s, order: index + 1 }))
    }

    try {
      if (isEditMode) {
        await blogsApi.updateBlog(blogId as string, finalData)
      } else {
        await blogsApi.createBlog(finalData)
      }

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Database operation failed', err)
      setError(`Operation failed: Failed to ${isEditMode ? 'update' : 'create'} blog.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50'>
        <div className='p-6 bg-white dark:bg-gray-800 rounded-lg'>
          <p className='text-gray-700 dark:text-gray-300'>Loading blog data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center border-b pb-3 mb-4'>
          <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>{modalTitle}</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          >
            &times;
          </button>
        </div>

        {/* Display general API/submission error */}
        {error && (
          <div className='p-3 mb-4 text-sm text-red-800 rounded-lg bg-red-100 dark:bg-red-900/20 dark:text-red-400'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* 1. Title */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Title</label>
            <input
              type='text'
              name='title'
              value={formData.title}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${formErrors.title ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            />
            {formErrors.title && <p className='mt-1 text-xs text-red-500'>{formErrors.title}</p>}
          </div>

          {/* 2. Description */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Short Description</label>
            <textarea
              name='description'
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${formErrors.description ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            />
            {formErrors.description && <p className='mt-1 text-xs text-red-500'>{formErrors.description}</p>}
          </div>

          {/* 3. Thumbnail File Input */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Thumbnail Image {isEditMode && '(Choose new file to replace)'}
            </label>
            <input
              type='file'
              name='file'
              accept='image/*'
              onChange={handleFileChange}
              className='mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400'
            />

            {(formData.thumbnail || selectedFile) && (
              <div className='mt-2 flex items-center space-x-3'>
                <img
                  src={selectedFile ? URL.createObjectURL(selectedFile) : formData.thumbnail}
                  alt='Thumbnail Preview'
                  className='w-20 h-12 object-cover rounded-md border dark:border-gray-700'
                />
                {formData.thumbnail && !selectedFile && (
                  <p className='text-sm text-gray-500 dark:text-gray-400 truncate'>Currently using existing image.</p>
                )}
              </div>
            )}

            {selectedFile && (
              <p className='mt-1 text-sm text-green-600 dark:text-green-400'>File selected: {selectedFile.name}</p>
            )}
            {formErrors.thumbnail && <p className='mt-1 text-xs text-red-500'>{formErrors.thumbnail}</p>}
          </div>

          {/* 4 & 5. Sections Management */}
          <div className='pt-4 border-t dark:border-gray-700'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-3'>
              Section Contents ({formData.sections.length})
            </h3>

            {formErrors.sections && (
              <p className='p-2 mb-2 text-xs text-red-700 bg-red-100 rounded dark:bg-red-900/20 dark:text-red-400'>
                {formErrors.sections}
              </p>
            )}

            {formData.sections.map((section, index) => (
              <div
                key={index}
                className={`p-4 mb-4 border rounded-md bg-gray-50 dark:bg-gray-700/50 ${formErrors.sectionDetails && formErrors.sectionDetails[index] ? 'border-red-400 dark:border-red-600' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <div className='flex justify-between items-center mb-2'>
                  <h4 className='font-medium text-sm text-indigo-600 dark:text-indigo-400'>Section {index + 1}</h4>
                  {formData.sections.length > 1 && (
                    <button
                      type='button'
                      onClick={() => handleRemoveSection(index)}
                      className='text-red-500 hover:text-red-700 text-xs font-medium'
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div>
                  <label className='block text-xs font-medium text-gray-700 dark:text-gray-300'>Section Subtitle</label>
                  <input
                    type='text'
                    value={section.subtitle}
                    onChange={(e) => handleSectionChange(index, 'subtitle', e.target.value)}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm dark:bg-gray-600 dark:text-white ${formErrors.sectionDetails && formErrors.sectionDetails[index]?.subtitle ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-500'}`}
                  />
                  {formErrors.sectionDetails && formErrors.sectionDetails[index]?.subtitle && (
                    <p className='mt-1 text-xs text-red-500'>{formErrors.sectionDetails[index].subtitle}</p>
                  )}
                </div>

                <div className='mt-2'>
                  <label className='block text-xs font-medium text-gray-700 dark:text-gray-300'>Content</label>
                  <textarea
                    value={section.content}
                    onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                    rows={4}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm dark:bg-gray-600 dark:text-white ${formErrors.sectionDetails && formErrors.sectionDetails[index]?.content ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-500'}`}
                  />
                  {formErrors.sectionDetails && formErrors.sectionDetails[index]?.content && (
                    <p className='mt-1 text-xs text-red-500'>{formErrors.sectionDetails[index].content}</p>
                  )}
                </div>
              </div>
            ))}
            <button
              type='button'
              onClick={handleAddSection}
              className='text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium'
            >
              + Add New Section
            </button>
          </div>

          {/* Submit Button */}
          <div className='flex justify-end pt-4 border-t dark:border-gray-700'>
            <button
              type='button'
              onClick={onClose}
              className='mr-3 inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isSubmitting || isUploading}
              className={`inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm ${
                isSubmitting || isUploading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isSubmitting || isUploading ? 'Processing...' : isEditMode ? 'Update Blog Post' : 'Create Blog Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BlogFormModal
