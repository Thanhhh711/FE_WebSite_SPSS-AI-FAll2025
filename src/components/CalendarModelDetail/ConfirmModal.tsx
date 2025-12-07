// File: ConfirmModal.tsx (Mẫu)
import React from 'react'
import { Modal } from '../ui/modal' // Giả sử sử dụng Modal component của bạn

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  is?: boolean
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message, is }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className='max-w-md p-0'>
      <div className='p-6'>
        <h5 className='mb-3 text-xl font-bold text-gray-800 dark:text-white'>{title}</h5>
        <p className='text-gray-600 dark:text-gray-400'>{message}</p>
      </div>

      <div className='flex justify-end gap-3 p-4 border-t border-gray-100 dark:border-gray-800'>
        <button
          onClick={onClose}
          type='button'
          className='flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]'
        >
          Cancel
        </button>

        {is ? (
          <button
            onClick={onConfirm}
            type='button'
            className='flex justify-center rounded-lg bg-success-500 px-4 py-2.5 text-sm font-medium text-white shadow-red-xs hover:bg-red-600'
          >
            Confirm
          </button>
        ) : (
          <button
            onClick={onConfirm}
            type='button'
            className='flex justify-center rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white shadow-red-xs hover:bg-red-600'
          >
            Delete
          </button>
        )}
      </div>
    </Modal>
  )
}

export default ConfirmModal
