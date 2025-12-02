// file: BasicTableVariations.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useMemo, useState } from 'react'
import { toast } from 'react-toastify'

import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'
import Pagination from '../../pagination/Pagination'
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'

import VariationModal from '../../VariationModal/VariationModal'
import { Variation, VariationForm } from '../../../types/variation.type'
import variationApi from '../../../api/variation.api'
import { categoryApi } from '../../../api/category.api'
import { Category } from '../../../types/category.type'

const ITEMS_PER_PAGE = 10

export default function BasicTableVariations() {
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)

  // --- API READ: Variations & Categories ---
  const { data: variationsResponse, isLoading: isVariationsLoading } = useQuery({
    queryKey: ['variations'],
    queryFn: variationApi.getVariations,
    staleTime: 1000 * 60 * 1
  })

  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
    staleTime: 1000 * 60 * 5
  })

  const allVariations: Variation[] = variationsResponse?.data.data || []
  const allCategories: Category[] = categoriesResponse?.data.data || []

  const getCategoryName = (id: string) => allCategories.find((cat) => cat.id === id)?.categoryName || 'N/A'

  // --- Search and Pagination Logic ---
  const filteredAndPaginatedVariations = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase()

    const filtered = allVariations.filter(
      (v: Variation) =>
        v.name.toLowerCase().includes(lowercasedSearchTerm) ||
        getCategoryName(v.productCategoryId).toLowerCase().includes(lowercasedSearchTerm)
    )

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    return {
      totalItems: filtered.length,
      data: filtered.slice(startIndex, endIndex)
    }
  }, [allVariations, searchTerm, currentPage, allCategories])

  // --- API MUTATIONS (C, U, D) ---
  const { mutate: saveVariation } = useMutation({
    mutationFn: (data: VariationForm & { id?: string }) => {
      if (data.id) return variationApi.updateVariation(data.id, data)
      return variationApi.createVariation(data)
    },
    onSuccess: (res) => {
      toast.success(res.data.message || 'Variation saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['variations'] })
      setIsModalOpen(false)
      setSelectedVariation(null)
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error saving variation.')
    }
  })

  const { mutate: deleteVariation, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => variationApi.deleteVariation(id),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Variation deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['variations'] })
      setSelectedVariation(null)
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error deleting variation.')
    }
  })

  // --- EVENT HANDLERS ---
  const handleOpenDetailModal = (variation: Variation, mode: 'view' | 'edit') => {
    setSelectedVariation(variation)
    setIsViewMode(mode === 'view')
    setIsModalOpen(true)
  }

  const handleCreateNew = () => {
    setSelectedVariation(null)
    setIsViewMode(false)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (variation: Variation) => {
    if (variation.variationOptions.length > 0) {
      toast.error('Cannot delete: Variation still has associated options.')
      return
    }
    setSelectedVariation(variation)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedVariation?.id) {
      deleteVariation(selectedVariation.id)
      setIsConfirmOpen(false)
    }
  }

  if (isVariationsLoading) return <div className='p-6 text-center text-lg text-brand-500'>Loading Variations...</div>

  return (
    <>
      <div className='flex justify-between items-center mb-5'>
        {/* Search Bar */}
        <input
          type='text'
          placeholder='Search by Variation Name or Category...'
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
          Add New Variation
        </button>
      </div>

      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-lg'>
        {/* Total Products Found (Mới) */}
        <div className='px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-end'>
          <span className='text-sm font-semibold text-indigo-700 dark:text-indigo-400  '>
            Total: **{filteredAndPaginatedVariations.totalItems}**
          </span>
        </div>

        <div className='max-w-full overflow-x-auto'>
          <Table>
            {/* Table Header */}
            <TableHeader className='border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.05]'>
              <TableRow>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Variation Name
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Product Category
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Options Count
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-end'>
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredAndPaginatedVariations.data.length === 0 ? (
                <TableRow>
                  <TableCell className='py-4 text-center text-gray-500'>
                    {searchTerm ? 'No variations found.' : 'No variations have been registered yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndPaginatedVariations.data.map((variation) => {
                  const hasOptions = (variation.variationOptions || []).length > 0

                  const isDisabled = isDeleting || hasOptions

                  return (
                    <TableRow key={variation.id}>
                      <TableCell className='px-5 py-4 font-medium truncate max-w-[200px]'>{variation.name}</TableCell>
                      <TableCell className='px-4 py-3 text-start truncate max-w-[150px]'>
                        {getCategoryName(variation.productCategoryId)}
                      </TableCell>
                      <TableCell className='px-4 py-3 text-start'>{variation.variationOptions?.length || 0}</TableCell>
                      <TableCell className='px-4 py-3 text-end'>
                        <div className='flex justify-end gap-2'>
                          {/* View Button */}
                          <button
                            onClick={() => handleOpenDetailModal(variation, 'view')}
                            className='text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 text-sm p-1'
                            title='View Details'
                          >
                            View
                          </button>
                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenDetailModal(variation, 'edit')}
                            className='text-brand-500 hover:text-brand-700 dark:hover:text-brand-300 text-sm p-1'
                            title='Edit Variation'
                          >
                            Edit
                          </button>
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteClick(variation)}
                            className={`text-red-500 hover:text-red-700 dark:hover:text-red-300 text-sm p-1 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={hasOptions ? 'Cannot delete: Variation still has options.' : 'Delete Variation'}
                            disabled={isDisabled}
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
        {filteredAndPaginatedVariations.totalItems > ITEMS_PER_PAGE && (
          <div className='p-4 border-t border-gray-100 dark:border-white/[0.05] flex justify-center'>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredAndPaginatedVariations.totalItems / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* --- MODAL VIEW/CREATE/EDIT DETAILS --- */}
      {isModalOpen && (
        <VariationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          variation={selectedVariation}
          onSave={saveVariation}
          isViewMode={isViewMode}
        />
      )}
      {/* --- CONFIRM DELETE MODAL --- */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Confirm Variation Deletion'
        message={`Are you sure you want to delete the variation "${selectedVariation?.name}"? This action cannot be undone.`}
      />
    </>
  )
}
