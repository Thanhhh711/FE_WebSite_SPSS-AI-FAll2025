import { DashboardData, DashboardMetric } from '../types/dashboard.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

const DASHBOARD = 'dashboard'
const USERS = 'users'
const BUSINESS = 'business'

const dashboardApi = {
  getDashboardUsers: (year?: number, month?: number) =>
    http.get<SuccessResponse<DashboardMetric>>(`${DASHBOARD}/${USERS}?Year=${year}&Month=${month}`),

  getDashboardBusiness: (year?: number, month?: number) =>
    http.get<SuccessResponse<DashboardData>>(`${DASHBOARD}/${BUSINESS}?Year=${year}&Month=${month}`)
}

export default dashboardApi
