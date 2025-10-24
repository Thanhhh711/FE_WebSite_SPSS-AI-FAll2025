/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { Tag, DollarSign, Calendar, Package, Factory, LayoutList, CheckCircle, Home } from 'lucide-react'

// --- 1. Component PageMeta (Tích hợp) ---
// Thay thế PageMeta component
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PageMeta = ({ title, description }: { title: string; description: string }) => {
  // Trong môi trường Immersive, chúng ta chỉ giả lập việc đặt tiêu đề
  React.useEffect(() => {
    document.title = title || 'Dashboard'
    // console.log(`Meta Title Set: ${title}`);
  }, [title])

  return null // Component này không render gì trong DOM
}

// --- 2. Component PageBreadcrumb (Tích hợp) ---
// Thay thế PageBreadcrumb component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PageBreadcrumb = ({ pageTitle }: any) => (
  <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
    <h2 className='text-2xl font-semibold text-gray-800 dark:text-white'>{pageTitle}</h2>
    <nav>
      <ol className='flex items-center gap-2'>
        <li>
          {/* Giả định Link component của Router */}
          <a
            href='/'
            className='flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500 transition-colors'
          >
            <Home className='w-4 h-4 mr-1' /> Trang chủ
          </a>
        </li>
        <li className='text-gray-500 dark:text-gray-400'>/</li>
        <li className='text-blue-600 dark:text-blue-500 font-medium'>{pageTitle}</li>
      </ol>
    </nav>
  </div>
)

// --- Dữ liệu Mẫu (Mock Data) ---
const mockProduct = {
  id: 'PRD001',
  name: 'Tinh chất dưỡng ẩm chuyên sâu',
  englishName: 'Deep Hydration Serum',
  status: 'selling', // selling | out_of_stock | draft
  brand: 'Brand A',
  category: 'Dưỡng da',
  price: 750000,
  marketPrice: 900000,
  expiryDate: '2026-06-30',
  soldCount: 1250,
  description:
    'Sản phẩm tinh chất dưỡng ẩm với công thức đột phá, chứa Hyaluronic Acid đa phân tử giúp thẩm thấu sâu, cấp nước tức thì và duy trì độ ẩm suốt 24 giờ. Lý tưởng cho mọi loại da, đặc biệt là da khô và da nhạy cảm.',
  mainFunction: 'Cấp ẩm sâu, làm dịu da, tăng độ đàn hồi, chống lão hóa nhẹ.',
  usageInstruction:
    'Sau khi rửa mặt và dùng toner, lấy 2-3 giọt tinh chất thoa đều lên mặt và cổ. Vỗ nhẹ cho tinh chất thấm hoàn toàn. Sử dụng hai lần mỗi ngày vào buổi sáng và tối.',
  detailedIngredients:
    'Aqua (Nước cất), Glycerin, Sodium Hyaluronate (đa phân tử), Panthenol (B5), Chiết xuất rau má (Centella Asiatica), Allantoin, Phenoxyethanol.',
  keyActiveIngredients: 'Hyaluronic Acid, Panthenol, Centella Asiatica.',
  storageInstruction: 'Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp. Đóng chặt nắp sau khi sử dụng.',
  images: ['https://placehold.co/400x400/2563EB/FFFFFF?text=Product+Image+1']
}

// --- Component Card Item cho Chi tiết (Detail Item) ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DetailItem = ({ icon: Icon, label, value }: any) => (
  <div className='flex items-start space-x-3'>
    <div className='flex-shrink-0 p-2 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'>
      <Icon className='w-5 h-5' />
    </div>
    <div className='overflow-hidden'>
      <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>{label}</p>
      <p className='text-lg font-semibold text-gray-800 dark:text-white truncate'>{value}</p>
    </div>
  </div>
)

