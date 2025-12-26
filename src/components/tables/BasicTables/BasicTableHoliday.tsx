import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Calendar, Edit2, Plus, Search, Trash2, Milestone } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'

import { formatDateToDDMMYYYY } from '../../../utils/validForm'

import Pagination from '../../pagination/Pagination'
import { CreateHolidayBody, Holiday } from '../../../types/holiday.type'
import holidayApi from '../../../api/holiday.api'
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'

const ITEMS_PER_PAGE = 10

export default function BasicTableHoliday() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isEditing, setIsEditing] = useState<Holiday | null>(null)
  const [formData, setFormData] = useState<CreateHolidayBody>({ holidayDate: '', description: '' })

  // State cho ConfirmModal
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null)

  // --- Fetch Data ---
  const { data: holidays = [], isLoading } = useQuery({
    queryKey: ['holidays'],
    queryFn: () => holidayApi.getHolidays().then((res) => res.data.data)
  })

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: (body: CreateHolidayBody) => holidayApi.createHoliday(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] })
      toast.success('Holiday created successfully')
      resetForm()
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: CreateHolidayBody }) => holidayApi.updateHoliday(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] })
      toast.success('Holiday updated successfully')
      resetForm()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => holidayApi.deleteHoliday(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] })
      toast.success('Holiday deleted successfully')
      setIsConfirmOpen(false)
    }
  })

  // --- Handlers ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditing) {
      updateMutation.mutate({ id: isEditing.id, body: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDeleteClick = (holiday: Holiday) => {
    setSelectedHoliday(holiday)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedHoliday) {
      deleteMutation.mutate(selectedHoliday.id)
    }
  }

  const resetForm = () => {
    setIsEditing(null)
    setFormData({ holidayDate: '', description: '' })
  }

  // --- Logic Phân trang & Tìm kiếm ---
  const filteredHolidays = useMemo(() => {
    return holidays.filter((h) => h.description.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [holidays, searchTerm])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredHolidays.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredHolidays, currentPage])

  const totalPages = Math.ceil(filteredHolidays.length / ITEMS_PER_PAGE)

  return (
    <div className='p-6 space-y-6 max-w-[1200px] mx-auto'>
      {/* STATS BAR */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-white dark:bg-gray-800/40 p-5 rounded-[1.5rem] border border-gray-100 dark:border-white/[0.05] flex items-center gap-4 shadow-sm text-brand-600'>
          <div className='p-3 rounded-xl bg-brand-50'>
            <Milestone size={20} />
          </div>
          <div>
            <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Total Holidays</p>
            <p className='text-xl font-black text-gray-900 dark:text-white'>{holidays.length} Days</p>
          </div>
        </div>
      </div>

      {/* FORM SECTION */}
      <div className='bg-white dark:bg-gray-800/40 p-6 rounded-[2rem] border border-gray-100 dark:border-white/[0.05] shadow-sm'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='p-3 bg-brand-50 text-brand-600 rounded-2xl'>
            <Calendar size={24} />
          </div>
          <div>
            <h2 className='text-xl font-black text-gray-900 dark:text-white'>Holiday Management</h2>
            <p className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Company non-working days</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='space-y-1'>
            <label className='text-[10px] font-black uppercase ml-2 text-gray-400'>Date</label>
            <input
              type='date'
              required
              value={formData.holidayDate}
              onChange={(e) => setFormData({ ...formData, holidayDate: e.target.value })}
              className='w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-brand-500 font-medium'
            />
          </div>
          <div className='space-y-1'>
            <label className='text-[10px] font-black uppercase ml-2 text-gray-400'>Description</label>
            <input
              type='text'
              placeholder='New Year Holiday...'
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className='w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-brand-500 font-medium'
            />
          </div>
          <div className='flex items-end gap-2'>
            <button
              type='submit'
              disabled={createMutation.isPending || updateMutation.isPending}
              className='flex-grow bg-brand-600 hover:bg-brand-700 text-white font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest disabled:opacity-50'
            >
              {isEditing ? <Edit2 size={16} /> : <Plus size={16} />}
              {isEditing ? 'Update' : 'Add'}
            </button>
            {isEditing && (
              <button
                type='button'
                onClick={resetForm}
                className='px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-xl font-black uppercase text-xs'
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* SEARCH BAR */}
      <div className='relative max-w-md group'>
        <input
          type='text'
          placeholder='Search description...'
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1) // Reset về trang 1 khi tìm kiếm
          }}
          className='w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-sm'
        />
        <Search className='absolute left-4 top-3.5 text-gray-400 group-focus-within:text-brand-500' size={18} />
      </div>

      {/* TABLE SECTION */}
      <div className='bg-white dark:bg-white/[0.03] rounded-[2rem] border border-gray-100 dark:border-white/[0.05] overflow-hidden shadow-sm'>
        <table className='w-full text-left'>
          <thead className='bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.05]'>
            <tr>
              <th className='py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest'>Holiday Date</th>
              <th className='py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest'>Description</th>
              <th className='py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-50 dark:divide-white/[0.05]'>
            {isLoading ? (
              <tr>
                <td colSpan={3} className='p-10 text-center font-bold text-gray-400'>
                  Loading...
                </td>
              </tr>
            ) : (
              paginatedData.map((holiday) => (
                <tr key={holiday.id} className='group hover:bg-gray-50/50 transition-colors'>
                  <td className='py-5 px-8 font-black text-gray-900 dark:text-white'>
                    {formatDateToDDMMYYYY(holiday.holidayDate)}
                  </td>
                  <td className='py-5 px-8 text-sm font-medium text-gray-600 dark:text-gray-400'>
                    {holiday.description}
                  </td>
                  <td className='py-5 px-8 text-right'>
                    <div className='flex justify-end gap-2'>
                      <button
                        onClick={() => {
                          setIsEditing(holiday)
                          setFormData({
                            holidayDate: holiday.holidayDate.split('T')[0],
                            description: holiday.description
                          })
                        }}
                        className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(holiday)}
                        className='p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors'
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className='p-6 border-t border-gray-50 dark:border-white/[0.05] flex justify-center'>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Delete Holiday'
        message={`Are you sure you want to delete the holiday "${selectedHoliday?.description}"?`}
      />
    </div>
  )
}
