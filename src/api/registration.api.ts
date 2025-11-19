import { SchedulePayload, ScheduleRegistration } from '../types/registration.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

const REGISTRATIONS = 'registrations'

export const registrationApi = {
  getRegistration: () => http.get<SuccessResponse<ScheduleRegistration[]>>(`${REGISTRATIONS}`),

  getRegistrationByBeatyAdvisorId: (BeatyAdvisorId: string) =>
    http.get<SuccessResponse<ScheduleRegistration[]>>(`${REGISTRATIONS}/staff/${BeatyAdvisorId}`),

  getRegistrationByRegistrationId: (RegistrationId: string) =>
    http.get<SuccessResponse<ScheduleRegistration[]>>(`${REGISTRATIONS}/registrations/${RegistrationId}`),

  createRegistration: (body: SchedulePayload) =>
    http.post<SuccessResponse<ScheduleRegistration>>(`${REGISTRATIONS}`, body),

  updateRegistration: (registrationid: string, registrationForm: SchedulePayload) =>
    http.put<SuccessResponse<ScheduleRegistration>>(`${REGISTRATIONS}/${registrationid}`, registrationForm),

  deleteRegistration: (registrationid: string) =>
    http.delete<SuccessResponse<ScheduleRegistration>>(`${REGISTRATIONS}/${registrationid}`)
}
