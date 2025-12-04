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
type CategoryErrors = Partial<Record<keyof CategoryForm, string>> // Định nghĩa kiểu lỗi

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
  const [errors, setErrors] = useState<CategoryErrors>({})

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

  // Hàm xử lý thay đổi input cho categoryName
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, categoryName: e.target.value }))
    // Xóa lỗi ngay lập tức
    if (errors.categoryName) {
      setErrors((p) => ({ ...p, categoryName: undefined }))
    }
  }

  const baseInputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-gray-100 dark:disabled:bg-gray-800'

  const validateForm = (data: CategoryForm): boolean => {
    const newErrors: CategoryErrors = {}
    let isValid = true // 1. Category Name Validation

    if (!data.categoryName.trim()) {
      newErrors.categoryName = 'Category Name cannot be empty.'
      isValid = false
    } else if (data.categoryName.trim().length < 2) {
      newErrors.categoryName = 'Category Name must be at least 2 characters.'
      isValid = false
    } else if (data.categoryName.trim().length > 50) {
      // Thêm giới hạn ký tự tối đa
      newErrors.categoryName = 'Category Name must not exceed 50 characters.'
      isValid = false
    } // 2. Parent Category Validation (Ngăn chặn vòng lặp)

    if (isEditing && data.parentCategoryId === category?.id) {
      newErrors.parentCategoryId = 'Cannot select the category itself as its Parent.'
      isValid = false
    }

    // (Optional but Recommended) Ngăn chặn chọn con cháu làm cha
    const isChild = (parentId: string | null, childId: string) => {
      if (!parentId) return false
      if (parentId === childId) return true

      const parent = allCategories.find((c) => c.id === parentId)
      if (!parent) return false

      // Kiểm tra tất cả các con cháu (recursive)
      let found = false
      const checkChildren = (cat: Category) => {
        if (found) return
        cat.inverseParentCategory?.forEach((c) => {
          if (c.id === childId) {
            found = true
            return
          }
          checkChildren(c)
        })
      }
      checkChildren(parent)
      return found
    }

    if (isEditing && data.parentCategoryId && category?.id) {
      // Nếu Category đang chọn là con của Category cha mới, sẽ tạo vòng lặp
      if (isChild(category.id, data.parentCategoryId)) {
        newErrors.parentCategoryId = 'Cannot select a descendant category as its parent.'
        isValid = false
      }
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
    toast.success(`${isEditing ? 'Updated' : 'Created'} category successfully!`)
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
    } // Tìm tất cả con cháu và loại bỏ chúng
    findChildren(currentCategory)

    return allCategories.filter((cat) => !excludedIds.has(cat.id))
  }

  const availableParents = getAvailableParentCategories(category)

  const handleParentCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === '' ? null : e.target.value
    setForm((p) => ({ ...p, parentCategoryId: value }))
    // Xóa lỗi ngay lập tức
    if (errors.parentCategoryId) {
      setErrors((p) => ({ ...p, parentCategoryId: undefined }))
    }
  }

  return (
    <ModalRegistration isOpen={isOpen} onClose={onClose} title={title}>
      <div className='p-6 max-h-[80vh] overflow-y-auto'>
        {category && isViewMode && (
          <div className='space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Name:</span>
              <span className='font-bold text-brand-600'>{category.categoryName}</span>
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Parent:</span>
              {category.parentCategory?.categoryName || 'None (Root Category)'}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Subcategories:</span> {category.inverseParentCategory.length}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Products:</span> {category.products.length}
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
                name='categoryName' // Thêm name
                type='text'
                placeholder='E.g., Electronics, T-Shirts, Books'
                value={form.categoryName}
                onChange={handleNameChange} // Sử dụng hàm mới
                className={`${baseInputClass} ${errors.categoryName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                maxLength={50} // Thêm giới hạn ký tự cứng trên input
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
                name='parentCategoryId' // Thêm name
                value={form.parentCategoryId || ''}
                onChange={handleParentCategoryChange} // Cập nhật để xóa lỗi
                className={`${baseInputClass} ${errors.parentCategoryId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
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
