// src/components/ActionModal.tsx

import { MouseEvent, ReactNode, useEffect, useState } from 'react'

// src/interface/Order.ts

export interface Order {
  id: number
  user: {
    image: string
    name: string
    role: string
  }
  projectName: string
  team: {
    images: string[]
  }
  status: string // Active, Pending, Cancel, Banned
  budget: string
  reason?: string // Lý do cấm/bỏ cấm
  isBanned: boolean // Trạng thái cấm
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode // 'ReactNode' is the correct type for children in React
}

interface ButtonProps {
  children: ReactNode // Content inside the button (text, icon, etc.)
  onClick: (event: MouseEvent<HTMLButtonElement>) => void // Click handler
  className?: string // Optional extra Tailwind classes
  color?: 'primary' | 'danger' | 'success' // Define accepted color strings
  disabled?: boolean // Optional disabled state
}

// Mock Components (Replace with your actual components)
const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null
  return (
    <div className='fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 p-4'>
      <div className='bg-white p-6 rounded-lg shadow-xl w-full max-w-sm dark:bg-gray-800'>
        <button
          onClick={onClose}
          className='absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  )
}

export const Button = ({ children, onClick, className = '', color = 'primary', disabled = false }: ButtonProps) => {
  const baseStyle = 'px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50'
  let colorStyle = ''

  switch (color) {
    case 'danger':
      colorStyle = 'bg-red-500 hover:bg-red-600 text-white'
      break
    case 'success':
      colorStyle = 'bg-green-500 hover:bg-green-600 text-white'
      break
    default:
      colorStyle = 'bg-blue-500 hover:bg-blue-600 text-white'
  }

  return (
    <button onClick={onClick} className={`${baseStyle} ${colorStyle} ${className}`} disabled={disabled}>
      {children}
    </button>
  )
}
// End Mock Components

interface ActionModalProps {
  isOpen: boolean
  onClose: () => void
  order: Order | null
  onConfirm: (orderId: number, reason: string, isBanning: boolean) => void
}

export default function ActionModal({ isOpen, onClose, order, onConfirm }: ActionModalProps) {
  const [reasonInput, setReasonInput] = useState(order?.reason || '')

  // Cập nhật reasonInput khi prop order thay đổi (khi mở modal cho order khác)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    // Luôn kiểm tra order trước khi truy cập reason
    if (order) {
      setReasonInput(order.reason || '')
    }
  }, [order]) // Hook này chạy mỗi khi prop 'order' thay đổi

  if (!order) return null // ✅ chuyển xuống sau hook

  const isBanning = !order.isBanned
  const actionText = isBanning ? 'Ban' : 'Unban'
  const statusText = order.isBanned ? 'Banned' : order.status

  const handleSubmit = () => {
    // Chỉ cần lý do khi thực hiện Ban
    if (isBanning && reasonInput.trim() === '') {
      alert('Vui lòng nhập lý do cấm.')
      return
    }

    onConfirm(order.id, reasonInput.trim(), isBanning)
    onClose() // Đóng modal sau khi xác nhận
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className='text-xl font-semibold mb-4 text-gray-900 dark:text-white'>
        {actionText} Người: {order.user.name}
      </h3>
      <p className='mb-4 text-gray-600 dark:text-gray-400'>
        Người dùng hiện tại có trạng thái **{statusText}**. Vui lòng cung cấp lý do để **{actionText.toLowerCase()}**
        người dùng này.
      </p>

      <label htmlFor='reason' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
        Lý do:
      </label>
      <textarea
        id='reason'
        rows={3}
        value={reasonInput}
        onChange={(e) => setReasonInput(e.target.value)}
        placeholder={`Lý do ${actionText.toLowerCase()}... (Bắt buộc khi Ban)`}
        className='w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4'
        disabled={!isBanning} // Không cần nhập lý do khi Unban
      />

      <div className='flex justify-end space-x-3'>
        <Button onClick={onClose} className='bg-gray-300 hover:bg-gray-400 text-gray-800'>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          color={isBanning ? 'danger' : 'success'}
          disabled={isBanning && reasonInput.trim() === ''} // Disable nếu Ban mà chưa có lý do
        >
          {actionText} Order
        </Button>
      </div>
    </Modal>
  )
}
