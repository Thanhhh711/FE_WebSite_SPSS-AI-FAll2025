import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'
import { Variation, VariationForm, VariationOption, VariationOptionForm } from '../types/variation.type'

const VARIATIONS = 'variations'
const VARIATION_OPTIONS = 'variation-options'

const variationApi = {
  // --- Variations ---
  getVariations: () => http.get<SuccessResponse<Variation[]>>(`${VARIATIONS}`),

  getVariationById: (variationId: string) => http.get<SuccessResponse<Variation>>(`${VARIATIONS}/${variationId}`),

  createVariation: (body: VariationForm) => http.post<SuccessResponse<Variation>>(`${VARIATIONS}`, body),

  updateVariation: (variationId: string, body: VariationForm) =>
    http.put<SuccessResponse<Variation>>(`${VARIATIONS}/${variationId}`, body),

  deleteVariation: (variationId: string) => http.delete<SuccessResponse<null>>(`${VARIATIONS}/${variationId}`),

  // --- Variation Options ---
  getVariationOptionById: (optionId: string) =>
    http.get<SuccessResponse<VariationOption>>(`${VARIATION_OPTIONS}/${optionId}`),

  createVariationOption: (body: VariationOptionForm) =>
    http.post<SuccessResponse<VariationOption>>(`${VARIATION_OPTIONS}`, body),

  updateVariationOption: (optionId: string, body: VariationOptionForm) =>
    http.put<SuccessResponse<VariationOption>>(`${VARIATION_OPTIONS}/${optionId}`, body),

  deleteVariationOption: (optionId: string) => http.delete<SuccessResponse<null>>(`${VARIATION_OPTIONS}/${optionId}`)
}

export default variationApi
