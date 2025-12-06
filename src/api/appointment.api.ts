import { Appointment, AppointmentDashboard, AppointmentForm, AppointmentResponse } from '../types/appoinment.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

const APPOINTMENTS = '/appointments'

export const appointmentApi = {
  getAppoinments: () => http.get<AppointmentResponse>(`${APPOINTMENTS}`),

  getAppoinmentsById: (appoimentId: string) => http.get<SuccessResponse<Appointment>>(`${APPOINTMENTS}/${appoimentId}`),

  getAppoinmentByBeatyAdvisorId: (BeatyAdvisorId: string) =>
    http.get<SuccessResponse<Appointment[]>>(`${APPOINTMENTS}/staff/${BeatyAdvisorId}`),

  getAppoinmentScheduleId: (scheduleId: string) =>
    http.get<SuccessResponse<Appointment[]>>(`${APPOINTMENTS}/schedule/${scheduleId}`),

  getAppoinmentByStaticsDateRange: (startDate: string, endDate: string, BeatyAdvisorId?: string) => {
    let url = `${APPOINTMENTS}/statistics/date-range?startDate=${startDate}&endDate=${endDate}`

    if (BeatyAdvisorId) {
      url += `&staffId=${BeatyAdvisorId}`
    }

    return http.get<SuccessResponse<AppointmentDashboard>>(url)
  },

  createAppoinments: (body: AppointmentForm) => http.post<AppointmentResponse>(`${APPOINTMENTS}`, body),

  updateAppoinments: (apppoimentId: string, appoinmentForm: AppointmentForm) =>
    http.put<AppointmentResponse>(`${APPOINTMENTS}/${apppoimentId}`, appoinmentForm),

  deleteAppoiment: (apppoimentId: string) => http.delete<AppointmentResponse>(`${APPOINTMENTS}/${apppoimentId}`),

  updateStatusAppoiment: (apppoimentId: string, status: number) =>
    http.put<AppointmentResponse>(`${APPOINTMENTS}/${apppoimentId}/status/${status}`)
}
