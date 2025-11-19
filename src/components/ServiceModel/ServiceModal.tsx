// File: ServiceModal.tsx

import React, { useState, useEffect } from 'react'
import { Service, ServiceForm } from '../../types/service.type'
import { Modal } from '../ui/modal'

interface ServiceModalProps {
  isOpen: boolean
  onClose: () => void
  service: Service | null // Dữ liệu service khi Update, null khi Create
  onSave: (data: { form: ServiceForm; id?: string }) => void
}

const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, service, onSave }) => {
  const [form, setForm] = useState<ServiceForm>({
    name: '',
    description: '',
    durationMinutes: 0,
    price: 0
  })

  // Đặt lại form khi Modal mở hoặc 'service' object thay đổi
  useEffect(() => {
    if (service) {
      setForm({
        name: service.name,
        description: service.description,
        durationMinutes: service.durationMinutes,
        price: service.price
      })
    } else {
      setForm({ name: '', description: '', durationMinutes: 0, price: 0 })
    }
  }, [service])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || form.durationMinutes <= 0 || form.price < 0) {
      // Logic xử lý lỗi ở đây
      return
    }

    onSave({ form, id: service?.id })
  }

  // Styles chung cho input
  const inputClass =
    'w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 dark:bg-gray-800 dark:text-white/90 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition duration-150'
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'

  const modalTitle = service ? 'Edit Service' : 'Create New Service'

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className='px-6 pt-10 pb-2 sm:pt-14 sm:pb-4 border-b border-gray-100 dark:border-gray-800'>
          <h3 className='text-2xl font-bold text-gray-900 dark:text-white'>{modalTitle}</h3>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
            {service ? 'Chỉnh sửa thông tin dịch vụ.' : 'Thêm mới một dịch vụ vào hệ thống.'}
          </p>
        </div>
        {/* KHỐI NỘI DUNG FORM */}
        <div className='space-y-5 px-6 pt-8 pb-6'>
          {/* 1. Service Name (Tên Dịch vụ) */}
          <div>
            <label htmlFor='name' className={labelClass}>
              Service Name <span className='text-red-500'>*</span>
            </label>
            <input
              id='name'
              placeholder='Ví dụ: Dịch vụ chăm sóc da chuyên sâu'
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              required
            />
          </div>

          {/* 2. Description (Mô tả) */}
          <div>
            <label htmlFor='description' className={labelClass}>
              Description
            </label>
            <textarea
              id='description'
              placeholder='Mô tả chi tiết về các bước và lợi ích của dịch vụ'
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
            />
          </div>

          {/* 3 & 4. Duration và Price (Sử dụng Grid 2 cột) */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {/* 3. Duration (Thời lượng) */}
            <div>
              <label htmlFor='durationMinutes' className={labelClass}>
                Duration (minutes) <span className='text-red-500'>*</span>
              </label>
              <input
                id='durationMinutes'
                type='number'
                placeholder='Thời lượng dịch vụ (phút)'
                value={form.durationMinutes || ''} // Dùng || '' để tránh lỗi input khi giá trị là 0
                onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 0 })}
                className={inputClass}
                required
                min={1}
              />
            </div>

            {/* 4. Price (Giá) */}
            <div>
              <label htmlFor='price' className={labelClass}>
                Price (VND) <span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 font-semibold'>
                  ₫
                </span>
                <input
                  id='price'
                  type='number'
                  placeholder='Giá dịch vụ'
                  value={form.price || ''} // Dùng || '' để tránh lỗi input khi giá trị là 0
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  className={`${inputClass} pl-6`} // Thêm padding-left cho biểu tượng ₫
                  required
                  min={0}
                  step='0.01'
                />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER (Giữ nguyên phong cách) */}
        <div className='flex justify-end gap-3 p-4 border-t border-gray-100 dark:border-gray-800'>
          <button
            type='button'
            onClick={onClose}
            className='flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]'
          >
            Cancel
          </button>
          <button
            type='submit'
            className='flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-brand-xs hover:bg-brand-600'
          >
            {service ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ServiceModal
