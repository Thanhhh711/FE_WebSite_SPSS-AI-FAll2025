import { Brand } from './brands.type'

export interface CountryForm {
  countryCode: string
  countryName: string
}

export interface Country {
  id: number
  countryCode: string
  countryName: string
  brands: Brand[]
}
