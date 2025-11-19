import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'
import { ScheduleTemplate, TemplateForm } from '../types/templete.type'

const TEMPLATES = 'templates'
export const templateApi = {
  getTemplates: () => http.get<SuccessResponse<ScheduleTemplate[]>>(`${TEMPLATES}`),

  // getRegistrationByBeautyAdvisorId: (beautyAdvisorId: string) =>
  //   http.get<SuccessResponse<Registration[]>>(`${REGISTRATIONS}/staff/${beautyAdvisorId}`),

  getTemplatesById: (templateId: string) => http.get<SuccessResponse<ScheduleTemplate>>(`${TEMPLATES}/${templateId}`),

  createTemplate: (body: TemplateForm) => http.post<SuccessResponse<ScheduleTemplate>>(`${TEMPLATES}`, body),

  updateTemplate: (temlateID: string, templateFrom: TemplateForm) =>
    http.put<SuccessResponse<ScheduleTemplate>>(`${TEMPLATES}/${temlateID}`, templateFrom),

  deleteTemplate: (temlateID: string) => http.delete<SuccessResponse<ScheduleTemplate>>(`${TEMPLATES}/${temlateID}`)
}
