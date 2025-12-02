import { useState } from 'react'
import PageBreadcrumb from '../components/common/PageBreadCrumb'
import PageMeta from '../components/common/PageMeta'

// Placeholder components for tables/lists - you can replace with actual data fetching and modals
const BlogPostsTable = () => (
  <div className='overflow-x-auto'>
    <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
      <thead className='bg-gray-50 dark:bg-gray-800'>
        <tr>
          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300'>
            Title
          </th>
          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300'>
            Date
          </th>
          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300'>
            Status
          </th>
          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300'>
            Actions
          </th>
        </tr>
      </thead>
      <tbody className='bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700'>
        {/* Sample rows - replace with dynamic data */}
        <tr>
          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
            Sample Blog Post 1
          </td>
          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>2023-10-01</td>
          <td className='px-6 py-4 whitespace-nowrap'>
            <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'>
              Published
            </span>
          </td>
          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
            <button className='text-indigo-600 hover:text-indigo-900 mr-2'>Edit</button>
            <button className='text-red-600 hover:text-red-900'>Delete</button>
          </td>
        </tr>
        {/* Add more rows as needed */}
      </tbody>
    </table>
  </div>
)

const NewsTable = () => (
  <div className='overflow-x-auto'>
    <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
      <thead className='bg-gray-50 dark:bg-gray-800'>
        <tr>
          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300'>
            Title
          </th>
          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300'>
            Date
          </th>
          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300'>
            Category
          </th>
          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300'>
            Actions
          </th>
        </tr>
      </thead>
      <tbody className='bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700'>
        {/* Sample rows - replace with dynamic data */}
        <tr>
          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
            Sample News Article 1
          </td>
          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>2023-10-05</td>
          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>Company Update</td>
          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
            <button className='text-indigo-600 hover:text-indigo-900 mr-2'>Edit</button>
            <button className='text-red-600 hover:text-red-900'>Delete</button>
          </td>
        </tr>
        {/* Add more rows as needed */}
      </tbody>
    </table>
  </div>
)

const FaqsTable = () => (
  <div className='overflow-x-auto'>
    <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
      <thead className='bg-gray-50 dark:bg-gray-800'>
        <tr>
          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300'>
            Question
          </th>
          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300'>
            Answer Preview
          </th>
          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300'>
            Category
          </th>
          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300'>
            Status
          </th>
          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300'>
            Actions
          </th>
        </tr>
      </thead>
      <tbody className='bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700'>
        {/* Sample rows - replace with dynamic data */}
        <tr>
          <td className='px-6 py-4 text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate'>
            What is your return policy?
          </td>
          <td className='px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-md truncate'>
            Returns are accepted within 30 days for unused products...
          </td>
          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>Shipping & Returns</td>
          <td className='px-6 py-4 whitespace-nowrap'>
            <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'>
              Active
            </span>
          </td>
          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
            <button className='text-indigo-600 hover:text-indigo-900 mr-2'>Edit</button>
            <button className='text-red-600 hover:text-red-900'>Delete</button>
          </td>
        </tr>
        <tr>
          <td className='px-6 py-4 text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate'>
            How do I contact customer support?
          </td>
          <td className='px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-md truncate'>
            You can reach us via email at support@skincare.com or live chat...
          </td>
          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>Support</td>
          <td className='px-6 py-4 whitespace-nowrap'>
            <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'>
              Active
            </span>
          </td>
          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
            <button className='text-indigo-600 hover:text-indigo-900 mr-2'>Edit</button>
            <button className='text-red-600 hover:text-red-900'>Delete</button>
          </td>
        </tr>
        {/* Add more rows as needed */}
      </tbody>
    </table>
  </div>
)

export default function ManageContent() {
  const [activeTab, setActiveTab] = useState('blog') // Simple tab state for switching sections

  return (
    <div>
      <PageMeta
        title='Manage Content - Blog, News & FAQs | TailAdmin - Next.js Admin Dashboard Template'
        description='Manage blog posts, news articles, and frequently asked questions to support customers.'
      />
      <PageBreadcrumb pageTitle='Manage Content' />

      <div className='min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Manage Blog Posts, News, and FAQs</h1>
          <p className='mt-2 text-gray-600 dark:text-gray-300'>
            Update and organize content to better support your customers.
          </p>
        </div>

        {/* Tabs for switching between sections */}
        <div className='mb-6'>
          <nav className='flex space-x-8' aria-label='Tabs'>
            <button
              onClick={() => setActiveTab('blog')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'blog'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Blog Posts
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'news'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              News
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'faqs'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              FAQs
            </button>
          </nav>
        </div>

        {/* Content Sections */}
        <div className='space-y-8'>
          {activeTab === 'blog' && (
            <div>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>Blog Posts</h2>
                <button className='bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium'>
                  Add New Post
                </button>
              </div>
              <BlogPostsTable />
            </div>
          )}

          {activeTab === 'news' && (
            <div>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>News</h2>
                <button className='bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium'>
                  Add New Article
                </button>
              </div>
              <NewsTable />
            </div>
          )}

          {activeTab === 'faqs' && (
            <div>
              {/* Giới thiệu về FAQs */}
              <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
                <h3 className='text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2'>
                  Frequently Asked Questions (FAQs)
                </h3>
                <p className='text-sm text-blue-700 dark:text-blue-300'>
                  FAQs được dùng để hỗ trợ trả lời người dùng một cách nhanh chóng và hiệu quả. Quản lý các câu hỏi phổ
                  biến ở đây để giúp khách hàng tự tìm thấy thông tin, giảm tải cho đội ngũ hỗ trợ và cải thiện trải
                  nghiệm người dùng.
                </p>
              </div>

              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>Frequently Asked Questions</h2>
                <button className='bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium'>
                  Add New FAQ
                </button>
              </div>
              <FaqsTable />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
