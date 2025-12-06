/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'

// Giả định các Component Modal đã được định nghĩa và import

import { serviceApi } from '../../../api/services.api'
import { Service, ServiceForm } from '../../../types/service.type'
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import Pagination from '../../pagination/Pagination'
import ServiceModal from '../../ServiceModel/ServiceModal'
import { useAppContext } from '../../../context/AuthContext'
import { Role } from '../../../constants/Roles'
import { formatVND } from '../../../utils/validForm'

// --- COMPONENT CHÍNH ---

const ITEMS_PER_PAGE = 10

export default function ServiceManagementTable() {
  const { profile } = useAppContext()
  const queryClient = useQueryClient()

  // --- STATE QUẢN LÝ ---
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // States cho Modals
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  // --- API READ (R) ---
  const {
    data: servicesResponse,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['services'],
    queryFn: serviceApi.getServices, // Giả định API trả về SuccessResponse<Service[]>
    staleTime: 1000 * 60 * 5 // Cache 5 phút
  })

  const allServices = servicesResponse?.data.data || []

  // --- LỌC VÀ PHÂN TRANG (CLIENT-SIDE) ---
  const filteredAndPaginatedServices = useMemo(() => {
    // 1. Lọc theo tên
    const lowercasedSearchTerm = searchTerm.toLowerCase()
    const filtered = allServices.filter((service: Service) => service.name.toLowerCase().includes(lowercasedSearchTerm))

    // 2. Phân trang
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    return {
      totalItems: filtered.length,
      data: filtered.slice(startIndex, endIndex)
    }
  }, [allServices, searchTerm, currentPage])

  // --- API MUTATIONS (C, U, D) ---

  // Mutation cho Create và Update
  const { mutate: saveService } = useMutation({
    mutationFn: (data: { form: ServiceForm; id?: string }) => {
      if (data.id) {
        console.log('id', data.id)
        console.log('data', data.form)

        return serviceApi.updateService(data.id, data.form)
      }
      return serviceApi.createService(data.form)
    },
    onSuccess: (res) => {
      toast.success(res.data.message || 'Service saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['services'] })
      setIsServiceModalOpen(false)
      setSelectedService(null)
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error saving service.')
    }
  })

  // Mutation cho Delete
  const { mutate: deleteService } = useMutation({
    mutationFn: (id: string) => serviceApi.deletedService(id),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Service deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error deleting service.')
    }
  })

  // --- HÀM XỬ LÝ SỰ KIỆN ---

  const handleOpenDetailModal = (service: Service) => {
    setSelectedService(service)
    setIsServiceModalOpen(true)
  }

  const handleCreateNew = () => {
    setSelectedService(null) // Reset để mở chế độ Create
    setIsServiceModalOpen(true)
  }

  const handleDeleteClick = (service: Service) => {
    setSelectedService(service)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedService?.id) {
      deleteService(selectedService.id)
      setIsConfirmOpen(false)
      setSelectedService(null)
    }
  }

  // --- RENDERING ---

  if (isLoading) return <div>Loading Services...</div>
  if (isError) return <div>Error loading services. Please try again.</div>

  return (
    <>
      <div className='flex justify-between items-center mb-5'>
        {/* Thanh Tìm kiếm */}
        <input
          type='text'
          placeholder='Search by Service Name...'
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1) // Reset trang khi tìm kiếm
          }}
          className='w-1/3 dark:text-white rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm'
        />

        {/* Nút Tạo mới */}
        {profile?.role === Role.ADMIN && (
          <button
            onClick={handleCreateNew}
            className='btn btn-primary flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-brand-xs hover:bg-brand-600'
          >
            Add New Service
          </button>
        )}
      </div>

      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]'>
        {/* Total Products Found (Mới) */}
        <div className='px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-end'>
          <span className='text-sm font-semibold text-indigo-700 dark:text-indigo-400'>
            Total: **{filteredAndPaginatedServices.totalItems}**
          </span>
        </div>

        <div className='max-w-full overflow-x-auto'>
          <Table>
            {/* Table Header */}
            <TableHeader className='border-b border-gray-100 dark:border-white/[0.05]'>
              <TableRow>
                <TableCell
                  isHeader
                  className='px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
                >
                  Name
                </TableCell>
                <TableCell
                  isHeader
                  className='px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
                >
                  Description
                </TableCell>
                <TableCell
                  isHeader
                  className='px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
                >
                  Duration (Mins)
                </TableCell>
                <TableCell
                  isHeader
                  className='px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
                >
                  Price
                </TableCell>
                <TableCell
                  isHeader
                  className='px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
                >
                  Created Time
                </TableCell>
                <TableCell
                  isHeader
                  className='px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400'
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className='divide-y divide-gray-100 dark:divide-white/[0.05]'>
              {filteredAndPaginatedServices.data.length === 0 ? (
                <TableRow>
                  <TableCell className='py-4 text-center text-gray-500'>No services found.</TableCell>
                </TableRow>
              ) : (
                filteredAndPaginatedServices.data.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className='px-5 py-4 sm:px-6 text-start font-medium text-gray-800 dark:text-white/90'>
                      {service.name}
                    </TableCell>
                    <TableCell className='px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 truncate max-w-xs'>
                      {service.description}
                    </TableCell>
                    <TableCell className='px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400'>
                      {service.durationMinutes} minutes
                    </TableCell>
                    <TableCell className='px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 font-semibold'>
                      {formatVND(service.price)} VNĐ
                    </TableCell>
                    <TableCell className='px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400'>
                      {new Date(service.createdTime).toLocaleDateString()}
                    </TableCell>
                    <TableCell className='px-4 py-3 text-end'>
                      <div className='flex justify-end gap-2'>
                        {/* Nút View/Edit */}
                        <button
                          onClick={() => handleOpenDetailModal(service)}
                          className='text-brand-500 hover:text-brand-700 dark:hover:text-brand-300 text-sm'
                          title='View/Edit Details'
                        >
                          View Detail
                        </button>
                        {/* Nút Delete */}
                        {profile?.role === Role.ADMIN && (
                          <button
                            onClick={() => handleDeleteClick(service)}
                            className='text-red-500 hover:text-red-700 dark:hover:text-red-300 text-sm'
                            title='Delete Service'
                          >
                            Delete
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

        {/* Pagination */}
        {filteredAndPaginatedServices.totalItems > ITEMS_PER_PAGE && (
          <div className='p-4 border-t border-gray-100 dark:border-white/[0.05] flex justify-center'>
            {/* Sử dụng component Pagination của bạn */}
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
        service={selectedService} // null cho Create, Service obj cho Update
        onSave={saveService}
      />

      {/* --- MODAL XÁC NHẬN XÓA --- */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Confirm Deletion'
        message={`Are you sure you want to delete service "${selectedService?.name}"? This action cannot be undone.`}
      />
    </>
  )
}
