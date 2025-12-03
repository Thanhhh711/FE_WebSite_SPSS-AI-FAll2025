// components/dashboard/MetricCard.tsx

import React from 'react'
import { DashboardMetric } from '../../types/dashboard.type'

interface MetricCardProps {
  title: string
  metric: DashboardMetric
  icon: React.ReactNode
  isCurrency?: boolean
}

const MetricCard: React.FC<MetricCardProps> = ({ title, metric, icon, isCurrency = false }) => {
  const { currentValue, previousValue, percentageChange, trend } = metric

  const formatValue = (value: number) => {
    if (isCurrency) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
    }
    return new Intl.NumberFormat('vi-VN').format(value)
  }

  const isPositive = trend > 0
  const trendColor = trend === 0 ? 'text-gray-500' : isPositive ? 'text-green-500' : 'text-red-500'
  const trendIcon = trend === 0 ? '→' : isPositive ? '↑' : '↓'

  return (
    <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg dark:border-gray-800 dark:bg-white/[0.03]'>
      <div className='flex items-center justify-between'>
        {/* Title and Icon */}
        <h3 className='text-md font-medium text-gray-500 dark:text-gray-400'>{title}</h3>
        <div className='text-2xl text-indigo-500 dark:text-indigo-400'>{icon}</div>
      </div>

      {/* Current Value */}
      <div className='mt-1'>
        <p className='text-3xl font-bold text-gray-900 dark:text-white'>{formatValue(currentValue)}</p>
      </div>

      {/* Comparison and Trend */}
      <div className='mt-3 flex items-center justify-between'>
        <span className={`flex items-center text-sm font-semibold ${trendColor}`}>
          <span className='mr-1'>{trendIcon}</span>
          {Math.abs(percentageChange).toFixed(2)}%
        </span>
        <p className='text-sm text-gray-500 dark:text-gray-400'>vs. {formatValue(previousValue)} last period</p>
      </div>
    </div>
  )
}

export default MetricCard
