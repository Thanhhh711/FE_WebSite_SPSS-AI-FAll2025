/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { ProductForm, ProductImage, ProductImageForm, ProductStatusEnum } from '../../types/product.type'

export type NewUploadedImage = ProductImageForm & { imagePath: string }
export interface ProductFormState extends Omit<ProductForm, 'images' | 'expiryDate'> {
  images: (ProductImage | NewUploadedImage)[]
}

interface SelectOption {
  value: string | number
  label: string
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

// Hàm render Field tái sử dụng (đã được tối ưu hóa)
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
  isViewMode
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
}) => (
  <div>
    <label htmlFor={id as string} className={labelClass}>
      {label} {isRequired && <span className='text-red-500'>*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        id={id as string}
        rows={rows}
        value={value || ''}
        onChange={handleChange}
        disabled={isViewMode}
        className={baseInputClass + ' min-h-[100px]'}
      />
    ) : type === 'select' ? (
      <select
        id={id as string}
        // Đối với multi-select, value là mảng, còn single-select là chuỗi
        value={isMulti ? value : value || ''}
        onChange={handleChange}
        disabled={isViewMode}
        multiple={isMulti}
        className={baseInputClass + (isMulti ? ' h-[150px]' : '')}
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
        className={baseInputClass}
      />
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
  if (isViewMode) {
    return (
      <div className='space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300'>
        <h3 className='text-lg font-bold text-brand-600 dark:text-brand-400 border-b pb-2'>Basic Information</h3>
        {/* <p>
          <span className='font-semibold'>ID:</span> {form.id}
        </p> */}
        <p>
          <span className='font-semibold'>Name:</span> {form.name}
        </p>
        <p>
          <span className='font-semibold'>Price:</span> {form.price.toLocaleString('vi-VN')} VND
        </p>
        <p>
          <span className='font-semibold'>Status:</span> {getStatusText(form.status)}
        </p>
        <h3 className='text-lg font-bold text-brand-600 dark:text-brand-400 pt-4 border-b pb-2'>Details</h3>
        <p className='whitespace-pre-wrap'>
          <span className='font-semibold'>Description:</span> {form.description || 'N/A'}
        </p>

        {form.images.length > 0 && (
          <div className='pt-4'>
            <h4 className='font-semibold'>Images:</h4>
            <div className='grid grid-cols-4 gap-2'>
              {form.images.map((image) => (
                <img
                  key={'id' in image ? image.id : image.imagePath}
                  src={image.imageUrl}
                  alt='Product'
                  className='w-full h-auto object-cover rounded'
                />
              ))}
            </div>
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
        />
        <Field
          id='englishName'
          label='English Name'
          value={form.englishName}
          handleChange={handleChange}
          isViewMode={isViewMode}
        />

        <div className='grid grid-cols-2 gap-4'>
          <Field
            id='price'
            label='Price (VND)'
            value={form.price}
            type='number'
            isRequired={true}
            min={0}
            handleChange={handleChange}
            isViewMode={isViewMode}
          />
          <Field
            id='marketPrice'
            label='Market Price (VND)'
            value={form.marketPrice}
            type='number'
            min={0}
            handleChange={handleChange}
            isViewMode={isViewMode}
          />
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
          />
          <Field
            id='productCategoryId'
            label='Category'
            value={form.productCategoryId}
            type='select'
            options={categoryOptions}
            handleChange={handleChange}
            isViewMode={isViewMode}
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
