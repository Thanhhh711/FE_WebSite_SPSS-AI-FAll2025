// src/components/order/OrderSummaryMetrics.tsx
import { CheckCircle, Clock, DollarSign, ShoppingCart } from 'lucide-react'
import React from 'react'

import { OrderStatus } from '../../types/order.type'
import { formatVND } from '../../utils/validForm'

// Assuming OrderMetrics is defined in types/order.ts or passed in
interface OrderMetrics {
  totalValue: number
  statusCounts: Record<OrderStatus, number>
  totalOrders: number
}

interface OrderSummaryMetricsProps {
  metrics: OrderMetrics
}

const OrderSummaryMetrics: React.FC<OrderSummaryMetricsProps> = ({ metrics }) => {
  const pendingStatus = OrderStatus.Pending
  const completedStatus = OrderStatus.Completed

  const metricItems = [
    {
      title: 'Total Order Value',
      value: formatVND(metrics.totalValue), // Use VND format
      icon: DollarSign,
      color: 'text-green-500',
      bg: 'bg-green-50'
    },
    {
      title: pendingStatus,
      value: metrics.statusCounts[pendingStatus],
      icon: Clock,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50'
    },
    {
      title: completedStatus,
      value: metrics.statusCounts[completedStatus],
      icon: CheckCircle,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50'
    },
    {
      title: 'Total Orders',
      value: metrics.totalOrders,
      icon: ShoppingCart,
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    }
  ]

  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 mb-6'>
      {metricItems.map((item, index) => (
        <div
          key={index}
          className={`flex items-center p-4 rounded-xl shadow-sm border border-gray-200 dark:border-white/[0.05] ${item.bg} dark:bg-gray-800/80`}
        >
          <div className={`p-3 rounded-full ${item.bg} dark:bg-gray-700/50 ${item.color}`}>
            <item.icon className='w-5 h-5' />
          </div>
          <div className='ml-4'>
            <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>{item.title}</p>
            <p className='text-xl font-bold text-gray-900 dark:text-white'>{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default OrderSummaryMetrics
