/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Calendar, Edit3, Eye, Percent, Plus, Search, Tag, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import vouchersApi from '../../../api/voucher.api'
import { Voucher, VoucherForm, VoucherStatusEnum } from '../../../types/vourcher.type'
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import Pagination from '../../pagination/Pagination'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'
import VoucherModal from '../../VoucherModal/VoucherModal'

const ITEMS_PER_PAGE = 10

const getVoucherStatusInfo = (status: VoucherStatusEnum) => {
  switch (status) {
    case VoucherStatusEnum.Active:
      return { text: 'Active', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' }
    case VoucherStatusEnum.Expired:
      return { text: 'Expired', color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' }
    case VoucherStatusEnum.Scheduled:
      return { text: 'Scheduled', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' }
    default:
      return { text: 'Unknown', color: 'bg-slate-100 text-slate-500' }
  }
}

export default function BasicTableVouchers() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)

  const { data: vouchersResponse, isLoading } = useQuery({
    queryKey: ['vouchers'],
    queryFn: vouchersApi.getVouchers,
    staleTime: 1000 * 60 * 5
  })

  const allVouchers = vouchersResponse?.data.data || []
  const filteredData = useMemo(() => {
    const filtered = allVouchers.filter((v: Voucher) => v.code.toLowerCase().includes(searchTerm.toLowerCase()))
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return { total: filtered.length, data: filtered.slice(start, start + ITEMS_PER_PAGE) }
  }, [allVouchers, searchTerm, currentPage])

  const { mutate: saveVoucher } = useMutation({
    mutationFn: (data: VoucherForm & { id?: string }) =>
      data.id ? vouchersApi.updateVoucher(data.id, data) : vouchersApi.createVoucher(data),
    onSuccess: () => {
      toast.success('Saved!')
      queryClient.invalidateQueries({ queryKey: ['vouchers'] })
      setIsVoucherModalOpen(false)
    }
  })

  const { mutate: deleteVoucher } = useMutation({
    mutationFn: (id: string) => vouchersApi.deleteVoucher(id),
    onSuccess: () => {
      toast.success('Deleted!')
      queryClient.invalidateQueries({ queryKey: ['vouchers'] })
      setIsConfirmOpen(false)
    }
  })

  const handleConfirmDelete = () => {
    if (selectedVoucher) deleteVoucher(selectedVoucher.id)
  }

  if (isLoading)
    return <div className='p-20 text-center font-black text-rose-500 animate-pulse'>LOADING VOUCHERS...</div>

  return (
    <div className='p-6 space-y-6 bg-transparent min-h-screen'>
      {/* Header Section */}
      <div className='flex flex-col md:flex-row justify-between items-center gap-6 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-gray-800 transition-all'>
        <div className='flex items-center gap-5'>
          {/* <div className='w-14 h-14 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center text-rose-600 shadow-sm'>
            <Ticket size={28} />
          </div> */}
          <div>
            <h1 className='text-2xl font-black text-slate-800 dark:text-white tracking-tight'>Vouchers</h1>
            <p className='text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1'>
              Inventory: {filteredData.total} Active Codes
            </p>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='relative group'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
            <input
              type='text'
              placeholder='Search code...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-gray-800  dark:text-white border-none rounded-2xl text-sm font-bold w-full sm:w-64 focus:ring-2 ring-rose-500/20'
            />
          </div>
          <button
            onClick={() => {
              setSelectedVoucher(null)
              setIsViewMode(false)
              setIsVoucherModalOpen(true)
            }}
            className='bg-slate-900 dark:bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-xl'
          >
            <Plus size={18} /> New Voucher
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className='bg-white dark:bg-gray-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-gray-800 overflow-hidden'>
        <Table>
          <TableHeader className='bg-slate-50/50 dark:bg-gray-800/50'>
            <TableRow className='border-none'>
              <TableCell
                isHeader
                className='px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'
              >
                Voucher Code
              </TableCell>
              <TableCell
                isHeader
                className='px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'
              >
                Discount
              </TableCell>
              <TableCell
                isHeader
                className='px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'
              >
                Validity
              </TableCell>
              <TableCell
                isHeader
                className='px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className='px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right'
              >
                Action
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.data.map((voucher) => {
              const status = getVoucherStatusInfo(voucher.status)
              return (
                <TableRow
                  key={voucher.id}
                  className='hover:bg-rose-50/20 dark:hover:bg-rose-900/10 transition-all border-b border-slate-50 dark:border-gray-800 last:border-0'
                >
                  <TableCell className='px-8 py-7'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-rose-500'>
                        <Tag size={18} />
                      </div>
                      <span className='font-black text-slate-800 dark:text-white text-base'>{voucher.code}</span>
                    </div>
                  </TableCell>
                  <TableCell className='px-6 py-7'>
                    <div className='flex items-center gap-1.5 font-black text-slate-700 dark:text-slate-300'>
                      <Percent size={14} className='text-rose-500' /> {voucher.discountRate}%
                    </div>
                  </TableCell>
                  <TableCell className='px-6 py-7'>
                    <div className='text-[11px] font-bold text-slate-400 flex items-center gap-1.5'>
                      <Calendar size={12} /> {new Date(voucher.startDate).toLocaleDateString()} -{' '}
                      {new Date(voucher.endDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className='px-6 py-7'>
                    <span
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${status.color}`}
                    >
                      {status.text}
                    </span>
                  </TableCell>
                  <TableCell className='px-8 py-7 text-right'>
                    <div className='flex justify-end gap-2'>
                      <button
                        onClick={() => {
                          setSelectedVoucher(voucher)
                          setIsViewMode(true)
                          setIsVoucherModalOpen(true)
                        }}
                        className='p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-2xl transition-all'
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedVoucher(voucher)
                          setIsViewMode(false)
                          setIsVoucherModalOpen(true)
                        }}
                        className='p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-2xl transition-all'
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedVoucher(voucher)
                          setIsConfirmOpen(true)
                        }}
                        className='p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-800 rounded-2xl transition-all'
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <div className='p-10 flex justify-center border-t border-slate-50 dark:border-gray-800'>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredData.total / ITEMS_PER_PAGE)}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      {isVoucherModalOpen && (
        <VoucherModal
          isOpen={isVoucherModalOpen}
          onClose={() => setIsVoucherModalOpen(false)}
          voucher={selectedVoucher}
          onSave={saveVoucher}
          isViewMode={isViewMode}
        />
      )}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Delete Voucher'
        message='Are you sure?'
      />
    </div>
  )
}
