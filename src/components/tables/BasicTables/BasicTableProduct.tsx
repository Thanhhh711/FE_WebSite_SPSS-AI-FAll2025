/* eslint-disable @typescript-eslint/no-unused-vars */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
// Giả định các imports này đã tồn tại trong dự án của bạn
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'
// Loại bỏ import Pagination và dùng logic thủ công
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'

import { productApi } from '../../../api/product.api'
import { Role } from '../../../constants/Roles'
import { useAppContext } from '../../../context/AuthContext'
import { Product, ProductForm, ProductStatusEnum } from '../../../types/product.type'
import { normalizeProductData } from '../../../utils/validForm'
import ProductModal from '../../ProductModal/ProductModal'

const ITEMS_PER_PAGE = 10
// --- COMPONENT CHÍNH ---

interface BasicTableProductProps {
  onViewReviews: (productItemId: string, productName: string) => void
}

export default function BasicTableProduct({ onViewReviews }: BasicTableProductProps) {
  const queryClient = useQueryClient()
  const { profile } = useAppContext()
  // --- 1. STATE QUẢN LÝ ---
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(ITEMS_PER_PAGE)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)

  // --- 2. API READ (R) ---
  const {
    data: productsResponse,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['products'],
    queryFn: productApi.getProducts,
    staleTime: 1000 * 60 * 5,
    select: (res) => res.data.data
  })

  const products: Product[] = productsResponse || []

  // --- 3. API MUTATIONS (C, U, D) ---

  // 3.1. CREATE/UPDATE
  const saveProductMutation = useMutation({
    mutationFn: (data: ProductForm & { id?: string }) => {
      const normalizedData = normalizeProductData(data)

      if (data.id) {
        return productApi.updateProduct(normalizedData.id, normalizedData)
      }

      return productApi.createProduct(normalizedData)
    },
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(variables.id ? 'Cập nhật sản phẩm thành công!' : 'Tạo sản phẩm mới thành công!')
      setIsProductModalOpen(false)
      setSelectedProduct(null)
    },
    onError: () => {
      toast.error('Lỗi khi lưu sản phẩm. Vui lòng thử lại.')
    }
  })

  const saveProduct = (data: ProductForm & { id?: string }) => {
    saveProductMutation.mutate(data)
  }

  // 3.2. DELETE
  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) => productApi.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Xóa sản phẩm thành công!')
    },
    onError: () => {
      toast.error('Lỗi khi xóa sản phẩm. Vui lòng thử lại.')
    }
  })

  const handleConfirmDelete = () => {
    if (selectedProduct?.id) {
      deleteProductMutation.mutate(selectedProduct.id)
    }
    setIsConfirmOpen(false)
    setSelectedProduct(null)
  }

  // --- 4. HÀM XỬ LÝ UI ---

  const handleOpenCreateModal = () => {
    setSelectedProduct(null)
    setIsViewMode(false)
    setIsProductModalOpen(true)
  }

  const handleOpenEditModal = (product: Product) => {
    setSelectedProduct(product)
    setIsViewMode(false)
    setIsProductModalOpen(true)
  }

  const handleOpenViewModal = (product: Product) => {
    setSelectedProduct(product)
    setIsViewMode(true)
    setIsProductModalOpen(true)
  }

  const handleOpenDeleteConfirm = (product: Product) => {
    setSelectedProduct(product)
    setIsConfirmOpen(true)
  }

  // --- 5. LỌC VÀ PHÂN TRANG LOGIC ---
  const filteredAndPaginatedProducts = useMemo(() => {
    const normalizedSearchTerm = searchTerm.toLowerCase().trim()
    const filteredItems = products.filter(
      (product) =>
        product.name.toLowerCase().includes(normalizedSearchTerm) ||
        product.englishName.toLowerCase().includes(normalizedSearchTerm) ||
        product.brandId.toLowerCase().includes(normalizedSearchTerm)
    )

    const totalItems = filteredItems.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    const finalCurrentPage = Math.min(currentPage, totalPages > 0 ? totalPages : 1)

    const startIndex = (finalCurrentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedItems = filteredItems.slice(startIndex, endIndex)

    return {
      items: paginatedItems,
      totalItems,
      totalPages: totalPages,
      currentPage: finalCurrentPage
    }
  }, [products, searchTerm, currentPage, itemsPerPage])

  const totalItems = filteredAndPaginatedProducts.totalItems
  const totalPages = filteredAndPaginatedProducts.totalPages

  // --- 6. PHÂN TRANG THỦ CÔNG (TỪ BasicTableOne.tsx) ---
  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  const goToPrevPage = () => goToPage(currentPage - 1)
  const goToNextPage = () => goToPage(currentPage + 1)

  const renderPaginationButtons = () => {
    const pages = []
    const maxButtons = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2))
    const endPage = Math.min(totalPages, startPage + maxButtons - 1)

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 mx-1 rounded-md text-sm transition-colors ${
            currentPage === i
              ? 'bg-blue-600 text-white font-semibold'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.1]'
          }`}
        >
          {i}
        </button>
      )
    }
    return pages
  }

  // --- 7. UTILS ---

  const getStatusBadge = (status: ProductStatusEnum) => {
    let colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    let statusText = 'Unknown'

    switch (status) {
      case ProductStatusEnum.InStock:
        colorClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        statusText = 'In Stock'
        break
      case ProductStatusEnum.OutOfStock:
        colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
        statusText = 'Out of Stock'
        break
      case ProductStatusEnum.Archived:
        colorClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        statusText = 'Archived'
        break
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {statusText}
      </span>
    )
  }

  // --- RENDERING ---
  return (
    <div className='p-6 bg-white dark:bg-gray-900 min-h-screen'>
      <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-6'> Product Management</h2>

      <div className='bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden'>
        {/* THANH TÌM KIẾM, TỔNG SẢN PHẨM VÀ TẠO MỚI (Header) */}
        <div className='p-4 border-b border-gray-100 dark:border-white/[0.05] flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0'>
          {/* Search Input */}
          <div className='w-full sm:w-1/3 min-w-[200px]'>
            <input
              type='text'
              placeholder='Search by Name...'
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className='w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
            />
          </div>

          {/* Total Products Found (Mới) */}
          <div className='px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg'>
            <span className='text-sm font-semibold text-indigo-700 dark:text-indigo-400'>
              Total Products Found: **{totalItems}**
            </span>
          </div>

          {/* Create Button */}
          {profile?.role === Role.STORE_STAFF && (
            <button
              onClick={handleOpenCreateModal}
              type='button'
              className='flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-brand-xs hover:bg-brand-600 transition-colors w-full sm:w-auto min-w-[180px]'
            >
              <svg
                className='w-5 h-5 mr-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4v16m8-8H4'></path>
              </svg>
              Create New Product
            </button>
          )}
        </div>

        {/* Table */}
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader className='border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.05] dark:text-white'>
              <TableRow>
                <TableCell isHeader className='min-w-[80px] px-4 py-3 text-start'>
                  Image
                </TableCell>
                <TableCell isHeader className='min-w-[180px] px-4 py-3 text-start'>
                  Product Name
                </TableCell>
                <TableCell isHeader className='min-w-[120px] px-4 py-3 text-start'>
                  Price (VND)
                </TableCell>
                <TableCell isHeader className='min-w-[100px] px-4 py-3 text-start'>
                  Stock
                </TableCell>
                <TableCell isHeader className='min-w-[120px] px-4 py-3 text-start'>
                  Status
                </TableCell>
                <TableCell isHeader className='min-w-[150px] px-4 py-3 text-end'>
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell className='text-center py-8'>Loading product data...</TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell className='text-center py-8 text-red-500'>
                    Failed to load data. Please try again.
                  </TableCell>
                </TableRow>
              ) : filteredAndPaginatedProducts.items.length === 0 ? (
                <TableRow>
                  <TableCell className='text-center py-8 text-gray-500 dark:text-gray-400'>
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndPaginatedProducts.items.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className='px-4 py-3'>
                      <img
                        src={product.images.find((img) => img.isThumbnail)?.imageUrl || 'placeholder.jpg'}
                        alt={product.name}
                        className='w-10 h-10 object-cover rounded-md'
                      />
                    </TableCell>
                    <TableCell className='font-medium text-gray-900 dark:text-white max-w-[200px] px-4 py-3'>
                      {product.name}
                    </TableCell>

                    <TableCell className='px-4 py-3'>{product.price.toLocaleString('vi-VN')}</TableCell>
                    <TableCell className='px-4 py-3'>{product.quantityInStock}</TableCell>
                    <TableCell className='px-4 py-3'>{getStatusBadge(product.status)}</TableCell>
                    <TableCell className='px-4 py-3 text-end whitespace-nowrap'>
                      <div className='flex justify-end space-x-2'>
                        <button
                          onClick={() => handleOpenViewModal(product)}
                          className='text-blue-500 hover:text-blue-700 text-sm p-1'
                          title='View Details'
                        >
                          View
                        </button>

                        <button
                          onClick={() => onViewReviews(product.id, product.name)}
                          className='text-blue-600 hover:text-blue-900 mr-2 border border-blue-600 px-3 py-1 rounded-md text-xs transition duration-150'
                        >
                          View Reviews
                        </button>
                        {profile?.role === Role.STORE_STAFF && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(product)}
                              className='text-yellow-500 hover:text-yellow-700 text-sm p-1'
                              title='Edit Product'
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleOpenDeleteConfirm(product)}
                              className='text-red-500 hover:text-red-700 text-sm p-1'
                              title='Delete Product'
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

        {/* PHÂN TRANG THỦ CÔNG */}
        {totalPages > 1 && (
          <div className='flex justify-between items-center mt-4 p-4 border-t border-gray-100 dark:border-white/[0.05]'>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Showing page **{currentPage}** of **{totalPages}**
            </p>
            <div className='flex items-center'>
              {/* Nút Previous */}
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className='px-3 py-1 mx-1 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.1]'
              >
                Previous
              </button>

              {/* Các nút số trang */}
              {renderPaginationButtons()}

              {/* Nút Next */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className='px-3 py-1 mx-1 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.1]'
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {isProductModalOpen && (
        <ProductModal
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false)
            setSelectedProduct(null)
          }}
          product={selectedProduct}
          onSave={saveProduct}
          isViewMode={isViewMode}
        />
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Confirm Delete Product'
        message={`Are you sure you want to delete product "${selectedProduct?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}
