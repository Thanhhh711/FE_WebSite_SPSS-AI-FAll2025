import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Search, UserCircle, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import userApi from '../../../api/user.api'
import { Role } from '../../../constants/Roles'
import { useAppContext } from '../../../context/AuthContext'
import { Status } from '../../../types/user.type'

const ITEMS_PER_PAGE = 10

export default function BasicTableRecord() {
  const navigate = useNavigate()
  const { profile } = useAppContext()

  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRoleFilter] = useState<string>('All')
  const [currentPage, setCurrentPage] = useState(1)
  //   const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const isBeautyAdvisor = profile?.role === Role.BEAUTY_ADVISOR

  // --- DATA FETCHING ---
  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ['users', profile?.role],
    queryFn: () =>
      isBeautyAdvisor ? userApi.getCustomersByRoleName().then((res) => res.data) : Promise.reject('Unauthorized'),
    enabled: !!profile
  })

  // --- FILTERING LOGIC ---
  const filteredData = useMemo(() => {
    const allUsers = usersResponse?.data || []
    return allUsers.filter((user) => {
      if (user.roleName === Role.ADMIN) return false
      const fullName = `${user.firstName} ${user.surName}`.toLowerCase()
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
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

  return (
    <div className='min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] p-4 md:p-8'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* HEADER */}
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <div>
            <h1 className='text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight'>User Record</h1>
            {/* <p className='text-slate-500 dark:text-slate-400 mt-1'>
              Manage system users, roles, and account permissions.
            </p> */}
          </div>
          <div className='bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-2'>
            <Users className='w-5 h-5 text-blue-500' />
            <span className='font-bold text-slate-700 dark:text-slate-200'>{filteredData.length}</span>
            <span className='text-slate-400 text-sm'>Total Users</span>
          </div>
        </div>

        {/* CONTROLS */}
        <div className='flex flex-col md:flex-row gap-4'>
          <div className='relative flex-1'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400' />
            <input
              type='text'
              placeholder='Search by name or email address...'
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className='w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm dark:text-slate-400'
            />
          </div>
          {/* <div className='flex gap-2'>
            <div className='relative'>
              <Filter className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className='pl-10 pr-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none font-medium text-slate-600 dark:text-slate-300 cursor-pointer shadow-sm'
              >
                <option value='All'>All Roles</option>
                <option value='Customer'>Customer</option>
                <option value='Expert'>Expert</option>
              </select>
            </div>
          </div> */}
        </div>

        {/* TABLE CONTAINER */}
        <div className='bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left'>
              <thead>
                <tr className='bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800'>
                  <th className='px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest'>
                    User Identity
                  </th>
                  <th className='px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center'>
                    Role
                  </th>
                  <th className='px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center'>
                    Status
                  </th>
                  <th className='px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-50 dark:divide-slate-800'>
                {isLoading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <tr key={i} className='animate-pulse'>
                        <td colSpan={4} className='px-8 py-8'>
                          <div className='h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl' />
                        </td>
                      </tr>
                    ))
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className='px-8 py-24 text-center'>
                      <div className='flex flex-col items-center opacity-40 dark:text-slate-400'>
                        <Search className='w-16 h-16 mb-4' />
                        <p className='text-lg font-bold'>No users found</p>
                        <p className='text-sm'>Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr
                      key={user.userId}
                      className='hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group'
                    >
                      <td className='px-8 py-5'>
                        <div className='flex items-center gap-4'>
                          <img
                            src={
                              user.avatarUrl || `https://ui-avatars.com/api/?name=${user.userName}&background=random`
                            }
                            className='w-12 h-12 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform'
                            alt='profile'
                          />
                          <div>
                            <p className='font-bold text-slate-900 dark:text-white'>
                              {user.firstName}
                              {user.surName}
                            </p>
                            <p className='text-xs text-slate-500 font-medium'>{user.emailAddress}</p>
                          </div>
                        </div>
                      </td>
                      <td className='px-8 py-5 text-center'>
                        <span className='px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'>
                          {user.roleName}
                        </span>
                      </td>
                      <td className='px-8 py-5 text-center'>
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            user.status === Status.Active
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full animate-pulse ${user.status === Status.Active ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          />
                          {user.status}
                        </div>
                      </td>
                      <td className='px-8 py-5 text-right'>
                        <div className='flex justify-end gap-1'>
                          <button
                            onClick={() => navigate(`/profile/${user.userId}`)}
                            className='p-2.5 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-emerald-500 transition-all hover:shadow-md'
                            title='User Profile'
                          >
                            <UserCircle className='w-5 h-5' />
                          </button>
                          {/* <button
                            className='p-2.5 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-500 transition-all hover:shadow-md'
                            title='Edit Role'
                          >
                            <ShieldAlert className='w-5 h-5' />
                          </button>

                          <button
                            className={`p-2.5 rounded-xl transition-all hover:shadow-md ${
                              user.status === Status.Active
                                ? 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                                : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'
                            }`}
                            title={user.status === Status.Active ? 'Restrict User' : 'Activate User'}
                          >
                            {user.status === Status.Active ? (
                              <UserX className='w-5 h-5' />
                            ) : (
                              <UserCheck className='w-5 h-5' />
                            )}
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER / PAGINATION */}
          {totalPages > 1 && (
            <div className='px-8 py-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between'>
              <p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>
                Page <span className='text-slate-900 dark:text-white'>{currentPage}</span> of {totalPages}
              </p>
              <div className='flex gap-3'>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className='flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:border-blue-500 transition-all shadow-sm'
                >
                  <ChevronLeft className='w-4 h-4' /> Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className='flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:border-blue-500 transition-all shadow-sm'
                >
                  Next <ChevronRight className='w-4 h-4' />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
