/* eslint-disable prefer-const */
// File: src/components/common/Pagination.tsx

import React from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const MAX_PAGES_TO_SHOW = 5 // Số lượng nút trang tối đa hiển thị

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null
  }

  const pages: number[] = []

  // Tính toán phạm vi các nút trang hiển thị
  let startPage = Math.max(1, currentPage - Math.floor(MAX_PAGES_TO_SHOW / 2))
  let endPage = Math.min(totalPages, startPage + MAX_PAGES_TO_SHOW - 1)

  // Điều chỉnh startPage nếu endPage bị giới hạn
  if (endPage - startPage + 1 < MAX_PAGES_TO_SHOW) {
    startPage = Math.max(1, endPage - MAX_PAGES_TO_SHOW + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  const baseButtonClasses = 'px-4 py-2 mx-1 rounded-lg text-sm font-medium transition duration-150'
  const activeClasses = 'bg-brand-500 text-white shadow-brand-xs hover:bg-brand-600'
  const inactiveClasses =
    'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
  const disabledClasses = 'opacity-50 cursor-not-allowed'

  return (
    <div className='flex items-center justify-center space-x-2'>
      {/* Nút Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${baseButtonClasses} ${currentPage === 1 ? disabledClasses : inactiveClasses}`}
      >
        Previous
      </button>

      {/* Các nút số trang */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${baseButtonClasses} ${page === currentPage ? activeClasses : inactiveClasses}`}
        >
          {page}
        </button>
      ))}

      {/* Nút Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${baseButtonClasses} ${currentPage === totalPages ? disabledClasses : inactiveClasses}`}
      >
        Next
      </button>
    </div>
  )
}

export default Pagination
