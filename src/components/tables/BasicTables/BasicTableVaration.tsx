// file: BasicTableVariations.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'

import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import Pagination from '../../pagination/Pagination'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'

import { Edit3, Eye, Plus, Search, Trash2 } from 'lucide-react'
import { categoryApi } from '../../../api/category.api'
import variationApi from '../../../api/variation.api'
import { Category } from '../../../types/category.type'
import { Variation, VariationForm } from '../../../types/variation.type'
import VariationModal from '../../VariationModal/VariationModal'

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
      {/* HEADER SECTION: Search & Create */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-gray-800 transition-all mb-6'>
        <div className='flex items-center gap-5'>
          {/* <div className='w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm'>
            <Layers size={30} />
          </div> */}
          <div>
            <h1 className='text-2xl font-black text-slate-800 dark:text-white tracking-tight'>Product Variations</h1>
            <p className='text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1'>
              Attributes Management • {filteredAndPaginatedVariations.totalItems} Variations Found
            </p>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='relative group'>
            <Search
              className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors'
              size={18}
            />
            <input
              type='text'
              placeholder='Search Variations...'
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className='pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-gray-800/50 border-none rounded-2xl focus:ring-4 ring-indigo-500/10 w-full sm:w-64 transition-all text-sm font-bold dark:text-white outline-none'
            />
          </div>

          <button
            onClick={handleCreateNew}
            className='bg-slate-900 dark:bg-indigo-600 hover:scale-[1.02] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95'
          >
            <Plus size={18} /> Add New Variation
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className='bg-white dark:bg-gray-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-gray-800 overflow-hidden'>
        <div className='max-w-full overflow-x-auto'>
          <Table>
            <TableHeader className='bg-slate-50/50 dark:bg-gray-800/50'>
              <TableRow className='border-none'>
                <TableCell
                  isHeader
                  className='px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[30%]'
                >
                  Variation Name
                </TableCell>
                <TableCell
                  isHeader
                  className='px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[30%]'
                >
                  Category
                </TableCell>
                <TableCell
                  isHeader
                  className='px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center w-[20%]'
                >
                  Options
                </TableCell>
                <TableCell
                  isHeader
                  className='px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right w-[20%]'
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredAndPaginatedVariations.data.length === 0 ? (
                <TableRow>
                  <TableCell className='py-20 text-center text-slate-400 font-bold italic uppercase tracking-widest'>
                    {searchTerm ? 'No matching variations found.' : 'No variations registered yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndPaginatedVariations.data.map((variation) => {
                  const hasOptions = (variation.variationOptions || []).length > 0
                  const isDisabled = isDeleting || hasOptions

                  return (
                    <TableRow
                      key={variation.id}
                      className='group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all border-b border-slate-50 dark:border-gray-800 last:border-0'
                    >
                      <TableCell className='px-8 py-7'>
                        <span className='font-black text-slate-800 dark:text-white text-base tracking-tight'>
                          {variation.name}
                        </span>
                      </TableCell>

                      <TableCell className='px-8 py-7'>
                        <div className='inline-flex items-center px-3 py-1 bg-slate-100 dark:bg-gray-800 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-gray-700'>
                          {getCategoryName(variation.productCategoryId)}
                        </div>
                      </TableCell>

                      <TableCell className='px-8 py-7 text-center'>
                        <span
                          className={`text-sm font-black ${hasOptions ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
                        >
                          {variation.variationOptions?.length || 0} items
                        </span>
                      </TableCell>

                      <TableCell className='px-8 py-7 text-right'>
                        <div className='flex justify-end gap-2.5'>
                          <button
                            onClick={() => handleOpenDetailModal(variation, 'view')}
                            className='p-3 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-2xl transition-all shadow-sm bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700'
                            title='View Details'
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleOpenDetailModal(variation, 'edit')}
                            className='p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-2xl transition-all shadow-sm bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700'
                            title='Edit Variation'
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(variation)}
                            disabled={isDisabled}
                            className={`p-3 rounded-2xl transition-all shadow-sm border ${
                              isDisabled
                                ? 'opacity-30 bg-slate-50 dark:bg-gray-900 text-slate-300 border-slate-100 dark:border-gray-800 cursor-not-allowed'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-900 border-slate-100 dark:border-gray-700'
                            }`}
                            title={hasOptions ? 'Variation has options - Cannot delete' : 'Delete Variation'}
                          >
                            <Trash2 size={18} />
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

        {/* PAGINATION SECTION */}
        {filteredAndPaginatedVariations.totalItems > ITEMS_PER_PAGE && (
          <div className='p-10 flex justify-center bg-slate-50/30 dark:bg-transparent border-t dark:border-gray-800'>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredAndPaginatedVariations.totalItems / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* MODALS */}
      {isModalOpen && (
        <VariationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          variation={selectedVariation}
          onSave={saveVariation}
          isViewMode={isViewMode}
        />
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Delete Variation'
        message={`Remove "${selectedVariation?.name}" permanently?`}
      />
    </>
  )
}
