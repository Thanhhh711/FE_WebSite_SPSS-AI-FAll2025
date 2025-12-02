/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { toast } from 'react-toastify'
import userApi from '../../../api/user.api'
import { AppPath } from '../../../constants/Paths'
import { Role as UserRoleConstant } from '../../../constants/Roles'
import { useAppContext } from '../../../context/AuthContext'
import { Status, User } from '../../../types/user.type'
import { SuccessResponse } from '../../../utils/utils.type'
import ActionModal, { Button } from '../../ActionModal' // Dùng lại ActionModal cho Ban/Unban
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal' // Dùng lại ConfirmModal cho Unban
import Badge from '../../ui/badge/Badge'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'
// Import roleApi và Role interface để lấy danh sách roles và gán role
import { roleApi } from '../../../api/role.api'
import { useNavigate } from 'react-router'
import { Role } from '../../../types/role.type'

const ITEMS_PER_PAGE = 10

const MockRoleChangeModal = ({ isOpen, onClose, user, rolesList, onConfirm }: any) => {
  if (!isOpen || !user) return null
  const [selectedRoleId, setSelectedRoleId] = useState(user.roleId || 'default')

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm'>
        <h3 className='text-lg font-bold mb-4 text-gray-900 dark:text-white'>Set Role for **{user.userName}**</h3>
        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Select New Role</label>
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className='w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white'
          >
            <option value='default' disabled>
              Select a Role
            </option>
            {rolesList.map((role: Role) => (
              <option key={role.roleId} value={role.roleId}>
                {role.roleName}
              </option>
            ))}
          </select>
        </div>
        <div className='flex justify-end space-x-3'>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => onConfirm(user.userId, selectedRoleId)}
            color='primary'
            disabled={selectedRoleId === user.roleId || selectedRoleId === 'default'}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  )
}

// Hàm xác định màu Badge
const getStatusColor = (status: string, isDeleted: boolean) => {
  if (isDeleted) return 'error'
  switch (status) {
    case Status.Active:
      return 'success'
    case Status.UnActive:
      return 'warning'
    default:
      return 'info'
  }
}

