/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import { categoryApi } from '../../api/category.api'
import { ProductForm, ProductImage, ProductImageForm, ProductStatusEnum } from '../../types/product.type'
import { formatVND } from '../../utils/validForm'
import ModalPhotoViewer from './ModalPhotoViewer'

export type NewUploadedImage = ProductImageForm & { imagePath: string }
export interface ProductFormState extends Omit<ProductForm, 'images' | 'expiryDate'> {
  images: (ProductImage | NewUploadedImage)[]
}

interface SelectOption {
  value: string | number
  label: string
}

interface Image {
  id?: number | string
  imagePath?: string
  imageUrl: string // URL của ảnh
}
// ------------------------------------

interface ProductFormFieldsProps {
  form: ProductFormState
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleVideoFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleRemoveImagePreview: (index: number) => void
  handleRemoveVideo: () => void
  imagePreviews: string[]
  isViewMode: boolean
  isUploading: boolean
  handleRemoveExistingImage: (imageUrl: string) => void
  skinConditionsOptions: SelectOption[]
  skinTypesOptions: SelectOption[]
  variationOptions: SelectOption[]
  brandOptions: SelectOption[]
  categoryOptions: SelectOption[]
}

const baseInputClass =
  'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-800'
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'

const STATUS_MAP: { [key: number]: string } = {
  [ProductStatusEnum.InStock]: 'In Stock (Active)',
  [ProductStatusEnum.OutOfStock]: 'Out of Stock',
  [ProductStatusEnum.Archived]: 'Archived'
}
const getStatusText = (status: ProductStatusEnum): string => STATUS_MAP[status] || 'Unknown'

