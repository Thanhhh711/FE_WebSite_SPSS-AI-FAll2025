import { Brand, BrandForm } from '../types/brands.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

export const BRANDS = 'brands'

const brandApi = {
  getBrands: () => http.get<SuccessResponse<Brand[]>>(`${BRANDS}`),

  createBrand: (body: BrandForm) => http.post<SuccessResponse<Brand>>(BRANDS, body),

  getBrandById: (brandId: string) => http.get<SuccessResponse<Brand>>(`${BRANDS}/${brandId}`),

  updateBrand: (brandId: string, body: BrandForm) => http.put<SuccessResponse<Brand>>(`${BRANDS}/${brandId}`, body),

  deleteBrand: (brandId: string) => http.delete<SuccessResponse<Brand>>(`${BRANDS}/${brandId}`)
}

export default brandApi
