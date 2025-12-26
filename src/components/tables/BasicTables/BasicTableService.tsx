/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Calendar, Clock, Edit2, Package, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'

import { serviceApi } from '../../../api/services.api'
import { Role } from '../../../constants/Roles'
import { useAppContext } from '../../../context/AuthContext'
import { Service, ServiceForm } from '../../../types/service.type'
import { formatVND } from '../../../utils/validForm'
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import Pagination from '../../pagination/Pagination'
import ServiceModal from '../../ServiceModel/ServiceModal'

const ITEMS_PER_PAGE = 10

export default function ServiceManagementTable() {
  const { profile } = useAppContext()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  const { data: servicesResponse, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: serviceApi.getServices,
    staleTime: 1000 * 60 * 5
  })

  const allServices = servicesResponse?.data.data || []

  const filteredAndPaginatedServices = useMemo(() => {
    const filtered = allServices.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return {
      totalItems: filtered.length,
      data: filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    }
  }, [allServices, searchTerm, currentPage])

  const { mutate: saveService } = useMutation({
    mutationFn: (data: { form: ServiceForm; id?: string }) =>
      data.id ? serviceApi.updateService(data.id, data.form) : serviceApi.createService(data.form),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['services'] })
      setIsServiceModalOpen(false)
    }
  })

  const { mutate: deleteService } = useMutation({
    mutationFn: (id: string) => serviceApi.deletedService(id),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['services'] })
      setIsConfirmOpen(false)
    }
  })

  if (isLoading)
    return <div className='p-10 text-center animate-pulse text-slate-500 font-bold'>Loading Services...</div>

  return (
    <div className='p-6 space-y-6 bg-slate-50/50 dark:bg-transparent min-h-screen transition-all'>
      {/* Header Section */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-gray-800'>
        <div className='flex items-center gap-4'>
          <div className='p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600'>
            <Package size={28} />
          </div>
          <div>
            <h1 className='text-2xl font-black text-slate-800 dark:text-white tracking-tight'>Service Management</h1>
            <p className='text-slate-400 text-xs font-medium uppercase tracking-widest mt-1'>
              Total Services:{' '}
              <span className='text-indigo-600 font-bold'>{filteredAndPaginatedServices.totalItems}</span>
            </p>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-3'>
          <div className='relative group'>
            <Search
              className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors'
              size={18}
            />
            <input
              type='text'
              placeholder='Search by name...'
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className='pl-10 pr-4 py-3 dark:text-gray-300 bg-slate-100 dark:bg-gray-800 dark:text-border-none rounded-2xl focus:ring-2 ring-indigo-500/20 w-full sm:w-64 transition-all text-sm font-medium'
            />
          </div>
          {profile?.role === Role.ADMIN && (
            <button
              onClick={() => {
                setSelectedService(null)
                setIsServiceModalOpen(true)
              }}
              className='bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95'
            >
              <Plus size={20} /> Add Service
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className='bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-gray-800 overflow-hidden'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader className='bg-slate-50/50 dark:bg-gray-800/50 border-b border-slate-100 dark:border-gray-800'>
              <TableRow>
                <TableCell isHeader className='px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest'>
                  Service Details
                </TableCell>
                <TableCell
                  isHeader
                  className='px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center'
                >
                  Duration
                </TableCell>
                <TableCell isHeader className='px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest'>
                  Price
                </TableCell>
                <TableCell isHeader className='px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest'>
                  Created At
                </TableCell>
                <TableCell
                  isHeader
                  className='px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right'
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndPaginatedServices.data.length === 0 ? (
                <TableRow>
                  <TableCell className='py-20 text-center text-slate-400 font-medium'>
                    No services found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndPaginatedServices.data.map((service) => (
                  <TableRow
                    key={service.id}
                    className='group hover:bg-slate-50 dark:hover:bg-indigo-900/10 transition-colors border-b border-slate-50 dark:border-gray-800 last:border-0'
                  >
                    <TableCell className='px-8 py-6'>
                      <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-lg shadow-sm'>
                          {service.name.charAt(0)}
                        </div>
                        <div className='max-w-xs'>
                          <p className='font-bold text-slate-800 dark:text-white text-base leading-tight'>
                            {service.name}
                          </p>
                          <p className='text-xs text-slate-400 line-clamp-1 mt-1'>{service.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='px-6 text-center'>
                      <span className='inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full text-[11px] font-black border border-amber-100 dark:border-amber-900/30'>
                        <Clock size={14} /> {service.durationMinutes} MINS
                      </span>
                    </TableCell>
                    <TableCell className='px-6'>
                      <span className='font-black text-indigo-600 dark:text-indigo-400 text-lg'>
                        {formatVND(service.price)}
                      </span>
                    </TableCell>
                    <TableCell className='px-6 text-slate-400 font-medium text-sm'>
                      <div className='flex items-center gap-2'>
                        <Calendar size={14} /> {new Date(service.createdTime).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className='px-8 text-right'>
                      <div className='flex justify-end gap-2'>
                        <button
                          onClick={() => {
                            setSelectedService(service)
                            setIsServiceModalOpen(true)
                          }}
                          className='p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all'
                        >
                          <Edit2 size={18} />
                        </button>
                        {profile?.role === Role.ADMIN && (
                          <button
                            onClick={() => {
                              setSelectedService(service)
                              setIsConfirmOpen(true)
                            }}
                            className='p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all'
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredAndPaginatedServices.totalItems > ITEMS_PER_PAGE && (
          <div className='p-8 bg-slate-50/30 dark:bg-gray-800/20 border-t border-slate-100 dark:border-gray-800 flex justify-center'>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredAndPaginatedServices.totalItems / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        service={selectedService}
        onSave={saveService}
      />
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => selectedService && deleteService(selectedService.id)}
        title='Confirm Deletion'
        message={`Are you sure you want to delete "${selectedService?.name}"?`}
      />
    </div>
  )
}
