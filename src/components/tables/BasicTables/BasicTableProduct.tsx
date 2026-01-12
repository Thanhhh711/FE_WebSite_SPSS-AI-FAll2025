/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit3, Eye, MessageSquare, Plus, RotateCcw, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'

import brandApi from '../../../api/brand.api'
import { categoryApi } from '../../../api/category.api'
import { productApi } from '../../../api/product.api'
import { Role } from '../../../constants/Roles'
import { useAppContext } from '../../../context/AuthContext'
import { Product, ProductForm, ProductStatusEnum } from '../../../types/product.type'
import { formatVND, normalizeProductData, parseNumber } from '../../../utils/validForm'
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import ProductModal from '../../ProductModal/ProductModal'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'

const ITEMS_PER_PAGE = 10

const getStatusLabel = (status: ProductStatusEnum) => {
  switch (status) {
    case ProductStatusEnum.InStock:
      return 'In Stock'
    case ProductStatusEnum.OutOfStock:
      return 'Out of Stock'
    case ProductStatusEnum.Archived:
      return 'Archived'
    default:
      return 'Unknown'
  }
}

// --- Sub-component Thẻ Thống Kê ---
// const StatCard = ({ title, count, icon, color }: any) => (
//   <div className='bg-white dark:bg-gray-800/40 p-6 rounded-[2rem] border border-gray-100 dark:border-white/[0.05] shadow-sm flex items-center justify-between group hover:shadow-md transition-all'>
//     <div>
//       <p className='text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1'>{title}</p>
//       <h3 className='text-2xl font-black text-gray-900 dark:text-white tracking-tight'>{count}</h3>
//     </div>
//     <div className={`p-4 rounded-2xl ${color}`}>{icon}</div>
//   </div>
// )

interface BasicTableProductProps {
  onViewReviews: (productItemId: string, productName: string) => void
}

