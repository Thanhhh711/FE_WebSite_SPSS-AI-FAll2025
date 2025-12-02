/* eslint-disable @typescript-eslint/no-explicit-any */

export interface SelectOption {
  value: string | number
  label: string
}

// Interface mở rộng cho ảnh mới được chọn
export interface NewUploadedImage extends ProductImageForm {
  file: File
  isNew: true
}
export type CombinedProductImage = ProductImage | NewUploadedImage

// State của form (sử dụng trong ProductModal)
export interface ProductFormState
  extends Omit<
    ProductForm,
    'images' | 'expiryDate' | 'status' | 'skinConditionIds' | 'skinTypeIds' | 'variationOptionIds'
  > {
  expiryDate: string | null
  status: ProductStatusEnum
  skinConditionIds: string[]
  skinTypeIds: string[]
  variationOptionIds: string[]
  images: CombinedProductImage[]
}

export interface ProductForm {
  name: string
  englishName: string
  description: string
  price: number
  marketPrice: number
  quantityInStock: number
  storageInstruction: string
  usageInstruction: string
  detailedIngredients: string
  mainFunction: string
  texture: string
  keyActiveIngredients: string
  status: number

  skinIssues: string
  videoUrl: string
  brandId: string
  productCategoryId: string
  skinConditionIds: string[]
  skinTypeIds: string[]
  variationOptionIds: string[]
  images: ProductImageForm[]
}

export interface ProductImageForm {
  imageUrl: string
  isThumbnail: boolean
}

export enum ProductStatusEnum {
  InStock = 1,
  OutOfStock = 2,
  Archived = 3
}

export interface ProductImage {
  id: string
  imageUrl: string
  isThumbnail: boolean
}

export interface Product {
  id: string
  name: string
  englishName: string
  price: number
  marketPrice: number
  soldCount: number
  status: ProductStatusEnum
  rate: number
  description: string
  quantityInStock: number
  storageInstruction: string
  usageInstruction: string
  detailedIngredients: string
  mainFunction: string
  expiryDate: string | null
  texture: string
  skinIssues: string
  videoUrl: string | null

  brandId: string
  productCategoryId: string
  keyActiveIngredients: string
  skinTypeIds: string[]
  skinConditionIds: string[]
  variationOptionIds: string[]

  images: ProductImage[]
  reviews: any[]
}
