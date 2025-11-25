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
  options: VariationOption[]
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
