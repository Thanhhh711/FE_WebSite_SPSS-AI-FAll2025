import { Service, ServiceForm } from '../types/service.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

const SERVICES = '/services'

export const serviceApi = {
  getServices: () => http.get<SuccessResponse<Service[]>>(`${SERVICES}`),
  getServiceById: (id: string) => http.get<SuccessResponse<Service[]>>(`${SERVICES}/${id}`),

  createService: (body: ServiceForm) => http.post<SuccessResponse<Service>>(`${SERVICES}`, body),
  updateService: (serviceId: string, body: ServiceForm) =>
    http.put<SuccessResponse<Service>>(`${SERVICES}/${serviceId}`, body),
  deletedService: (serviceId: string) => http.delete<SuccessResponse<Service>>(`${SERVICES}/${serviceId}`)
}
