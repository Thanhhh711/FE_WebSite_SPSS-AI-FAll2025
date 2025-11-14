import { Service } from '../types/appoinment.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

const SERVICES = '/services'

export const serviceApi = {
  getServices: () => http.get<SuccessResponse<Service[]>>(`${SERVICES}`),
  getServiceById: (id: string) => http.get<SuccessResponse<Service[]>>(`${SERVICES}/${id}`)
}
