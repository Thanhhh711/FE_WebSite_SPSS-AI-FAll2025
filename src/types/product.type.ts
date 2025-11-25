export interface Product {
  id: string
  name: string
  price: number
  marketPrice: number
  rating: number
  brandName: string | null
  thumbnailImageUrl: string | null
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
  expiryDate: string
  skinIssues: string
  productStatusId: string
  brandId: string
  productCategoryId: string
  skinConditionIds: string[]
  skinTypeIds: string[]
  variationOptionIds: string[]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
enum ProductStatusEnum {
  InStock = 1,
  OutOfStock = 2,
  Archived = 3
}
