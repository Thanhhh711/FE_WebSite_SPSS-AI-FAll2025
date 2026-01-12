/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
// Giả định path:
import brandApi from '../../api/brand.api'
import { categoryApi } from '../../api/category.api'
import { productApi } from '../../api/product.api'
import { skinConditionApi, skinTypeApi } from '../../api/skin.api'
import variationApi from '../../api/variation.api'
import { Brand } from '../../types/brands.type'
import { Category } from '../../types/category.type'
import { Product, ProductForm, ProductImage, ProductImageForm, ProductStatusEnum } from '../../types/product.type'
import { SkinCondition, SkinType } from '../../types/skin.type'
import { Variation, VarionOptionInResponse } from '../../types/variation.type'
import { uploadFile, UploadResult } from '../../utils/supabaseStorage'
import { validateProductForm } from '../../utils/validForm'
import ModalRegistration from '../RegistrationModal/ModalRegistration'
import ProductFormFields, { NewUploadedImage, ProductFormState } from './ProductFormFields'

// ---------------------------------------------------

// --- TYPES CHO PROPS & LOCAL STATE ---
interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  onSave: (data: ProductForm & { id?: string }) => void
  isViewMode: boolean
}
type SelectOption = { value: string | number; label: string }
type ProductFormData = ProductForm & { id?: string }

// Khởi tạo state form ban đầu (giữ nguyên)
const initialFormState: ProductFormState = {
  name: '',
  englishName: '',
  description: '',
  price: 0,
  marketPrice: 0,
  quantityInStock: 0,
  storageInstruction: '',
  usageInstruction: '',
  detailedIngredients: '',
  mainFunction: '',
  texture: '',
  keyActiveIngredients: '',
  status: ProductStatusEnum.InStock,

  skinIssues: '',
  videoUrl: '',
  brandId: '',
  productCategoryId: '',
  skinConditionIds: [],
  skinTypeIds: [],
  variationOptionIds: [],
  images: []
}

const useProductDependencies = () => {
  // 1. Fetch Skin Conditions
  const { data: skinConditionsData } = useQuery({
    queryKey: ['skinConditionsList'],
    queryFn: skinConditionApi.getSkinConditions,
    select: (res) => res.data.data.map((sc: SkinCondition) => ({ value: sc.id, label: sc.name })),
    staleTime: Infinity
  })

  // 2. Fetch Skin Types
  const { data: skinTypesData } = useQuery({
    queryKey: ['skinTypesList'],
    queryFn: skinTypeApi.getSkinTypes,
    select: (res) => res.data.data.map((st: SkinType) => ({ value: st.id, label: st.name })),
    staleTime: Infinity
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categoriesList'],
    queryFn: categoryApi.getCategories,
    select: (res) => res.data.data.map((cat: Category) => ({ value: cat.id, label: cat.categoryName })),
    staleTime: Infinity
  })

  const { data: brandsData } = useQuery({
    queryKey: ['brandsList'],
    queryFn: brandApi.getBrands,
    select: (res) => res.data.data.map((ba: Brand) => ({ value: ba.id, label: ba.title })),
    staleTime: Infinity
  })

  // 4. Fetch Variations (UPDATED to use new API structure)
  const { data: variationsData } = useQuery({
    queryKey: ['variationsList'],
    queryFn: variationApi.getVariations,
    select: (res) => {
      const allOptions: SelectOption[] = []

      console.log('data', res.data.data)

      res.data.data.forEach((v: Variation) => {
        console.log('v', v)

        v.variationOptions.forEach((o: VarionOptionInResponse) => {
          console.log('option', o)

          allOptions.push({ value: o.id, label: `${v.name}: ${o.value}` })
        })
      })
      return allOptions
    },
    staleTime: Infinity
  })

  return {
    skinConditionsOptions: skinConditionsData || [],
    skinTypesOptions: skinTypesData || [],
    variationOptions: variationsData || [],
    brandOptions: brandsData || [],
    categoryOptions: categoriesData || []
  }
}
// ----------------------------------------------------

