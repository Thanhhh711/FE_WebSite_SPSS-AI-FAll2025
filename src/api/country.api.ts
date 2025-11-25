import { Country, CountryForm } from '../types/contries.type'
import http from '../utils/http'
import { ProductOrderService, SuccessResponse } from '../utils/utils.type'

const COUNTRIES = 'countries'

const countriesApi = {
  getCountries: () => http.get<SuccessResponse<Country[]>>(`${ProductOrderService}/${COUNTRIES}`),

  getCountryById: (countryId: number) =>
    http.get<SuccessResponse<Country>>(`${ProductOrderService}/${COUNTRIES}/${countryId}`),

  createCountry: (body: CountryForm) =>
    http.post<SuccessResponse<Country>>(`${ProductOrderService}/${COUNTRIES}`, body),

  updateCountry: (countryId: number, body: CountryForm) =>
    http.put<SuccessResponse<Country>>(`${ProductOrderService}/${COUNTRIES}/${countryId}`, body),

  deleteCountry: (countryId: number) =>
    http.delete<SuccessResponse<Country>>(`${ProductOrderService}/${COUNTRIES}/${countryId}`)
}

export default countriesApi