// --- Component Chính: ProductDetail ---
export default function ProductDetail() {
  const product = mockProduct

  // Hàm chuyển đổi trạng thái thành màu sắc và nhãn
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getStatusDisplay = (status: any) => {
    switch (status) {
      case 'selling':
        return {
          label: 'Đang Bán',
          color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
          icon: CheckCircle
        }
      case 'out_of_stock':
        return {
          label: 'Tạm Hết',
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
          icon: Package
        }
      case 'draft':
      default:
        return { label: 'Nháp', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300', icon: Tag }
    }
  }

  const statusDisplay = getStatusDisplay(product.status)
  const StatusIcon = statusDisplay.icon

  // Định dạng tiền tệ
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatCurrency = (amount: any) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

  // Định dạng ngày
  const formatDate = (dateString?: string | Date | null): string => {
    if (!dateString) return 'N/A'

    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Date'

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className='bg-gray-50 dark:bg-gray-900 min-h-screen pb-20'>
      <PageMeta
        title={`${product.name} Detail | Dashboard`}
        description={`Detailed view of product ${product.name}.`}
      />

      {/* Breadcrumb và Title */}
      <div className='p-4 md:p-6'>
        <PageBreadcrumb pageTitle={`Chi Tiết Sản Phẩm: ${product.name}`} />
      </div>

      {/* Container chính */}
      <div className='flex flex-col gap-6 px-4 md:px-6'>
        {/* KHỐI CHÍNH: MEDIA & THÔNG TIN CƠ BẢN */}
        <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
          {/* CỘT TRÁI: MEDIA & TÓM TẮT */}
          <div className='xl:col-span-1 rounded-xl border border-gray-100 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 p-6'>
            <h2 className='text-2xl font-bold text-gray-800 dark:text-white mb-2'>{product.name}</h2>
            <p className='text-gray-500 dark:text-gray-400 text-sm mb-4 italic'>({product.englishName})</p>

            {/* Hình ảnh chính */}
            <div className='mb-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600'>
              {/* Placeholder image for product */}
              <img
                src={product.images[0]}
                alt={product.name}
                className='object-cover w-full h-auto aspect-square'
                onError={(e: any) => {
                  e.target.onerror = null
                  e.target.src = 'https://placehold.co/400x400/94A3B8/FFFFFF?text=No+Image'
                }}
              />
            </div>

            {/* Trạng thái */}
            <div className='flex items-center justify-center p-3 rounded-lg border border-gray-200 dark:border-gray-700'>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusDisplay.color}`}
              >
                <StatusIcon className='w-4 h-4 mr-2' />
                {statusDisplay.label}
              </span>
            </div>
          </div>

          {/* CỘT PHẢI: CHI TIẾT & GIÁ CẢ */}
          <div className='xl:col-span-2 rounded-xl border border-gray-100 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 p-8'>
            <h3 className='mb-6 text-2xl font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-3'>
              Thông Số Kỹ Thuật
            </h3>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
              <DetailItem icon={DollarSign} label='Giá Bán' value={formatCurrency(product.price)} />
              <DetailItem icon={DollarSign} label='Giá Thị Trường' value={formatCurrency(product.marketPrice)} />
              <DetailItem icon={LayoutList} label='Danh Mục' value={product.category} />
              <DetailItem icon={Factory} label='Thương Hiệu' value={product.brand} />
              <DetailItem icon={Calendar} label='Ngày Hết Hạn' value={formatDate(product.expiryDate)} />
              <DetailItem icon={Package} label='Số Lượng Đã Bán' value={`${product.soldCount} đơn`} />
            </div>

            <h3 className='mt-10 mb-6 text-2xl font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-3'>
              Mô Tả Sản Phẩm
            </h3>
            <p className='text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed'>
              {product.description}
            </p>
          </div>
        </div>

        {/* KHỐI 2: MÔ TẢ CHI TIẾT & HƯỚNG DẪN */}
        <div className='rounded-xl border border-gray-100 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 p-8'>
          <h3 className='mb-6 text-2xl font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-3'>
            Chi Tiết Ứng Dụng
          </h3>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* 1. Chức năng chính */}
            <div>
              <h4 className='mb-3 text-lg font-semibold text-gray-800 dark:text-white'>Chức Năng Chính</h4>
              <p className='text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed'>
                {product.mainFunction}
              </p>
            </div>

            {/* 2. Hướng dẫn sử dụng */}
            <div>
              <h4 className='mb-3 text-lg font-semibold text-gray-800 dark:text-white'>Hướng Dẫn Sử Dụng</h4>
              <p className='text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed'>
                {product.usageInstruction}
              </p>
            </div>

            {/* 3. Hướng dẫn bảo quản */}
            <div>
              <h4 className='mb-3 text-lg font-semibold text-gray-800 dark:text-white'>Hướng Dẫn Bảo Quản</h4>
              <p className='text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed'>
                {product.storageInstruction}
              </p>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 border-t border-gray-200 dark:border-gray-600 pt-8'>
            {/* 4. Thành phần chính */}
            <div>
              <h4 className='mb-3 text-lg font-semibold text-gray-800 dark:text-white'>Thành Phần Hoạt Tính Chính</h4>
              <p className='text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed'>
                {product.keyActiveIngredients}
              </p>
            </div>

            {/* 5. Thành phần chi tiết */}
            <div>
              <h4 className='mb-3 text-lg font-semibold text-gray-800 dark:text-white'>Thành Phần Chi Tiết</h4>
              <p className='text-gray-600 dark:text-gray-400 whitespace-pre-wrap text-sm leading-relaxed'>
                {product.detailedIngredients}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nút Action - Sửa sản phẩm */}
      {/* Đã giảm Z-Index ở đây thành z-10 để nút không che modal (nếu có) */}
      <div
        className='
        sticky bottom-0 
        bg-white/95 dark:bg-gray-800/95 
        backdrop-blur-sm 
        border-t border-gray-200 dark:border-gray-700 
        p-4 flex justify-end 
        mt-10 z-10 
      '
      >
        <button className='flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition'>
          Chỉnh Sửa Sản Phẩm
        </button>
      </div>
    </div>
  )
}