export default function ProductModal({ isOpen, onClose, product, onSave, isViewMode }: ProductModalProps) {
  const isEditing = !!product && !isViewMode
  const isCreating = !product && !isViewMode
  const productId = product?.id

  const { skinConditionsOptions, skinTypesOptions, variationOptions, brandOptions, categoryOptions } =
    useProductDependencies()

  console.log('variationOptions', variationOptions)

  // Fetch chi tiết sản phẩm và mapping (giữ nguyên)
  const { data: productResponse, isLoading: isProductLoading } = useQuery<Product>({
    queryKey: ['products', productId],
    queryFn: () => productApi.getProductById(productId as string).then((res) => res.data.data),
    enabled: !!productId && !isCreating,
    staleTime: 1000 * 60 * 5
  })
  const detailedProductData: Product | null = productResponse || product

  const mapDetailToForm = (detail: Product): ProductFormState => ({
    name: detail.name || '',
    englishName: detail.englishName || '',
    description: detail.description || '',
    price: detail.price || 0,
    marketPrice: detail.marketPrice || 0,
    quantityInStock: detail.quantityInStock || 0,
    storageInstruction: detail.storageInstruction || '',
    usageInstruction: detail.usageInstruction || '',
    detailedIngredients: detail.detailedIngredients || '',
    mainFunction: detail.mainFunction || '',
    texture: detail.texture || '',
    keyActiveIngredients: detail.keyActiveIngredients || '',
    status: detail.status || ProductStatusEnum.InStock,

    skinIssues: detail.skinIssues || '',
    videoUrl: detail.videoUrl || '',
    brandId: detail.brandId || '',
    productCategoryId: detail.productCategoryId || '',
    skinConditionIds: detail.skinConditions?.map((skin) => skin.id) || [],
    skinTypeIds: detail.skinTypes?.map((skinType) => skinType.id) || [],
    variationOptionIds: detail.variationOptions?.map((variation) => variation.id) || [],
    images: (detail.images || []) as ProductFormState['images']
  })

  const [form, setForm] = useState<ProductFormState>(initialFormState)
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormState, string>>>({})

  const validateForm = () => {
    const newErrors: any = {}

    if (!form.name.trim()) newErrors.name = 'Product name is required'
    if (form.price <= 0) newErrors.price = 'Price must be greater than 0'
    if (form.quantityInStock < 0) newErrors.quantityInStock = 'Quantity cannot be negative'
    if (form.description.length < 10) newErrors.description = 'Description must be at least 10 characters'

    setErrors(newErrors) // Cập nhật state errors để UI hiển thị
    return Object.keys(newErrors).length === 0
  }

  useEffect(() => {
    if (detailedProductData) {
      setForm(mapDetailToForm(detailedProductData))
    } else if (isCreating) {
      setForm(initialFormState)
    }
  }, [detailedProductData, isCreating])

  // Cleanup URLs (giữ nguyên)
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
      if (form.videoUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(form.videoUrl)
      }
    }
  }, [imagePreviews, form.videoUrl])

  // File Handlers (giữ nguyên)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
      setSelectedImageFiles(files)
      setImagePreviews(files.map((file) => URL.createObjectURL(file)))
    }
  }
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (form.videoUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(form.videoUrl)
      }
      setSelectedVideoFile(file)
      setForm((p) => ({ ...p, videoUrl: URL.createObjectURL(file) }))
    } else {
      setSelectedVideoFile(null)
      if (form.videoUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(form.videoUrl)
      }
      setForm((p) => ({ ...p, videoUrl: '' }))
    }
  }
  const handleRemoveImagePreview = (index: number) => {
    setSelectedImageFiles((p) => p.filter((_, i) => i !== index))
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index])
    }
    setImagePreviews((p) => p.filter((_, i) => i !== index))
  }
  const handleRemoveVideo = () => {
    setSelectedVideoFile(null)
    if (form.videoUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(form.videoUrl)
    }
    setForm((p) => ({ ...p, videoUrl: '' }))
  }

  const handleRemoveExistingImage = (imageUrl: string) => {
    setForm((prevForm) => {
      const newImages = prevForm.images.filter((img) => img.imageUrl !== imageUrl)

      if (newImages.length > 0 && !newImages.some((img) => img.isThumbnail)) {
        newImages[0] = { ...newImages[0], isThumbnail: true }
      }
      return {
        ...prevForm,
        images: newImages
      }
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target
    setForm((p) => {
      let newValue: any = value
      if (type === 'number') {
        newValue = parseFloat(value) || 0
      } else if (id === 'status') {
        newValue = parseInt(value) as ProductStatusEnum
      } else if (['skinConditionIds', 'skinTypeIds', 'variationOptionIds'].includes(id)) {
        const options = (e.target as HTMLSelectElement).options
        newValue = Array.from(options)
          .filter((option) => option.selected)
          .map((option) => option.value)
      }
      return { ...p, [id]: newValue }
    })
  }

  const handleSave = async () => {
    if (!validateProductForm(form, selectedImageFiles)) return

    const needsUpload = selectedImageFiles.length > 0 || selectedVideoFile !== null
    if (needsUpload) {
      setIsUploading(true)
    }

    try {
      let uploadedImages: NewUploadedImage[] = []
      let uploadedVideoUrl: string | undefined = undefined
      const bucket = 'products'

      const [uploadedImageResults, uploadedVideoResult] = await Promise.all([
        selectedImageFiles.length > 0
          ? Promise.all(selectedImageFiles.map((file) => uploadFile(bucket, file)))
          : Promise.resolve([]),
        selectedVideoFile ? uploadFile(bucket, selectedVideoFile) : Promise.resolve(null)
      ])

      if (uploadedImageResults.length > 0) {
        const existingImages = form.images.filter(
          (img): img is ProductImage => 'imageUrl' in img && !('imagePath' in img)
        )

        uploadedImages = uploadedImageResults.map(
          (res: UploadResult, index: number): NewUploadedImage => ({
            imageUrl: res.publicUrl,
            imagePath: res.path,
            isThumbnail: index === 0 && !existingImages.some((img) => img.isThumbnail)
          })
        )
      }

      if (uploadedVideoResult) {
        uploadedVideoUrl = (uploadedVideoResult as UploadResult).publicUrl
      }

      setIsUploading(false)

      const currentImages: ProductImageForm[] = form.images
        .filter((img: ProductImageForm | any) => !('imagePath' in img))
        .map((img: ProductImageForm) => ({
          imageUrl: img.imageUrl,
          isThumbnail: img.isThumbnail
        }))

      const newImages: ProductImageForm[] = uploadedImages.map((img) => ({
        imageUrl: img.imageUrl,
        isThumbnail: img.isThumbnail
      }))

      const finalImages: ProductImageForm[] = [...currentImages, ...newImages]
      const finalVideoUrl = uploadedVideoUrl || (form.videoUrl?.startsWith('blob:') ? '' : form.videoUrl) || ''

      const dataToSave: ProductFormData = {
        ...form,
        id: isEditing ? product?.id : undefined,
        status: form.status,
        images: finalImages,
        videoUrl: finalVideoUrl
      }

      onSave(dataToSave)
      setSelectedImageFiles([])
      setImagePreviews([])
      setSelectedVideoFile(null)
    } catch (error) {
      setIsUploading(false)
      toast.error('Lỗi khi tải file lên hoặc lưu sản phẩm.')
    }
  }

  const title = isCreating ? 'Create New Product' : isEditing ? 'Edit Product Details' : 'Product Details'

  if (isProductLoading && !isCreating) {
    return (
      <ModalRegistration isOpen={isOpen} onClose={onClose} title='Loading Product Details...'>
        <div className='p-6 text-center text-lg text-brand-500 dark:text-brand-300'>
          <svg className='animate-spin h-5 w-5 mr-3 inline-block' viewBox='0 0 24 24'>
            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
          Loading product details...
        </div>
      </ModalRegistration>
    )
  }

  return (
    <ModalRegistration isOpen={isOpen} onClose={onClose} title={title}>
      <div className='max-h-[70vh] overflow-y-auto custom-scrollbar'>
        <ProductFormFields
          product={product ? product : null}
          form={form}
          errors={errors}
          handleChange={handleChange}
          handleImageFileChange={handleImageFileChange}
          handleVideoFileChange={handleVideoFileChange}
          handleRemoveImagePreview={handleRemoveImagePreview}
          handleRemoveExistingImage={handleRemoveExistingImage}
          handleRemoveVideo={handleRemoveVideo}
          imagePreviews={imagePreviews}
          isViewMode={isViewMode}
          isUploading={isUploading}
          skinConditionsOptions={skinConditionsOptions}
          skinTypesOptions={skinTypesOptions}
          variationOptions={variationOptions}
          brandOptions={brandOptions}
          categoryOptions={categoryOptions}
        />
      </div>

      <div className='flex items-center gap-3 p-6 border-t border-gray-100 dark:border-gray-800 modal-footer sm:justify-end'>
        <button
          onClick={onClose}
          type='button'
          disabled={isUploading}
          className='flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto disabled:opacity-50'
        >
          {isViewMode ? 'Close' : 'Cancel'}
        </button>
        {!isViewMode && (
          <button
            onClick={handleSave}
            type='button'
            disabled={isUploading}
            className='flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-brand-xs hover:bg-brand-600 sm:w-auto disabled:opacity-50'
          >
            {isUploading ? (
              <>
                <svg className='animate-spin h-5 w-5 mr-3 inline-block' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                Uploading...
              </>
            ) : isEditing ? (
              'Save Changes'
            ) : (
              'Create Product'
            )}
          </button>
        )}
      </div>
    </ModalRegistration>
  )
}
