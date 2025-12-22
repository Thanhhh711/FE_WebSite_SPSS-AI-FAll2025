/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock, Coffee, Edit3, Eye, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { slotApi } from '../../../api/slot.api'
import { Role } from '../../../constants/Roles'
import { useAppContext } from '../../../context/AuthContext'
import { Slot } from '../../../types/registration.type'
import { SlotForm } from '../../../types/slot.type'
import { SuccessResponse } from '../../../utils/utils.type'
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import Pagination from '../../pagination/Pagination'
import SlotModal from '../../SlotModal/SlotModal'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'

const ITEMS_PER_PAGE = 10

export default function BasicTableSlot() {
  const { profile } = useAppContext()
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)

  const {
    data: slotsRes,
    isLoading,
    isFetching
  } = useQuery<SuccessResponse<Slot[]>>({
    queryKey: ['slots'],
    queryFn: async () => {
      const res = await slotApi.getSlots()
      return res.data
    },
    staleTime: 1000 * 60 * 5
  })

  const allSlots = slotsRes?.data ?? []

  const filteredAndPaginatedSlots = useMemo(() => {
    const filtered = allSlots.filter((s: Slot) => s.slotMinutes.toString().includes(searchTerm))
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return {
      totalItems: filtered.length,
      data: filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    }
  }, [allSlots, searchTerm, currentPage])

  const { mutate: saveSlot } = useMutation({
    mutationFn: (data: SlotForm & { id?: string }) =>
      data.id ? slotApi.updateSlot(data.id, data) : slotApi.createSlot(data),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      setIsSlotModalOpen(false)
    }
  })

  const { mutate: deleteSlot } = useMutation({
    mutationFn: (id: string) => slotApi.deleteSlot(id),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Removed successfully!')
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      setIsConfirmOpen(false)
    }
  })

  const handleConfirmDelete = () => {
    if (selectedSlot) deleteSlot(selectedSlot.id)
  }

  if (isLoading || isFetching)
    return (
      <div className='p-20 text-center font-black text-amber-500 animate-pulse uppercase tracking-widest'>
        Loading Durations...
      </div>
    )

  return (
    <div className='p-4 md:p-8 space-y-6 bg-transparent min-h-screen'>
      {/* Header Section */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-gray-800 transition-all'>
        <div className='flex items-center gap-5'>
          {/* <div className='w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm'>
            <Timer size={30} />
          </div> */}
          <div>
            <h1 className='text-2xl font-black text-slate-800 dark:text-white tracking-tight'>Time Configuration</h1>
            <p className='text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1'>
              Slots & Breaks • {filteredAndPaginatedSlots.totalItems} Items
            </p>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='relative group'>
            <Search
              className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors'
              size={18}
            />
            <input
              type='text'
              placeholder='Search minutes...'
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className='pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-gray-800/50 border-none rounded-2xl focus:ring-4 ring-amber-500/10 w-full sm:w-64 transition-all text-sm font-bold placeholder:text-slate-400 dark:text-white'
            />
          </div>
          {profile?.role === Role.ADMIN && (
            <button
              onClick={() => {
                setSelectedSlot(null)
                setIsViewMode(false)
                setIsSlotModalOpen(true)
              }}
              className='bg-slate-900 dark:bg-amber-600 hover:scale-[1.02] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95'
            >
              <Plus size={18} /> Add New
            </button>
          )}
        </div>
      </div>

      {/* Table Card Section */}
      <div className='bg-white dark:bg-gray-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-gray-800 overflow-hidden'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader className='bg-slate-50/50 dark:bg-gray-800/50'>
              <TableRow className='border-none'>
                <TableCell
                  isHeader
                  className='px-8 py-6 text-[10px] text-left font-black text-slate-400 uppercase tracking-[0.2em]'
                >
                  Slot Duration
                </TableCell>
                <TableCell
                  isHeader
                  className='px-8 py-6 text-[10px] text-left font-black text-slate-400 uppercase tracking-[0.2em]'
                >
                  Break Duration
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
              {filteredAndPaginatedSlots.data.map((slot) => (
                <TableRow
                  key={slot.id}
                  className='group hover:bg-amber-50/30 dark:hover:bg-amber-900/10 transition-all border-b border-slate-50 dark:border-gray-800 last:border-0'
                >
                  {/* Slot Duration Column */}
                  <TableCell className='px-8 py-7'>
                    <div className='flex items-center gap-3 text-slate-700 dark:text-slate-200'>
                      <div className='w-9 h-9 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl flex items-center justify-center'>
                        <Clock size={16} />
                      </div>
                      <span className='font-black text-base'>
                        {slot.slotMinutes} <span className='text-[10px] font-bold text-slate-400 uppercase'>Mins</span>
                      </span>
                    </div>
                  </TableCell>

                  {/* Break Duration Column */}
                  <TableCell className='px-8 py-7'>
                    <div className='inline-flex  items-center gap-2.5 px-4 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl text-sm font-black shadow-sm border border-amber-100 dark:border-amber-900/50'>
                      <Coffee size={16} /> {slot.slotMinutes} Mins
                    </div>
                  </TableCell>

                  {/* Actions Column */}
                  <TableCell className='px-8 py-7 text-right'>
                    <div className='flex justify-end gap-2.5'>
                      <button
                        onClick={() => {
                          setSelectedSlot(slot)
                          setIsViewMode(true)
                          setIsSlotModalOpen(true)
                        }}
                        className='p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-2xl transition-all shadow-sm bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700'
                      >
                        <Eye size={18} />
                      </button>
                      {profile?.role === Role.ADMIN && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedSlot(slot)
                              setIsViewMode(false)
                              setIsSlotModalOpen(true)
                            }}
                            className='p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-2xl transition-all shadow-sm bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700'
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSlot(slot)
                              setIsConfirmOpen(true)
                            }}
                            className='p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-800 rounded-2xl transition-all shadow-sm bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700'
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Section */}
        <div className='p-10 flex justify-center bg-slate-50/30 dark:bg-transparent border-t dark:border-gray-800'>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredAndPaginatedSlots.totalItems / ITEMS_PER_PAGE)}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {isSlotModalOpen && (
        <SlotModal
          isOpen={isSlotModalOpen}
          onClose={() => setIsSlotModalOpen(false)}
          slot={selectedSlot}
          onSave={saveSlot}
          isViewMode={isViewMode}
        />
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Remove Duration'
        message={`Confirm deletion of ${selectedSlot?.slotMinutes} mins duration?`}
      />
    </div>
  )
}
