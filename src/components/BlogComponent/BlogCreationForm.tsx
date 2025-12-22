// BlogFormModal.tsx

import { useState, useEffect } from 'react'
import { Blog, BlogForm } from '../../types/media.type'
import { blogsApi } from '../../api/media.api'
import { uploadFile, UploadResult } from '../../utils/supabaseStorage'
import { AlignLeft, ImageIcon, Info, Plus, Trash2, Type, X } from 'lucide-react'

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
    <div className='fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md transition-all duration-300 p-4'>
      <div className='bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 dark:border-gray-800'>
        {/* HEADER */}
        <div className='flex justify-between items-center px-8 py-6 border-b border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/30'>
          <div>
            <h2 className='text-2xl font-black text-slate-800 dark:text-white tracking-tight'>{modalTitle}</h2>
            <p className='text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 italic'>
              Blog Creation Engine
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20 rounded-xl transition-all text-slate-400'
          >
            <X size={24} />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto p-8 custom-scrollbar'>
          {/* Error Message Alert */}
          {error && (
            <div className='flex items-center gap-3 p-4 mb-6 text-sm text-rose-600 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 font-bold'>
              <Info size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-10'>
            {/* 1. GENERAL INFORMATION */}
            <div className='space-y-6'>
              <div className='flex items-center gap-2 mb-2'>
                <Type size={18} className='text-indigo-500' />
                <h3 className='font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest'>
                  General Information
                </h3>
              </div>

              <div className='grid grid-cols-1 gap-6'>
                {/* Title Input */}
                <div className='space-y-2'>
                  <label className='text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1'>
                    Post Title
                  </label>
                  <input
                    type='text'
                    name='title'
                    value={formData.title}
                    onChange={handleChange}
                    placeholder='E.g. 10 Steps to Glowing Skin...'
                    className={`w-full px-5 py-4 bg-slate-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-4 ring-indigo-500/10 transition-all text-sm font-bold dark:text-white outline-none ${
                      formErrors.title ? 'ring-2 ring-rose-500/50' : ''
                    }`}
                  />
                  {formErrors.title && <p className='text-[10px] text-rose-500 font-bold ml-2'>{formErrors.title}</p>}
                </div>

                {/* Description Textarea */}
                <div className='space-y-2'>
                  <label className='text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1'>
                    Short Description
                  </label>
                  <textarea
                    name='description'
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder='Give a brief summary of this article...'
                    className={`w-full px-5 py-4 bg-slate-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-4 ring-indigo-500/10 transition-all text-sm font-bold dark:text-white outline-none resize-none ${
                      formErrors.description ? 'ring-2 ring-rose-500/50' : ''
                    }`}
                  />
                  {formErrors.description && (
                    <p className='text-[10px] text-rose-500 font-bold ml-2'>{formErrors.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. THUMBNAIL UPLOAD */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <ImageIcon size={18} className='text-indigo-500' />
                <h3 className='font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest'>
                  Cover Media
                </h3>
              </div>

              <div className='relative group'>
                <div
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-[2.5rem] p-8 transition-all ${
                    selectedFile || formData.thumbnail
                      ? 'border-indigo-200 bg-indigo-50/30 dark:border-indigo-900/30 dark:bg-indigo-900/10'
                      : 'border-slate-200 dark:border-gray-800 hover:border-indigo-400 hover:bg-slate-50'
                  }`}
                >
                  {formData.thumbnail || selectedFile ? (
                    <div className='relative group/img w-full'>
                      <img
                        src={selectedFile ? URL.createObjectURL(selectedFile) : formData.thumbnail}
                        alt='Preview'
                        className='w-full max-h-56 object-cover rounded-[2rem] shadow-xl border border-white dark:border-gray-700'
                      />
                      <div className='absolute inset-0 bg-black/40 rounded-[2rem] opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all backdrop-blur-[2px]'>
                        <p className='text-white text-xs font-black uppercase tracking-widest'>Change Thumbnail</p>
                      </div>
                    </div>
                  ) : (
                    <div className='text-center py-4'>
                      <div className='w-14 h-14 bg-indigo-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-500'>
                        <Plus size={28} />
                      </div>
                      <p className='text-sm font-bold text-slate-600 dark:text-slate-300'>Drop your image here</p>
                      <p className='text-[10px] text-slate-400 mt-2 uppercase font-black tracking-tighter'>
                        Support: JPG, PNG, WEBP (Max 5MB)
                      </p>
                    </div>
                  )}
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleFileChange}
                    className='absolute inset-0 opacity-0 cursor-pointer'
                  />
                </div>
                {formErrors.thumbnail && (
                  <p className='text-[10px] text-rose-500 font-bold mt-2 ml-2'>{formErrors.thumbnail}</p>
                )}
              </div>
            </div>

            {/* 3. SECTION CONTENT BUILDER */}
            <div className='pt-8 border-t border-slate-100 dark:border-gray-800 space-y-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <AlignLeft size={18} className='text-indigo-500' />
                  <h3 className='font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest'>
                    Post Sections ({formData.sections.length})
                  </h3>
                </div>
                <button
                  type='button'
                  onClick={handleAddSection}
                  className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-5 py-2.5 rounded-xl hover:bg-indigo-100 transition-all border border-indigo-100 dark:border-indigo-800'
                >
                  <Plus size={14} /> Add New Section
                </button>
              </div>

              {formErrors.sections && (
                <p className='p-3 text-[10px] font-bold text-rose-600 bg-rose-50 rounded-xl border border-rose-100 uppercase tracking-widest text-center'>
                  {formErrors.sections}
                </p>
              )}

              <div className='space-y-6'>
                {formData.sections.map((section, index) => (
                  <div
                    key={index}
                    className='group relative p-7 bg-slate-50/50 dark:bg-gray-800/40 rounded-[2.5rem] border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all shadow-sm'
                  >
                    <div className='flex justify-between items-center mb-5'>
                      <div className='flex items-center gap-3'>
                        <span className='w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full text-[12px] font-black text-indigo-500 shadow-sm border border-slate-100 dark:border-gray-700'>
                          {index + 1}
                        </span>
                        <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                          Section Content
                        </span>
                      </div>
                      {formData.sections.length > 1 && (
                        <button
                          type='button'
                          onClick={() => handleRemoveSection(index)}
                          className='p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all'
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    <div className='space-y-5'>
                      <div className='space-y-2'>
                        <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                          Subtitle
                        </label>
                        <input
                          type='text'
                          placeholder='E.g. Why hydration matters...'
                          value={section.subtitle}
                          onChange={(e) => handleSectionChange(index, 'subtitle', e.target.value)}
                          className='w-full px-5 py-3.5 bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-2xl focus:ring-4 ring-indigo-500/10 transition-all text-sm font-bold dark:text-white outline-none shadow-sm'
                        />
                      </div>

                      <div className='space-y-2'>
                        <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                          Body Text
                        </label>
                        <textarea
                          placeholder='Enter the detailed content for this section...'
                          value={section.content}
                          onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                          rows={4}
                          className='w-full px-5 py-4 bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-2xl focus:ring-4 ring-indigo-500/10 transition-all text-sm font-medium dark:text-white outline-none shadow-sm resize-none'
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* FOOTER ACTIONS */}
        <div className='px-8 py-6 border-t border-slate-100 dark:border-gray-800 flex justify-end items-center gap-4 bg-slate-50/50 dark:bg-gray-800/30'>
          <button
            type='button'
            onClick={onClose}
            className='px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all'
          >
            Discard
          </button>
          <button
            type='submit'
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className={`px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all active:scale-95 ${
              isSubmitting || isUploading
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30 hover:shadow-indigo-500/40'
            }`}
          >
            {isSubmitting || isUploading ? 'Saving...' : isEditMode ? 'Update Article' : 'Publish Article'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BlogFormModal
