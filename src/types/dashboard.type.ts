export interface DashboardMetric {
  currentValue: number
  previousValue: number
  percentageChange: number
  trend: number
}

export interface DashboardData {
  totalProducts: DashboardMetric
  totalOrders: DashboardMetric
  totalRevenue: DashboardMetric
}
