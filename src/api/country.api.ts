import { Country, CountryForm } from '../types/contries.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

const COUNTRIES = 'countries'

const countriesApi = {
  getCountries: () => http.get<SuccessResponse<Country[]>>(`${COUNTRIES}`),

  getCountryById: (countryId: number) => http.get<SuccessResponse<Country>>(`${COUNTRIES}/${countryId}`),

  createCountry: (body: CountryForm) => http.post<SuccessResponse<Country>>(`${COUNTRIES}`, body),

  updateCountry: (countryId: number, body: CountryForm) =>
    http.put<SuccessResponse<Country>>(`${COUNTRIES}/${countryId}`, body),

  deleteCountry: (countryId: number) => http.delete<SuccessResponse<Country>>(`${COUNTRIES}/${countryId}`)
}

export default countriesApi
