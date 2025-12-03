// ManageBlogs.tsx

import { useState, useEffect, useCallback } from 'react'
import { Blog } from '../../types/media.type'
import { blogsApi } from '../../api/media.api'
import PageMeta from '../../components/common/PageMeta'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import BlogTable from '../../components/BlogComponent/BlogTable'
import BlogFormModal from '../../components/BlogComponent/BlogCreationForm'

export default function ManageBlogs() {
  // State to manage the Modal Form:
  // - null: Closed
  // - 'new': Open in Create mode
  // - string (ID): Open in Edit mode
  const [editingBlogId, setEditingBlogId] = useState<string | 'new' | null>(null)

  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to fetch the list of blogs
  const fetchBlogs = useCallback(async () => {
    try {
      setIsLoadingBlogs(true)
      setError(null)

      // API CALL: GET BLOGS
      const response = await blogsApi.getBlogs()
      setBlogs(response.data.data)
    } catch (err) {
      console.error('Failed to fetch blogs:', err)
      setError('Could not load blog posts. Please check the API endpoint and connection.')
    } finally {
      setIsLoadingBlogs(false)
    }
  }, [])

  // Run on mount to fetch initial data
  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  const openCreateModal = () => setEditingBlogId('new')
  const openEditModal = (id: string) => setEditingBlogId(id)
  const closeModal = () => setEditingBlogId(null)

  return (
    <div>
      <PageMeta
        title='Manage Blogs | Next.js Admin Dashboard'
        description='Create, edit, and publish engaging blog content.'
      />
      <PageBreadcrumb pageTitle='Manage Blog Posts' />

      <div className='min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Blog Management</h1>
          <p className='mt-2 text-gray-600 dark:text-gray-300'>
            Create, edit, and publish engaging content for your audience.
          </p>
        </div>

        <div>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>All Blog Posts</h2>
            <button
              onClick={openCreateModal}
              className='bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium'
            >
              + Add New Post
            </button>
          </div>

          {error && (
            <div className='p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-100 dark:bg-red-900/20 dark:text-red-400'>
              {error}
            </div>
          )}

          <BlogTable data={blogs} isLoading={isLoadingBlogs} onEdit={openEditModal} onDeleteSuccess={fetchBlogs} />
        </div>
      </div>

      {/* RENDER BLOG FORM MODAL */}
      {editingBlogId !== null && (
        <BlogFormModal
          blogId={editingBlogId === 'new' ? null : editingBlogId}
          onClose={closeModal}
          onSuccess={fetchBlogs}
        />
      )}
    </div>
  )
}
