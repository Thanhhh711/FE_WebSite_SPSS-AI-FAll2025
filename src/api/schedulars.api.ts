import { Schedule, ScheduleWork } from '../types/appoinment.type'
import { FormUpdateSchedular, ScheduleRequest } from '../types/schedula.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

const WORK_SCHEDULES = '/work-schedules'

export const scheduleApi = {
  getSchedule: () => http.get<SuccessResponse<Schedule[]>>(`${WORK_SCHEDULES}`),
  getScheduleById: (id: string) => http.get<SuccessResponse<Schedule>>(`${WORK_SCHEDULES}/${id}`),
  getScheduleByIdBeautyAdvisor: (BeatyAdvisorid: string) =>
    http.get<SuccessResponse<ScheduleWork[]>>(`${WORK_SCHEDULES}/staff/${BeatyAdvisorid}`),

  getScheduleByRegistrationID: (Registrationid: string) =>
    http.get<SuccessResponse<ScheduleWork[]>>(`${WORK_SCHEDULES}/registration/${Registrationid}`),

  getScheduleByRoomID: (roomId: string) =>
    http.get<SuccessResponse<ScheduleWork[]>>(`${WORK_SCHEDULES}/room/${roomId}`),

  createSchedule: (body: ScheduleRequest) => http.post<SuccessResponse<ScheduleWork>>(`${WORK_SCHEDULES}`, body),

  updateScheduleById: (id: string, body: FormUpdateSchedular) =>
    http.put<SuccessResponse<ScheduleWork>>(`${WORK_SCHEDULES}/${id}`, body),

  deleteSchedule: (id: string) => http.delete<SuccessResponse<ScheduleWork[]>>(`${WORK_SCHEDULES}/${id}`)
}
