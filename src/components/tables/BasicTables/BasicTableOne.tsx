/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router'

// Import APIs & Types
import userApi from '../../../api/user.api'
import { roleApi } from '../../../api/role.api'
import { AppPath } from '../../../constants/Paths'
import { Role as UserRoleConstant } from '../../../constants/Roles'
import { useAppContext } from '../../../context/AuthContext'
import { Status, User } from '../../../types/user.type'
import { Role } from '../../../types/role.type'
import { SuccessResponse } from '../../../utils/utils.type'

// Import Components
import ActionModal, { Button } from '../../ActionModal'
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import Badge from '../../ui/badge/Badge'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'

export enum RoleEnum {
  ADMIN = 'Admin',
  CUSTOMER = 'Customer',
  STORE_STAFF = 'StoreStaff',
  BEAUTY_ADVISOR = 'BeautyAdvisor',
  SCHEDULE_MANAGER = 'ScheduleManager'
}

const ITEMS_PER_PAGE = 10

// --- Stats Card Component ---
const StatCard = ({ title, count, colorClass, icon }: any) => (
  <div className='group bg-white dark:bg-gray-800/40 p-6 rounded-[2rem] border border-gray-100 dark:border-white/[0.05] shadow-sm hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none transition-all duration-300 flex flex-col gap-4 relative overflow-hidden'>
    {/* Một lớp phủ màu nhẹ khi hover */}
    <div
      className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-500 ${colorClass.split(' ')[0]}`}
    />

    <div className='flex items-center justify-between'>
      <div className={`p-3.5 rounded-2xl shadow-sm ${colorClass}`}>{icon}</div>
      <span className='flex h-2 w-2 rounded-full bg-current opacity-20 animate-pulse' />
    </div>

    <div>
      ư<p className='text-[11px] font-black text-gray-400 uppercase tracking-[0.12em] mb-1'>{title}</p>
      <div className='flex items-baseline gap-1'>
        <h3 className='text-3xl font-black text-gray-900 dark:text-white tracking-tight'>
          {count?.toLocaleString() || 0}
        </h3>
        <span className='text-[10px] font-bold text-gray-400'>Users</span>
      </div>
    </div>
  </div>
)

// --- Role Update Modal ---
const RoleChangeModal = ({ isOpen, onClose, user, rolesList, onConfirm }: any) => {
  if (!isOpen || !user) return null
  const [selectedRoleId, setSelectedRoleId] = useState(user.roleId || 'default')

  return (
    <div className='fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
      <div className='bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-gray-800'>
        <h3 className='text-xl font-bold mb-1 text-gray-900 dark:text-white'>Update User Role</h3>
        <p className='text-sm text-gray-500 mb-6'>
          Change permissions for <b>{user.userName}</b>
        </p>

        <div className='mb-6'>
          <label className='block text-xs font-bold uppercase text-gray-400 mb-2 tracking-tight'>Select New Role</label>
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className='w-full p-3 border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all cursor-pointer'
          >
            <option value='default' disabled>
              Choose a role...
            </option>
            {rolesList
              .filter((r: Role) => r.roleName !== RoleEnum.ADMIN)
              .map((role: Role) => (
                <option key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </option>
              ))}
          </select>
        </div>

        <div className='flex justify-end gap-3'>
          <button onClick={onClose} className='px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700'>
            Cancel
          </button>
          <Button
            onClick={() => onConfirm(user.userId, selectedRoleId)}
            color='primary'
            disabled={selectedRoleId === user.roleId || selectedRoleId === 'default'}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function BasicTableUsers() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { profile } = useAppContext()
  const isAdmin = profile?.role === UserRoleConstant.ADMIN

  // --- LOCAL STATE ---
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [isBanModalOpen, setIsBanModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // --- DATA FETCHING ---
  const {
    data: usersResponse,
    isLoading,
    refetch: refetchUsers
  } = useQuery<SuccessResponse<User[]>>({
    queryKey: ['users'],
    queryFn: () => userApi.getUsers().then((res) => res.data),
    enabled: isAdmin && !!profile,
    staleTime: 1000 * 60 * 5
  })

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleApi.getRoles().then((res) => res.data.data.items),
    enabled: isAdmin && !!profile && isRoleModalOpen,
    staleTime: Infinity
  })

  // --- COMPUTED STATS ---
  const stats = useMemo(() => {
    const all = usersResponse?.data || []
    const nonAdmins = all.filter((u) => u.roleName !== RoleEnum.ADMIN)

    return {
      total: nonAdmins.length,
      customers: nonAdmins.filter((u) => u.roleName === RoleEnum.CUSTOMER).length,
      beauty: nonAdmins.filter((u) => u.roleName === RoleEnum.BEAUTY_ADVISOR).length,
      storestaff: nonAdmins.filter((u) => u.roleName === RoleEnum.STORE_STAFF).length,
      scheduleManager: nonAdmins.filter((u) => u.roleName === RoleEnum.SCHEDULE_MANAGER).length
    }
  }, [usersResponse])

  // --- FILTERING & PAGINATION ---
  const filteredData = useMemo(() => {
    const allUsers = usersResponse?.data || []
    return allUsers.filter((user) => {
      if (user.roleName === RoleEnum.ADMIN) return false
      const matchesSearch =
        user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.emailAddress.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = selectedRoleFilter === 'All' || user.roleName === selectedRoleFilter
      return matchesSearch && matchesRole
    })
  }, [usersResponse, searchTerm, selectedRoleFilter])

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredData, currentPage])

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)

  // --- MUTATIONS ---
  const { mutate: unLockUser } = useMutation({
    mutationFn: (userId: string) => userApi.unLockUser(userId),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Account reactivated!')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  const { mutate: changeRoleMutation } = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) => userApi.changeRole(userId, roleId),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Role updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsRoleModalOpen(false)
    }
  })

  const roleFilters = ['All', ...Object.values(RoleEnum).filter((r) => r !== RoleEnum.ADMIN)]

  if (!isAdmin) return null

  return (
    <div className='space-y-6 max-w-[1600px] mx-auto'>
      {/* 1. TOP ANALYTICS SECTION */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5'>
        <StatCard
          title='Total Users'
          count={stats.total}
          colorClass='bg-blue-500 text-white dark:bg-blue-500/20 dark:text-blue-400'
          icon={
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
              />
            </svg>
          }
        />

        <StatCard
          title='Customers'
          count={stats.customers}
          colorClass='bg-emerald-500 text-white dark:bg-emerald-500/20 dark:text-emerald-400'
          icon={
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
              />
            </svg>
          }
        />

        <StatCard
          title='Beauty Advisors'
          count={stats.beauty}
          colorClass='bg-purple-500 text-white dark:bg-purple-500/20 dark:text-purple-400'
          icon={
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
              />
            </svg>
          }
        />

        <StatCard
          title='Store Staff'
          count={stats.storestaff}
          colorClass='bg-orange-500 text-white dark:bg-orange-500/20 dark:text-orange-400'
          icon={
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
              />
            </svg>
          }
        />

        <StatCard
          title='Schedule Manager'
          count={stats.scheduleManager}
          colorClass='bg-rose-500 text-white dark:bg-rose-500/20 dark:text-rose-400'
          icon={
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
          }
        />
      </div>

      {/* 2. FILTER & ACTION BAR */}
      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2'>
        <div className='flex items-center gap-1.5 p-1 bg-gray-100/80 dark:bg-white/5 w-fit rounded-2xl border border-gray-200/50 dark:border-white/5 shadow-inner'>
          {roleFilters.map((role) => (
            <button
              key={role}
              onClick={() => {
                setSelectedRoleFilter(role)
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-tighter ${
                selectedRoleFilter === role
                  ? 'bg-white dark:bg-brand-500 text-brand-600 dark:text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        <div className='relative group'>
          <input
            type='text'
            placeholder='Search name or email...'
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className='w-full md:w-80 pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-brand-500 outline-none text-sm transition-all group-hover:border-gray-300'
          />
          <svg
            className='w-5 h-5 absolute left-4 top-3 text-gray-400 group-focus-within:text-brand-500'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
        </div>
      </div>

      {/* 3. TABLE SECTION */}
      <div className='bg-white dark:bg-white/[0.03] rounded-[2rem] border border-gray-100 dark:border-white/[0.05] overflow-hidden shadow-xl shadow-gray-200/20 dark:shadow-none'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader className='bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.05]'>
              <TableRow>
                <TableCell
                  isHeader
                  className='py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]'
                >
                  Identity
                </TableCell>
                <TableCell
                  isHeader
                  className='py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] text-center'
                >
                  Role
                </TableCell>
                <TableCell
                  isHeader
                  className='py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] text-center'
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className='py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] text-right'
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell className='h-64 text-center text-gray-400 font-medium'>
                    Fetching user database...
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell className='h-64 text-center'>
                    <div className='flex flex-col items-center gap-2 opacity-30'>
                      <svg className='w-14 h-14' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='1'
                          d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
                        />
                      </svg>
                      <p className='text-sm font-bold'>No results found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow
                    key={user.userId}
                    className='group hover:bg-gray-50/80 dark:hover:bg-white/[0.01] transition-all'
                  >
                    <TableCell className='py-4 px-6'>
                      <div className='flex items-center gap-4'>
                        <div className='relative'>
                          <img
                            src={user.avatarUrl ?? '/default-avatar.png'}
                            className='w-12 h-12 rounded-2xl object-cover ring-2 ring-white dark:ring-gray-800 shadow-sm'
                            alt='avatar'
                          />
                          <div
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${user.status === Status.Active ? 'bg-emerald-500' : 'bg-red-500'}`}
                          />
                        </div>
                        <div>
                          <p className='font-bold text-gray-900 dark:text-white leading-tight'>{user.userName}</p>
                          <p className='text-[11px] text-gray-500 font-medium mt-0.5'>{user.emailAddress}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className='py-4 px-6 text-center'>
                      <span className='inline-flex px-3 py-1 rounded-lg text-[10px] font-black bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 uppercase tracking-widest'>
                        {user.roleName}
                      </span>
                    </TableCell>

                    <TableCell className='py-4 px-6 text-center'>
                      <Badge color={user.status === Status.Active ? 'success' : 'error'}>
                        {user.status.toUpperCase()}
                      </Badge>
                    </TableCell>

                    <TableCell className='py-4 px-6 text-right'>
                      <div className='flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                        <button
                          onClick={() => navigate(`${AppPath.PROFILE}/${user.userId}`)}
                          className='p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-xl transition-all'
                          title='View Profile'
                        >
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                            />
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                            />
                          </svg>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setIsRoleModalOpen(true)
                          }}
                          className='px-3 py-2 text-xs font-black text-indigo-600 hover:bg-indigo-50 rounded-xl uppercase tracking-tighter transition-all'
                        >
                          Role
                        </button>

                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            if (user.status === Status.Active) setIsBanModalOpen(true)
                            else setIsConfirmOpen(true)
                          }}
                          className={`px-3 py-2 text-xs font-black rounded-xl uppercase tracking-tighter transition-all ${
                            user.status === Status.Active
                              ? 'text-red-500 hover:bg-red-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {user.status === Status.Active ? 'Ban' : 'Unban'}
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* 4. PAGINATION FOOTER */}
        {totalPages > 1 && (
          <div className='px-8 py-5 flex items-center justify-between bg-gray-50/30 dark:bg-white/[0.01] border-t border-gray-100 dark:border-white/[0.05]'>
            <p className='text-xs text-gray-500 font-bold uppercase tracking-widest'>
              Showing page <span className='text-gray-900 dark:text-white'>{currentPage}</span> / {totalPages}
            </p>
            <div className='flex gap-3'>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className='p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl disabled:opacity-30 shadow-sm transition-all hover:border-brand-500 hover:text-brand-500'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 19l-7-7 7-7' />
                </svg>
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className='p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl disabled:opacity-30 shadow-sm transition-all hover:border-brand-500 hover:text-brand-500'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- EXTERNAL MODALS --- */}
      <ActionModal
        refetch={refetchUsers}
        isOpen={isBanModalOpen}
        onClose={() => setIsBanModalOpen(false)}
        user={selectedUser}
        onConfirm={() => {
          setIsBanModalOpen(false)
          setSelectedUser(null)
        }}
      />

      <ConfirmModal
        is={true}
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          if (selectedUser) unLockUser(selectedUser.userId)
          setIsConfirmOpen(false)
          setSelectedUser(null)
        }}
        title='Confirm Reactivation'
        message={`Are you sure you want to unban "${selectedUser?.userName}"? Their account will be accessible immediately.`}
      />

      <RoleChangeModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        user={selectedUser}
        rolesList={rolesData || []}
        onConfirm={(userId: string, roleId: string) => changeRoleMutation({ userId, roleId })}
      />
    </div>
  )
}
