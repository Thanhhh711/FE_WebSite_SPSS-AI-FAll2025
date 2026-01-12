/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from 'react-toastify'
import { ProductFormState } from '../components/ProductModal/ProductFormFields'
import { ProductForm } from '../types/product.type'

// Thêm tham số selectedImageFiles để check ảnh mới chọn
export const validateProductForm = (form: ProductFormState, selectedImageFiles: File[] = []): boolean => {
  const requiredFields: (keyof ProductFormState)[] = [
    'name',
    'englishName',
    'description',
    'price',
    'marketPrice',
    'quantityInStock',
    'storageInstruction',
    'usageInstruction',
    'detailedIngredients',
    'mainFunction',
    'texture',
    'keyActiveIngredients',
    'status',
    'skinIssues',
    'brandId',
    'productCategoryId',
    'skinConditionIds',
    'skinTypeIds',
    'variationOptionIds'
  ]

  // 1. Validate các field text/number/array mặc định
  for (const field of requiredFields) {
    const value = form[field]

    if (typeof value === 'string' && !value.trim()) {
      toast.error(`Please enter ${field}`)
      return false
    }

    if (typeof value === 'number' && value <= 0) {
      toast.error(`${field} must be greater than 0`)
      return false
    }

    if (Array.isArray(value) && value.length === 0) {
      toast.error(`Please select at least one value for ${field}`)
      return false
    }
  }

  // 2. Validate Hình ảnh (MỚI)
  // Kiểm tra: form.images (ảnh cũ) và selectedImageFiles (ảnh mới chọn)
  const totalImages = form.images.length + selectedImageFiles.length
  if (totalImages === 0) {
    toast.error('Please upload at least one product image')
    return false
  }

  return true
}

export const formatDateValue = (dateString: string | undefined): string => {
  if (!dateString) return ''
  return dateString.split('T')[0]
}

export const formatDateToDDMMYYYY = (isoDateString: string | undefined): string => {
  const yyyyMmDd = formatDateValue(isoDateString)
  if (!yyyyMmDd) return ''

  const parts = yyyyMmDd.split('-')

  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

export const ProductOrderService = 'product-order-service'
export const UserService = 'user-service'

export function normalizeProductData(data: ProductForm & { id?: string }) {
  const normalizedData: any = {}

  for (const key in data) {
    let value = data[key as keyof typeof data]

    // Convert empty string -> null
    if (typeof value === 'string' && value.trim() === '') {
      normalizedData[key] = null
      continue
    }

    // Convert arrays: empty array -> null
    if (Array.isArray(value)) {
      normalizedData[key] = value.length > 0 ? value : null
      continue
    }

    // SPECIAL CASE: convert expiryDate to ISO JSON datetime
    if (key === 'expiryDate' && typeof value === 'string' && value) {
      const d = new Date(value)

      // nếu user nhập yyyy-MM-dd thì tự convert
      normalizedData[key] = d.toISOString()
      continue
    }

    normalizedData[key] = value
  }

  return normalizedData
}

export const formatVND = (value: number) => value.toLocaleString('vi-VN')

export const parseNumber = (value: string) => Number(value.replace(/\./g, '')) || 0
