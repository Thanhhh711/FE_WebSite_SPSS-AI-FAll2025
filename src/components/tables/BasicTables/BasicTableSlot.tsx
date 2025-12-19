/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { slotApi } from '../../../api/slot.api'
import { Role } from '../../../constants/Roles'
import { useAppContext } from '../../../context/AuthContext'
import { Slot } from '../../../types/registration.type'
import { SlotForm } from '../../../types/slot.type'
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import Pagination from '../../pagination/Pagination'
import SlotModal from '../../SlotModal/SlotModal'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'
import { SuccessResponse } from '../../../utils/utils.type'

const ITEMS_PER_PAGE = 10

export default function BasicTableSlot() {
  const { profile } = useAppContext()
  const queryClient = useQueryClient()

  // --- STATE MANAGEMENT ---
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)

  // --- API READ (R) ---
  const {
    data: slotsRes,
    isLoading,
    isError
  } = useQuery<SuccessResponse<Slot[]>>({
    queryKey: ['slots'],
    queryFn: async () => {
      const res = await slotApi.getSlots()
      return res.data
    },
    staleTime: 1000 * 60 * 5
  })

  const allSlots: Slot[] = slotsRes?.data ?? []

  // --- FILTERING AND PAGINATION ---
  const filteredAndPaginatedSlots = useMemo(() => {
    // Filter by slot minutes or break minutes (or search term that can be converted to number)
    const filtered = allSlots.filter((slot: Slot) => {
      const lowercasedSearchTerm = searchTerm.toLowerCase()
      // Check if the search term matches slotMinutes or breakMinutes (converted to string)
      return (
        slot.slotMinutes.toString().includes(lowercasedSearchTerm) ||
        slot.breakMinutes.toString().includes(lowercasedSearchTerm)
      )
    })

    // Pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    return {
      totalItems: filtered.length,
      data: filtered.slice(startIndex, endIndex)
    }
  }, [allSlots, searchTerm, currentPage])

  // --- API MUTATIONS (C, U, D) ---

  // Mutation for Create and Update
  const { mutate: saveSlot } = useMutation({
    mutationFn: (data: SlotForm & { id?: string }) => {
      if (data.id) {
        // Update
        return slotApi.updateSlot(data.id, data)
      }
      // Create
      return slotApi.createSlot(data)
    },
    onSuccess: (res) => {
      toast.success(res.data.message || 'Slot saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      // Reset state and close modal after successful save
      setIsSlotModalOpen(false)
      setSelectedSlot(null)
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error saving slot.')
    }
  })

  // Mutation for Delete
  const { mutate: deleteSlot } = useMutation({
    mutationFn: (id: string) => slotApi.deleteSlot(id),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Slot deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['slots'] })
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error deleting slot.')
    }
  })

  // --- EVENT HANDLERS ---

  const handleOpenDetailModal = (slot: Slot, mode: 'view' | 'edit') => {
    setSelectedSlot(slot)
    setIsViewMode(mode === 'view')
    setIsSlotModalOpen(true)
  }

  const handleCreateNew = () => {
    setSelectedSlot(null) // Reset to open Create mode
    setIsViewMode(false)
    setIsSlotModalOpen(true)
  }

  const handleDeleteClick = (slot: Slot) => {
    setSelectedSlot(slot)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedSlot?.id) {
      deleteSlot(selectedSlot.id)
      setIsConfirmOpen(false)
      setSelectedSlot(null)
    }
  }

  // --- RENDERING ---

  if (isLoading) return <div className='p-6 text-center text-lg text-brand-500'>Loading Slot list...</div>
  if (isError) return <div className='p-6 text-center text-lg text-red-500'>Error loading slot list.</div>

  return (
    <>
      <div className='flex justify-between items-center mb-5'>
        {/* Search Bar */}
        <input
          type='text'
          placeholder='Search by Slot/Break Minutes...'
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1) // Reset page on search
          }}
          className='dark:text-white w-1/3 min-w-[200px] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
        />

        {/* Create Button */}

        {profile?.role === Role.ADMIN && (
          <button
            onClick={handleCreateNew}
            className='btn btn-primary flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-brand-xs hover:bg-brand-600 transition-colors'
          >
            Add New Slot
          </button>
        )}
      </div>

      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-lg'>
        <div className='px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-end'>
          <span className='text-sm font-semibold text-indigo-700 dark:text-indigo-400'>
            Total: **{filteredAndPaginatedSlots.totalItems}**
          </span>
        </div>
        <div className='max-w-full overflow-x-auto'>
          <Table>
            {/* Table Header */}
            <TableHeader className='dark:text-white border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.05]'>
              <TableRow>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Slot Duration
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Break Duration
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Created Time
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-end'>
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody>
              {filteredAndPaginatedSlots.data.length === 0 ? (
                <TableRow>
                  <TableCell className='py-4 text-center text-gray-500'>
                    {searchTerm ? 'No matching slots found.' : 'No slots have been registered.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndPaginatedSlots.data.map((slot) => (
                  <TableRow key={slot.id} className='dark:text-gray-300'>
                    <TableCell className='px-5 py-4 font-medium truncate'>{slot.slotMinutes} min</TableCell>
                    <TableCell className='px-4 py-3 text-start'>{slot.breakMinutes} min</TableCell>
                    <TableCell className='px-4 py-3 text-start'>
                      {new Date(slot.createdTime).toLocaleDateString()}
                    </TableCell>
                    <TableCell className='px-4 py-3 text-end'>
                      <div className='flex justify-end gap-2'>
                        {/* View/Edit Buttons */}
                        <button
                          onClick={() => handleOpenDetailModal(slot, 'view')}
                          className='text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 text-sm p-1'
                          title='View Details'
                        >
                          View
                        </button>
                        {profile?.role === Role.ADMIN && (
                          <>
                            <button
                              onClick={() => handleOpenDetailModal(slot, 'edit')}
                              className='text-brand-500 hover:text-brand-700 dark:hover:text-brand-300 text-sm p-1'
                              title='Edit Slot'
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(slot)}
                              className='text-red-500 hover:text-red-700 dark:hover:text-red-300 text-sm p-1'
                              title='Delete Slot'
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredAndPaginatedSlots.totalItems > ITEMS_PER_PAGE && (
          <div className='p-4 border-t border-gray-100 dark:border-white/[0.05] flex justify-center'>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredAndPaginatedSlots.totalItems / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* --- SLOT DETAIL MODAL --- */}
      {isSlotModalOpen && ( // Using conditional rendering to ensure form resets
        <SlotModal
          isOpen={isSlotModalOpen}
          onClose={() => setIsSlotModalOpen(false)}
          slot={selectedSlot}
          onSave={saveSlot}
          isViewMode={isViewMode}
        />
      )}

      {/* --- CONFIRM DELETION MODAL --- */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Confirm Slot Deletion'
        message={`Are you sure you want to delete this slot (${selectedSlot?.slotMinutes} min)? This action cannot be undone.`}
      />
    </>
  )
}
