// ModalPhotoViewer.tsx
import React from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  onPrev?: () => void
  onNext?: () => void
}

const ModalPhotoViewer: React.FC<ModalProps> = ({ isOpen, onClose, imageUrl, onPrev, onNext }) => {
  if (!isOpen) return null

  const navButtonClasses =
    'absolute top-1/2 transform -translate-y-1/2 p-3 text-white bg-black/40 hover:bg-white/20 backdrop-blur-md rounded-full z-[60] transition-all duration-200 focus:outline-none active:scale-90 border border-white/10'

  return (
    <div
      className='fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300'
      onClick={onClose}
    >
      {/* Nút Close góc trên bên phải */}
      <button
        className='absolute top-6 right-6 text-white/50 hover:text-white z-[70] transition-colors'
        onClick={onClose}
      >
        <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
        </svg>
      </button>

      {/* Nút Prev */}
      {onPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrev()
          }}
          className={`${navButtonClasses} left-6`}
          aria-label='Previous image'
        >
          <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 19l-7-7 7-7' />
          </svg>
        </button>
      )}

      {/* Container chứa ảnh - Giới hạn kích thước ở đây */}
      <div
        className='relative max-w-[90vw] max-h-[90vh] flex items-center justify-center m-4 animate-in zoom-in-95 duration-300'
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt='Full size'
          className='
            w-auto h-auto 
            max-w-full max-h-[85vh] 
            object-contain 
            rounded-2xl 
            shadow-[0_0_50px_rgba(0,0,0,0.5)]
            ring-1 ring-white/10
          '
        />
      </div>

      {/* Nút Next */}
      {onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          className={`${navButtonClasses} right-6`}
          aria-label='Next image'
        >
          <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
          </svg>
        </button>
      )}
    </div>
  )
}

export default ModalPhotoViewer
