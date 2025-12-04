// src/utils/order.utils.ts
import { CheckCircle, Clock, Truck, XCircle, LucideIcon } from 'lucide-react'
import { OrderResponse, OrderStatus, OrderUserAddress } from '../types/order.type'

// import { formatDateToDDMMYYYY } from './validForm' // Assuming this utility exists

// Function to get color and icon for the status Badge
export const getStatusDisplay = (
  status: OrderStatus
): { label: OrderStatus; color: 'success' | 'warning' | 'error' | 'info' | 'default'; icon: LucideIcon } => {
  switch (status) {
    case OrderStatus.Confirmed:
    case OrderStatus.Completed:
      return { label: status, color: 'success', icon: CheckCircle }
    case OrderStatus.Pending:
      return { label: status, color: 'warning', icon: Clock }
    case OrderStatus.Processing:
      return { label: status, color: 'info', icon: Truck }
    case OrderStatus.Cancelled:
    case OrderStatus.Refunded:
      return { label: status, color: 'error', icon: XCircle }
    default:
      return { label: status, color: 'default', icon: Clock }
  }
}

// Helper to format currency
export const formatCurrency = (amount: number): string => {
  // Assuming USD format based on previous output
  return `$${amount.toFixed(2)}`
}

// Get Short Address for Table Row
export const getShortAddress = (addresses: OrderUserAddress[]): string => {
  if (!addresses || addresses.length === 0) return 'N/A'
  const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0]
  return `${defaultAddress.streetNumber}, ${defaultAddress.city}`
}

// Get Full Address for Modal
export const getFullAddress = (addresses: OrderUserAddress[]): string => {
  if (!addresses || addresses.length === 0) return 'N/A'
  const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0]
  return [
    defaultAddress.streetNumber,
    defaultAddress.addressLine1,
    defaultAddress.ward,
    defaultAddress.city,
    defaultAddress.province,
    defaultAddress.countryName
  ]
    .filter(Boolean)
    .join(', ')
}

// Function to calculate key order metrics
export const calculateOrderMetrics = (orders: OrderResponse[]) => {
  const metrics = {
    // Note: Assuming orderTotal is the value we track. Using "Total Value" instead of "Profit".
    totalValue: 0,
    statusCounts: {
      [OrderStatus.Pending]: 0,
      [OrderStatus.Processing]: 0,
      [OrderStatus.Confirmed]: 0,
      [OrderStatus.Completed]: 0,
      [OrderStatus.Cancelled]: 0,
      [OrderStatus.Refunded]: 0
    },
    totalOrders: orders.length
  } as {
    totalValue: number
    statusCounts: Record<OrderStatus, number>
    totalOrders: number
  }

  orders.forEach((order) => {
    metrics.totalValue += order.orderTotal
    metrics.statusCounts[order.status]++
  })

  return metrics
}
