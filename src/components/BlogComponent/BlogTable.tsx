// BlogTable.tsx

import React from 'react'
import { blogsApi } from '../../api/media.api'
import { Blog } from '../../types/media.type'

interface BlogTableProps {
  data: Blog[]
  isLoading: boolean
  onEdit: (blogId: string) => void
  onDeleteSuccess: () => void
}

const BlogTable: React.FC<BlogTableProps> = ({ data, isLoading, onEdit, onDeleteSuccess }) => {
  const handleDelete = async (blogId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the blog post titled: "${title}"?`)) {
      try {
        // API CALL: DELETE BLOG
        await blogsApi.deleteBlog(blogId)

        alert(`Blog post "${title}" successfully deleted.`)
        onDeleteSuccess()
      } catch (error) {
        console.error('Failed to delete blog:', error)
        alert('Failed to delete blog post. Please try again.')
      }
    }
  }

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
        <tbody className='bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700'>
          {data.map((blog) => (
            <tr key={blog.id}>
              {/* THUMBNAIL COLUMN */}
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
                <button onClick={() => onEdit(blog.id)} className='text-indigo-600 hover:text-indigo-900 mr-2'>
                  Edit
                </button>
                <button onClick={() => handleDelete(blog.id, blog.title)} className='text-red-600 hover:text-red-900'>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default BlogTable