export default function BasicTableUsers() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { profile } = useAppContext()
  const isAdmin = profile?.role === UserRoleConstant.ADMIN

  // --- STATE QUẢN LÝ ---
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isBanModalOpen, setIsBanModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false) // Dùng cho Unban
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false) // State cho Role Modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // --- API READ (USERS) ---
  const {
    data: usersResponse,
    isLoading,
    isError,
    refetch: refetchUsers
  } = useQuery<SuccessResponse<User[]>>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await userApi.getUsers()
      return res.data
    },
    enabled: isAdmin && !!profile,
    staleTime: 1000 * 60 * 5
  })
  const allUsers = usersResponse?.data || []

  // --- API READ (ROLES) ---
  const { data: rolesData } = useQuery({
    // Giả định Role API trả về PaginaResponse<Role[]>
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await roleApi.getRoles()
      return res.data.data.items
    },
    enabled: isAdmin && !!profile && isRoleModalOpen, // Chỉ fetch khi modal mở
    staleTime: Infinity
  })
  const rolesList = rolesData || []

  // --- LỌC VÀ PHÂN TRANG ---
  const filteredAndPaginatedUsers = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase()
    const filtered = allUsers.filter(
      (user: User) =>
        user.userName.toLowerCase().includes(lowercasedSearchTerm) ||
        user.emailAddress.toLowerCase().includes(lowercasedSearchTerm) ||
        user.roleName.toLowerCase().includes(lowercasedSearchTerm)
    )
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    return {
      totalItems: filtered.length,
      data: filtered.slice(startIndex, endIndex)
    }
  }, [allUsers, searchTerm, currentPage])

  const totalPages = Math.ceil(filteredAndPaginatedUsers.totalItems / ITEMS_PER_PAGE)
  const totalFilteredUsers = filteredAndPaginatedUsers.totalItems
  // --- API MUTATIONS (Ban/Unban/ChangeRole) ---

  const { mutate: unLockUser } = useMutation({
    mutationFn: (userId: string) => userApi.unLockUser(userId),
    onSuccess: (res) => {
      toast.success(res.data.message || 'User unlocked successfully!')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error unlocking user.')
    }
  })

  const { mutate: changeRoleMutation } = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) => userApi.changeRole(userId, roleId),
    onSuccess: (res) => {
      toast.success(res.data.message || 'User role changed successfully!')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      handleCloseRoleModal()
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error changing role.')
    }
  })

  // --- HÀM XỬ LÝ SỰ KIỆN ---

  const handleViewProfileClick = (userId: string) => {
    navigate(`${AppPath.PROFILE}/${userId}`)
  }

  // Xử lý Ban/Unban click
  const handleActionClick = (user: User) => {
    setSelectedUser(user)
    if (user.status === Status.Active) {
      setIsBanModalOpen(true)
    } else {
      setIsConfirmOpen(true)
    }
  }

  // Xử lý xác nhận Unban từ ConfirmModal
  const handleConfirmAction = () => {
    if (!selectedUser || selectedUser.status !== Status.UnActive) return
    unLockUser(selectedUser.userId)
    setIsConfirmOpen(false)
    setSelectedUser(null)
  }

  // Xử lý mở Modal Gán Role
  const handleOpenRoleModal = (user: User) => {
    setSelectedUser(user)
    setIsRoleModalOpen(true)
  }

  // Xử lý đóng Modal Gán Role
  const handleCloseRoleModal = () => {
    setIsRoleModalOpen(false)
    setSelectedUser(null)
  }

  // Xử lý xác nhận Gán Role
  const handleChangeRole = (userId: string, newRoleId: string) => {
    if (newRoleId && newRoleId !== selectedUser?.roleId) {
      console.log('newRoleId', newRoleId)

      changeRoleMutation({ userId, roleId: newRoleId })
    } else {
      handleCloseRoleModal()
    }
  }

  // --- LOGIC PHÂN TRANG (Áp dụng từ BasicTableOne) ---
  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }
  const goToPrevPage = () => goToPage(currentPage - 1)
  const goToNextPage = () => goToPage(currentPage + 1)

  const renderPaginationButtons = () => {
    const pages = []
    const maxButtons = 5 // Giới hạn số nút hiển thị

    // Tính toán khoảng trang hiển thị
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2))
    let endPage = Math.min(totalPages, startPage + maxButtons - 1)

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
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

  // --- RENDERING ---

  if (!isAdmin) return null
  if (isLoading) return <div className='p-6 text-center text-lg text-brand-500'>Đang tải danh sách người dùng...</div>
  if (isError) return <div className='p-6 text-center text-lg text-red-500'>Lỗi khi tải danh sách người dùng.</div>

  return (
    <>
      <div className='flex justify-between items-center mb-5'>
        {/* Thanh Tìm kiếm */}
        <input
          type='text'
          placeholder='Search by Name, Email, or Role...'
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className='w-full max-w-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
        />

        {/* Total Users Found */}
        <div className='px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg'>
          <span className='text-sm font-semibold text-indigo-700 dark:text-indigo-400'>
            Total Users Found: **{totalFilteredUsers}**
          </span>
        </div>
      </div>
      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-lg'>
        <div className='max-w-full overflow-x-auto'>
          <Table>
            {/* Table Header (Cột gọn gàng hơn) */}
            <TableHeader className='border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.05]'>
              <TableRow>
                <TableCell isHeader className='min-w-[180px] px-4 py-3 text-start'>
                  User
                </TableCell>
                <TableCell isHeader className='min-w-[160px] px-4 py-3 text-start'>
                  Email / Phone
                </TableCell>
                <TableCell isHeader className='min-w-[100px] px-4 py-3 text-start'>
                  Role
                </TableCell>
                <TableCell isHeader className='min-w-[100px] px-4 py-3 text-start'>
                  Status
                </TableCell>
                <TableCell isHeader className='min-w-[150px] px-4 py-3 text-start'>
                  Ban Reason
                </TableCell>
                <TableCell isHeader className='min-w-[180px] px-4 py-3 text-end'>
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody>
              {filteredAndPaginatedUsers.data.length === 0 ? (
                <TableRow>
                  <TableCell className='py-4 text-center text-gray-500'>
                    {searchTerm ? 'No users found matching your search.' : 'No users have been registered yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndPaginatedUsers.data.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell className='px-4 py-3 text-start'>
                      <div className='flex items-center gap-2'>
                        <div className='w-8 h-8 overflow-hidden rounded-full flex-shrink-0'>
                          <img
                            width={32}
                            height={32}
                            src={user.avatarUrl ?? '/default-avatar.png'}
                            alt={user.userName}
                          />
                        </div>
                        <span className='font-semibold text-gray-900 text-sm dark:text-white truncate max-w-[120px]'>
                          {user.userName}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className='px-4 py-3 text-start'>
                      <span className='block text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[150px]'>
                        {user.emailAddress}
                      </span>
                      <span className='block text-xs text-gray-500 dark:text-gray-400'>
                        {user.phoneNumber || 'N/A'}
                      </span>
                    </TableCell>

                    <TableCell className='px-4 py-3 text-start text-sm font-medium text-brand-600 dark:text-brand-400'>
                      {user.roleName}
                    </TableCell>

                    <TableCell className='px-4 py-3 text-start'>
                      <Badge size='md' color={getStatusColor(user.status, user.isDeleted)}>
                        {user.status}
                      </Badge>
                    </TableCell>

                    <TableCell className='px-4 py-3 text-start text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px]'>
                      {user.banReason || <span className='italic text-gray-400'>N/A</span>}
                    </TableCell>

                    <TableCell className='px-4 py-3 text-end whitespace-nowrap'>
                      <div className='flex justify-end gap-1'>
                        {/* Nút View Profile */}
                        <button
                          onClick={() => handleViewProfileClick(user.userId)}
                          className='text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 text-xs p-1'
                          title='View Profile'
                        >
                          View
                        </button>

                        {/* Nút Ban/Unban */}
                        <button
                          onClick={() => handleActionClick(user)}
                          className={`text-xs p-1 font-semibold ${
                            user.status === Status.UnActive
                              ? 'text-green-500 hover:text-green-700'
                              : 'text-red-500 hover:text-red-700'
                          }`}
                          title={user.status === Status.UnActive ? 'Unban User' : 'Ban User'}
                        >
                          {user.status === Status.UnActive ? 'Unban' : 'Ban'}
                        </button>

                        {/* Nút Change Role mới */}
                        <button
                          onClick={() => handleOpenRoleModal(user)}
                          className='text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs p-1 font-semibold'
                          title='Change Role'
                        >
                          Role
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Phân Trang (Áp dụng logic từ BasicTableOne) */}
        {totalPages > 1 && (
          <div className='flex justify-between items-center mt-4 p-4 border border-gray-200 rounded-xl dark:border-white/[0.05] dark:bg-white/[0.03]'>
            <p className='text-theme-sm text-gray-600 dark:text-gray-400'>
              Showing page **{currentPage}** of **{totalPages}**
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
      </div>

      {/* --- MODAL BAN (ActionModal) --- */}
      <ActionModal
        refetch={refetchUsers} // Sử dụng refetchUsers để tải lại danh sách người dùng
        isOpen={isBanModalOpen}
        onClose={() => setIsBanModalOpen(false)}
        user={selectedUser}
        onConfirm={() => {
          setIsBanModalOpen(false)
          setSelectedUser(null)
        }}
      />
      {/* --- MODAL XÁC NHẬN UNBAN (ConfirmModal) --- */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        title='Confirm User Unban'
        message={`Are you sure you want to unban the user "${selectedUser?.userName}"? This will immediately reactivate the account.`}
      />

      {/* --- MODAL GÁN ROLE (Mock) --- */}
      <MockRoleChangeModal
        isOpen={isRoleModalOpen}
        onClose={handleCloseRoleModal}
        user={selectedUser}
        rolesList={rolesList}
        onConfirm={handleChangeRole}
      />
    </>
  )
}
