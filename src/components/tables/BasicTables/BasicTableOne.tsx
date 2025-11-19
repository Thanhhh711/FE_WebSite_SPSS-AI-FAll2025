// src/components/BasicTableOne.tsx

import { useEffect, useMemo, useState } from 'react'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table' // Thay đổi path tùy theo cấu trúc thư mục thực tế của bạn
import Badge from '../../ui/badge/Badge' // Thay đổi path
import ActionModal, { Button } from '../../ActionModal'
import { Status, User } from '../../../types/user.type'
import { useQuery } from '@tanstack/react-query'
import userApi from '../../../api/user.api'
import { PaginaResponse } from '../../../types/auth.type'
import { useNavigate } from 'react-router'
import { AppPath } from '../../../constants/Paths'
import { toast } from 'react-toastify'
import { useAppContext } from '../../../context/AuthContext'
import { Role } from '../../../constants/Roles'

// Dùng mock Button cho Action Cell

// ---

// src/data/tableData.ts

// const { data: pagingData } = useQuery<PagingData<User>>({
//   queryKey: ['users'],
//   queryFn: async () => {
//     const res = await userApi.getUsers() // res: UserResponse
//     return res.data // trả về data bên trong
//   }
// })

// export const initialTableData: User[] = [
//   {
//     id: 1,
//     user: {
//       image: '/images/user/user-17.jpg',
//       name: 'Lindsey Curtis',
//       role: 'Web Designer'
//     },
//     projectName: 'Agency Website',
//     team: {
//       images: ['/images/user/user-22.jpg', '/images/user/user-23.jpg', '/images/user/user-24.jpg']
//     },
//     budget: '3.9K',
//     status: 'Active',
//     isBanned: false
//   },
//   {
//     id: 2,
//     user: {
//       image: '/images/user/user-18.jpg',
//       name: 'Kaiya George',
//       role: 'Project Manager'
//     },
//     projectName: 'Technology',
//     team: {
//       images: ['/images/user/user-25.jpg', '/images/user/user-26.jpg']
//     },
//     budget: '24.9K',
//     status: 'Pending',
//     isBanned: true,
//     reason: 'Late delivery of first milestone.'
//   },
//   {
//     id: 3,
//     user: {
//       image: '/images/user/user-17.jpg',
//       name: 'Zain Geidt',
//       role: 'Content Writing'
//     },
//     projectName: 'Blog Writing',
//     team: {
//       images: ['/images/user/user-27.jpg']
//     },
//     budget: '12.7K',
//     status: 'Active',
//     isBanned: false
//   },
//   {
//     id: 4,
//     user: {
//       image: '/images/user/user-20.jpg',
//       name: 'Abram Schleifer',
//       role: 'Digital Marketer'
//     },
//     projectName: 'Social Media',
//     team: {
//       images: ['/images/user/user-28.jpg', '/images/user/user-29.jpg', '/images/user/user-30.jpg']
//     },
//     budget: '2.8K',
//     status: 'Cancel',
//     isBanned: false
//   },
//   {
//     id: 5,
//     user: {
//       image: '/images/user/user-21.jpg',
//       name: 'Carla George',
//       role: 'Front-end Developer'
//     },
//     projectName: 'Website',
//     team: {
//       images: ['/images/user/user-31.jpg', '/images/user/user-32.jpg', '/images/user/user-33.jpg']
//     },
//     budget: '4.5K',
//     status: 'Active',
//     isBanned: false
//   }
// ]

// Function to determine the badge color
const getStatusColor = (status: string, isDeleted: boolean) => {
  if (isDeleted) return 'error'
  switch (status) {
    case 'Active':
      return 'success'
    case 'Pending':
      return 'warning'
    case 'Cancel':
      return 'error'
    default:
      return 'info'
  }
}

// Đảm bảo import các component UI và types cần thiết

