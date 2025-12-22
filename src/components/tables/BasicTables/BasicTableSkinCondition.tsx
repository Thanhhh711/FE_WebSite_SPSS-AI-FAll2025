/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Calendar, Clock, Edit3, Eye, Plus, Search, ShieldAlert, Trash2 } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { skinConditionApi } from '../../../api/skin.api'
import { SkinCondition, SkinConditionForm } from '../../../types/skin.type'
import { formatDateToDDMMYYYY } from '../../../utils/validForm'
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import Pagination from '../../pagination/Pagination'
import SkinConditionModal from '../../skinModal/SkinConditionModal'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'

const ITEMS_PER_PAGE = 10

export default function BasicTableSkinCondition() {
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedCondition, setSelectedCondition] = useState<SkinCondition | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)

  const {
    data: conditionsResponse,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['skinConditions'],
    queryFn: skinConditionApi.getSkinConditions,
    staleTime: 1000 * 60 * 5
  })

  const allConditions = conditionsResponse?.data.data || []

  const filteredAndPaginatedConditions = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase()
    const filtered = allConditions.filter((condition: SkinCondition) =>
      condition.name.toLowerCase().includes(lowercasedSearchTerm)
    )

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return {
      totalItems: filtered.length,
      data: filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    }
  }, [allConditions, searchTerm, currentPage])

  const { mutate: saveCondition } = useMutation({
    mutationFn: (data: SkinConditionForm & { id?: string }) => {
      if (data.id) return skinConditionApi.updateSkinCondition(data.id, data)
      return skinConditionApi.createSkinCondition(data)
    },
    onSuccess: (res) => {
      toast.success(res.data.message || 'Skin condition saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['skinConditions'] })
      setIsModalOpen(false)
      setSelectedCondition(null)
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error saving skin condition.')
    }
  })

  const { mutate: deleteCondition } = useMutation({
    mutationFn: (id: string) => skinConditionApi.deleteSkinCondition(id),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Skin condition deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['skinConditions'] })
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error deleting skin condition.')
    }
  })

  const handleOpenDetailModal = (condition: SkinCondition, mode: 'view' | 'edit') => {
    setSelectedCondition(condition)
    setIsViewMode(mode === 'view')
    setIsModalOpen(true)
  }

  const handleCreateNew = () => {
    setSelectedCondition(null)
    setIsViewMode(false)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (condition: SkinCondition) => {
    setSelectedCondition(condition)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedCondition?.id) {
      deleteCondition(selectedCondition.id)
      setIsConfirmOpen(false)
      setSelectedCondition(null)
    }
  }

  if (isLoading)
    return (
      <div className='p-20 text-center font-black text-indigo-500 animate-pulse uppercase tracking-widest'>
        Loading Health Data...
      </div>
    )
  if (isError)
    return <div className='p-20 text-center font-black text-rose-500 uppercase'>Failed to load conditions.</div>

  return (
    <Fragment>
      <div className='p-4 md:p-8 space-y-6 bg-transparent min-h-screen'>
        {/* Header Section */}
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-gray-800 transition-all'>
          <div className='flex items-center gap-5'>
            {/* <div className='w-14 h-14 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center text-rose-600 shadow-sm'>
              <Activity size={30} />
            </div> */}
            <div>
              <h1 className='text-2xl font-black text-slate-800 dark:text-white tracking-tight'>Skin Conditions</h1>
              <p className='text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1'>
                Medical Records • {filteredAndPaginatedConditions.totalItems} Active Cases
              </p>
            </div>
          </div>

          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='relative group'>
              <Search
                className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors'
                size={18}
              />
              <input
                type='text'
                placeholder='Search condition...'
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className='pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-gray-800/50 border-none rounded-2xl focus:ring-4 ring-rose-500/10 w-full sm:w-64 transition-all text-sm font-bold dark:text-white'
              />
            </div>

            <button
              onClick={handleCreateNew}
              className='bg-slate-900 dark:bg-rose-600 hover:scale-[1.02] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95'
            >
              <Plus size={18} /> Add New Condition
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className='bg-white dark:bg-gray-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-gray-800 overflow-hidden'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader className='bg-slate-50/50 dark:bg-gray-800/50'>
                <TableRow className='border-none'>
                  <TableCell
                    isHeader
                    className='px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'
                  >
                    Condition Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className='px-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center'
                  >
                    Severity
                  </TableCell>
                  <TableCell
                    isHeader
                    className='px-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center'
                  >
                    Chronic
                  </TableCell>
                  <TableCell
                    isHeader
                    className='px-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center'
                  >
                    Created
                  </TableCell>
                  <TableCell
                    isHeader
                    className='px-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center'
                  >
                    Updated
                  </TableCell>
                  <TableCell
                    isHeader
                    className='px-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center'
                  >
                    Deleted
                  </TableCell>
                  <TableCell
                    isHeader
                    className='px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right'
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredAndPaginatedConditions.data.length === 0 ? (
                  <TableRow>
                    <TableCell className='py-20 text-center text-slate-400 font-bold italic uppercase tracking-widest'>
                      No skin conditions recorded.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndPaginatedConditions.data.map((condition) => (
                    <TableRow
                      key={condition.id}
                      className='group hover:bg-rose-50/30 dark:hover:bg-rose-900/10 transition-all border-b border-slate-50 dark:border-gray-800 last:border-0'
                    >
                      <TableCell className='px-8 py-7'>
                        <span className='font-black text-slate-800 dark:text-white text-base tracking-tight'>
                          {condition.name}
                        </span>
                      </TableCell>

                      <TableCell className='px-4 py-3 text-center'>
                        <span
                          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            condition.severityLevel > 5
                              ? 'bg-rose-100 text-rose-600'
                              : 'bg-emerald-100 text-emerald-600'
                          }`}
                        >
                          Lv. {condition.severityLevel}
                        </span>
                      </TableCell>

                      <TableCell className='px-4 py-3 text-center text-sm font-bold text-slate-600 dark:text-slate-400'>
                        {condition.isChronic ? <ShieldAlert size={18} className='mx-auto text-amber-500' /> : '-'}
                      </TableCell>

                      <TableCell className='px-4 py-3 text-center'>
                        <div className='flex flex-col items-center gap-1 text-[11px] font-bold text-slate-500'>
                          <Calendar size={12} />
                          {formatDateToDDMMYYYY(condition.createdTime)}
                        </div>
                      </TableCell>

                      <TableCell className='px-4 py-3 text-center'>
                        <div className='flex flex-col items-center gap-1 text-[11px] font-bold text-slate-500'>
                          <Clock size={12} />
                          {condition.deletedTime ? formatDateToDDMMYYYY(condition.deletedTime) : 'None'}
                        </div>
                      </TableCell>

                      <TableCell className='px-4 py-3 text-center text-[11px] font-bold text-rose-400'>
                        {condition.deletedTime ? formatDateToDDMMYYYY(condition.deletedTime) : '-'}
                      </TableCell>

                      <TableCell className='px-8 py-7 text-right'>
                        <div className='flex justify-end gap-2.5'>
                          <button
                            onClick={() => handleOpenDetailModal(condition, 'view')}
                            className='p-3 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-2xl transition-all shadow-sm bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700'
                            title='View Details'
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            onClick={() => handleOpenDetailModal(condition, 'edit')}
                            className='p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-800 rounded-2xl transition-all shadow-sm bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700'
                            title='Edit Condition'
                          >
                            <Edit3 size={18} />
                          </button>

                          <button
                            onClick={() => handleDeleteClick(condition)}
                            className='p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-800 rounded-2xl transition-all shadow-sm bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700'
                            title='Delete Condition'
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredAndPaginatedConditions.totalItems > ITEMS_PER_PAGE && (
            <div className='p-10 flex justify-center bg-slate-50/30 dark:bg-transparent border-t dark:border-gray-800'>
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredAndPaginatedConditions.totalItems / ITEMS_PER_PAGE)}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <SkinConditionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          condition={selectedCondition}
          onSave={saveCondition}
          isViewMode={isViewMode}
        />
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Archive Record'
        message={`Are you sure you want to delete "${selectedCondition?.name}"?`}
      />
    </Fragment>
  )
}
