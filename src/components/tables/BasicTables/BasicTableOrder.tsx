/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query'
import { Search, ShoppingBag, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { orderApi } from '../../../api/order.api'
import { OrderResponse, OrderStatus } from '../../../types/order.type'
import { formatDateToDDMMYYYY, formatVND } from '../../../utils/validForm'
import { OrderDetailModal } from '../../order/OrderDetailModal'
import Pagination from '../../pagination/Pagination'
import { AvatarStaff } from '../../../utils/StaffEmailLookup'

const ITEMS_PER_PAGE = 10

// --- Order Stat Component ---
const OrderStat = ({ title, count, icon, color }: any) => (
  <div className='bg-white dark:bg-gray-800/40 p-5 rounded-[1.5rem] border border-gray-100 dark:border-white/[0.05] flex items-center gap-4 shadow-sm'>
    <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
    <div>
      <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>{title}</p>
      <p className='text-xl font-black text-gray-900 dark:text-white'>{count}</p>
    </div>
  </div>
)

const getOrderStatusStyles = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Completed:
    case OrderStatus.Confirmed:
      return 'bg-emerald-100 text-emerald-700 border-emerald-200' // Thành công
    case OrderStatus.Pending:
      return 'bg-amber-100 text-amber-700 border-amber-200' // Chờ xử lý
    case OrderStatus.Processing:
      return 'bg-blue-100 text-blue-700 border-blue-200' // Đang giao
    case OrderStatus.Cancelled:
    case OrderStatus.Refunded:
      return 'bg-rose-100 text-rose-700 border-rose-200' // Hủy/Hoàn tiền
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

export default function BasicTableOrder() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderApi.getOrders().then((res) => res.data.data as OrderResponse[])
  })

  // Order Stats Logic
  const orderStats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((o) => o.status === OrderStatus.Pending).length,
      completed: orders.filter((o) => o.status === OrderStatus.Completed).length,
      cancelled: orders.filter((o) => o.status === OrderStatus.Cancelled).length
    }),
    [orders]
  )

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [orders, searchTerm, filterStatus])

  const paginatedData = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <div className='space-y-6 max-w-[1600px] mx-auto p-2'>
      {/* ORDER STATS BAR */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <OrderStat
          title='Total Orders'
          count={orderStats.total}
          color='bg-blue-50 text-blue-600'
          icon={<ShoppingBag size={20} />}
        />
        <OrderStat
          title='Pending'
          count={orderStats.pending}
          color='bg-amber-50 text-amber-600'
          icon={<Clock size={20} />}
        />
        <OrderStat
          title='Success'
          count={orderStats.completed}
          color='bg-emerald-50 text-emerald-600'
          icon={<CheckCircle size={20} />}
        />
        <OrderStat
          title='Cancelled'
          count={orderStats.cancelled}
          color='bg-rose-50 text-rose-600'
          icon={<XCircle size={20} />}
        />
      </div>

      {/* FILTER BAR */}
      <div className='flex flex-col md:flex-row gap-4 justify-between'>
        <div className='relative flex-grow max-w-md group'>
          <input
            type='text'
            placeholder='Search by ID or Customer...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-sm'
          />
          <Search className='absolute left-4 top-3.5 text-gray-400 group-focus-within:text-brand-500' size={18} />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className='px-4 py-3 rounded-2xl border border-gray-100 dark:bg-gray-900 dark:border-gray-800 outline-none font-bold text-xs uppercase tracking-widest text-gray-500 shadow-sm'
        >
          <option value='all'>All Statuses</option>
          {Object.values(OrderStatus).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className='bg-white dark:bg-white/[0.03] rounded-[2rem] border border-gray-100 dark:border-white/[0.05] overflow-hidden shadow-sm'>
        <table className='w-full text-left border-collapse'>
          <thead className='bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.05]'>
            <tr>
              <th className='py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest'>Customer</th>
              <th className='py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest'>Status</th>
              <th className='py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest'>Amount</th>
              <th className='py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right'>
                Action
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-50'>
            {paginatedData.map((order) => (
              <tr key={order.id} className='group hover:bg-gray-50/50 transition-colors'>
                <td className='py-5 px-8'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-brand-600 text-xs'>
                      <AvatarStaff staffId={order.userId as string} />
                    </div>
                    <div>
                      <p className='font-black text-gray-900 dark:text-white leading-tight'>{order.user.userName}</p>
                      <p className='text-[10px] text-gray-400 font-bold uppercase'>
                        {formatDateToDDMMYYYY(order.createdTime)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className='py-5 px-8'>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${getOrderStatusStyles(order.status)}`}
                  >
                    <span className='w-1.5 h-1.5 rounded-full bg-current' /> {/* Chấm tròn nhỏ cho đẹp */}
                    {order.status}
                  </span>
                </td>
                <td className='py-5 px-8 font-black text-gray-900 dark:text-white'>{formatVND(order.orderTotal)}</td>
                <td className='py-5 px-8 text-right'>
                  <button
                    onClick={() => {
                      setSelectedOrder(order)
                      setIsModalOpen(true)
                    }}
                    className='px-4 py-2 text-[10px] font-black text-brand-600 hover:bg-brand-50 rounded-xl uppercase tracking-widest transition-all'
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className='p-6 border-t border-gray-50 flex justify-center'>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <OrderDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} order={selectedOrder} />
    </div>
  )
}
