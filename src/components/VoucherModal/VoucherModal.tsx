import React, { useEffect, useState } from 'react'

import ModalRegistration from '../RegistrationModal/ModalRegistration'
import { toast } from 'react-toastify'
import { Voucher, VoucherForm, VoucherStatusEnum } from '../../types/vourcher.type'

// >>> ĐẢM BẢO IMPORT ĐÚNG HÀM CẦN THIẾT <<<
import { formatDateValue, formatDateToDDMMYYYY, formatVND, parseNumber } from '../../utils/validForm'

// Hàm chuyển Enum Status sang Text (Giữ nguyên)
const getStatusText = (status: VoucherStatusEnum) => {
  switch (status) {
    case VoucherStatusEnum.Active:
      return '1 - Active'
    case VoucherStatusEnum.Expired:
      return '2 - Expired'
    case VoucherStatusEnum.Scheduled:
      return '3 - Scheduled'
    case VoucherStatusEnum.Inactive:
    default:
      return '0 - Inactive'
  }
}

interface VoucherModalProps {
  isOpen: boolean
  onClose: () => void
  voucher: Voucher | null

  onSave: (data: VoucherForm & { id?: string; status?: VoucherStatusEnum }) => void
  isViewMode: boolean
}

type VoucherFormData = VoucherForm & { id?: string; status?: VoucherStatusEnum }

