/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { Edit3, Eye, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { skinTypeApi } from '../../../api/skin.api'
import { SkinType, SkinTypeForm } from '../../../types/skin.type'
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import Pagination from '../../pagination/Pagination'
import SkinTypeModal from '../../skinModal/SkinTypeModal'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'

const ITEMS_PER_PAGE = 10

export default function BasicTableSkinType() {
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<SkinType | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)

  const {
    data: typesResponse,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['skinTypes'],
    queryFn: skinTypeApi.getSkinTypes,
    staleTime: 1000 * 60 * 5
  })

  const allTypes = typesResponse?.data.data || []

  console.log('allTypes', allTypes)

  const filteredAndPaginatedTypes = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase()
    const filtered = allTypes.filter((type: SkinType) => type.name.toLowerCase().includes(lowercasedSearchTerm))

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    return {
      totalItems: filtered.length,
      data: filtered.slice(startIndex, endIndex)
    }
  }, [allTypes, searchTerm, currentPage])

  const { mutate: saveType } = useMutation({
    mutationFn: (data: SkinTypeForm & { id?: string }) => {
      if (data.id) {
        return skinTypeApi.updateSkinType(data.id, data)
      }
      return skinTypeApi.createSkinType(data)
    },
    onSuccess: (res) => {
      toast.success(res.data.message || 'Skin type saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['skinTypes'] })

      setIsModalOpen(false)
      setSelectedType(null)
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error saving skin type.')
    }
  })

  const { mutate: deleteType } = useMutation({
    mutationFn: (id: string) => skinTypeApi.deleteSkinType(id),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Skin type deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['skinTypes'] })
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error deleting skin type.')
    }
  })

  const handleOpenDetailModal = (type: SkinType, mode: 'view' | 'edit') => {
    setSelectedType(type)
    setIsViewMode(mode === 'view')
    setIsModalOpen(true)
  }

  const handleCreateNew = () => {
    setSelectedType(null)
    setIsViewMode(false)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (type: SkinType) => {
    setSelectedType(type)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedType?.id) {
      deleteType(selectedType.id)
      setIsConfirmOpen(false)
      setSelectedType(null)
    }
  }

  if (isLoading) return <div className='p-6 text-center text-lg text-brand-500'>Loading skin types...</div>

  if (isError) return <div className='p-6 text-center text-lg text-red-500'>Failed to load skin types.</div>

  return (
    <>
      {/* HEADER SECTION */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-gray-800 transition-all mb-6'>
        <div className='flex items-center gap-5'>
          {/* <div className='w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm'>
            <Layers size={30} />
          </div> */}
          <div>
            <h1 className='text-2xl font-black text-slate-800 dark:text-white tracking-tight'>Skin Types</h1>
            <p className='text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1'>
              Classification • {filteredAndPaginatedTypes.totalItems} Total Types
            </p>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='relative group'>
            <Search
              className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors'
              size={18}
            />
            <input
              type='text'
              placeholder='Search by Skin Type Name...'
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className='pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-gray-800/50 border-none rounded-2xl focus:ring-4 ring-indigo-500/10 w-full sm:w-64 transition-all text-sm font-bold dark:text-white'
            />
          </div>

          <button
            onClick={handleCreateNew}
            className='bg-slate-900 dark:bg-indigo-600 hover:scale-[1.02] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95'
          >
            <Plus size={18} /> Add New Skin Type
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className='bg-white dark:bg-gray-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-gray-800 overflow-hidden'>
        <div className='max-w-full overflow-x-auto'>
          <Table>
            <TableHeader className='bg-slate-50/50 dark:bg-gray-800/50'>
              <TableRow className='border-none'>
                <TableCell
                  isHeader
                  className='px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[35%]'
                >
                  Skin Type Name
                </TableCell>
                <TableCell
                  isHeader
                  className='px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[45%]'
                >
                  Description
                </TableCell>
                <TableCell
                  isHeader
                  className='px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right w-[20%]'
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredAndPaginatedTypes.data.length === 0 ? (
                <TableRow>
                  <TableCell className='py-20 text-center text-slate-400 font-bold italic uppercase tracking-widest'>
                    {searchTerm ? 'No matching skin types found.' : 'No skin types registered yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndPaginatedTypes.data.map((type) => (
                  <TableRow
                    key={type.id}
                    className='group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all border-b border-slate-50 dark:border-gray-800 last:border-0'
                  >
                    <TableCell className='px-8 py-7'>
                      <span className='font-black text-slate-800 dark:text-white text-base tracking-tight'>
                        {type.name}
                      </span>
                    </TableCell>

                    <TableCell className='px-8 py-7'>
                      <p className='text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-1 max-w-md'>
                        {type.description}
                      </p>
                    </TableCell>

                    <TableCell className='px-8 py-7 text-right'>
                      <div className='flex justify-end gap-2.5'>
                        <button
                          onClick={() => handleOpenDetailModal(type, 'view')}
                          className='p-3 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-2xl transition-all shadow-sm bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700'
                          title='View Details'
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenDetailModal(type, 'edit')}
                          className='p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-2xl transition-all shadow-sm bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700'
                          title='Edit Skin Type'
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(type)}
                          className='p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-800 rounded-2xl transition-all shadow-sm bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700'
                          title='Delete Skin Type'
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

        {/* PAGINATION */}
        {filteredAndPaginatedTypes.totalItems > ITEMS_PER_PAGE && (
          <div className='p-10 flex justify-center bg-slate-50/30 dark:bg-transparent border-t dark:border-gray-800'>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredAndPaginatedTypes.totalItems / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* MODALS */}
      {isModalOpen && (
        <SkinTypeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          skinType={selectedType}
          onSave={saveType}
          isViewMode={isViewMode}
        />
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Remove Skin Type'
        message={`Are you sure you want to delete "${selectedType?.name}"? This action cannot be undone.`}
      />
    </>
  )
}
