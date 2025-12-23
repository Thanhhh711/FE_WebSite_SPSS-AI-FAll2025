import { MedicalReportForm, MedicalReportRequestEditForm, Report } from '../types/report.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

const REPORT = 'reports'
export const reportApi = {
  getReport: () => http.get<SuccessResponse<Report[]>>(`${REPORT}`),

  getSessionsById: (reportId: string) => http.get<SuccessResponse<Report>>(`${REPORT}/${reportId}`),

  getSessionsByCustomerId: (customerId: string) =>
    http.get<SuccessResponse<Report>>(`${REPORT}/customer/${customerId}`),

  getSessionsByAppoinmentId: (appoimentId: string) =>
    http.get<SuccessResponse<Report>>(`${REPORT}/appointment/${appoimentId}`),

  createReport: (body: MedicalReportForm) => http.post<SuccessResponse<Report>>(`${REPORT}`, body),

  editReport: (id: string, body: MedicalReportRequestEditForm) =>
    http.put<SuccessResponse<Report>>(`${REPORT}/${id}`, body),

  deleteReport: (id: string) => http.delete<SuccessResponse<Report>>(`${REPORT}/${id}`)
}
