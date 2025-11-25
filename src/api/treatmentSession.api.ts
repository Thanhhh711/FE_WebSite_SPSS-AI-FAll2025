/* eslint-disable @typescript-eslint/no-explicit-any */
import { TreatmentSession, TreatmentSessionForm } from '../types/treatmentSession.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

const SESSIONS = 'treatment-sessions'
export const sessionApi = {
  getSessions: () => http.get<SuccessResponse<TreatmentSession[]>>(`${SESSIONS}`),

  getSessionsById: (sessionId: string) => http.get<SuccessResponse<TreatmentSession>>(`${SESSIONS}/${sessionId}`),

  createSession: (body: any) => http.post<SuccessResponse<TreatmentSession>>(`${SESSIONS}/with-schedule`, body),

  updateSession: (sessionId: string, sessionFrom: TreatmentSessionForm) =>
    http.put<SuccessResponse<TreatmentSession>>(`${SESSIONS}/${sessionId}`, sessionFrom),

  deleteSession: (sessionId: string) => http.delete<SuccessResponse<TreatmentSession>>(`${SESSIONS}/${sessionId}`),

  getSessionsByPlanId: (plandId: string) => http.get<SuccessResponse<TreatmentSession[]>>(`${SESSIONS}/plan/${plandId}`)
}
