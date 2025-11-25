/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useMemo, useState } from 'react'

import brandApi from '../../../api/brand.api'
import { toast } from 'react-toastify'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table' // Giả định path
import Pagination from '../../pagination/Pagination' // Giả định path

import ConfirmModal from '../../CalendarModelDetail/ConfirmModal' // Giả định path
import { Brand, BrandForm } from '../../../types/brands.type'
import countriesApi from '../../../api/country.api'
import BrandModal from '../../BrandModal/BrandModal'

const ITEMS_PER_PAGE = 10

export default function BasicTableBrands() {
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)

  // --- API READ (R) ---
  const {
    data: brandsResponse,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['brands'],
    queryFn: brandApi.getBrands,
    staleTime: 1000 * 60 * 5
  })

  const { data: countriesResponse } = useQuery({
    queryKey: ['countries'],
    queryFn: countriesApi.getCountries,
    staleTime: 1000 * 60 * 5
  })

  const allBrands = brandsResponse?.data.data || []
  const allCountries = countriesResponse?.data.data || []

  const filteredAndPaginatedBrands = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase()
    const filtered = allBrands.filter(
      (brand: Brand) =>
        brand.name.toLowerCase().includes(lowercasedSearchTerm) ||
        brand.title.toLowerCase().includes(lowercasedSearchTerm) ||
        brand.country?.countryName.toLowerCase().includes(lowercasedSearchTerm)
    )

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    return {
      totalItems: filtered.length,
      data: filtered.slice(startIndex, endIndex)
    }
  }, [allBrands, searchTerm, currentPage])

  // --- API MUTATIONS (C, U, D) ---
  const { mutate: saveBrand } = useMutation({
    mutationFn: (data: BrandForm & { id?: string }) => {
      if (data.id) {
        return brandApi.updateBrand(data.id, data)
      }
      return brandApi.createBrand(data)
    },
    onSuccess: (res) => {
      toast.success(res.data.message || 'Brand saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['brands'] })
      refetch()
      setIsBrandModalOpen(false)
      setSelectedBrand(null)
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error saving brand.')
    }
  })

  const { mutate: deleteBrand, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => brandApi.deleteBrand(id),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Brand deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['brands'] })
      refetch()
      setSelectedBrand(null)
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error deleting brand.')
    }
  })

  // --- EVENT HANDLERS ---
  const handleOpenDetailModal = (brand: Brand, mode: 'view' | 'edit') => {
    setSelectedBrand(brand)
    setIsViewMode(mode === 'view')
    setIsBrandModalOpen(true)
  }

  const handleCreateNew = () => {
    setSelectedBrand(null)
    setIsViewMode(false)
    setIsBrandModalOpen(true)
  }

  const handleDeleteClick = (brand: Brand) => {
    setSelectedBrand(brand)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedBrand?.id) {
      deleteBrand(selectedBrand.id)
      setIsConfirmOpen(false)
    }
  }

  if (isLoading) return <div className='p-6 text-center text-lg text-brand-500'>Loading Brands...</div>
  if (isError) return <div className='p-6 text-center text-lg text-red-500'>Error loading brand list.</div>

  return (
    <>
      <div className='flex justify-between items-center mb-5'>
        {/* Search Bar */}
        <input
          type='text'
          placeholder='Search by Name, Title, or Country...'
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
          Add New Brand
        </button>
      </div>

      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-lg'>
        <div className='max-w-full overflow-x-auto'>
          <Table>
            {/* Table Header */}
            <TableHeader className='border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.05]'>
              <TableRow>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Name
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Title
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Country
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Products
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-end'>
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredAndPaginatedBrands.data.length === 0 ? (
                <TableRow>
                  <TableCell className='py-4 text-center text-gray-500'>
                    {searchTerm ? 'No brands found.' : 'No brands have been registered yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndPaginatedBrands.data.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell className='px-5 py-4 font-medium truncate max-w-[150px]'>{brand.name}</TableCell>
                    <TableCell className='px-4 py-3 text-start truncate max-w-[150px]'>{brand.title}</TableCell>
                    <TableCell className='px-4 py-3 text-start'>{brand.country?.countryName || 'N/A'}</TableCell>
                    <TableCell className='px-4 py-3 text-start'>{brand.products?.length || 0}</TableCell>
                    <TableCell className='px-4 py-3 text-end'>
                      <div className='flex justify-end gap-2'>
                        {/* View Button */}
                        <button
                          onClick={() => handleOpenDetailModal(brand, 'view')}
                          className='text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 text-sm p-1'
                          title='View Details'
                        >
                          View
                        </button>
                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenDetailModal(brand, 'edit')}
                          className='text-brand-500 hover:text-brand-700 dark:hover:text-brand-300 text-sm p-1'
                          title='Edit Brand'
                        >
                          Edit
                        </button>
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteClick(brand)}
                          className='text-red-500 hover:text-red-700 dark:hover:text-red-300 text-sm p-1'
                          title='Delete Brand'
                          disabled={isDeleting}
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredAndPaginatedBrands.totalItems > ITEMS_PER_PAGE && (
          <div className='p-4 border-t border-gray-100 dark:border-white/[0.05] flex justify-center'>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredAndPaginatedBrands.totalItems / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* --- MODAL VIEW/CREATE/EDIT DETAILS --- */}
      {isBrandModalOpen && (
        <BrandModal
          countries={allCountries || []}
          isOpen={isBrandModalOpen}
          onClose={() => setIsBrandModalOpen(false)}
          brand={selectedBrand}
          onSave={saveBrand}
          isViewMode={isViewMode}
        />
      )}
      {/* --- CONFIRM DELETE MODAL --- */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Confirm Brand Deletion'
        message={`Are you sure you want to delete the brand "${selectedBrand?.name}"? This action cannot be undone.`}
      />
    </>
  )
}
