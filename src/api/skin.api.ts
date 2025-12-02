import { SkinCondition, SkinConditionForm, SkinType, SkinTypeForm } from '../types/skin.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

const SKIN_CONDITIONS = 'skin-conditions'

export const skinConditionApi = {
  getSkinConditions: () => http.get<SuccessResponse<SkinCondition[]>>(`${SKIN_CONDITIONS}`),

  getSkinConditionById: (id: string) => http.get<SuccessResponse<SkinCondition>>(`${SKIN_CONDITIONS}/${id}`),

  createSkinCondition: (body: SkinConditionForm) =>
    http.post<SuccessResponse<SkinCondition>>(`${SKIN_CONDITIONS}`, body),

  updateSkinCondition: (id: string, body: SkinConditionForm) =>
    http.put<SuccessResponse<SkinCondition>>(`${SKIN_CONDITIONS}/${id}`, body),

  deleteSkinCondition: (id: string) => http.delete<SuccessResponse<null>>(`${SKIN_CONDITIONS}/${id}`)
}

const SKIN_TYPES = 'skin-types'

export const skinTypeApi = {
  getSkinTypes: () => http.get<SuccessResponse<SkinType[]>>(`${SKIN_TYPES}`),

  getSkinTypeById: (id: string) => http.get<SuccessResponse<SkinType>>(`${SKIN_TYPES}/${id}`),

  createSkinType: (body: SkinTypeForm) => http.post<SuccessResponse<SkinType>>(`${SKIN_TYPES}`, body),

  updateSkinType: (id: string, body: SkinTypeForm) => http.put<SuccessResponse<SkinType>>(`${SKIN_TYPES}/${id}`, body),

  deleteSkinType: (id: string) => http.delete<SuccessResponse<null>>(`${SKIN_TYPES}/${id}`)
}