export default function BasicTableProduct({ onViewReviews }: BasicTableProductProps) {
  const queryClient = useQueryClient()
  const { profile } = useAppContext()

  // --- 1. STATE QUẢN LÝ ---
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedBrandId, setSelectedBrandId] = useState<string>('')
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' })
  const [stockStatus, setStockStatus] = useState<'all' | 'low' | 'out'>('all')
  // --- 2. LẤY DỮ LIỆU ---
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.getProducts().then((res) => res.data.data)
  })

  // Thêm vào cùng chỗ với các useQuery hiện có
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories()
  })

  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandApi.getBrands()
  })

  const categories = categoriesData?.data.data || []
  const brands = brandsData?.data.data || []

  // Handle Save (Create or Update)
  const saveProductMutation = useMutation({
    mutationFn: (data: ProductForm & { id?: string }) => {
      const normalizedData = normalizeProductData(data)
      return data.id
        ? productApi.updateProduct(normalizedData.id, normalizedData)
        : productApi.createProduct(normalizedData)
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(vars.id ? 'Updated successfully!' : 'Created successfully!')
      setIsProductModalOpen(false)
      setSelectedProduct(null)
    },
    onError: (error: any) => {
      // Parse lỗi Product (400 / 422) và toast chỉ ở đây
      const data = error?.response?.data
      let message = 'Something went wrong!'

      if (data?.errors) {
        if (Array.isArray(data.errors)) {
          message = data.errors.join('\n')
        } else if (typeof data.errors === 'object') {
          message = Object.values(data.errors).flat().join('\n')
        }
      } else if (data?.message) {
        message = data.message
      }

      toast.error(message)
      console.log('Product error:', message)
    }
  })

  // Handle Delete
  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => productApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product deleted successfully!')
      setIsConfirmOpen(false)
      setSelectedProduct(null)
    },
    onError: () => {
      toast.error('Unable to delete this product!')
    }
  })

  // --- 4. LOGIC TÌM KIẾM & THỐNG KÊ ---
  const stats = useMemo(
    () => ({
      total: products.length,
      // Low stock: Có hàng nhưng dưới 10
      lowStock: products.filter((p) => p.quantityInStock < 10 && p.quantityInStock > 0).length,
      // Out of stock: Bằng 0
      outOfStock: products.filter((p) => p.quantityInStock <= 0).length,
      // Active: Dựa theo enum trạng thái của bạn
      active: products.filter((p) => p.status === ProductStatusEnum.InStock).length
    }),
    [products]
  )

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()

    const filtered = products.filter((p) => {
      // 1. Search Term
      const matchesSearch = p.name.toLowerCase().includes(term)

      // 2. Category & Brand
      const matchesCategory = selectedCategoryId === '' || p.productCategoryId === selectedCategoryId
      const matchesBrand = selectedBrandId === '' || p.brandId === selectedBrandId

      // 3. Price Range
      const min = parseNumber(priceRange.min)
      const max = priceRange.max ? parseNumber(priceRange.max) : Infinity
      const matchesPrice = p.price >= min && p.price <= max

      // 4. MỚI: Lọc theo tình trạng kho (Giả định p.stock là số lượng tồn kho)
      let matchesStock = true
      if (stockStatus === 'low') {
        matchesStock = p.quantityInStock > 0 && p.quantityInStock < 10 // Dưới 10 là Low Stock
      } else if (stockStatus === 'out') {
        matchesStock = p.quantityInStock <= 0 // Bằng hoặc dưới 0 là Out Stock
      }

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesStock
    })

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    return {
      items: filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
      totalPages,
      totalItems: filtered.length // Trả về để hiện "Showing X products"
    }
  }, [products, searchTerm, currentPage, selectedCategoryId, selectedBrandId, priceRange, stockStatus])
  // --- 5. HANDLERS ---
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

  const handleConfirmDelete = () => {
    if (selectedProduct) {
      deleteProductMutation.mutate(selectedProduct.id)
    }
  }

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    // 1. Chuyển chuỗi có dấu chấm thành số thuần túy bằng hàm của bạn
    const numericValue = parseNumber(value)

    // 2. Nếu là số hợp lệ, format ngược lại thành chuỗi có dấu chấm để hiển thị
    // Nếu người dùng xóa hết thì để trống
    const displayValue = numericValue > 0 ? formatVND(numericValue) : ''

    setPriceRange((prev) => ({
      ...prev,
      [type]: displayValue
    }))

    setCurrentPage(1)
  }
  return (
    <div className='space-y-6 p-2 max-w-[1600px] mx-auto'>
      {/* HÀNG THỐNG KÊ NHỎ GỌN (Đặt phía trên cùng) */}
      <div className='flex flex-wrap items-center gap-y-2 gap-x-5 mb-4'>
        {/* Total */}
        <div className='flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800'>
          <div className='w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'></div>
          <span className='text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400'>
            Total:
          </span>
          <span className='text-xs font-bold text-gray-900 dark:text-white'>{stats.total}</span>
        </div>

        {/* Low Stock */}
        <div className='flex items-center gap-2 px-3 py-1.5 bg-amber-50/50 dark:bg-amber-500/5 rounded-lg border border-amber-100/50 dark:border-amber-500/10'>
          <div className='w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse'></div>
          <span className='text-[10px] font-black uppercase tracking-widest text-amber-600/80 dark:text-amber-400/80'>
            Low Stock:
          </span>
          <span className='text-xs font-bold text-amber-700 dark:text-amber-400'>{stats.lowStock}</span>
        </div>

        {/* Out of Stock */}
        <div className='flex items-center gap-2 px-3 py-1.5 bg-rose-50/50 dark:bg-rose-500/5 rounded-lg border border-rose-100/50 dark:border-rose-500/10'>
          <div className='w-1.5 h-1.5 rounded-full bg-rose-500'></div>
          <span className='text-[10px] font-black uppercase tracking-widest text-rose-600/80 dark:text-rose-400/80'>
            Out of Stock:
          </span>
          <span className='text-xs font-bold text-rose-700 dark:text-rose-400'>{stats.outOfStock}</span>
        </div>
      </div>

      {/* SEARCH & CREATE BAR */}
      <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
        <div className='relative w-full md:w-[450px] group'>
          <Search
            className='absolute left-4 top-3.5 text-gray-400 group-focus-within:text-brand-500 transition-colors'
            size={18}
          />
          <input
            type='text'
            placeholder='Search name or code...'
            className='w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 dark:text-white border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 shadow-sm text-sm'
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>

        {profile?.role === Role.STORE_STAFF && (
          <button
            onClick={handleOpenCreateModal}
            className='flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all active:scale-95'
          >
            <Plus size={18} /> Create Product
          </button>
        )}
      </div>

      {/* BỘ LỌC CHI TIẾT */}
      <div className='flex flex-wrap items-center gap-y-4 gap-x-6 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm'>
        {/* Stock Status Filter - MỚI */}
        <div className='flex items-center gap-3'>
          <span className='text-[10px] font-black uppercase text-gray-400 tracking-tighter'>Availability:</span>
          <div className='flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg gap-1'>
            {(['all', 'low', 'out'] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStockStatus(status)
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${
                  stockStatus === status
                    ? 'bg-white dark:bg-gray-700 text-brand-600 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {status === 'all' ? 'All' : status === 'low' ? 'Low' : 'Out'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className='flex items-center gap-2 border-l border-gray-100 dark:border-gray-800 pl-6'>
          <span className='text-[10px] font-black uppercase text-gray-400 tracking-tighter'>Category:</span>
          <select
            className='bg-transparent dark:text-gray-500 text-xs font-bold outline-none cursor-pointer'
            value={selectedCategoryId}
            onChange={(e) => {
              setSelectedCategoryId(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value=''>All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.categoryName}
              </option>
            ))}
          </select>
        </div>

        {/* Brand Filter */}
        <div className='flex items-center gap-2 border-l border-gray-100 dark:border-gray-800 pl-6'>
          <span className='text-[10px] font-black uppercase text-gray-400 tracking-tighter'>Brand:</span>
          <select
            className='bg-transparent dark:text-gray-500 text-xs font-bold outline-none cursor-pointer'
            value={selectedBrandId}
            onChange={(e) => {
              setSelectedBrandId(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value=''>All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className='flex items-center gap-3 border-l border-gray-100 dark:border-gray-800 pl-6'>
          <span className='text-[10px] font-black uppercase text-gray-400 tracking-tighter'>Price (VND):</span>
          <div className='flex items-center gap-2'>
            <input
              type='text'
              placeholder='From'
              className='w-20 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-brand-500 px-2 py-1.5 rounded-lg text-[11px] font-bold outline-none dark:text-gray-300 transition-all'
              value={priceRange.min}
              onChange={(e) => handlePriceChange('min', e.target.value)}
            />
            <span className='text-gray-300'>-</span>
            <input
              type='text'
              placeholder='To'
              className='w-20 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-brand-500 px-2 py-1.5 rounded-lg text-[11px] font-bold outline-none dark:text-gray-300 transition-all'
              value={priceRange.max}
              onChange={(e) => handlePriceChange('max', e.target.value)}
            />
          </div>
        </div>

        {/* Clear All */}
        {(selectedCategoryId ||
          selectedBrandId ||
          priceRange.min ||
          priceRange.max ||
          stockStatus !== 'all' ||
          searchTerm) && (
          <button
            onClick={() => {
              setSelectedCategoryId('')
              setSelectedBrandId('')
              setPriceRange({ min: '', max: '' })
              setSearchTerm('')
              setStockStatus('all')
            }}
            className='ml-auto flex items-center gap-1 text-[10px] font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 px-3 py-1.5 rounded-lg uppercase tracking-widest transition-all'
          >
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>

      {/* BẢNG SẢN PHẨM */}
      <div className='bg-white dark:bg-white/[0.02] rounded-[2.5rem] border border-gray-100 dark:border-white/[0.05] overflow-hidden shadow-sm'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader className='bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100'>
              <TableRow>
                <TableCell
                  isHeader
                  className='py-6 px-8 text-[10px] font-black uppercase tracking-widest text-gray-400'
                >
                  Product
                </TableCell>
                <TableCell
                  isHeader
                  className='py-6 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400'
                >
                  Price
                </TableCell>
                <TableCell
                  isHeader
                  className='py-6 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center'
                >
                  Stock
                </TableCell>
                <TableCell
                  isHeader
                  className='py-6 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center'
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className='py-6 px-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right'
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.items.map((product) => (
                <TableRow key={product.id} className='group hover:bg-gray-50/30 transition-all'>
                  <TableCell className='py-5 px-8'>
                    <div className='flex items-center gap-4'>
                      <img
                        src={product.images.find((img) => img.isThumbnail)?.imageUrl || '/placeholder.jpg'}
                        className='w-14 h-14 rounded-2xl object-cover shadow-sm'
                        alt=''
                      />
                      <div>
                        <p
                          title={product.name}
                          className='font-black text-gray-900 dark:text-white mb-1 leading-tight line-clamp-2 max-w-[250px]'
                        >
                          {product.name}
                        </p>
                        {/* <p className='text-[10px] text-gray-400 font-bold uppercase'>{product.brandId}</p> */}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className='px-4 font-black dark:text-white'>
                    {product.marketPrice.toLocaleString('vi-VN')} <span className='text-[9px] text-gray-400'>VND</span>
                  </TableCell>

                  <TableCell className='px-4 text-center'>
                    <div className='flex flex-col items-center gap-1.5'>
                      <div className='w-20 bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden'>
                        <div
                          className={`h-full rounded-full ${product.quantityInStock > 10 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${Math.min((product.quantityInStock / 50) * 100, 100)}%` }}
                        />
                      </div>
                      <span className='text-[10px] font-black'>{product.quantityInStock} pcs</span>
                    </div>
                  </TableCell>

                  <TableCell className='px-4 text-center'>
                    <span
                      className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${
                        product.status === ProductStatusEnum.InStock
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : product.status === ProductStatusEnum.OutOfStock
                            ? 'bg-rose-50 text-rose-600 border-rose-100'
                            : 'bg-gray-50 text-gray-600 border-gray-100'
                      }`}
                    >
                      {getStatusLabel(product.status)}
                    </span>
                  </TableCell>
                  <TableCell className='px-8 text-right'>
                    <div className='flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all'>
                      <button
                        onClick={() => handleOpenViewModal(product)}
                        className='p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-xl'
                        title='View'
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onViewReviews(product.id, product.name)}
                        className='p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl'
                        title='Reviews'
                      >
                        <MessageSquare size={16} />
                      </button>
                      {profile?.role === Role.STORE_STAFF && (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className='p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl'
                            title='Edit'
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProduct(product)
                              setIsConfirmOpen(true)
                            }}
                            className='p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl'
                            title='Delete'
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* PHÂN TRANG */}
        <div className='p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/30'>
          <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>
            Page {currentPage} / {filteredData.totalPages}
          </p>
          <div className='flex gap-2'>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className='px-4 py-2 text-[10px] font-black bg-white border rounded-xl disabled:opacity-50'
            >
              Prev
            </button>
            <button
              disabled={currentPage === filteredData.totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className='px-4 py-2 text-[10px] font-black bg-brand-600 text-white rounded-xl disabled:opacity-50'
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isProductModalOpen && (
        <ProductModal
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false)
            setSelectedProduct(null)
          }}
          product={selectedProduct}
          onSave={(data) => saveProductMutation.mutate(data)}
          isViewMode={isViewMode}
        />
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Delete Product'
        message={`Are you sure you want to delete "${selectedProduct?.name}"?`}
      />
    </div>
  )
}
