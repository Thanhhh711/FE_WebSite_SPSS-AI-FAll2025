import { Schedule, ScheduleWork } from '../types/appoinment.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

const WORK_SCHEDULES = '/work-schedules'

export const scheduleApi = {
  getSchedule: () => http.get<SuccessResponse<Schedule[]>>(`${WORK_SCHEDULES}`),
  getScheduleById: (id: string) => http.get<SuccessResponse<Schedule>>(`${WORK_SCHEDULES}/${id}`),
  getScheduleByIdBeautyAdvisor: (BeatyAdvisorid: string) =>
    http.get<SuccessResponse<ScheduleWork[]>>(`${WORK_SCHEDULES}/staff/${BeatyAdvisorid}`)
}
