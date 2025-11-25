/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'

import ModalRegistration from '../RegistrationModal/ModalRegistration'
import { toast } from 'react-toastify'

import { useQuery } from '@tanstack/react-query'
import { Category, CategoryForm } from '../../types/category.type'
import { categoryApi } from '../../api/category.api'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category: Category | null
  onSave: (data: CategoryForm & { id?: string }) => void
  isViewMode: boolean
}

type CategoryFormData = CategoryForm & { id?: string }

export default function CategoryModal({ isOpen, onClose, category, onSave, isViewMode }: CategoryModalProps) {
  const isEditing = !!category && !isViewMode
  const isCreating = !category && !isViewMode

  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
    staleTime: 1000 * 60 * 5,
    enabled: isOpen
  })

  const allCategories: Category[] = categoriesResponse?.data.data || []

  const [form, setForm] = useState<CategoryForm>({
    categoryName: category?.categoryName || '',
    parentCategoryId: category?.parentCategoryId || null
  })
  const [errors, setErrors] = useState<Partial<Record<keyof CategoryForm, string>>>({})

  useEffect(() => {
    if (category) {
      setForm({
        categoryName: category.categoryName,
        parentCategoryId: category.parentCategoryId || null
      })
    } else {
      setForm({
        categoryName: '',
        parentCategoryId: null
      })
    }
    setErrors({})
  }, [category])

  const baseInputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-gray-100 dark:disabled:bg-gray-800'

  const validateForm = (data: CategoryForm): boolean => {
    const newErrors: Partial<Record<keyof CategoryForm, string>> = {}
    let isValid = true

    if (!data.categoryName.trim()) {
      newErrors.categoryName = 'Category Name cannot be empty.'
      isValid = false
    } else if (data.categoryName.trim().length < 2) {
      newErrors.categoryName = 'Category Name must be at least 2 characters.'
      isValid = false
    }

    if (isEditing && data.parentCategoryId === category?.id) {
      newErrors.parentCategoryId = 'Cannot select the category itself as its Parent.'
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

    const dataToSave: CategoryFormData = {
      ...form,
      id: isEditing ? category?.id : undefined
    }
    onSave(dataToSave)
  }

  const title = isCreating ? 'Create New Category' : isEditing ? 'Edit Category Details' : 'Category Details'

  const getAvailableParentCategories = (currentCategory: Category | null): Category[] => {
    if (!currentCategory) return allCategories

    const excludedIds: Set<string> = new Set()

    excludedIds.add(currentCategory.id)

    const findChildren = (cat: Category) => {
      cat.inverseParentCategory?.forEach((child) => {
        excludedIds.add(child.id)
        findChildren(child)
      })
    }
    findChildren(currentCategory)

    return allCategories.filter((cat) => !excludedIds.has(cat.id))
  }

  const availableParents = getAvailableParentCategories(category)

  const handleParentCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === '' ? null : e.target.value
    setForm((p) => ({ ...p, parentCategoryId: value }))
  }

  return (
    <ModalRegistration isOpen={isOpen} onClose={onClose} title={title}>
      <div className='p-6 max-h-[80vh] overflow-y-auto'>
        {category && isViewMode && (
          <div className='space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Name:</span>{' '}
              <span className='font-bold text-brand-600'>{category.categoryName}</span>
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Parent:</span>{' '}
              {category.parentCategory?.categoryName || 'None (Root Category)'}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Subcategories:</span> {category.inverseParentCategory.length}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Products:</span> {category.products.length}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Variations:</span> {category.variations.length}
            </p>
          </div>
        )}

        {!isViewMode && (
          <div className='space-y-4'>
            <div>
              <label htmlFor='categoryName' className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block'>
                Category Name *
              </label>
              <input
                id='categoryName'
                type='text'
                placeholder='E.g., Electronics, T-Shirts, Books'
                value={form.categoryName}
                onChange={(e) => setForm((p) => ({ ...p, categoryName: e.target.value }))}
                className={`${baseInputClass} ${errors.categoryName ? 'border-red-500' : ''}`}
              />
              {errors.categoryName && <p className='mt-1 text-xs text-red-500'>{errors.categoryName}</p>}
            </div>

            <div>
              <label
                htmlFor='parentCategory'
                className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block'
              >
                Parent Category (Optional)
              </label>
              <select
                id='parentCategory'
                value={form.parentCategoryId || ''}
                onChange={handleParentCategoryChange}
                className={`${baseInputClass} ${errors.parentCategoryId ? 'border-red-500' : ''}`}
              >
                <option value=''>--- Select Root Category ---</option>
                {availableParents.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
              {errors.parentCategoryId && <p className='mt-1 text-xs text-red-500'>{errors.parentCategoryId}</p>}
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
            {isEditing ? 'Update Category' : 'Create Category'}
          </button>
        )}
      </div>
    </ModalRegistration>
  )
}
