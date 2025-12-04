// src/pages/Home.tsx (Sử dụng Bar Chart và Time Selectors)
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from 'react'

// Simple icons for illustration
import { DollarSign, Package, ShoppingBag, Users, Calendar } from 'lucide-react'
import dashboardApi from '../../api/dashboard.api'
import PageMeta from '../../components/common/PageMeta'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import MetricCard from '../../components/dashboard/MetricCard'
import CombinedBarChart from '../../components/dashboard/CombinedBarChart' // NEW IMPORT
import { DashboardData, DashboardMetric } from '../../types/dashboard.type'

// Initial state for metrics
const initialMetric: DashboardMetric = { currentValue: 0, previousValue: 0, percentageChange: 0, trend: 0 }
const initialDashboardData: DashboardData = {
  totalProducts: initialMetric,
  totalOrders: initialMetric,
  totalRevenue: initialMetric
}

export default function Dashboard() {
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1) // 1-indexed

  const [userMetric, setUserMetric] = useState<DashboardMetric>(initialMetric)
  const [businessData, setBusinessData] = useState<DashboardData>(initialDashboardData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Hàm fetch data chính, phụ thuộc vào tháng/năm đã chọn
  const fetchData = useCallback(async (year: number, month: number) => {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch User Metrics và Business Metrics cho thời gian đã chọn
      const [userResponse, businessResponse] = await Promise.all([
        dashboardApi.getDashboardUsers(year, month),
        dashboardApi.getDashboardBusiness(year, month)
      ])

      setUserMetric(userResponse.data.data)
      setBusinessData(businessResponse.data.data)
    } catch (e: any) {
      console.error('Lỗi khi tải dữ liệu Dashboard:', e)
      setError(e.message || `Lỗi khi tải dữ liệu cho ${month}/${year}. Vui lòng thử lại.`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(selectedYear, selectedMonth)
  }, [fetchData, selectedYear, selectedMonth]) // Chạy lại khi tháng/năm thay đổi

  // Chuyển đổi dữ liệu Business Metric thành định dạng cho biểu đồ cột
  const combinedChartData = useMemo(() => {
    return [
      {
        name: 'Total Products',
        value: businessData.totalProducts.currentValue,
        color: '#8884d8', // Tím
        isCurrency: false
      },
      {
        name: 'Total Orders',
        value: businessData.totalOrders.currentValue,
        color: '#82ca9d', // Xanh lá
        isCurrency: false
      },
      {
        name: 'Total Revenue',
        value: businessData.totalRevenue.currentValue,
        color: '#ffc658', // Vàng
        isCurrency: true
      }
    ]
  }, [businessData])

  // Handlers và Options cho selectors
  const handleTimeChange = (type: 'year' | 'month', value: number) => {
    if (type === 'year') {
      setSelectedYear(value)
    } else {
      setSelectedMonth(value)
    }
  }
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i) // 5 năm gần nhất
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1) // 1 đến 12

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className='p-8 text-center text-lg text-blue-500'>
          <div className='animate-spin inline-block w-8 h-8 border-4 border-t-4 border-blue-500 border-gray-200 rounded-full'></div>
          <p className='mt-2'>Đang tải dữ liệu Dashboard...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className='p-4 mb-6 text-sm text-red-800 rounded-lg bg-red-100 dark:bg-red-900/20 dark:text-red-400'>
          Lỗi: {error}
        </div>
      )
    }

    return (
      <>
        {/* TIME SELECTORS */}
        <div className='flex flex-wrap items-center gap-6 mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700'>
          <div className='flex items-center gap-2'>
            <Calendar className='w-5 h-5 text-gray-500 dark:text-gray-400' />
            <span className='text-sm font-semibold text-gray-700 dark:text-gray-300'>Chọn Thời Gian:</span>
          </div>

          <div className='flex items-center gap-2'>
            <label htmlFor='month-select' className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              Tháng:
            </label>
            <select
              id='month-select'
              value={selectedMonth}
              onChange={(e) => handleTimeChange('month', parseInt(e.target.value))}
              className='rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            >
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
          </div>

          <div className='flex items-center gap-2'>
            <label htmlFor='year-select' className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              Năm:
            </label>
            <select
              id='year-select'
              value={selectedYear}
              onChange={(e) => handleTimeChange('year', parseInt(e.target.value))}
              className='rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* METRIC CARDS GRID */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
          <MetricCard title='Total Users' metric={userMetric} icon={<Users className='w-5 h-5' />} />
          <MetricCard
            title='Total Products'
            metric={businessData.totalProducts}
            icon={<Package className='w-5 h-5' />}
          />
          <MetricCard
            title='Total Orders'
            metric={businessData.totalOrders}
            icon={<ShoppingBag className='w-5 h-5' />}
          />
          <MetricCard
            title='Total Revenue'
            metric={businessData.totalRevenue}
            icon={<DollarSign className='w-5 h-5' />}
            isCurrency={true}
          />
        </div>

        {/* CHART SECTION: Combined Bar Chart */}
        <div className='mt-8'>
          <CombinedBarChart data={combinedChartData} selectedMonth={selectedMonth} selectedYear={selectedYear} />
        </div>
      </>
    )
  }

  return (
    <>
      <PageMeta title='Dashboard' description='Overview of system metrics and analytics' />
      <div className='p-6'>
        <PageBreadcrumb pageTitle='Dashboard' />
        <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-6'>Analytics Dashboard</h2>
        {renderContent()}
      </div>
    </>
  )
}
