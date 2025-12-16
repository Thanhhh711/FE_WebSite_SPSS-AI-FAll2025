// ModalPhotoViewer.tsx

import React from 'react'

// Cập nhật Props để bao gồm hàm xử lý cho nút Prev và Next
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  // Thêm props cho chức năng chuyển ảnh
  onPrev?: () => void
  onNext?: () => void
}

// Thay đổi signature của component để nhận ModalProps mới
const ModalPhotoViewer: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onPrev, // Nhận hàm chuyển ảnh trước
  onNext // Nhận hàm chuyển ảnh sau
}) => {
  // ... (phần logic ModalClasses không đổi)
  const modalClasses = isOpen
    ? 'opacity-100 transition-opacity duration-300 ease-out'
    : 'opacity-0 pointer-events-none transition-opacity duration-300 ease-in'

  if (!isOpen) return null

  // Tạo một class cơ sở cho nút Prev/Next
  const navButtonClasses =
    'absolute top-1/2 transform -translate-y-1/2 p-3 text-white bg-black/50 hover:bg-black/80 rounded-full z-50 transition duration-200 focus:outline-none'

  return (
    <div
      // Backdrop (Không đổi)
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm ${modalClasses}`}
      onClick={onClose}
    >
      {onPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrev()
          }}
          className={`${navButtonClasses} left-4`}
          aria-label='Previous image'
        >
          <svg
            className='w-6 h-6'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 19l-7-7 7-7'></path>
          </svg>
        </button>
      )}

      <div
        className='relative m-8 transform scale-100 transition duration-300 ease-out'
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className='
            p-4
            overflow-hidden
            rounded-xl
            shadow-2xl
            ring-2
            ring-gray-700/50
          '
        >
          <img src={imageUrl} alt='Full size' className='h-auto    object-contain' />
        </div>
      </div>

      {/* NÚT CHUYỂN ẢNH SAU (NEXT) */}
      {onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          className={`${navButtonClasses} right-4`}
          aria-label='Next image'
        >
          <svg
            className='w-6 h-6'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7'></path>
          </svg>
        </button>
      )}
    </div>
  )
}

export default ModalPhotoViewer
