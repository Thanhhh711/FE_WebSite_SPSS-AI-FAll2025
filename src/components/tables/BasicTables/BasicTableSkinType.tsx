/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useMemo, useState } from 'react'

import { toast } from 'react-toastify'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'
import Pagination from '../../pagination/Pagination'
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import { SkinType, SkinTypeForm } from '../../../types/skin.type'
import { skinTypeApi } from '../../../api/skin.api'
import SkinTypeModal from '../../skinModal/SkinTypeModal'

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
      <div className='flex justify-between items-center mb-5'>
        <input
          type='text'
          placeholder='Search by Skin Type Name...'
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className='w-1/3 min-w-[200px] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-gray-800 dark:text-white/90'
        />

        <button
          onClick={handleCreateNew}
          className='btn btn-primary flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-brand-xs hover:bg-brand-600 transition-colors'
        >
          Add New Skin Type
        </button>
      </div>

      <div className='overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] shadow-lg'>
        {/* Total Products Found (Mới) */}
        <div className='px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-end'>
          <span className='text-sm font-semibold text-indigo-700 dark:text-indigo-400  '>
            Total: **{filteredAndPaginatedTypes.totalItems}**
          </span>
        </div>

        <div className='max-w-full overflow-x-auto'>
          <Table>
            <TableHeader className='border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.05]'>
              <TableRow>
                <TableCell isHeader className='px-5 py-3 text-start w-[40%] text-gray-600 dark:text-gray-300'>
                  Skin Type Name
                </TableCell>

                <TableCell isHeader className='px-5 py-3 text-start w-[40%] text-gray-600 dark:text-gray-300'>
                  Description
                </TableCell>

                <TableCell isHeader className='px-5 py-3 text-end w-[40%] text-gray-600 dark:text-gray-300'>
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className='text-gray-800 dark:text-white/90'>
              {filteredAndPaginatedTypes.data.length === 0 ? (
                <TableRow>
                  <TableCell className='py-4 text-center text-gray-500 dark:text-gray-400'>
                    {searchTerm ? 'No skin types found.' : 'No skin types have been registered yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndPaginatedTypes.data.map((type) => (
                  <TableRow key={type.id} className='hover:bg-gray-50 dark:hover:bg-white/[0.06]'>
                    <TableCell className='px-5 py-4 font-medium max-w-[200px] truncate'>{type.name}</TableCell>
                    <TableCell className='px-5 py-4 font-medium max-w-[200px] truncate'>{type.description}</TableCell>

                    <TableCell className='px-5 py-3 text-end'>
                      <div className='flex justify-end gap-2'>
                        <button
                          onClick={() => handleOpenDetailModal(type, 'view')}
                          className='text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 text-sm p-1'
                          title='View Details'
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleOpenDetailModal(type, 'edit')}
                          className='text-brand-500 hover:text-brand-700 dark:hover:text-brand-300 text-sm p-1'
                          title='Edit Skin Type'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(type)}
                          className='text-red-500 hover:text-red-700 dark:hover:text-red-300 text-sm p-1'
                          title='Delete Skin Type'
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

        {filteredAndPaginatedTypes.totalItems > ITEMS_PER_PAGE && (
          <div className='p-4 border-t border-gray-100 dark:border-white/[0.05] flex justify-center'>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredAndPaginatedTypes.totalItems / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

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
        title='Confirm Skin Type Deletion'
        message={`Are you sure you want to delete the skin type "${selectedType?.name}"? This action cannot be undone.`}
      />
    </>
  )
}
