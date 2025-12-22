/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit3, Eye, Layers, MapPin, Plus, Search, Trash2, UserPlus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { roomApi } from '../../../api/room.api'
import { scheduleApi } from '../../../api/schedulars.api'
import { Role } from '../../../constants/Roles'
import { useAppContext } from '../../../context/AuthContext'
import { Room, RoomForm } from '../../../types/room.type'
import { BookingPayload } from '../../../types/schedula.type'
import ConfirmModal from '../../CalendarModelDetail/ConfirmModal'
import Pagination from '../../pagination/Pagination'
import AssignRoomModal from '../../RoomModel/AssignRoomModal'
import RoomModal from '../../RoomModel/RoomModal'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table'

const ITEMS_PER_PAGE = 10

export default function BasicTableRoom() {
  const { profile } = useAppContext()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)

  const { data: roomsResponse, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomApi.getRooms,
    staleTime: 1000 * 60 * 5
  })

  const { mutate: assignRoomMutation } = useMutation({
    mutationFn: (data: BookingPayload) => scheduleApi.assginRoom(data),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Room assigned successfully!')
      setIsAssignModalOpen(false)
    }
  })

  const allRooms = roomsResponse?.data.data || []

  const filteredAndPaginatedRooms = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase()
    const filtered = allRooms.filter(
      (room: Room) =>
        room.roomName.toLowerCase().includes(lowercasedSearchTerm) ||
        room.location.toLowerCase().includes(lowercasedSearchTerm)
    )
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return {
      totalItems: filtered.length,
      data: filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    }
  }, [allRooms, searchTerm, currentPage])

  const { mutate: saveRoom } = useMutation({
    mutationFn: (data: RoomForm & { id?: string }) =>
      data.id ? roomApi.updateRoom(data.id, data) : roomApi.createRoom(data),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Room saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      setIsRoomModalOpen(false)
      setSelectedRoom(null)
    }
  })

  const { mutate: deleteRoom } = useMutation({
    mutationFn: (id: string) => roomApi.deleteRoom(id),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Room deleted successfully!')
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      setIsConfirmOpen(false)
    }
  })

  if (isLoading) return <div className='p-10 text-center text-indigo-500 font-bold'>Accessing Facility Data...</div>

  return (
    <div className='p-4 md:p-8 space-y-6'>
      <div className='flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-gray-800 transition-all'>
        <div className='flex items-center gap-5'>
          {/* <div className='w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm'>
            <Layers size={32} />
          </div> */}
          <div>
            <h1 className='text-2xl font-black text-slate-800 dark:text-white tracking-tight'>Facility Management</h1>
            <p className='text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1'>
              Registered Rooms: {filteredAndPaginatedRooms.totalItems}
            </p>
          </div>
        </div>

        <div className='flex flex-col md:flex-row items-stretch md:items-center gap-4'>
          <div className='relative group flex-1'>
            <Search
              className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors'
              size={18}
            />
            <input
              type='text'
              placeholder='Room name or floor...'
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className='pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-gray-800/50 border-none rounded-2xl focus:ring-4 ring-emerald-500/10 min-w-[300px] transition-all text-sm font-bold'
            />
          </div>

          <div className='flex gap-3'>
            {profile?.role === Role.ADMIN && (
              <button
                onClick={() => {
                  setSelectedRoom(null)
                  setIsViewMode(false)
                  setIsRoomModalOpen(true)
                }}
                className='flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95'
              >
                <Plus size={18} /> Add Room
              </button>
            )}
            {profile?.role === Role.SCHEDULE_MANAGER && (
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className='flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95'
              >
                <UserPlus size={18} /> Assign
              </button>
            )}
          </div>
        </div>
      </div>

      <div className='bg-white dark:bg-gray-900 rounded-[3rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-gray-800 overflow-hidden'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader className='bg-slate-50/30 dark:bg-gray-800/30'>
              <TableRow className='border-none'>
                <TableCell
                  isHeader
                  className='px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'
                >
                  Room Information
                </TableCell>
                <TableCell
                  isHeader
                  className='px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'
                >
                  Location Details
                </TableCell>
                <TableCell
                  isHeader
                  className='px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'
                >
                  Capacity
                </TableCell>
                <TableCell
                  isHeader
                  className='px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'
                >
                  Register Date
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
              {filteredAndPaginatedRooms.data.map((room) => (
                <TableRow
                  key={room.id}
                  className='group border-b border-slate-50 dark:border-gray-800 hover:bg-emerald-50/20 transition-all'
                >
                  <TableCell className='px-8 py-7'>
                    <div className='flex items-center gap-4'>
                      <div className='w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 flex items-center justify-center font-black text-slate-700 dark:text-white shadow-sm'>
                        {room.roomName.match(/\d+/) || room.roomName.charAt(0)}
                      </div>
                      <span className='font-black text-slate-800 dark:text-white text-lg'>{room.roomName}</span>
                    </div>
                  </TableCell>
                  <TableCell className='px-6'>
                    <div className='space-y-1.5'>
                      <div className='flex items-center gap-2 text-slate-600 dark:text-slate-300 font-bold text-sm'>
                        <MapPin size={14} className='text-emerald-500' /> {room.location}
                      </div>
                      <div className='flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter'>
                        <Layers size={12} /> Level {room.floorNumber}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='px-6'>
                    <div className='inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-gray-800 rounded-xl text-slate-700 dark:text-slate-300 font-black text-xs'>
                      <Users size={14} /> {room.capacity} SLOTS
                    </div>
                  </TableCell>
                  <TableCell className='px-6 text-slate-400 font-bold text-sm'>
                    {new Date(room.createdTime).toLocaleDateString()}
                  </TableCell>
                  <TableCell className='px-8 text-right'>
                    <div className='flex justify-end gap-2'>
                      <button
                        onClick={() => {
                          setSelectedRoom(room)
                          setIsViewMode(true)
                          setIsRoomModalOpen(true)
                        }}
                        className='p-3 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all'
                      >
                        <Eye size={18} />
                      </button>
                      {profile?.role === Role.ADMIN && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedRoom(room)
                              setIsViewMode(false)
                              setIsRoomModalOpen(true)
                            }}
                            className='p-3 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all'
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRoom(room)
                              setIsConfirmOpen(true)
                            }}
                            className='p-3 text-rose-600 bg-rose-50 dark:bg-rose-900/20 rounded-2xl hover:bg-rose-600 hover:text-white transition-all'
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

        {filteredAndPaginatedRooms.totalItems > ITEMS_PER_PAGE && (
          <div className='p-10 flex justify-center bg-slate-50/50 dark:bg-transparent border-t dark:border-gray-800'>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredAndPaginatedRooms.totalItems / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {isRoomModalOpen && (
        <RoomModal
          isOpen={isRoomModalOpen}
          onClose={() => setIsRoomModalOpen(false)}
          room={selectedRoom}
          onSave={saveRoom}
          isViewMode={isViewMode}
        />
      )}
      {isAssignModalOpen && (
        <AssignRoomModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onAssign={assignRoomMutation}
        />
      )}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => selectedRoom && deleteRoom(selectedRoom.id)}
        title='Confirm Deletion'
        message={`Delete room "${selectedRoom?.roomName}" permanently?`}
      />
    </div>
  )
}
