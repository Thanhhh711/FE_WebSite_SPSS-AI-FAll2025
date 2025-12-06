/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

  console.log('allCategories', allCategories)

  const filteredAndPaginatedCategories = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase()

    const filtered = allCategories.filter(
      (category: Category) =>
        category.categoryName.toLowerCase().includes(lowercasedSearchTerm) ||
        category.parentCategory?.categoryName.toLowerCase().includes(lowercasedSearchTerm)
    )

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    return {
      totalItems: filtered.length,
      data: filtered.slice(startIndex, endIndex)
    }
  }, [allCategories, searchTerm, currentPage])

  const { mutate: saveCategory } = useMutation({
    mutationFn: (data: CategoryForm & { id?: string }) => {
      if (data.id) {
        return categoryApi.updateCategory(data.id, data)
      }
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

  if (isLoading) return <div className='p-6 text-center text-lg text-brand-500'>Loading Categories...</div>
  if (isError) return <div className='p-6 text-center text-lg text-red-500'>Error loading category list.</div>

  return (
    <Fragment>
      <div className='flex justify-between items-center mb-5'>
        {/* Search Bar */}
        <input
          type='text'
          placeholder='Search by Category or Parent Name...'
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className='w-1/3 min-w-[200px] rounded-lg border border-gray-300 dark:border-gray-700 dark:text-white bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
        />

        {profile?.role === Role.STORE_STAFF && (
          <button
            onClick={handleCreateNew}
            className='btn btn-primary flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-brand-xs hover:bg-brand-600 transition-colors'
          >
            Add New Category
          </button>
        )}
      </div>

      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-lg'>
        <div className='px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-end'>
          <span className='text-sm font-semibold text-indigo-700 dark:text-indigo-400'>
            Total: **{filteredAndPaginatedCategories.totalItems}**
          </span>
        </div>

        <div className='max-w-full overflow-x-auto'>
          <Table>
            {/* Table Header */}
            <TableHeader className='border-b border-gray-100 dark:border-white/[0.05] dark:text-white bg-gray-50 dark:bg-white/[0.05]'>
              <TableRow>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Category Name
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Parent Category
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Subcategories
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
              {filteredAndPaginatedCategories.data.length === 0 ? (
                <TableRow>
                  <TableCell className='py-4 text-center text-gray-500'>
                    {searchTerm ? 'No categories found.' : 'No categories have been registered yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndPaginatedCategories.data.map((category) => (
                  <TableRow key={category.id} className='dark:text-gray-300'>
                    <TableCell className='px-5 py-4 font-medium truncate max-w-[200px]'>
                      {category.categoryName}
                    </TableCell>
                    <TableCell className='px-4 py-3 text-start truncate max-w-[150px]'>
                      {category.parentCategory?.categoryName || 'Root'}
                    </TableCell>
                    <TableCell className='px-4 py-3 text-start'>
                      {category.inverseParentCategory?.length || 0}
                    </TableCell>
                    <TableCell className='px-4 py-3 text-start'>{category.products?.length || 0}</TableCell>
                    <TableCell className='px-4 py-3 text-end'>
                      <div className='flex justify-end gap-2'>
                        {/* View Button */}
                        <button
                          onClick={() => handleOpenDetailModal(category, 'view')}
                          className='text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 text-sm p-1'
                          title='View Details'
                        >
                          View
                        </button>

                        {profile?.role === Role.STORE_STAFF && (
                          <>
                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenDetailModal(category, 'edit')}
                              className='text-brand-500 hover:text-brand-700 dark:hover:text-brand-300 text-sm p-1'
                              title='Edit Category'
                            >
                              Edit
                            </button>
                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteClick(category)}
                              className='text-red-500 hover:text-red-700 dark:hover:text-red-300 text-sm p-1'
                              title='Delete Category'
                              // Disable nếu đang xóa hoặc có sản phẩm/danh mục con
                              disabled={
                                isDeleting || category.products.length > 0 || category.inverseParentCategory.length > 0
                              }
                            >
                              Delete
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

        {/* Pagination */}
        {filteredAndPaginatedCategories.totalItems > ITEMS_PER_PAGE && (
          <div className='p-4 border-t border-gray-100 dark:border-white/[0.05] flex justify-center'>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredAndPaginatedCategories.totalItems / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* --- MODAL VIEW/CREATE/EDIT DETAILS --- */}
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
        title='Confirm Category Deletion'
        message={`Are you sure you want to delete the category "${selectedCategory?.categoryName}"? This action cannot be undone.`}
      />
    </Fragment>
  )
}