export default function VoucherModal({ isOpen, onClose, voucher, onSave, isViewMode }: VoucherModalProps) {
  console.log('voucher', voucher)

  const isEditing = !!voucher && !isViewMode
  const isCreating = !voucher && !isViewMode

  const initialFormState: VoucherForm = {
    code: '',
    description: '',
    discountRate: 0,
    minimumOrderValue: 0,
    maximumDiscountAmount: 0,

    startDate: formatDateValue(new Date().toISOString()),
    endDate: formatDateValue(new Date().toISOString()),
    usageLimit: 1
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const [form, setForm] = useState<VoucherForm>(initialFormState)
  const [status, setStatus] = useState<VoucherStatusEnum>(voucher?.status || VoucherStatusEnum.Inactive)
  const [errors, setErrors] = useState<Partial<Record<keyof VoucherForm, string>>>({}) // State lưu lỗi

  useEffect(() => {
    if (voucher) {
      setForm({
        code: voucher.code,
        description: voucher.description,
        discountRate: voucher.discountRate,
        minimumOrderValue: voucher.minimumOrderValue,
        maximumDiscountAmount: voucher.maximumDiscountAmount,

        startDate: formatDateValue(voucher.startDate),
        endDate: formatDateValue(voucher.endDate),
        usageLimit: voucher.usageLimit
      })
      setStatus(voucher.status)
    } else {
      setForm(initialFormState)
      setStatus(VoucherStatusEnum.Inactive)
    }
    setErrors({})
  }, [voucher])

  const baseInputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'

  const validateForm = (data: VoucherForm): boolean => {
    const newErrors: Partial<Record<keyof VoucherForm, string>> = {}
    let isValid = true

    if (!data.code.trim()) {
      newErrors.code = 'Voucher code cannot be empty.'
      isValid = false
    } else if (data.code.trim().length < 4) {
      newErrors.code = 'Voucher code must be at least 4 characters.'
      isValid = false
    }

    if (data.discountRate <= 0 || data.discountRate > 100) {
      newErrors.discountRate = 'Discount Rate must be between 1 and 100.'
      isValid = false
    }

    if (data.maximumDiscountAmount <= 1000) {
      newErrors.maximumDiscountAmount = 'Maximum Discount Amount must be greater than 1000.'
      isValid = false
    }

    if (data.minimumOrderValue < 0) {
      newErrors.minimumOrderValue = 'Minimum Order Value cannot be negative.'
      isValid = false
    }

    if (data.usageLimit < 1) {
      newErrors.usageLimit = 'Usage Limit must be at least 1.'
      isValid = false
    }

    if (!data.startDate) {
      newErrors.startDate = 'Start Date is required.'
      isValid = false
    }
    if (!data.endDate) {
      newErrors.endDate = 'End Date is required.'
      isValid = false
    }

    if (data.startDate && data.endDate && new Date(data.startDate) >= new Date(data.endDate)) {
      newErrors.endDate = 'End Date must be after Start Date.'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSave = () => {
    if (!validateForm(form)) {
      toast.error('Please correct the form errors.')
      return
    }

    const dataToSave: VoucherFormData = {
      ...form,
      id: isEditing ? voucher?.id : undefined,

      ...(isEditing && { status: status })
    }
    onSave(dataToSave as VoucherFormData)
  }
  const title = isCreating ? 'Create New Voucher' : isEditing ? 'Edit Voucher Details' : 'Voucher Details'

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof VoucherForm) => {
    let value = parseNumber(e.target.value)
    if (isNaN(value)) value = 0

    if (field === 'minimumOrderValue' && value < 0) {
      value = 0
    } else if (value < 0) {
      value = 0
    }

    setForm((p) => ({ ...p, [field]: value }))
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof VoucherForm) => {
    setForm((p) => ({ ...p, [field]: e.target.value }))
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(parseInt(e.target.value) as VoucherStatusEnum)
  }

  return (
    <ModalRegistration isOpen={isOpen} onClose={onClose} title={title}>
      <div className='p-6 max-h-[80vh] overflow-y-auto'>
        {voucher && isViewMode && (
          <div className='grid grid-cols-2 gap-x-6 gap-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <div className='col-span-2'>
              <p className='text-sm text-gray-700 dark:text-gray-300'>
                <span className='font-semibold'>Code:</span>{' '}
                <span className='text-brand-600 font-bold'>{voucher.code}</span>
              </p>
            </div>

            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Status:</span> {getStatusText(voucher.status)}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Used:</span> {voucher.orders?.length || 0} times
            </p>

            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Discount Rate:</span> {voucher.discountRate}%
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Max Discount:</span> {formatCurrency(voucher.maximumDiscountAmount)}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Min Order Value:</span> {formatCurrency(voucher.minimumOrderValue)}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Usage Limit:</span> {voucher.usageLimit}
            </p>

            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Start Date:</span> {formatDateToDDMMYYYY(voucher.startDate)}
            </p>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>End Date:</span> {formatDateToDDMMYYYY(voucher.endDate)}
            </p>

            <div className='col-span-2'>
              <p className='text-sm text-gray-700 dark:text-gray-300'>
                <span className='font-semibold'>Description:</span> {voucher.description}
              </p>
            </div>
          </div>
        )}

        {!isViewMode && (
          <div className='space-y-4'>
            <div>
              <label htmlFor='code' className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block'>
                Voucher Code *
              </label>
              <input
                id='code'
                type='text'
                placeholder='E.g., SUMMERSALE20'
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                className={`${baseInputClass} ${errors.code ? 'border-red-500' : ''}`}
                disabled={isEditing}
              />
              {errors.code && <p className='mt-1 text-xs text-red-500'>{errors.code}</p>}
            </div>

            {isEditing && (
              <div>
                <label htmlFor='status' className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block'>
                  Status
                </label>
                <select id='status' value={status} onChange={handleStatusChange} className={`${baseInputClass}`}>
                  {Object.keys(VoucherStatusEnum)

                    .filter((key) => !isNaN(Number(VoucherStatusEnum[key as keyof typeof VoucherStatusEnum])))
                    .map((key) => {
                      const value = VoucherStatusEnum[key as keyof typeof VoucherStatusEnum] as VoucherStatusEnum
                      return (
                        <option key={value} value={value}>
                          {getStatusText(value)}
                        </option>
                      )
                    })}
                </select>
              </div>
            )}

            <div>
              <label htmlFor='description' className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block'>
                Description
              </label>
              <textarea
                id='description'
                rows={2}
                placeholder='Voucher description (optional)'
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className={`${baseInputClass}`}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label
                  htmlFor='discountRate'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block'
                >
                  Discount Rate (%) *
                </label>
                <input
                  id='discountRate'
                  type='number'
                  placeholder='E.g., 10 (for 10%)'
                  value={form.discountRate === 0 ? '' : form.discountRate}
                  onChange={(e) => handleNumberChange(e, 'discountRate')}
                  className={`${baseInputClass} ${errors.discountRate ? 'border-red-500' : ''}`}
                  min={1}
                  max={100}
                  step={1}
                />
                {errors.discountRate && <p className='mt-1 text-xs text-red-500'>{errors.discountRate}</p>}
              </div>

              <div>
                <label
                  htmlFor='maximumDiscountAmount'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block'
                >
                  Max Discount Amount (VNĐ) *
                </label>
                <input
                  id='maximumDiscountAmount'
                  type='number'
                  placeholder='E.g., 50.00'
                  value={form.maximumDiscountAmount === 0 ? '' : formatVND(form.maximumDiscountAmount)}
                  onChange={(e) => handleNumberChange(e, 'maximumDiscountAmount')}
                  className={`${baseInputClass} ${errors.maximumDiscountAmount ? 'border-red-500' : ''}`}
                  min={1}
                  step={0.01}
                />
                {errors.maximumDiscountAmount && (
                  <p className='mt-1 text-xs text-red-500'>{errors.maximumDiscountAmount}</p>
                )}
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label
                  htmlFor='minimumOrderValue'
                  className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block'
                >
                  Min Order Value (VNĐ)
                </label>
                <input
                  id='minimumOrderValue'
                  type='number'
                  placeholder='E.g., 100.00'
                  value={form.minimumOrderValue === 0 ? '' : form.minimumOrderValue}
                  onChange={(e) => handleNumberChange(e, 'minimumOrderValue')}
                  className={`${baseInputClass} ${errors.minimumOrderValue ? 'border-red-500' : ''}`}
                  min={0}
                  step={0.01}
                />
                {errors.minimumOrderValue && <p className='mt-1 text-xs text-red-500'>{errors.minimumOrderValue}</p>}
              </div>

              <div>
                <label htmlFor='usageLimit' className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block'>
                  Usage Limit (Times) *
                </label>
                <input
                  id='usageLimit'
                  type='number'
                  placeholder='E.g., 100'
                  value={form.usageLimit === 0 ? '' : form.usageLimit}
                  onChange={(e) => handleNumberChange(e, 'usageLimit')}
                  className={`${baseInputClass} ${errors.usageLimit ? 'border-red-500' : ''}`}
                  min={1}
                  step={1}
                />
                {errors.usageLimit && <p className='mt-1 text-xs text-red-500'>{errors.usageLimit}</p>}
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label htmlFor='startDate' className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block'>
                  Start Date *
                </label>
                <input
                  id='startDate'
                  type='date'
                  value={form.startDate}
                  onChange={(e) => handleDateChange(e, 'startDate')}
                  className={`${baseInputClass} ${errors.startDate ? 'border-red-500' : ''}`}
                />
                {errors.startDate && <p className='mt-1 text-xs text-red-500'>{errors.startDate}</p>}
              </div>

              <div>
                <label htmlFor='endDate' className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block'>
                  End Date *
                </label>
                <input
                  id='endDate'
                  type='date'
                  value={form.endDate}
                  onChange={(e) => handleDateChange(e, 'endDate')}
                  className={`${baseInputClass} ${errors.endDate ? 'border-red-500' : ''}`}
                />
                {errors.endDate && <p className='mt-1 text-xs text-red-500'>{errors.endDate}</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='flex items-center gap-3 p-6 border-t border-gray-100 dark:border-gray-800 modal-footer sm:justify-end'>
        <button
          onClick={onClose}
          type='button'
          className='flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto'
        >
          {isViewMode ? 'Close' : 'Cancel'}
        </button>
        {!isViewMode && (
          <button
            onClick={handleSave}
            type='button'
            className='flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-brand-xs hover:bg-brand-600 sm:w-auto'
          >
            {isEditing ? 'Update Voucher' : 'Create Voucher'}
          </button>
        )}
      </div>
    </ModalRegistration>
  )
}