export default function BasicTableOne() {
  const { profile } = useAppContext()

  const isAdmin = profile?.role === Role.ADMIN

  const [tableData, setTableData] = useState<User[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalData, setModalData] = useState<User | null>(null)
  const navigate = useNavigate()
  // Thêm trạng thái cho Phân trang
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // Đặt số mục mỗi trang là 10

  const { data: pagingData, refetch } = useQuery<PaginaResponse<User>>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await userApi.getUsers()
      console.log('resQuery', res.data.data.items)
      return res.data // Trả về data bên trong
    },
    enabled: isAdmin && !!profile,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false
  })

  useEffect(() => {
    if (pagingData?.data.items) {
      console.log('res', pagingData.data.items)

      toast.success(pagingData.message)
      setTableData(pagingData.data.items)
      // Khi dữ liệu mới được tải, reset về trang 1
      setCurrentPage(1)
    }
  }, [pagingData])

  const handleViewProfileClick = (userId: string) => {
    // Sử dụng navigate để chuyển hướng đến /profile/:userId
    navigate(`${AppPath.PROFILE}/${userId}`)
  }

  // Logic Phân trang: Cắt dữ liệu hiển thị trên trang hiện tại
  const totalItems = tableData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * itemsPerPage
    const lastPageIndex = firstPageIndex + itemsPerPage
    return tableData.slice(firstPageIndex, lastPageIndex)
  }, [currentPage, tableData])

  if (!isAdmin) return null

  // Mở modal và thiết lập dữ liệu cho order được chọn
  const handleActionClick = async (user: User) => {
    if (user.status === Status.Active) {
      setModalData(user)
      setIsModalOpen(true)
    } else {
      await userApi.unLockUser(user.userId)
      refetch()
    }
  }

  // Đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setModalData(null)
  }

  // Logic xử lý Ban/Unban từ Modal
  const handleConfirmAction = (userId: string, reason: string, isBanning: boolean) => {
    if (!tableData) return

    setTableData((prevData) =>
      prevData!.map((user) => {
        if (user.userId === userId) {
          const newStatus: Status = isBanning ? Status.UnActive : Status.Active
          return {
            ...user,
            status: newStatus,
            reason: isBanning ? reason : ''
          }
        }
        return user
      })
    )
  }

  // Hàm xử lý chuyển trang
  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  const goToPrevPage = () => goToPage(currentPage - 1)
  const goToNextPage = () => goToPage(currentPage + 1)

  const totalUsers = currentTableData.length

  // Hàm render các nút số trang
  const renderPaginationButtons = () => {
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          // Tailwind CSS cho nút trang
          className={`px-3 py-1 mx-1 rounded-md text-theme-sm transition-colors ${
            currentPage === i
              ? 'bg-blue-600 text-white font-semibold'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.1]'
          }`}
        >
          {i}
        </button>
      )
    }
    return pages
  }

  return (
    <>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>👥 List User</h2>
        <div className='px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg'>
          <span className='text-sm font-semibold text-indigo-700 dark:text-indigo-400'>Total: **{totalUsers}**</span>
        </div>
      </div>

      <div className='overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg'>
        <div className='max-w-full overflow-x-auto'>
          <Table>
            {/* Table Header */}
            <TableHeader className='border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'>
              <TableRow>
                <TableCell
                  isHeader
                  className='min-w-[200px] px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300'
                >
                  User
                </TableCell>
                <TableCell
                  isHeader
                  className='min-w-[180px] px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300'
                >
                  Email / Phone Number
                </TableCell>
                <TableCell
                  isHeader
                  className='min-w-[250px] px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300'
                >
                  Default Address
                </TableCell>
                <TableCell
                  isHeader
                  className='px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300'
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className='min-w-[200px] px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300'
                >
                  Reason
                </TableCell>
                <TableCell
                  isHeader
                  className='px-6 py-3 text-end text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300'
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body - Sử dụng currentTableData đã được cắt */}
            <TableBody className='divide-y divide-gray-200 dark:divide-gray-700'>
              {currentTableData.map((user) => (
                <TableRow
                  key={user.userId}
                  className={
                    user.status === Status.UnActive
                      ? 'bg-red-50/50 dark:bg-red-900/10 hover:bg-red-100/50 dark:hover:bg-red-900/20 transition duration-150'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150'
                  }
                >
                  <TableCell className='px-6 py-4 text-start'>
                    {/* User Info Block - Ảnh to hơn một chút */}
                    <div className='flex items-center gap-3'>
                      <div className='w-11 h-11 overflow-hidden rounded-full flex-shrink-0'>
                        <img width={44} height={44} src={user.avatarUrl ?? '/default-avatar.png'} alt={user.userName} />
                      </div>
                      <div>
                        <span className='block font-semibold text-gray-900 text-sm dark:text-white'>
                          {user.userName}
                        </span>
                        <span className='block text-gray-500 text-xs dark:text-gray-400'>{user.roleName}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className='px-6 py-4 text-start'>
                    {/* Email và SĐT gộp chung để tiết kiệm cột và tạo cấu trúc */}
                    <span className='block text-sm font-medium text-gray-800 dark:text-gray-200'>
                      {user.emailAddress}
                    </span>
                    <span className='block text-xs text-gray-500 dark:text-gray-400'>{user.phoneNumber || 'N/A'}</span>
                  </TableCell>

                  <TableCell className='px-6 py-4 text-start max-w-sm'>
                    {/* Hiển thị Địa chỉ chi tiết hơn */}
                    {user.addresses?.find((a) => a.isDefault) ? (
                      <>
                        <span className='block text-sm text-gray-800 dark:text-gray-200'>
                          {user.addresses.find((a) => a.isDefault)?.addressLine1}
                        </span>
                        <span className='block text-xs text-gray-500 dark:text-gray-400'>
                          {user.addresses.find((a) => a.isDefault)?.city}
                        </span>
                      </>
                    ) : (
                      <span className='text-sm italic text-gray-400 dark:text-gray-500'>No default address</span>
                    )}
                  </TableCell>

                  <TableCell className='px-6 py-4 text-start'>
                    <Badge size='md' color={getStatusColor(user.status, user.isDeleted)}>
                      {user.isDeleted ? 'Banned' : user.status}
                    </Badge>
                  </TableCell>

                  <TableCell className='px-6 py-4 text-start max-w-xs whitespace-normal text-sm text-gray-500 dark:text-gray-400'>
                    {/* Căn chỉnh text nhạt hơn để nhấn mạnh vào trạng thái và tên */}
                    {user.banReason || <span className='italic text-gray-400'>Không có lý do</span>}
                  </TableCell>

                  <TableCell className='px-6 py-4 text-end whitespace-nowrap'>
                    {/* Nút View Profile (Primary/Outline) */}
                    <Button onClick={() => handleViewProfileClick(user.userId)} className='mr-2 text-sm'>
                      View Profile
                    </Button>

                    {/* Nút Ban/Unban (Action Chính) */}
                    <Button
                      onClick={() => handleActionClick(user)}
                      color={user.status === Status.UnActive ? 'success' : 'danger'}
                      className='text-sm font-semibold'
                    >
                      {user.status === Status.UnActive ? 'Unban' : 'Ban'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* --- Phân Trang (Pagination) --- */}
      {totalPages > 1 && (
        <div className='flex justify-between items-center mt-4 p-4 border border-gray-200 rounded-xl dark:border-white/[0.05] dark:bg-white/[0.03]'>
          <p className='text-theme-sm text-gray-600 dark:text-gray-400'>
            Hiển thị mục **{(currentPage - 1) * itemsPerPage + 1}** đến **
            {Math.min(currentPage * itemsPerPage, totalItems)}** trên tổng số **{totalItems}**
          </p>
          <div className='flex items-center'>
            {/* Nút Previous */}
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className='px-3 py-1 mx-1 rounded-md text-theme-sm disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.1]'
            >
              Previous
            </button>

            {/* Các nút số trang */}
            {renderPaginationButtons()}

            {/* Nút Next */}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className='px-3 py-1 mx-1 rounded-md text-theme-sm disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.1]'
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Render the Action Modal */}
      <ActionModal
        refetch={refetch}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={modalData}
        onConfirm={handleConfirmAction}
      />
    </>
  )
}
