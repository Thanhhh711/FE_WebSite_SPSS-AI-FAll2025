import { DashboardData, DashboardMetric } from '../types/dashboard.type'
import http from '../utils/http'
import { SuccessResponse } from '../utils/utils.type'

const DASHBOARD = 'dashboard'
const USERS = 'users'
const BUSINESS = 'business'
const SUMMARY = 'summary'

const dashboardApi = {
  getdashboardUsers: () => http.get<SuccessResponse<DashboardMetric>>(`${DASHBOARD}/${USERS}/${SUMMARY}`),
  getdashboardBusiness: () => http.get<SuccessResponse<DashboardData>>(`${DASHBOARD}/${BUSINESS}/${SUMMARY}`)
}

export default dashboardApi
