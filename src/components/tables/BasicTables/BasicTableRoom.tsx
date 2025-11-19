/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useMemo, useState } from 'react'
import { Room, RoomForm } from '../../../types/room.type'
import { roomApi } from '../../../api/room.api'
import { toast } from 'react-toastify'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'
import Pagination from '../../pagination/Pagination'
import RoomModal from '../../RoomModel/RoomModal'
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'

const ITEMS_PER_PAGE = 10

// --- COMPONENT CHÍNH ---

export default function BasicTableRoom() {
  const queryClient = useQueryClient()

  // --- STATE QUẢN LÝ ---
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)

  // --- API READ (R) ---
  const {
    data: roomsResponse,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomApi.getRooms,
    staleTime: 1000 * 60 * 5
  })

  const allRooms = roomsResponse?.data.data || []

  // --- LỌC VÀ PHÂN TRANG ---
  const filteredAndPaginatedRooms = useMemo(() => {
    // 1. Lọc theo tên phòng hoặc vị trí
    const lowercasedSearchTerm = searchTerm.toLowerCase()
    const filtered = allRooms.filter(
      (room: Room) =>
        room.roomName.toLowerCase().includes(lowercasedSearchTerm) ||
        room.location.toLowerCase().includes(lowercasedSearchTerm)
    )

    // 2. Phân trang
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    return {
      totalItems: filtered.length,
      data: filtered.slice(startIndex, endIndex)
    }
  }, [allRooms, searchTerm, currentPage])

  // --- API MUTATIONS (C, U, D) ---

  // Mutation cho Create và Update
  const { mutate: saveRoom } = useMutation({
    mutationFn: (data: RoomForm & { id?: string }) => {
      if (data.id) {
        // Update
        return roomApi.updateRoom(data.id, data)
      }
      // Create
      return roomApi.createRoom(data)
    },
    onSuccess: (res) => {
      toast.success(res.data.message || 'Room saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['rooms'] })

      setIsRoomModalOpen(false)
      setSelectedRoom(null)
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error saving room.')
    }
  })

  // Mutation cho Delete
  const { mutate: deleteRoom } = useMutation({
    mutationFn: (id: string) => roomApi.deleteRoom(id),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Room deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error deleting room.')
    }
  })

  // --- HÀM XỬ LÝ SỰ KIỆN ---

  const handleOpenDetailModal = (room: Room, mode: 'view' | 'edit') => {
    setSelectedRoom(room)
    setIsViewMode(mode === 'view')
    setIsRoomModalOpen(true)
  }

  const handleCreateNew = () => {
    setSelectedRoom(null) // Reset để mở chế độ Create
    setIsViewMode(false)
    setIsRoomModalOpen(true)
  }

  const handleDeleteClick = (room: Room) => {
    setSelectedRoom(room)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedRoom?.id) {
      deleteRoom(selectedRoom.id)
      setIsConfirmOpen(false)
      setSelectedRoom(null)
    }
  }

  // --- RENDERING ---

  if (isLoading) return <div className='p-6 text-center text-lg text-brand-500'>Đang tải danh sách phòng...</div>
  if (isError) return <div className='p-6 text-center text-lg text-red-500'>Lỗi khi tải danh sách phòng.</div>

  return (
    <>
      <div className='flex justify-between items-center mb-5'>
        {/* Thanh Tìm kiếm */}
        <input
          type='text'
          placeholder='Search by Room Name/Location...'
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1) // Reset page when searching
          }}
          className='w-1/3 min-w-[200px] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
        />

        {/* Create New Button */}
        <button
          onClick={handleCreateNew}
          className='btn btn-primary flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-brand-xs hover:bg-brand-600 transition-colors'
        >
          Add New Room
        </button>
      </div>

      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-lg'>
        <div className='max-w-full overflow-x-auto'>
          <Table>
            {/* Table Header */}
            <TableHeader className='border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.05]'>
              <TableRow>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Room Name
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Location
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Floor
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Capacity
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-start'>
                  Created Date
                </TableCell>
                <TableCell isHeader className='px-5 py-3 text-end'>
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody>
              {filteredAndPaginatedRooms.data.length === 0 ? (
                <TableRow>
                  <TableCell className='py-4 text-center text-gray-500'>
                    {searchTerm ? 'No rooms found.' : 'No rooms have been registered yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndPaginatedRooms.data.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className='px-5 py-4 font-medium truncate max-w-[150px]'>{room.roomName}</TableCell>
                    <TableCell className='px-4 py-3 text-start'>{room.location}</TableCell>
                    <TableCell className='px-4 py-3 text-start'>{room.floorNumber}</TableCell>
                    <TableCell className='px-4 py-3 text-start'>{room.capacity} people</TableCell>
                    <TableCell className='px-4 py-3 text-start'>
                      {new Date(room.createdTime).toLocaleDateString()}
                    </TableCell>
                    <TableCell className='px-4 py-3 text-end'>
                      <div className='flex justify-end gap-2'>
                        {/* Nút View/Edit */}
                        <button
                          onClick={() => handleOpenDetailModal(room, 'view')}
                          className='text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 text-sm p-1'
                          title='View Details'
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleOpenDetailModal(room, 'edit')}
                          className='text-brand-500 hover:text-brand-700 dark:hover:text-brand-300 text-sm p-1'
                          title='Edit Room'
                        >
                          Edit
                        </button>
                        {/* Nút Delete */}
                        <button
                          onClick={() => handleDeleteClick(room)}
                          className='text-red-500 hover:text-red-700 dark:hover:text-red-300 text-sm p-1'
                          title='Delete Room'
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

        {/* Pagination */}
        {filteredAndPaginatedRooms.totalItems > ITEMS_PER_PAGE && (
          <div className='p-4 border-t border-gray-100 dark:border-white/[0.05] flex justify-center'>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredAndPaginatedRooms.totalItems / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* --- MODAL XEM/TẠO/CHỈNH SỬA CHI TIẾT --- */}
      {isRoomModalOpen && (
        <RoomModal
          isOpen={isRoomModalOpen}
          onClose={() => setIsRoomModalOpen(false)}
          room={selectedRoom}
          onSave={saveRoom}
          isViewMode={isViewMode}
        />
      )}
      {/* --- MODAL XÁC NHẬN XÓA --- */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title='Confirm Room Deletion'
        message={`Are you sure you want to delete the room "${selectedRoom?.roomName}"? This action cannot be undone.`}
      />
    </>
  )
}
