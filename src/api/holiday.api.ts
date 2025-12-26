import { CreateHolidayBody, Holiday } from '../types/holiday.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

const HOLIDAYS = 'holidays'

const holidayApi = {
  // Get all holidays
  getHolidays: () => http.get<SuccessResponse<Holiday[]>>(`${HOLIDAYS}`),

  // Get holiday by id
  getHolidayById: (holidayId: string) => http.get<SuccessResponse<Holiday>>(`${HOLIDAYS}/${holidayId}`),

  // Create holiday
  createHoliday: (body: CreateHolidayBody) => http.post<SuccessResponse<Holiday>>(`${HOLIDAYS}`, body),

  // Update holiday
  updateHoliday: (holidayId: string, body: CreateHolidayBody) =>
    http.put<SuccessResponse<Holiday>>(`${HOLIDAYS}/${holidayId}`, body),

  // Delete holiday
  deleteHoliday: (holidayId: string) => http.delete<SuccessResponse<void>>(`${HOLIDAYS}/${holidayId}`)
}

export default holidayApi
