/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, Clock, Search, Truck, XCircle } from 'lucide-react'
import React, { ReactNode, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { orderApi } from '../../../api/order.api'
import { useAppContext } from '../../../context/AuthContext'
import { OrderResponse, OrderStatus, OrderUserAddress } from '../../../types/order.type'
import { formatDateToDDMMYYYY, formatVND } from '../../../utils/validForm'
import { OrderDetailModal } from '../../order/OrderDetailModal'
import Pagination from '../../pagination/Pagination'
import { calculateOrderMetrics } from '../../../utils/oder.utils'

const ITEMS_PER_PAGE = 10

const Badge = ({ color, children }: any) => {
  let colorClasses = ''
  switch (color) {
    case 'success':
      colorClasses = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      break
    case 'warning':
      colorClasses = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      break
    case 'error':
      colorClasses = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      break
    case 'info':
      colorClasses = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      break
    default:
      colorClasses = 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300'
  }
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClasses}`}
    >
      {children}
    </span>
  )
}

interface TableProps {
  children: ReactNode
}
interface TableHeaderProps extends TableProps {
  className?: string
}
interface TableCellProps extends TableProps {
  isHeader?: boolean
  colSpan?: number
  className?: string
}

const Table: React.FC<TableProps> = ({ children }) => (
  <table className='w-full table-auto border-collapse'>{children}</table>
)
const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => (
  <thead className={`${className ?? ''} text-left`}>{children}</thead>
)
const TableBody: React.FC<TableHeaderProps> = ({ children, className }) => (
  <tbody className={`${className ?? ''} text-left divide-y divide-gray-100 dark:divide-white/[0.05]`}>{children}</tbody>
)
const TableRow: React.FC<TableProps> = ({ children }) => (
  <tr className='hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-white/[0.05] last:border-b-0'>
    {children}
  </tr>
)

const TableCell: React.FC<TableCellProps> = ({ children, isHeader, colSpan, className }) => {
  const baseClasses = 'p-4 text-sm align-middle'
  const headerClasses = isHeader
    ? 'font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400'
    : 'text-gray-700 dark:text-gray-300'
  const Tag = isHeader ? 'th' : 'td'
  return (
    <Tag colSpan={colSpan} className={`${baseClasses} ${headerClasses} ${className || ''}`}>
      {children}
    </Tag>
  )
}

// ====================================================================
// --- UTILITY FUNCTIONS ---
// ====================================================================

const getStatusDisplay = (status: OrderStatus) => {
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

export default function BasicTableOrder() {
  const { profile } = useAppContext()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // State for Detail Modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<OrderResponse | null>(null)

  // Fetch Order Data
  const {
    data: ordersResponse,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      try {
        const res = await orderApi.getOrders()
        return res.data.data as OrderResponse[]
      } catch (error) {
        toast.error('Failed to fetch orders.')
        return []
      }
    },
    staleTime: 1000 * 60
  })

  const allOrders: OrderResponse[] = ordersResponse || []

  const orderMetrics = useMemo(() => calculateOrderMetrics(allOrders), [allOrders])
  const handleViewDetails = (order: OrderResponse) => {
    setSelectedOrderForDetail(order)
    setIsDetailModalOpen(true)
  }

  // Filter + Pagination
  const filteredAndPaginatedData = useMemo(() => {
    let filtered = allOrders

    if (filterStatus !== 'all') {
      filtered = filtered.filter((order) => order.status === filterStatus)
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(lower) ||
          order.user.userName.toLowerCase().includes(lower) ||
          order.user.emailAddress.toLowerCase().includes(lower)
      )
    }

    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE

    return {
      totalItems: filtered.length,
      data: filtered.slice(start, end)
    }
  }, [allOrders, filterStatus, searchTerm, currentPage])

  const totalPages = Math.ceil(filteredAndPaginatedData.totalItems / ITEMS_PER_PAGE)

  if (isLoading)
    return (
      <div className='p-6 text-center text-lg text-blue-500'>
        <div className='animate-spin inline-block w-8 h-8 border-4 border-t-4 border-blue-500 border-gray-200 rounded-full'></div>
        Loading orders...
      </div>
    )

  if (isError) return <div className='p-6 text-center text-lg text-red-500'>Failed to load orders.</div>

  const getShortAddress = (addresses: OrderUserAddress[]): string => {
    if (!addresses || addresses.length === 0) return 'N/A'
    const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0]
    return `${defaultAddress.streetNumber}, ${defaultAddress.city}`
  }

  return (
    <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-white/[0.05] dark:bg-gray-800/80 backdrop-blur-sm'>
      <div className='p-5 border-b border-gray-100 dark:border-white/[0.05]'>
        <h3 className='text-xl font-bold text-gray-800 dark:text-white mb-1'>Order Management</h3>

        {/* Search + Filter */}
        <div className='flex items-center gap-3 mt-4'>
          <div className='relative flex-grow max-w-sm'>
            <input
              type='text'
              placeholder='Search by Order ID, Customer Name, or Email...'
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className='w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            />
            <Search className='w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2' />
          </div>

          <select
            className='w-[200px] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none'
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as OrderStatus | 'all')
              setCurrentPage(1)
            }}
          >
            <option value='all'>All Statuses</option>
            {Object.values(OrderStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className='max-w-full overflow-x-auto'>
        <div className='px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-end'>
          <span className='text-sm font-semibold text-indigo-700 dark:text-indigo-400'>
            Total Customer Order : **{filteredAndPaginatedData.totalItems}**
          </span>
        </div>
        <Table>
          <TableHeader className='border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.05]'>
            <TableRow>
              {/* <TableCell isHeader className='w-2/12'>
                Order ID
              </TableCell> */}
              <TableCell isHeader className='w-3/12'>
                Customer
              </TableCell>
              <TableCell isHeader className='w-2/12'>
                Status
              </TableCell>
              <TableCell isHeader className='w-1/12'>
                Total
              </TableCell>
              <TableCell isHeader className='w-2/12'>
                Created Date
              </TableCell>
              <TableCell isHeader className='w-2/12 text-end pr-6'>
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredAndPaginatedData.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='py-4 text-center text-gray-500'>
                  {searchTerm || filterStatus !== 'all' ? 'No matching orders found.' : 'No orders yet.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndPaginatedData.data.map((order) => {
                const statusDisplay = getStatusDisplay(order.status)
                const primaryAddress = order.user.addresses[0]

                return (
                  <TableRow key={order.id}>
                    {/* <TableCell className='text-gray-800 dark:text-white font-semibold truncate max-w-[150px]'>
                      {order.id}
                    </TableCell> */}

                    <TableCell className='py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700'>
                          <img
                            width={40}
                            height={40}
                            src={order.user.avatarUrl || 'https://placehold.co/40x40/EAB308/FFFFFF?text=U'}
                            alt={order.user.userName}
                            className='object-cover w-full h-full'
                          />
                        </div>
                        <div>
                          <span className='block font-medium text-gray-800 dark:text-white/90'>
                            {order.user.userName}
                          </span>
                          <span className='block text-gray-500 text-xs dark:text-gray-400'>
                            {order.user.emailAddress}
                          </span>
                          <span className='block text-gray-500 text-xs dark:text-gray-400'>
                            {primaryAddress ? getShortAddress(order.user.addresses) : 'No Address'}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge color={statusDisplay.color}>
                        <statusDisplay.icon className='w-3 h-3 mr-1' />
                        {statusDisplay.label}
                      </Badge>
                    </TableCell>

                    <TableCell className='text-gray-800 dark:text-white font-semibold'>
                      {formatVND(order.orderTotal)} VNĐ
                    </TableCell>

                    <TableCell className='text-gray-600 dark:text-gray-300'>
                      {formatDateToDDMMYYYY(order.createdTime)}
                    </TableCell>

                    <TableCell className='text-end pr-6'>
                      <button
                        onClick={() => handleViewDetails(order)}
                        className='text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 text-sm p-1 font-medium'
                      >
                        View Details
                      </button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {filteredAndPaginatedData.totalItems > ITEMS_PER_PAGE && (
        <div className='p-4 border-t border-gray-100 dark:border-white/[0.05] flex justify-center'>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        order={selectedOrderForDetail}
      />
    </div>
  )
}
