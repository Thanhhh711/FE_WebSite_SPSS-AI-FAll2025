import { CreateTreatmentPlanDto, TreatmentPlan } from '../types/treatmentPlan.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

const TREATMENTPLANS = 'treatment-plans'
export const treatmentPlanApi = {
  getTreateMents: () => http.get<SuccessResponse<TreatmentPlan[]>>(`${TREATMENTPLANS}`),

  getTreateMentsById: (planId: string) => http.get<SuccessResponse<TreatmentPlan>>(`${TREATMENTPLANS}/${planId}`),

  createTreateMent: (body: CreateTreatmentPlanDto) =>
    http.post<SuccessResponse<TreatmentPlan>>(`${TREATMENTPLANS}`, body),

  updateTreateMent: (planId: string, treatmentFrom: CreateTreatmentPlanDto) =>
    http.put<SuccessResponse<TreatmentPlan>>(`${TREATMENTPLANS}/${planId}`, treatmentFrom),

  deleteTreateMent: (planId: string) => http.delete<SuccessResponse<TreatmentPlan>>(`${TREATMENTPLANS}/${planId}`)
}