const Field = ({
  id,
  label,
  value,
  type = 'text',
  rows = 1,
  isRequired = false,
  options = [],
  min = 0,
  isMulti = false,
  handleChange,
  isViewMode,
  error // <--- Nhận prop error từ component cha
}: {
  id: keyof ProductFormState
  label: string
  value: any
  type?: 'text' | 'number' | 'textarea' | 'select' | 'date'
  rows?: number
  isRequired?: boolean
  options?: SelectOption[]
  min?: number
  isMulti?: boolean
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  isViewMode: boolean
  error?: string
}) => (
  <div className='flex flex-col gap-1.5'>
    {/* Label chuyển màu đỏ nếu có lỗi */}
    <label htmlFor={id as string} className={`${labelClass} ${error ? 'text-rose-500' : ''}`}>
      {label} {isRequired && <span className='text-rose-500'>*</span>}
    </label>

    <div className='relative'>
      {type === 'textarea' ? (
        <textarea
          id={id as string}
          rows={rows}
          value={value || ''}
          onChange={handleChange}
          disabled={isViewMode}
          className={`${baseInputClass} min-h-[100px] ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
              : 'border-gray-100 focus:border-brand-500'
          }`}
        />
      ) : type === 'select' ? (
        <select
          id={id as string}
          value={isMulti ? value : value || ''}
          onChange={handleChange}
          disabled={isViewMode}
          multiple={isMulti}
          className={`${baseInputClass} ${isMulti ? ' h-[150px]' : ''} ${
            error ? 'border-rose-400 focus:border-rose-500' : 'border-gray-100 focus:border-brand-500'
          }`}
        >
          {!isMulti && (
            <option value='' disabled>
              Select an option
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id as string}
          type={type === 'date' ? 'date' : type}
          value={value || ''}
          onChange={handleChange}
          min={min}
          disabled={isViewMode}
          className={`${baseInputClass} ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
              : 'border-gray-100 focus:border-brand-500'
          }`}
        />
      )}

      {/* Icon cảnh báo nhỏ ở góc phải input nếu có lỗi */}
      {error && !isViewMode && (
        <div className='absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 pointer-events-none animate-in zoom-in'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='3'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <circle cx='12' cy='12' r='10' />
            <line x1='12' y1='8' x2='12' y2='12' />
            <line x1='12' y1='16' x2='12.01' y2='16' />
          </svg>
        </div>
      )}
    </div>

    {error && !isViewMode && (
      <span className='text-[10px] font-black text-rose-500 uppercase tracking-tight ml-1 animate-in fade-in slide-in-from-top-1'>
        {error}
      </span>
    )}
  </div>
)
export default function ProductFormFields({
  form,
  handleChange,
  handleImageFileChange,
  handleVideoFileChange,
  handleRemoveImagePreview,
  handleRemoveExistingImage,
  handleRemoveVideo,
  imagePreviews,
  isViewMode,
  isUploading,
  skinConditionsOptions,
  skinTypesOptions,
  variationOptions,
  brandOptions,
  categoryOptions
}: ProductFormFieldsProps) {
  // --- VIEW MODE --- (Hiển thị tĩnh, không có controls)

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(-1)
  const [categoryName, setCategoryName] = useState('')
  const isModalOpen = currentImageIndex !== -1
  const currentImageUrl = isModalOpen ? form.images[currentImageIndex]?.imageUrl : ''
  const [errors] = useState<Partial<Record<keyof ProductFormState, string>>>({})
  // --- 2. HÀM XỬ LÝ SỰ KIỆN ---

  const openImage = (clickedImage: Image) => {
    // Tìm index của ảnh được click
    const index = form.images.findIndex(
      (img) =>
        ('id' in img && 'id' in clickedImage && img.id === clickedImage.id) || img.imageUrl === clickedImage.imageUrl
    )
    if (index !== -1) {
      setCurrentImageIndex(index)
    }
  }

  // const validateForm = () => {
  //   const newErrors: any = {}

  //   if (!form.name.trim()) newErrors.name = 'Product name is required'
  //   if (form.price <= 0) newErrors.price = 'Price must be greater than 0'
  //   if (form.quantityInStock < 0) newErrors.quantityInStock = 'Quantity cannot be negative'
  //   if (form.description.length < 10) newErrors.description = 'Description must be at least 10 characters'

  //   setErrors(newErrors)
  //   return Object.keys(newErrors).length === 0
  // }

  const closeModal = () => {
    setCurrentImageIndex(-1)
  }

  const handlePrev = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentImageIndex < form.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  useEffect(() => {
    if (!form.productCategoryId) {
      setCategoryName('Chưa xác định')
      return
    }

    const fetchCategory = async () => {
      try {
        setCategoryName('Đang tải...')
        const categoryData = await categoryApi.getCategoryById(form.productCategoryId)
        setCategoryName(categoryData.data.data.categoryName)
      } catch (error) {
        console.error('Error fetching category:', error)
        setCategoryName('Lỗi tải Category')
      }
    }

    fetchCategory()
  }, [form.productCategoryId])

  // const handleSubmit = () => {
  //   const isValid = validateForm()

  //   if (isValid) {
  //     // Nếu dữ liệu hợp lệ, mới gọi hàm onSave từ props truyền vào
  //     onSave(form)
  //     setErrors({}) // Xóa lỗi cũ
  //   } else {
  //     toast.error('Vui lòng kiểm tra lại các thông tin còn thiếu!')
  //   }
  // }

  if (isViewMode) {
    return (
      <div className='space-y-6'>
        <div className='p-6 bg-white dark:bg-gray-800   shadow-xl rounded-xl'>
          <h3 className='text-2xl font-extrabold text-brand-700 dark:text-brand-300 mb-4 border-b pb-3'>
            {form.name}
            {form.englishName && (
              <span className='text-lg font-light text-gray-500 dark:text-gray-400 ml-2'>({form.englishName})</span>
            )}
          </h3>
          <dl className='grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700 pt-4'>
            <div className='flex items-center'>
              <dt className='flex items-center font-semibold text-gray-500 dark:text-gray-400 w-1/3 min-w-[120px]'>
                <svg
                  className='w-5 h-5 mr-2 text-blue-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z'
                  ></path>
                </svg>
                Category:
              </dt>
              <dd className='font-bold ml-2 text-gray-800 dark:text-gray-200'>{categoryName}</dd>
            </div>

            <div className='flex items-center'>
              <dt className='flex items-center font-semibold text-gray-500 dark:text-gray-400 w-1/3 min-w-[120px]'>
                <svg
                  className='w-5 h-5 mr-2 text-purple-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  ></path>
                </svg>
                Status:
              </dt>
              <dd className='ml-2'>{getStatusText(form.status)}</dd>
            </div>

            <div className='flex items-center col-span-1 sm:col-span-2 border-t border-dashed border-gray-300 dark:border-gray-600 pt-4'>
              <dt className='flex items-center font-semibold text-gray-600 dark:text-gray-400 w-1/3 min-w-[120px]'>
                <svg
                  className='w-6 h-6 mr-2 text-red-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M7 7h.01M12 7v3m-3 0h6m4 12V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14l4-2 4 2 4-2 4 2z'
                  ></path>
                </svg>
                Selling Price:
              </dt>
              <dd className='text-3xl font-extrabold text-red-600 dark:text-red-400 ml-2 animate-pulse'>
                {form.price.toLocaleString('vi-VN')}
                <span className='text-base font-semibold ml-1'>VND</span>
              </dd>
            </div>

            {/* 4. Giá Thị trường (Market Price) */}
            <div className='flex items-center'>
              <dt className='flex items-center font-semibold text-gray-500 dark:text-gray-400 w-1/3 min-w-[120px]'>
                {/* Icon: Shopping Bag */}
                <svg
                  className='w-5 h-5 mr-2 text-gray-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
                  ></path>
                </svg>
                Market Price:
              </dt>
              <dd className='text-sm line-through text-gray-400 dark:text-gray-500 ml-2'>
                {form.marketPrice > 0 ? `${form.marketPrice.toLocaleString('vi-VN')} VND` : 'N/A'}
              </dd>
            </div>

            {/* 5. Số lượng tồn kho (Quantity) */}
            <div className='flex items-center'>
              <dt className='flex items-center font-semibold text-gray-500 dark:text-gray-400 w-1/3 min-w-[120px]'>
                {/* Icon: Stock */}
                <svg
                  className='w-5 h-5 mr-2 text-green-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4'
                  ></path>
                </svg>
                In Stock:
              </dt>
              <dd className='font-medium text-lg text-blue-600 dark:text-blue-400 ml-2'>
                {form.quantityInStock.toLocaleString('vi-VN')}
              </dd>
            </div>
          </dl>
        </div>

        {/* -------------------- PHẦN 2: MÔ TẢ & HƯỚNG DẪN -------------------- */}
        <div className='p-6 bg-white dark:bg-gray-800 shadow-xl rounded-xl space-y-4'>
          <h3 className='text-lg font-bold text-brand-600 dark:text-brand-400 border-b pb-2'>
            Description & Instructions
          </h3>
          {/* Mô tả (Description) */}
          <div>
            <h4 className='font-bold text-gray-700 dark:text-gray-300 mb-1'>Description:</h4>
            <p className='whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400 p-2 border border-gray-200 dark:border-gray-700 rounded'>
              {form.description || 'N/A'}
            </p>
          </div>

          {/* Hướng dẫn sử dụng (Usage Instruction) */}
          <div>
            <h4 className='font-bold text-gray-700 dark:text-gray-300 mb-1'>Usage Instruction:</h4>
            <p className='whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400 p-2 border border-gray-200 dark:border-gray-700 rounded'>
              {form.usageInstruction || 'N/A'}
            </p>
          </div>
        </div>

        {/* -------------------- PHẦN 3: MEDIA (Ảnh & Video) -------------------- */}
        {(form.images.length > 0 || form.videoUrl) && (
          <div className='p-6 bg-white dark:bg-gray-800 shadow-xl rounded-xl'>
            <h3 className='text-lg font-bold text-brand-600 dark:text-brand-400 border-b pb-2 mb-4'>Media Gallery</h3>

            {/* Khu vực Hiển thị Ảnh */}
            {form.images.length > 0 && (
              <div className='mb-4'>
                <h4 className='font-semibold mb-2'>Images:</h4>
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>
                  {form.images.map((image) => (
                    <img
                      key={'id' in image ? image.id : image.imagePath}
                      src={image.imageUrl}
                      alt='Product'
                      className='w-full aspect-square object-cover rounded-lg shadow-md hover:shadow-lg transition duration-200 cursor-pointer'
                      // Thêm onClick để mở modal xem ảnh lớn tại đây
                      onClick={() => openImage(image)}
                    />
                  ))}
                </div>
              </div>
            )}
            <ModalPhotoViewer
              isOpen={isModalOpen}
              onClose={closeModal}
              imageUrl={currentImageUrl}
              // Truyền hàm chuyển ảnh cho Modal
              onPrev={currentImageIndex > 0 ? handlePrev : undefined}
              onNext={currentImageIndex < form.images.length - 1 ? handleNext : undefined}
            />

            {/* Khu vực Hiển thị Video */}
            {form.videoUrl && (
              <div className='pt-4'>
                <h4 className='font-semibold mb-2'>Video:</h4>
                <div className='aspect-video w-full max-w-lg rounded-lg overflow-hidden shadow-lg'>
                  <video
                    src={form.videoUrl}
                    controls
                    className='w-full h-full object-cover'
                    // Thêm poster nếu có thumbnail
                    // poster={form.videoThumbnailUrl}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
  // --- EDIT/CREATE MODE ---
  return (
    <div className='space-y-6 p-6'>
      {/* --- 1. BASIC INFO & PRICING --- */}
      <div className='space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg'>
        <h3 className='text-lg font-bold text-brand-600 dark:text-brand-400'>1. Basic Info & Pricing</h3>
        <Field
          id='name'
          label='Product Name'
          value={form.name}
          isRequired={true}
          handleChange={handleChange}
          isViewMode={isViewMode}
          error={errors.name}
        />
        <Field
          id='englishName'
          label='English Name'
          value={form.englishName}
          handleChange={handleChange}
          isViewMode={isViewMode}
          error={errors.englishName}
        />

        <div className='grid grid-cols-2 gap-4'>
          <div className='relative'>
            <Field
              id='price'
              label='Price (VND)'
              value={form.price}
              type='number'
              isRequired={true}
              handleChange={handleChange}
              isViewMode={isViewMode}
              error={errors.price}
            />
            {!isViewMode && (
              <p className='absolute right-2 top-9 text-[10px] font-black text-brand-500 uppercase'>
                {formatVND(form.price)}
              </p>
            )}
          </div>

          <div className='relative'>
            <Field
              id='marketPrice'
              label='Market Price (VND)'
              value={form.marketPrice}
              type='number'
              handleChange={handleChange}
              isViewMode={isViewMode}
              error={errors.marketPrice}
            />
            {!isViewMode && (
              <p className='absolute right-2 top-9 text-[10px] font-black text-brand-500 uppercase'>
                {formatVND(form.marketPrice)}
              </p>
            )}
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          {/* Sử dụng brandOptions và categoryOptions được lấy từ API Categories */}
          <Field
            id='brandId'
            label='Brand'
            value={form.brandId}
            type='select'
            options={brandOptions}
            handleChange={handleChange}
            isViewMode={isViewMode}
            error={errors.brandId}
          />
          <Field
            id='productCategoryId'
            label='Category'
            value={form.productCategoryId}
            type='select'
            options={categoryOptions}
            handleChange={handleChange}
            isViewMode={isViewMode}
            error={errors.productCategoryId}
          />
        </div>
        <Field
          id='status'
          label='Status'
          value={form.status}
          type='select'
          options={[
            { value: ProductStatusEnum.InStock, label: getStatusText(ProductStatusEnum.InStock) },
            { value: ProductStatusEnum.OutOfStock, label: getStatusText(ProductStatusEnum.OutOfStock) },
            { value: ProductStatusEnum.Archived, label: getStatusText(ProductStatusEnum.Archived) }
          ]}
          handleChange={handleChange}
          isViewMode={isViewMode}
        />
      </div>

      {/* --- 2. DESCRIPTIONS & INSTRUCTIONS --- */}
      <div className='space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg'>
        <h3 className='text-lg font-bold text-brand-600 dark:text-brand-400'>2. Description & Instructions</h3>
        <Field
          id='description'
          label='Description'
          value={form.description}
          type='textarea'
          rows={5}
          isRequired={true}
          handleChange={handleChange}
          isViewMode={isViewMode}
        />
        <Field
          id='mainFunction'
          label='Main Function'
          value={form.mainFunction}
          type='textarea'
          rows={3}
          handleChange={handleChange}
          isViewMode={isViewMode}
        />
        <Field
          id='usageInstruction'
          label='Usage Instruction'
          value={form.usageInstruction}
          type='textarea'
          rows={3}
          handleChange={handleChange}
          isViewMode={isViewMode}
        />
        <Field
          id='storageInstruction'
          label='Storage Instruction'
          value={form.storageInstruction}
          type='textarea'
          rows={3}
          handleChange={handleChange}
          isViewMode={isViewMode}
        />
      </div>

      {/* --- 3. INGREDIENTS & TEXTURE --- */}
      <div className='space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg'>
        <h3 className='text-lg font-bold text-brand-600 dark:text-brand-400'>3. Ingredients & Texture</h3>
        <Field
          id='detailedIngredients'
          label='Detailed Ingredients'
          value={form.detailedIngredients}
          type='textarea'
          rows={5}
          handleChange={handleChange}
          isViewMode={isViewMode}
        />
        <Field
          id='keyActiveIngredients'
          label='Key Active Ingredients'
          value={form.keyActiveIngredients}
          type='textarea'
          rows={3}
          handleChange={handleChange}
          isViewMode={isViewMode}
        />
        <Field id='texture' label='Texture' value={form.texture} handleChange={handleChange} isViewMode={isViewMode} />
      </div>

      <div className='space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg'>
        <h3 className='text-lg font-bold text-brand-600 dark:text-brand-400'>4. Stock & Attributes</h3>
        <div className='grid grid-cols-2 gap-4'>
          <Field
            id='quantityInStock'
            label='Quantity In Stock'
            value={form.quantityInStock}
            type='number'
            min={0}
            handleChange={handleChange}
            isViewMode={isViewMode}
            error={errors.quantityInStock}
          />
        </div>

        <Field
          id='skinConditionIds'
          label='Skin Conditions'
          value={form.skinConditionIds}
          type='select'
          isMulti={true}
          options={skinConditionsOptions}
          handleChange={handleChange}
          isViewMode={isViewMode}
        />
        <Field
          id='skinTypeIds'
          label='Skin Types'
          value={form.skinTypeIds}
          type='select'
          isMulti={true}
          options={skinTypesOptions}
          handleChange={handleChange}
          isViewMode={isViewMode}
        />

        {/* Sử dụng variationOptions được lấy từ API Variations */}
        <Field
          id='variationOptionIds'
          label='Variation Options'
          value={form.variationOptionIds}
          type='select'
          isMulti={true}
          options={variationOptions}
          handleChange={handleChange}
          isViewMode={isViewMode}
        />
        <Field
          id='skinIssues'
          label='Skin Issues (General)'
          value={form.skinIssues}
          type='textarea'
          rows={3}
          handleChange={handleChange}
          isViewMode={isViewMode}
        />
      </div>

      {/* --- 5. MEDIA (Ảnh và Video) --- */}
      <div className='space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg'>
        <h3 className='text-lg font-bold text-brand-600 dark:text-brand-400'>5. Media (Images & Videos)</h3>

        {/* 5.1. UPLOAD IMAGES */}
        <div className='space-y-2'>
          <p className={labelClass}>Product Images</p>
          <label
            htmlFor='image-upload'
            className={`flex items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isUploading ? 'border-brand-300 dark:border-brand-700' : 'border-gray-300 dark:border-gray-600 hover:border-brand-500'}`}
          >
            <svg
              className='w-6 h-6 mr-2 text-gray-500 dark:text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'
              ></path>
            </svg>
            <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              {isUploading && imagePreviews.length > 0
                ? 'Đang tải lên ảnh...'
                : 'Chọn hoặc Kéo & Thả ảnh (Có thể chọn nhiều)'}
            </span>
            <input
              id='image-upload'
              type='file'
              multiple
              accept='image/*'
              onChange={handleImageFileChange}
              className='hidden'
              disabled={isUploading}
            />
          </label>
        </div>

        {/* Hiển thị ảnh đã có và ảnh preview */}
        {(form.images.length > 0 || imagePreviews.length > 0) && (
          <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2'>
            {/* Ảnh đã có từ API */}
            {form.images
              .filter((img) => !('imagePath' in img))
              .map((image, index) => (
                <div
                  // Thay đổi key để chắc chắn không bị trùng với index
                  key={image.imageUrl}
                  className='relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700'
                >
                  <img src={image.imageUrl} alt={`Product Image ${index + 1}`} className='w-full h-full object-cover' />

                  {/* 1. HIỂN THỊ CHỮ THUMBNAIL */}
                  {image.isThumbnail && (
                    <span className='absolute top-1 left-1 bg-brand-500 text-white text-[10px] px-1.5 rounded-full'>
                      Thumb
                    </span>
                  )}

                  {/* 2. NÚT XÓA ẢNH HIỆN TẠI (Chỉ hiển thị khi KHÔNG ở chế độ xem) */}
                  {/* Giả sử bạn nhận prop isViewMode và handleRemoveExistingImage vào component này */}
                  {!isViewMode && handleRemoveExistingImage && (
                    <button
                      type='button'
                      onClick={() => handleRemoveExistingImage(image.imageUrl)} // Gọi hàm xóa với URL của ảnh
                      className='absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-700 rounded-full transition-colors'
                      title='Xóa ảnh này'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-4 w-4 text-white'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                        strokeWidth={2}
                      >
                        <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
                      </svg>
                    </button>
                  )}
                </div>
              ))}

            {/* Ảnh đang chờ upload (previews) */}
            {imagePreviews.map((previewUrl, index) => (
              <div
                key={`preview-${index}`}
                className='relative w-full aspect-square rounded-lg overflow-hidden border-2 border-dashed border-brand-500'
              >
                <img
                  src={previewUrl}
                  alt={`Image Preview ${index + 1}`}
                  className='w-full h-full object-cover opacity-70'
                />
                <button
                  type='button'
                  onClick={() => handleRemoveImagePreview(index)}
                  className='absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs'
                >
                  &times;
                </button>
                <span className='absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 rounded-full'>
                  New
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 5.2. UPLOAD VIDEO */}
        <div className='space-y-2 pt-4'>
          <p className={labelClass}>Product Video</p>
          {form.videoUrl && (
            <div className='relative w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700'>
              <video controls src={form.videoUrl} className='w-full max-h-[250px] object-contain bg-black'></video>
              <button
                type='button'
                onClick={handleRemoveVideo}
                className='absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm z-10'
                title='Remove Video'
              >
                &times;
              </button>
            </div>
          )}

          {!form.videoUrl && (
            <label
              htmlFor='video-upload'
              className={`flex items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isUploading ? 'border-brand-300 dark:border-brand-700' : 'border-gray-300 dark:border-gray-600 hover:border-brand-500'}`}
            >
              <svg
                className='w-6 h-6 mr-2 text-gray-500 dark:text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M15 10l4.55-2.275a1 1 0 011.45.875v7.4a1 1 0 01-1.45.875L15 14m-5 4H5a2 2 0 01-2-2V8a2 2 0 012-2h5l2 2v8l-2 2z'
                ></path>
              </svg>
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                {isUploading ? 'Đang tải lên video...' : 'Chọn một Video (mp4/mov/etc.)'}
              </span>
              <input
                id='video-upload'
                type='file'
                accept='video/*'
                onChange={handleVideoFileChange}
                className='hidden'
                disabled={isUploading}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  )
}
