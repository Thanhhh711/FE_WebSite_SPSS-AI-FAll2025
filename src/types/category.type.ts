import { Product } from './product.type'
import { Variation } from './variation.type'

export interface Category {
  id: string
  parentCategoryId: string | null
  categoryName: string
  parentCategory: Category | null
  inverseParentCategory: Category[]
  products: Product[]
  variations: Variation[]
}

export interface CategoryForm {
  parentCategoryId: string | null
  categoryName: string
}
