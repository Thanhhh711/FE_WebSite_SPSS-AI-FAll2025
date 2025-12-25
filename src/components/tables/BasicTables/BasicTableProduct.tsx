/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { Search, Plus, Package, AlertTriangle, CheckCircle2, Eye, Edit3, Trash2, MessageSquare } from 'lucide-react'

import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import { productApi } from '../../../api/product.api'
import { Role } from '../../../constants/Roles'
import { useAppContext } from '../../../context/AuthContext'
import { Product, ProductForm, ProductStatusEnum } from '../../../types/product.type'
import { formatVND, normalizeProductData, parseNumber } from '../../../utils/validForm'
import ProductModal from '../../ProductModal/ProductModal'
import { categoryApi } from '../../../api/category.api'
import brandApi from '../../../api/brand.api'

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
const StatCard = ({ title, count, icon, color }: any) => (
  <div className='bg-white dark:bg-gray-800/40 p-6 rounded-[2rem] border border-gray-100 dark:border-white/[0.05] shadow-sm flex items-center justify-between group hover:shadow-md transition-all'>
    <div>
      <p className='text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1'>{title}</p>
      <h3 className='text-2xl font-black text-gray-900 dark:text-white tracking-tight'>{count}</h3>
    </div>
    <div className={`p-4 rounded-2xl ${color}`}>{icon}</div>
  </div>
)

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
      toast.error(error?.response?.data?.message || 'Something went wrong!')
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
      lowStock: products.filter((p) => p.quantityInStock < 10 && p.quantityInStock > 0).length,
      active: products.filter((p) => p.status === ProductStatusEnum.InStock).length
    }),
    [products]
  )

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()

    const filtered = products.filter((p) => {
      // 1. Lọc theo Search Term
      const matchesSearch = p.name.toLowerCase().includes(term)

      // 2. Lọc theo Category ID (Dựa trên cấu trúc Category của bạn)
      const matchesCategory = selectedCategoryId === '' || p.productCategoryId === selectedCategoryId

      // 3. Lọc theo Brand ID
      const matchesBrand = selectedBrandId === '' || p.brandId === selectedBrandId

      // 4. Lọc theo Price
      const min = parseNumber(priceRange.min) // Chuyển "1.000" -> 1000
      const max = priceRange.max ? parseNumber(priceRange.max) : Infinity

      const matchesPrice = p.price >= min && p.price <= max

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice
    })

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    return {
      items: filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
      totalPages
    }
  }, [products, searchTerm, currentPage, selectedCategoryId, selectedBrandId, priceRange])
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
    <div className='space-y-8 p-2 max-w-[1600px] mx-auto'>
      {/* THẺ THỐNG KÊ */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
        <StatCard
          title='Total Products'
          count={stats.total}
          color='bg-blue-50 text-blue-600'
          icon={<Package size={24} />}
        />
        <StatCard
          title='Low Stock'
          count={stats.lowStock}
          color='bg-amber-50 text-amber-600'
          icon={<AlertTriangle size={24} />}
        />
        <StatCard
          title='In Stock'
          count={stats.active}
          color='bg-emerald-50 text-emerald-600'
          icon={<CheckCircle2 size={24} />}
        />
      </div>

      {/* THANH CÔNG CỤ (Search & Create) */}
      {/* THANH CÔNG CỤ (Search & Filters) */}
      <div className='flex flex-col gap-4 mb-6'>
        <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
          {/* Ô Search cũ */}
          <div className='relative w-full md:w-96 group'>
            <Search
              className='absolute left-4 top-3.5 text-gray-400 group-focus-within:text-brand-500 transition-colors'
              size={20}
            />
            <input
              type='text'
              placeholder='Search products...'
              className='w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-900 dark:text-white border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 shadow-sm'
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
              className='w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-700 shadow-lg transition-all active:scale-95'
            >
              <Plus size={20} /> Create Product
            </button>
          )}
        </div>

        {/* HÀNG BỘ LỌC MỚI (Category, Brand, Price) */}
        <div className='flex flex-wrap items-center gap-4 bg-gray-50/50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 mb-6'>
          {/* Filter Category */}
          <div className='flex items-center gap-2'>
            <span className='text-[10px] font-black uppercase text-gray-400'>Category:</span>
            <select
              className='bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500 dark:text-gray-300'
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

          {/* Filter Brand */}
          <div className='flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-4'>
            <span className='text-[10px] font-black uppercase text-gray-400'>Brand:</span>
            <select
              className='bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500 dark:text-gray-300'
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

          {/* Filter Price */}
          <div className='flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-4'>
            <span className='text-[10px] font-black uppercase text-gray-400 tracking-wider'>Price Range:</span>

            <div className='flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-brand-500 transition-all'>
              {/* Min Price Input */}
              <input
                type='text'
                placeholder='From (VND)'
                className='w-24 bg-transparent text-xs font-bold outline-none dark:text-gray-300'
                value={priceRange.min}
                onChange={(e) => handlePriceChange('min', e.target.value)}
              />

              <span className='text-gray-300 font-light'>-</span>

              {/* Max Price Input */}
              <input
                type='text'
                placeholder='To (VND)'
                className='w-24 bg-transparent text-xs font-bold outline-none dark:text-gray-300'
                value={priceRange.max}
                onChange={(e) => handlePriceChange('max', e.target.value)}
              />
            </div>
          </div>
          {/* Reset Button */}
          {(selectedCategoryId || selectedBrandId || priceRange.min || priceRange.max) && (
            <button
              onClick={() => {
                setSelectedCategoryId('')
                setSelectedBrandId('')
                setPriceRange({ min: '', max: '' })
                setSearchTerm('')
              }}
              className='ml-auto text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-tighter transition-colors'
            >
              Clear All
            </button>
          )}
        </div>
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
                    {product.price.toLocaleString('vi-VN')} <span className='text-[9px] text-gray-400'>VND</span>
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
