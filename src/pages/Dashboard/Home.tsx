// pages/Dashboard.tsx

import { useEffect, useState } from 'react'

// Simple icons for illustration
import { DollarSign, Package, ShoppingBag, Users } from 'lucide-react'
import dashboardApi from '../../api/dashboard.api'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import PageMeta from '../../components/common/PageMeta'
import MetricCard from '../../components/dashboard/MetricCard'
import { DashboardData, DashboardMetric } from '../../types/dashboard.type'

// Initial state for metrics (to avoid undefined errors on first render)
const initialMetric: DashboardMetric = {
  currentValue: 0,
  previousValue: 0,
  percentageChange: 0,
  trend: 0
}

const initialDashboardData: DashboardData = {
  totalProducts: initialMetric,
  totalOrders: initialMetric,
  totalRevenue: initialMetric
}

export default function Dashboard() {
  const [userMetric, setUserMetric] = useState<DashboardMetric>(initialMetric)
  const [businessData, setBusinessData] = useState<DashboardData>(initialDashboardData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Fetch User Metrics
        const userResponse = await dashboardApi.getdashboardUsers()
        setUserMetric(userResponse.data.data)

        // Fetch Business Metrics
        const businessResponse = await dashboardApi.getdashboardBusiness()
        setBusinessData(businessResponse.data.data)
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError('Failed to load dashboard data. Please check your API connection.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <>
      <PageMeta
        title='Dashboard Overview | Next.js Admin Dashboard'
        description='Overview of user and business performance.'
      />
      <PageBreadcrumb pageTitle='Overview' />

      <div className='min-h-screen'>
        <h1 className='mb-6 text-3xl font-bold text-gray-900 dark:text-white'>Dashboard Overview</h1>

        {isLoading && (
          <div className='p-8 text-center dark:text-gray-300'>
            <p>Loading data...</p>
          </div>
        )}

        {error && (
          <div className='p-4 mb-6 text-sm text-red-800 rounded-lg bg-red-100 dark:bg-red-900/20 dark:text-red-400'>
            {error}
          </div>
        )}

        {/* METRIC CARDS GRID */}
        {!isLoading && !error && (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
            {/* 1. Total Users */}
            <MetricCard title='Total Users' metric={userMetric} icon={<Users />} />

            {/* 2. Total Products */}
            <MetricCard title='Total Products' metric={businessData.totalProducts} icon={<Package />} />

            {/* 3. Total Orders */}
            <MetricCard title='Total Orders' metric={businessData.totalOrders} icon={<ShoppingBag />} />

            {/* 4. Total Revenue */}
            <MetricCard
              title='Total Revenue'
              metric={businessData.totalRevenue}
              icon={<DollarSign />}
              isCurrency={true} // Use currency formatting
            />
          </div>
        )}

        {/* Additional charts or detailed tables can be added here */}
        <div className='mt-8'>
          <div className='h-96 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]'>
            <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>Monthly Revenue Chart (Placeholder)</h3>
            {/* Placeholder area for chart component */}
          </div>
        </div>
      </div>
    </>
  )
}
