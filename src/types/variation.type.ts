import { Category } from './category.type'

export interface Variation {
  id: string
  name: string
  productCategoryId: string
  createdBy: string
  lastUpdatedBy: string | null
  deletedBy: string | null
  createdTime: string // ISO Date string
  lastUpdatedTime: string | null
  deletedTime: string | null
  isDeleted: boolean
  productCategory: Category
  variationOptions: VarionOptionInResponse[]
}

export interface VarionOptionInResponse {
  id: string
  value: string
  variationId: string
  variationName: string
}

export interface VariationForm {
  name: string
  productCategoryId: string
}

export interface VariationOptionForm {
  value: string
  variationId: string
}

export interface VariationOption {
  id: string
  value: string
  variationId: string
  createdBy: string
  lastUpdatedBy: string | null
  deletedBy: string | null
  createdTime: string
  lastUpdatedTime: string | null
  deletedTime: string | null
  isDeleted: boolean
  variation: Variation
}
