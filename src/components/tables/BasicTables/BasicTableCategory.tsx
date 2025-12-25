/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Box, Edit3, Eye, GitBranch, Plus, Search, Trash2 } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { categoryApi } from '../../../api/category.api'
import { Role } from '../../../constants/Roles'
import { useAppContext } from '../../../context/AuthContext'
import { Category, CategoryForm } from '../../../types/category.type'
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import CategoryModal from '../../CategoryModal/CategoryModal'
import Pagination from '../../pagination/Pagination'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'

const ITEMS_PER_PAGE = 10

export default function BasicTableCategories() {
  const queryClient = useQueryClient()
  const { profile } = useAppContext()

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)

  // Logic phân quyền: Chỉ Store Staff mới có quyền thao tác
  const isStoreStaff = profile?.role === Role.STORE_STAFF

  const {
    data: categoriesResponse,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
    staleTime: 1000 * 60 * 5,
    select: (data) => data.data.data
  })

  const allCategories: Category[] = categoriesResponse || []

  const filteredAndPaginatedCategories = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase()
    const filtered = allCategories.filter(
      (category: Category) =>
        category.categoryName.toLowerCase().includes(lowercasedSearchTerm) ||
        category.parentCategory?.categoryName.toLowerCase().includes(lowercasedSearchTerm)
    )
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return {
      totalItems: filtered.length,
      data: filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    }
  }, [allCategories, searchTerm, currentPage])

  const { mutate: saveCategory } = useMutation({
    mutationFn: (data: CategoryForm & { id?: string }) => {
      if (data.id) return categoryApi.updateCategory(data.id, data)
      return categoryApi.createCategory(data)
    },
    onSuccess: (res) => {
      toast.success(res.data.message || 'Category saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setIsModalOpen(false)
      setSelectedCategory(null)
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error saving category.')
    }
  })

  const { mutate: deleteCategory, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => categoryApi.deleteCategory(id),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Category deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setSelectedCategory(null)
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error deleting category.')
    }
  })

  const handleOpenDetailModal = (category: Category, mode: 'view' | 'edit') => {
    setSelectedCategory(category)
    setIsViewMode(mode === 'view')
    setIsModalOpen(true)
  }

  const handleCreateNew = () => {
    setSelectedCategory(null)
    setIsViewMode(false)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (category: Category) => {
    if (category.products.length > 0 || category.inverseParentCategory.length > 0) {
      toast.error('Cannot delete: Category still has products or subcategories.')
      return
    }
    setSelectedCategory(category)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedCategory?.id) {
      deleteCategory(selectedCategory.id)
      setIsConfirmOpen(false)
    }
  }

  if (isLoading)
    return (
      <div className='p-20 text-center font-black text-indigo-500 animate-pulse tracking-widest uppercase'>
        Loading Categories...
      </div>
    )
  if (isError)
    return <div className='p-20 text-center font-black text-red-500 uppercase'>Error loading category list.</div>

  return (
    <Fragment>
      <div className='p-4 md:p-8 space-y-6 bg-transparent min-h-screen'>
        {/* Header Section */}
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-gray-800 transition-all'>
          <div className='flex items-center gap-5'>
            {/* <div className='w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm'>
              <LayoutGrid size={30} />
            </div> */}
            <div>
              <h1 className='text-2xl font-black text-slate-800 dark:text-white tracking-tight'>Category Library</h1>
              <p className='text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1'>
                Organization • {filteredAndPaginatedCategories.totalItems} Items
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
                placeholder='Search by name...'
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className='pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-gray-800/50 border-none rounded-2xl focus:ring-4 ring-indigo-500/10 w-full sm:w-64 transition-all text-sm font-bold dark:text-white'
              />
            </div>

            {isStoreStaff && (
              <button
                onClick={handleCreateNew}
                className='bg-slate-900 dark:bg-indigo-600 hover:scale-[1.02] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95'
              >
                <Plus size={18} /> Add New Category
              </button>
            )}
          </div>
        </div>

        {/* Table Card Section */}
        <div className='bg-white dark:bg-gray-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-gray-800 overflow-hidden'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader className='bg-slate-50/50 dark:bg-gray-800/50'>
                <TableRow className='border-none'>
                  <TableCell
                    isHeader
                    className='px-8 py-6 text-[10px] text-left font-black text-slate-400 uppercase tracking-[0.2em]'
                  >
                    Category Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className='px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'
                  >
                    Parent Category
                  </TableCell>
                  <TableCell
                    isHeader
                    className='px-6 py-6 text-[10px] text-left font-black text-slate-400 uppercase tracking-[0.2em]'
                  >
                    Subcategories
                  </TableCell>
                  <TableCell
                    isHeader
                    className='px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'
                  >
                    Products
                  </TableCell>
                  <TableCell
                    isHeader
                    className='px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right'
                  >
                    Action Center
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndPaginatedCategories.data.length === 0 ? (
                  <TableRow>
                    <TableCell className='py-20 text-center text-slate-400 font-bold italic uppercase tracking-widest'>
                      No categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndPaginatedCategories.data.map((category) => (
                    <TableRow
                      key={category.id}
                      className='group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all border-b border-slate-50 dark:border-gray-800 last:border-0'
                    >
                      <TableCell className='px-8 py-7'>
                        <div className='flex items-center gap-4'>
                          <span className='font-black text-slate-800 dark:text-white text-base tracking-tight'>
                            {category.categoryName}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className='px-6 py-7'>
                        <div className='inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold'>
                          <GitBranch size={14} /> {category.parentCategory?.categoryName || 'Root Category'}
                        </div>
                      </TableCell>

                      <TableCell className='px-6 py-7'>
                        <span className='font-black text-slate-700 text-start  dark:text-slate-300'>
                          {category.inverseParentCategory?.length || 0}
                        </span>
                      </TableCell>

                      <TableCell className='px-6 py-7'>
                        <div className='flex items-center gap-2 text-slate-500'>
                          <Box size={16} className='text-slate-400' />
                          <span className='font-black text-slate-700 dark:text-slate-300'>
                            {category.products?.length || 0}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className='px-8 py-7 text-right'>
                        <div className='flex justify-end gap-2.5'>
                          <button
                            onClick={() => handleOpenDetailModal(category, 'view')}
                            className='p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-2xl transition-all shadow-sm bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700'
                            title='View details'
                          >
                            <Eye size={18} />
                          </button>

                          {isStoreStaff && (
                            <>
                              <button
                                onClick={() => handleOpenDetailModal(category, 'edit')}
                                className='p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-2xl transition-all shadow-sm bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700'
                                title='Edit Category'
                              >
                                <Edit3 size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(category)}
                                disabled={
                                  isDeleting ||
                                  category.products.length > 0 ||
                                  category.inverseParentCategory.length > 0
                                }
                                className='p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-800 rounded-2xl transition-all shadow-sm bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed'
                                title='Delete Category'
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Section */}
          {filteredAndPaginatedCategories.totalItems > ITEMS_PER_PAGE && (
            <div className='p-10 flex justify-center bg-slate-50/30 dark:bg-transparent border-t dark:border-gray-800'>
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredAndPaginatedCategories.totalItems / ITEMS_PER_PAGE)}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <CategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          category={selectedCategory}
          onSave={saveCategory}
          isViewMode={isViewMode}
        />
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Archive Category'
        message={`Are you sure you want to permanently remove "${selectedCategory?.categoryName}"? This action cannot be undone.`}
      />
    </Fragment>
  )
}
