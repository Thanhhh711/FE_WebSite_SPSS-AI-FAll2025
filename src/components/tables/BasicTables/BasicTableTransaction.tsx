import { useEffect, useMemo, useState } from 'react'

import { transactionApi } from '../../../api/transaction.api'
import { Transaction } from '../../../types/transaction.type'
import Pagination from '../../pagination/Pagination'

const ITEMS_PER_PAGE = 5

export default function BasicTableTransaction() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await transactionApi.getTransaction()
        setTransactions(response.data.data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Logic: Filter -> Calculate Total -> Paginate
  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const matchesSearch =
        item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.orderCode.toString().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'All' || item.status === statusFilter

      const matchesDate = !dateFilter || item.createdTime.startsWith(dateFilter)

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [transactions, searchTerm, statusFilter, dateFilter])

  // Tính tổng tiền dựa trên danh sách đã lọc
  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce((sum, item) => sum + item.amount, 0)
  }, [filteredTransactions])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredTransactions.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredTransactions, currentPage])

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)

  const getStatusClass = (status: string) => {
    const base = 'px-2.5 py-1 rounded-md text-[11px] font-bold border '
    if (status === 'Approved')
      return (
        base +
        'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20'
      )
    if (status === 'Pending')
      return (
        base +
        'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20'
      )
    if (status === 'Rejected')
      return base + 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
    return base + 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
  }

  if (loading) return <div className='p-20 text-center dark:text-white dark:bg-gray-900'>Loading...</div>

  return (
    <div className='w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm transition-all overflow-hidden'>
      {/* Search & Filter Header */}
      <div className='p-5 space-y-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h2 className='text-lg font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight'>
              Transactions
            </h2>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Total Filtered: <span className='font-bold text-blue-600'>{filteredTransactions.length}</span>
            </p>
          </div>

          {/* Total Amount Box */}
          <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-4 py-2 rounded-lg text-right'>
            <p className='text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold'>Total Sum</p>
            <p className='text-lg font-black text-blue-700 dark:text-blue-300'>
              {totalAmount.toLocaleString('vi-VN')} <span className='text-sm'>₫</span>
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          <input
            type='text'
            placeholder='Search by Code, Name...'
            className='px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none'
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
          <select
            className='px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none'
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value='All'>All Statuses</option>
            <option value='Approved'>Approved</option>
            <option value='Pending'>Pending</option>
            <option value='Rejected'>Rejected</option>
          </select>
          <input
            type='date'
            className='px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white outline-none'
            onChange={(e) => {
              setDateFilter(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
      </div>

      {/* Table Area */}
      <div className='overflow-x-auto'>
        <table className='w-full text-left'>
          <thead>
            <tr className='bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-[11px] uppercase tracking-widest font-bold'>
              <th className='px-6 py-4'>Transaction Info</th>
              <th className='px-6 py-4'>Amount</th>
              <th className='px-6 py-4 text-center'>Status</th>
              <th className='px-6 py-4 text-right'>Created Date</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
            {paginatedData.map((item) => (
              <tr key={item.id} className='hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors group'>
                <td className='px-6 py-4'>
                  <div className='flex flex-col leading-tight'>
                    <span className='text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:underline cursor-pointer'>
                      #{item.orderCode}
                    </span>
                    <span className='text-xs text-gray-700 dark:text-gray-300 font-semibold mt-1'>{item.userName}</span>
                    <span className='text-[10px] text-gray-400 mt-0.5 truncate max-w-[150px]'>{item.description}</span>
                  </div>
                </td>
                <td className='px-6 py-4'>
                  <span className='text-sm font-black text-gray-900 dark:text-white italic'>
                    {item.amount.toLocaleString('vi-VN')}{' '}
                    <span className='text-[10px] font-normal not-italic opacity-70'>₫</span>
                  </span>
                </td>
                <td className='px-6 py-4 text-center'>
                  <span className={getStatusClass(item.status)}>{item.status.toUpperCase()}</span>
                </td>
                <td className='px-6 py-4 text-right text-[12px] text-gray-500 dark:text-gray-400 tabular-nums font-medium'>
                  {new Date(item.createdTime).toLocaleDateString('en-GB')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with Pagination */}
      <div className='px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900 flex justify-center'>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  )
}
