import { Country } from './contries.type'
import { Product } from './product.type'

export interface BrandForm {
  name: string
  title: string
  description: string
  imageUrl: string
  countryId: number
}

export interface Brand {
  id: string
  name: string
  title: string
  description: string
  imageUrl: string
  countryId: number
  country: Country
  products: Product[]
}
