// BlogTable.tsx

import React, { useState, useMemo } from 'react'
import { blogsApi } from '../../api/media.api'
import { Blog } from '../../types/media.type'
import ConfirmModal from '../CalendarModelDetail/ConfirmModal'

// --- HẰNG SỐ CỦA BẠN ---
const ITEMS_PER_PAGE = 10

// --- COMPONENT PHÂN TRANG (Tái sử dụng logic từ yêu cầu trước) ---
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  const pageNumbers = []
  let startPage = Math.max(1, currentPage - 2)
  let endPage = Math.min(totalPages, currentPage + 2)

  if (endPage - startPage < 4) {
    if (startPage === 1) endPage = Math.min(totalPages, 5)
    if (endPage === totalPages) startPage = Math.max(1, totalPages - 4)
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i)
  }

  return (
    <div className='flex justify-center space-x-2'>
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className='px-3 py-1 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50'
      >
        Previous
      </button>

      {startPage > 1 && <span className='px-3 py-1 text-sm font-medium text-gray-500 dark:text-gray-400'>...</span>}

      {pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            number === currentPage
              ? 'bg-indigo-600 text-white dark:bg-indigo-500'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
          }`}
        >
          {number}
        </button>
      ))}

      {endPage < totalPages && (
        <span className='px-3 py-1 text-sm font-medium text-gray-500 dark:text-gray-400'>...</span>
      )}

      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className='px-3 py-1 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50'
      >
        Next
      </button>
    </div>
  )
}
// --- HẾT COMPONENT PHÂN TRANG ---

interface BlogTableProps {
  data: Blog[]
  isLoading: boolean
  onEdit: (blogId: string) => void
  onDeleteSuccess: () => void
}

const BlogTable: React.FC<BlogTableProps> = ({ data, isLoading, onEdit, onDeleteSuccess }) => {
  // --- STATE VÀ LOGIC CHO CONFIRM MODAL ---
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null)

  // --- STATE CHO PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1)

  // Tính toán dữ liệu hiện tại dựa trên trang
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return data.slice(startIndex, endIndex)
  }, [data, currentPage])

  // --- HÀM XỬ LÝ XÓA SỬ DỤNG MODAL (KHÔNG DÙNG alert) ---

  // 1. Hàm mở modal
  const handleDelete = (blog: Blog) => {
    setBlogToDelete(blog)
    setIsConfirmOpen(true)
  }

  // 2. Hàm Xác nhận Xóa (KHÔNG DÙNG alert)
  const handleConfirmDelete = async () => {
    if (!blogToDelete) return

    setIsConfirmOpen(false)

    try {
      // API CALL: DELETE BLOG
      await blogsApi.deleteBlog(blogToDelete.id)

      // KHÔNG DÙNG alert: Chỉ gọi callback để tải lại dữ liệu
      onDeleteSuccess()

      // Logic: Nếu xóa thành công và trang hiện tại bị trống (chỉ có 1 item và bị xóa), lùi về trang trước (trừ trang 1)
      if (currentItems.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    } catch (error) {
      console.error('Failed to delete blog:', error)
      // KHÔNG DÙNG alert: Trong ứng dụng thực tế, bạn nên dùng Toast/Notification
      // để thông báo lỗi thay vì alert. Ở đây tôi chỉ console.error.
      // alert('Failed to delete blog post. Please try again.')
    } finally {
      setBlogToDelete(null)
    }
  }

  // --- RENDER CHÍNH ---
  if (isLoading) {
    return <p className='text-center py-8 dark:text-gray-300'>Loading blog posts...</p>
  }

  if (data.length === 0) {
    return (
      <p className='text-center py-8 dark:text-gray-300'>No blog posts found. Click "Add New Post" to create one.</p>
    )
  }

  return (
    <div className='overflow-x-auto'>
      <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
        {/* Table Head */}
        <thead className='bg-gray-50 dark:bg-gray-800'>
          <tr>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300'>
              Thumbnail Image
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300'>
              Title
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300'>
              Author
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300'>
              Last Updated
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300'>
              Actions
            </th>
          </tr>
        </thead>
        {/* Table Body */}
        <tbody className='bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700'>
          {currentItems.map((blog) => (
            <tr key={blog.id} className='hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150'>
              <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
                {blog.thumbnail && (
                  <img
                    src={blog.thumbnail}
                    alt={blog.title}
                    className='w-16 h-10 object-cover rounded-md'
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = 'https://via.placeholder.com/64x40?text=No+Image'
                    }}
                  />
                )}
              </td>
              <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate'>
                {blog.title}
              </td>
              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                {blog.authorName}
              </td>
              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                {new Date(blog.lastUpdatedTime).toLocaleDateString('en-US')}
              </td>
              <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                <button
                  onClick={() => onEdit(blog.id)}
                  className='text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-2'
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(blog)}
                  className='text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TÁI SỬ DỤNG CẤU TRÚC PHÂN TRANG */}
      {data.length > ITEMS_PER_PAGE && (
        <div className='p-4 border-t border-gray-100 dark:border-white/[0.05] flex justify-center'>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(data.length / ITEMS_PER_PAGE)}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Confirm Blog Deletion'
        message={`Are you sure you want to delete the blog post titled: "${blogToDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  )
}

export default BlogTable
