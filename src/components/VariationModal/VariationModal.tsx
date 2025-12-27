import { useEffect, useState } from 'react'

import { toast } from 'react-toastify'
import { Variation, VariationForm } from '../../types/variation.type'
import ModalRegistration from '../RegistrationModal/ModalRegistration'
import VariationOptionManager from './VariationOptionManager'

// --- TYPES ---
interface VariationModalProps {
  isOpen: boolean
  onClose: () => void
  variation: Variation | null
  onSave: (data: VariationForm & { id?: string }) => void
  isViewMode: boolean
  refetch: () => void
}

// --- MAIN COMPONENT ---
export default function VariationModal({
  isOpen,
  onClose,
  variation,
  onSave,
  isViewMode,
  refetch
}: VariationModalProps) {
  const isEditing = !!variation && !isViewMode
  const isCreating = !variation && !isViewMode

  console.log()

  // Fetch Categories
  // const { data: categoriesResponse } = useQuery({
  //   queryKey: ['categories'],
  //   queryFn: categoryApi.getCategories,
  //   staleTime: 1000 * 60 * 5,
  //   enabled: isOpen
  // })
  // const allCategories: Category[] = categoriesResponse?.data.data || []

  // --- Khởi tạo Form State ---
  const [form, setForm] = useState<VariationForm>({
    name: variation?.name || ''
    // productCategoryId: variation?.productCategoryId || ''
  })
  const [errors, setErrors] = useState<Partial<Record<keyof VariationForm, string>>>({})

  useEffect(() => {
    if (variation) {
      setForm({
        name: variation.name
        // productCategoryId: variation.productCategoryId
      })
    } else {
      // setForm({ name: '', productCategoryId: '' })
      setForm({ name: '' })
    }
    setErrors({})
  }, [variation])

  const baseInputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-gray-100 dark:disabled:bg-gray-800'

  const validateForm = (data: VariationForm): boolean => {
    const newErrors: Partial<Record<keyof VariationForm, string>> = {}
    let isValid = true

    if (!data.name.trim()) {
      newErrors.name = 'Variation Name cannot be empty.'
      isValid = false
    }
    // if (!data.productCategoryId) {
    //   newErrors.productCategoryId = 'Product Category is required.'
    //   isValid = false
    // }

    setErrors(newErrors)
    return isValid
  }

  const handleSave = () => {
    if (!validateForm(form)) {
      toast.error('Please correct the form errors.')
      return
    }

    onSave({ ...form, id: isEditing ? variation?.id : undefined })
    refetch()
  }

  const title = isCreating ? 'Create New Variation' : isEditing ? 'Edit Variation' : 'Variation Details'

  // const getCategoryName = (id: string) => {
  //   console.log('id', id)

  //   return allCategories.find((cat) => cat.id === id)?.categoryName || 'Unknown Category'
  // }

  return (
    <ModalRegistration isOpen={isOpen} onClose={onClose} title={title}>
      <div className='p-6 max-h-[80vh] overflow-y-auto'>
        {/* Phần VIEW MODE */}
        {variation && isViewMode && (
          <div className='space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Name:</span>{' '}
              <span className='font-bold text-brand-600'>{variation.name}</span>
            </p>
            {/* <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Category:</span> {getCategoryName(variation.productCategoryId)}
            </p> */}

            {/* Sử dụng VariationOptionManager */}
            <VariationOptionManager
              refetch={refetch}
              variationId={variation.id}
              initialOptions={variation.variationOptions}
              isViewMode={true}
            />
          </div>
        )}

        {/* Phần EDIT/CREATE MODE */}
        {!isViewMode && (
          <div className='space-y-4'>
            {/* Variation Name */}
            <div>
              <label htmlFor='name' className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block'>
                Variation Name *
              </label>
              <input
                id='name'
                type='text'
                placeholder='E.g., Color, Size, Material'
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className={`${baseInputClass} ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className='mt-1 text-xs text-red-500'>{errors.name}</p>}
            </div>

            {/* Product Category Select */}
            {/* <div>
              <label
                htmlFor='productCategoryId'
                className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block'
              >
                Product Category *
              </label>
              <select
                id='productCategoryId'
                value={form.productCategoryId}
                onChange={(e) => setForm((p) => ({ ...p, productCategoryId: e.target.value }))}
                className={`${baseInputClass} ${errors.productCategoryId ? 'border-red-500' : ''}`}
                disabled={isEditing}
              >
                <option value=''>--- Select Category ---</option>
                {allCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
              {errors.productCategoryId && <p className='mt-1 text-xs text-red-500'>{errors.productCategoryId}</p>}
            </div> */}

            {/* Variation Options Management (Chỉ trong Edit Mode) */}
            {isEditing && variation?.id && (
              <VariationOptionManager
                refetch={refetch}
                variationId={variation.id}
                initialOptions={variation.variationOptions}
                isViewMode={false}
              />
            )}
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
            {isEditing ? 'Update Variation' : 'Create Variation'}
          </button>
        )}
      </div>
    </ModalRegistration>
  )
}
