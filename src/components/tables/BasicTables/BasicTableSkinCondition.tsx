/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useMemo, useState } from 'react'

import { toast } from 'react-toastify'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'
import Pagination from '../../pagination/Pagination'
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import { SkinCondition, SkinConditionForm } from '../../../types/skin.type'
import { skinConditionApi } from '../../../api/skin.api'
import SkinConditionModal from '../../skinModal/SkinConditionModal'
import { formatDateToDDMMYYYY } from '../../../utils/validForm'

const ITEMS_PER_PAGE = 10

export default function BasicTableSkinCondition() {
  console.log('aa')

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

  console.log('allConditions', allConditions)

  const filteredAndPaginatedConditions = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase()
    const filtered = allConditions.filter((condition: SkinCondition) =>
      condition.name.toLowerCase().includes(lowercasedSearchTerm)
    )

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    return {
      totalItems: filtered.length,
      data: filtered.slice(startIndex, endIndex)
    }
  }, [allConditions, searchTerm, currentPage])

  const { mutate: saveCondition } = useMutation({
    mutationFn: (data: SkinConditionForm & { id?: string }) => {
      if (data.id) {
        return skinConditionApi.updateSkinCondition(data.id, data)
      }

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

  if (isLoading) return <div className='p-6 text-center text-lg text-brand-500'>Loading skin conditions...</div>

  if (isError) return <div className='p-6 text-center text-lg text-red-500'>Failed to load skin conditions.</div>

  return (
    <>
      <div className='flex justify-between items-center mb-5'>
        <input
          type='text'
          placeholder='Search by Skin Condition Name...'
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className='w-1/3 min-w-[200px] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
        />

        <button
          onClick={handleCreateNew}
          className='btn btn-primary flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-brand-xs hover:bg-brand-600 transition-colors'
        >
          Add New Condition
        </button>
      </div>

      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-lg'>
        <div className='px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-end'>
          <span className='text-sm font-semibold text-indigo-700 dark:text-indigo-400  '>
            Total: **{filteredAndPaginatedConditions.totalItems}**
          </span>
        </div>

        <div className='max-w-full overflow-x-auto'>
          <Table>
            <TableHeader className='border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.05]'>
              <TableRow>
                {/* Cột 1: Condition Name - Rộng nhất (25%) */}
                <TableCell isHeader className='px-5 py-3 text-start w-[25%]'>
                  Condition Name
                </TableCell>
                {/* Cột 2: Severity Level - Rất hẹp (15%) */}
                <TableCell isHeader className='px-4 py-3 text-center w-[15%]'>
                  Severity Level
                </TableCell>

                {/* Cột 3: Is Chronic - Rất hẹp (15%) */}
                <TableCell isHeader className='px-4 py-3 text-center w-[15%]'>
                  Is Chronic
                </TableCell>

                <TableCell isHeader className='px-4 py-3 text-center w-[15%]'>
                  CreatedTime
                </TableCell>

                <TableCell isHeader className='px-4 py-3 text-center w-[15%]'>
                  LastUpdatedTime
                </TableCell>

                <TableCell isHeader className='px-4 py-3 text-center w-[15%]'>
                  DeletedTime
                </TableCell>

                {/* Cột 5: Actions - Cố định (25%) */}
                <TableCell isHeader className='px-5 py-3 text-end w-[25%]'>
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredAndPaginatedConditions.data.length === 0 ? (
                <TableRow>
                  <TableCell className='py-4 text-center text-gray-500'>
                    {searchTerm ? 'No conditions found.' : 'No skin conditions have been registered yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndPaginatedConditions.data.map((condition) => (
                  <TableRow key={condition.id}>
                    <TableCell className='px-5 py-4 font-medium max-w-[200px] truncate'>{condition.name}</TableCell>

                    <TableCell className='px-4 py-3 text-center'>{condition.severityLevel}</TableCell>
                    <TableCell className='px-4 py-3 text-center'>{condition.isChronic ? 'Yes' : 'No'}</TableCell>
                    <TableCell className='px-4 py-3 text-center'>
                      {formatDateToDDMMYYYY(condition.createdTime)}
                    </TableCell>
                    <TableCell className='px-4 py-3 text-center'>
                      {formatDateToDDMMYYYY(condition.deletedTime || undefined)}
                    </TableCell>
                    <TableCell className='px-4 py-3 text-center'>
                      {formatDateToDDMMYYYY(condition.deletedTime || undefined)}
                    </TableCell>

                    <TableCell className='px-5 py-3 text-end'>
                      <div className='flex justify-end gap-2'>
                        <button
                          onClick={() => handleOpenDetailModal(condition, 'view')}
                          className='text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 text-sm p-1'
                          title='View Details'
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleOpenDetailModal(condition, 'edit')}
                          className='text-brand-500 hover:text-brand-700 dark:hover:text-brand-300 text-sm p-1'
                          title='Edit Condition'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(condition)}
                          className='text-red-500 hover:text-red-700 dark:hover:text-red-300 text-sm p-1'
                          title='Delete Condition'
                        >
                          Delete
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
          <div className='p-4 border-t border-gray-100 dark:border-white/[0.05] flex justify-center'>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredAndPaginatedConditions.totalItems / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
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
        title='Confirm Condition Deletion'
        message={`Are you sure you want to delete the skin condition "${selectedCondition?.name}"? This action cannot be undone.`}
      />
    </>
  )
}
