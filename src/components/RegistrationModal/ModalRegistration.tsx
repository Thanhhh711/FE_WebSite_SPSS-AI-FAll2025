interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

import React from 'react'

export default function ModalRegistration({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null
  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300'
      onClick={onClose}
    >
      <div
        className='bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-lg w-full m-4 transform transition-transform duration-300 scale-100 overflow-hidden'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>{title}</h3>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600 transition-colors'>
            <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
