/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useMemo, useState } from 'react'

import vouchersApi from '../../../api/voucher.api'
import { toast } from 'react-toastify'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'
import Pagination from '../../pagination/Pagination'

import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import VoucherModal from '../../VoucherModal/VoucherModal'
import { Voucher, VoucherForm, VoucherStatusEnum } from '../../../types/vourcher.type'

const ITEMS_PER_PAGE = 10

const getVoucherStatusInfo = (status: VoucherStatusEnum) => {
  switch (status) {
    case VoucherStatusEnum.Active:
      return { text: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' }
    case VoucherStatusEnum.Expired:
      return { text: 'Expired', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
    case VoucherStatusEnum.Scheduled:
      return { text: 'Scheduled', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' }
    case VoucherStatusEnum.Inactive:
    default:
      return { text: 'Inactive', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }
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

  // --- API READ (R) ---
  const {
    data: vouchersResponse,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['vouchers'],
    queryFn: vouchersApi.getVouchers,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

  const allVouchers = vouchersResponse?.data.data || []

  const filteredAndPaginatedVouchers = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase()
    const filtered = allVouchers.filter(
      (voucher: Voucher) =>
        voucher.code.toLowerCase().includes(lowercasedSearchTerm) ||
        voucher.description.toLowerCase().includes(lowercasedSearchTerm) ||
        getVoucherStatusInfo(voucher.status).text.toLowerCase().includes(lowercasedSearchTerm)
    )

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    return {
      totalItems: filtered.length,
      data: filtered.slice(startIndex, endIndex)
    }
  }, [allVouchers, searchTerm, currentPage])

  const { mutate: saveVoucher } = useMutation({
    mutationFn: (data: VoucherForm & { id?: string; status?: VoucherStatusEnum }) => {
      if (data.id) {
        const { id, status, ...body } = data
        const payload = {
          ...body,
          status,
          startDate: new Date(body.startDate).toISOString(),
          endDate: new Date(body.endDate).toISOString()
        }
        console.log('updateVoucher', payload)
        return vouchersApi.updateVoucher(id, payload)
      }

      const payload = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString()
      }

      return vouchersApi.createVoucher(payload)
    },
    onSuccess: (res) => {
      toast.success(res.data.message || 'Voucher saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['vouchers'] })
      setIsVoucherModalOpen(false)
      setSelectedVoucher(null)
    },
    onError: (error: any) => {
      console.log('error', error)

      toast.error(error.data?.res || 'Error saving voucher.')
    }
  })

  const { mutate: deleteVoucher, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => vouchersApi.deleteVoucher(id),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Voucher deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['vouchers'] })
      refetch()
      setSelectedVoucher(null)
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error deleting voucher.')
    }
  })

  const handleOpenDetailModal = (voucher: Voucher, mode: 'view' | 'edit') => {
    setSelectedVoucher(voucher)
    setIsViewMode(mode === 'view')
    setIsVoucherModalOpen(true)
  }

  const handleCreateNew = () => {
    setSelectedVoucher(null)
    setIsViewMode(false)
    setIsVoucherModalOpen(true)
  }

  const handleDeleteClick = (voucher: Voucher) => {
    setSelectedVoucher(voucher)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedVoucher?.id) {
      deleteVoucher(selectedVoucher.id)
      setIsConfirmOpen(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  if (isLoading) return <div className='p-6 text-center text-lg text-brand-500'>Loading Vouchers...</div>
  if (isError) return <div className='p-6 text-center text-lg text-red-500'>Error loading voucher list.</div>

  return (
    <>
      <div className='flex justify-between items-center mb-5'>
        {/* Search Bar */}
        <input
          type='text'
          placeholder='Search by Code, Description, or Status...'
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className='w-1/3 min-w-[200px] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
        />

        {/* Create New Button */}
        <button
          onClick={handleCreateNew}
          className='btn btn-primary flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-brand-xs hover:bg-brand-600 transition-colors'
        >
          Add New Voucher
        </button>
      </div>

      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-lg'>
        <div className='max-w-full overflow-x-auto'>
          <Table>
            {/* Table Header */}
            <TableHeader className='border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.05]'>
              <TableRow>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Code
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Discount
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Valid Dates
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Usage/Limit
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Status
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-end'>
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredAndPaginatedVouchers.data.length === 0 ? (
                <TableRow>
                  <TableCell className='py-4 text-center text-gray-500'>
                    {searchTerm ? 'No vouchers found.' : 'No vouchers have been registered yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndPaginatedVouchers.data.map((voucher) => {
                  const statusInfo = getVoucherStatusInfo(voucher.status)
                  return (
                    <TableRow key={voucher.id}>
                      <TableCell className='px-5 py-4 font-medium truncate max-w-[150px]'>{voucher.code}</TableCell>
                      <TableCell className='px-4 py-3 text-start font-medium'>
                        {voucher.discountRate}% (Max: {formatCurrency(voucher.maximumDiscountAmount)})
                      </TableCell>
                      <TableCell className='px-4 py-3 text-start text-xs'>
                        {formatDate(voucher.startDate)} - {formatDate(voucher.endDate)}
                      </TableCell>
                      <TableCell className='px-4 py-3 text-start'>
                        {voucher.orders.length} / {voucher.usageLimit}
                      </TableCell>
                      <TableCell className='px-4 py-3 text-start'>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold leading-tight ${statusInfo.color}`}
                        >
                          {statusInfo.text}
                        </span>
                      </TableCell>
                      <TableCell className='px-4 py-3 text-end'>
                        <div className='flex justify-end gap-2'>
                          {/* View Button */}
                          <button
                            onClick={() => handleOpenDetailModal(voucher, 'view')}
                            className='text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 text-sm p-1'
                            title='View Details'
                          >
                            View
                          </button>
                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenDetailModal(voucher, 'edit')}
                            className='text-brand-500 hover:text-brand-700 dark:hover:text-brand-300 text-sm p-1'
                            title='Edit Voucher'
                          >
                            Edit
                          </button>
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteClick(voucher)}
                            className='text-red-500 hover:text-red-700 dark:hover:text-red-300 text-sm p-1'
                            title='Delete Voucher'
                            disabled={isDeleting}
                          >
                            Delete
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredAndPaginatedVouchers.totalItems > ITEMS_PER_PAGE && (
          <div className='p-4 border-t border-gray-100 dark:border-white/[0.05] flex justify-center'>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredAndPaginatedVouchers.totalItems / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* --- MODAL VIEW/CREATE/EDIT DETAILS --- */}
      {isVoucherModalOpen && (
        <VoucherModal
          isOpen={isVoucherModalOpen}
          onClose={() => setIsVoucherModalOpen(false)}
          voucher={selectedVoucher}
          onSave={saveVoucher}
          isViewMode={isViewMode}
        />
      )}
      {/* --- CONFIRM DELETE MODAL --- */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Confirm Voucher Deletion'
        message={`Are you sure you want to delete the voucher code "${selectedVoucher?.code}"? This action cannot be undone.`}
      />
    </>
  )
}
