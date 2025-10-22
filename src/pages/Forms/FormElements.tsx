import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import PageMeta from '../../components/common/PageMeta'
import DropzoneComponent from '../../components/form/form-elements/DropZone'
import ProductInputField from '../../components/form/input/ProductInputField'
import ProductSelectField from '../../components/form/input/ProductSelectField'
import ProductTextAreaField from '../../components/form/input/ProductTextAreaField'

export default function FormElements() {
  // Dữ liệu mẫu options
  const statusOptions = [
    { value: 'selling', label: 'Đang bán' },
    { value: 'out_of_stock', label: 'Tạm hết' },
    { value: 'draft', label: 'Nháp' }
  ]
  const brandOptions = [
    { value: 'Brand A', label: 'Brand A' },
    { value: 'Brand B', label: 'Brand B' }
  ]
  const categoryOptions = [
    { value: 1, label: 'Dưỡng da' },
    { value: 2, label: 'Trang điểm' },
    { value: 3, label: 'Cơ thể' }
  ]

  return (
    // Sử dụng màu nền RẤT NHẸ để tạo độ sâu giữa nền và Card
    <div className='bg-gray-50 dark:bg-gray-900 min-h-screen pb-20'>
      <PageMeta
        title='Add New Product Form | Dashboard'
        description='Form to add a new product based on the Products database schema.'
      />

      {/* Breadcrumb và Title */}
      <div className='p-4 md:p-6'>
        <PageBreadcrumb pageTitle='Thêm Sản Phẩm Mới' />
      </div>

      {/* Container chính của Form */}
      <div className='flex flex-col gap-6 px-4 md:px-6'>
        {/* KHỐI 1: THÔNG TIN CƠ BẢN VÀ PHÂN LOẠI */}
        {/* Card Tối giản: Góc bo vừa phải, shadow nhẹ */}
        <div className='rounded-xl border border-gray-100 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 p-8'>
          <h2 className='mb-6 text-2xl font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-3'>
            Thông Tin Chung
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <ProductInputField label='Tên Sản Phẩm' id='Name' type='text' placeholder='Ví dụ: Tinh chất dưỡng ẩm' />
            <ProductInputField
              label='Tên Tiếng Anh'
              id='EnglishName'
              type='text'
              placeholder='Ví dụ: Hydrating Serum'
            />
            <ProductSelectField
              label='Trạng Thái Sản Phẩm'
              id='ProductStatusId'
              options={statusOptions}
              placeholder='Chọn trạng thái'
            />
            <ProductSelectField
              label='Thương Hiệu (Brand)'
              id='BrandId'
              options={brandOptions}
              placeholder='Chọn thương hiệu'
            />
            <ProductSelectField
              label='Danh Mục Sản Phẩm'
              id='ProductCategoryId'
              options={categoryOptions}
              placeholder='Chọn danh mục'
            />
          </div>
        </div>

        {/* KHỐI 2: GIÁ CẢ & TỒN KHO & MEDIA */}
        <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
          {/* CỘT PHỤ BÊN TRÁI: Giá cả */}
          <div className='xl:col-span-2 rounded-xl border border-gray-100 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 p-8'>
            <h2 className='mb-6 text-2xl font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-3'>
              Giá và Số lượng
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <ProductInputField label='Giá Bán (VND)' id='Price' type='number' placeholder='0' />
              <ProductInputField label='Giá Thị Trường' id='MarketPrice' type='number' placeholder='0' />
              <ProductInputField label='Ngày Hết Hạn' id='ExpiryDate' type='date' />
              <ProductInputField label='Số Lượng Đã Bán' id='SoldCount' type='number' placeholder='0' />
            </div>
          </div>

          {/* CỘT PHỤ BÊN PHẢI: Tải ảnh */}
          <div className='xl:col-span-1 rounded-xl border border-gray-100 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 p-8 flex flex-col justify-between'>
            <div>
              <h2 className='mb-4 text-2xl font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-3'>
                Media
              </h2>
              <label className='mb-2.5 block text-gray-700 dark:text-gray-300 font-medium'>Hình Ảnh Sản Phẩm</label>
              <DropzoneComponent />
              <p className='mt-3 text-sm text-gray-500 dark:text-gray-400'>
                Tải lên tối đa 5 hình ảnh (bao gồm thumbnail), dung lượng dưới 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* KHỐI 3: MÔ TẢ CHI TIẾT VÀ HƯỚNG DẪN */}
        <div className='rounded-xl border border-gray-100 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 p-8'>
          <h2 className='mb-6 text-2xl font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-3'>
            Mô Tả và Hướng Dẫn
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Cột Trái: Mô tả chính */}
            <div className='space-y-6'>
              <ProductTextAreaField
                label='Mô Tả Sản Phẩm'
                id='Description'
                placeholder='Mô tả chi tiết sản phẩm...'
                rows={5}
              />
              <ProductTextAreaField
                label='Chức Năng Chính'
                id='MainFunction'
                placeholder='Tóm tắt công dụng chính...'
                rows={3}
              />
              <ProductTextAreaField
                label='Hướng Dẫn Sử Dụng'
                id='UsageInstruction'
                placeholder='Các bước hướng dẫn sử dụng...'
                rows={3}
              />
            </div>
            {/* Cột Phải: Thành phần */}
            <div className='space-y-6'>
              <ProductTextAreaField
                label='Thành Phần Chi Tiết'
                id='DetailedIngredients'
                placeholder='Danh sách đầy đủ các thành phần...'
                rows={5}
              />
              <ProductTextAreaField
                label='Thành Phần Hoạt Tính Chính'
                id='KeyActiveIngredients'
                placeholder='Các hoạt chất nổi bật...'
                rows={3}
              />
              <ProductTextAreaField
                label='Hướng Dẫn Bảo Quản'
                id='StorageInstruction'
                placeholder='Lưu ý về cách bảo quản...'
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Nút Submit - Tối giản */}
      <div
        className='
        sticky bottom-0 
        bg-white/95 dark:bg-gray-800/95 
        backdrop-blur-sm 
        border-t border-gray-200 dark:border-gray-700 
        p-4 flex justify-end 
        mt-10 z-20 
      '
      >
        <button
          // onClick={onClick}
          className='flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition'
        >
          Lưu sản phẩm
        </button>
      </div>
    </div>
  )
}
