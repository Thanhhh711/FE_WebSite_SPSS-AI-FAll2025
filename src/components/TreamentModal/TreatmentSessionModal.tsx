/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { sessionApi } from '../../api/treatmentSession.api'
import { TreatmentSession, TreatmentSessionForm, TreatmentSessionStatus } from '../../types/treatmentSession.type'
import { roomApi } from '../../api/room.api'
import { SuccessResponse } from '../../utils/utils.type'
import { User } from '../../types/user.type'
import userApi from '../../api/user.api'
import { Role } from '../../constants/Roles'

const SESSION_STATUS_NAMES: { [key: number]: string } = {
  [TreatmentSessionStatus.Scheduled]: 'Scheduled',
  [TreatmentSessionStatus.InProgress]: 'In Progress',
  [TreatmentSessionStatus.Completed]: 'Completed',
  [TreatmentSessionStatus.Cancelled]: 'Cancelled',
  [TreatmentSessionStatus.Rescheduled]: 'Rescheduled',
  [TreatmentSessionStatus.NoShow]: 'No Show'
}

// Giả định Staff và Room list
// const MOCK_STAFFS = [
//   { id: 'S100', name: 'Dr. Nguyễn Văn A' },
//   { id: 'S101', name: 'Nurse Lê Thị B' }
// ]
// const MOCK_ROOMS = ['Room 101', 'Room 102', 'Room 203']

export const initialFormState: TreatmentSessionForm = {
  planId: '',
  sessionNumber: 1,
  staffId: '',
  sessionDate: '',
  startTime: '',
  endTime: '',
  treatmentProcedure: '',
  resultSummary: '',
  status: TreatmentSessionStatus.Scheduled,
  devices: '',
  kits: '',
  roomId: ''
}

interface TreatmentSessionModalProps {
  isOpen: boolean
  onClose: () => void
  session: TreatmentSession | null // Dữ liệu cho Edit/View, null cho Create
  planId: string // ID bắt buộc
  onSave: () => void
  refetch: () => void
  refetchPlan: () => void
}

export default function TreatmentSessionModal({
  isOpen,
  onClose,
  session,
  planId,
  refetch
}: TreatmentSessionModalProps) {
  const [form, setForm] = useState<TreatmentSessionForm>(initialFormState)
  const isEditing = !!session
  const title = isEditing ? `Session #${session.sessionNumber} Details` : 'Schedule New Session'

  const { data: roomsResponse } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomApi.getRooms,
    staleTime: 1000 * 60 * 5
  })

  const queryClient = useQueryClient()

  const { data: pagingData } = useQuery<SuccessResponse<User[]>>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await userApi.getUsers()
      console.log('resQuery', res.data.data)
      return res.data // Trả về data bên trong
    },

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false
  })

  useEffect(() => {
    if (session) {
      // EDIT MODE
      setForm({
        planId: session.planId,
        sessionNumber: session.sessionNumber,
        staffId: session.staffId,
        sessionDate: session.sessionDate?.substring(0, 10) || '',
        startTime: session.startTime?.substring(0, 5) || '',
        endTime: session.endTime?.substring(0, 5) || '',
        treatmentProcedure: session.treatmentProcedure,
        resultSummary: session.resultSummary,
        status: session.status,
        devices: session.devices,
        kits: session.kits,
        roomId: session.roomId // 🔥 thêm field này
      })
    } else {
      // CREATE MODE
      setForm((prev) => ({
        ...prev,
        ...initialFormState,
        planId
      }))
    }
  }, [session])

  // Mutation cho Create/Update
  const saveMutation = useMutation({
    mutationFn: (data: TreatmentSessionForm) => {
      if (isEditing && session?.id) {
        // Logic CẬP NHẬT
        return sessionApi.updateSession(session.id, data)
      } else {
        const dataForm = { ...data, staffId: '60bdbc72-5b01-4c17-9682-90f6b56d7aea' }

        console.log('dataForm', dataForm)

        // Logic TẠO MỚI
        return sessionApi.createSession(dataForm)
      }
    },
    onSuccess: (data) => {
      toast.success(data.data.message)

      refetch()

      queryClient.invalidateQueries({ queryKey: ['treatmentPlans', planId] })
      onClose()
    },
    onError: (error) => {
      toast.error(isEditing ? 'Lỗi khi cập nhật phiên điều trị.' : 'Lỗi khi tạo phiên điều trị.')
      console.error(error)
    }
  })
  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'sessionNumber' || name === 'status' ? Number(value) : value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const body: TreatmentSessionForm = {
      ...form,
      planId: planId // Gán planId từ props
    }

    console.log('body', body)

    saveMutation.mutate(body)
  }

  const baseInputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-gray-50'

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Modal Header */}
        <div className='p-6 border-b border-gray-200'>
          <h3 className='text-xl font-bold text-gray-900'>{title}</h3>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className='flex-grow overflow-y-auto p-6 space-y-5'>
          {/* Status and Session Number */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>Session Number</label>
              <input
                type='number'
                name='sessionNumber'
                value={form.sessionNumber}
                onChange={handleChange}
                className={baseInputClass}
                min='1'
                required
              />
            </div>
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>Status</label>
              <select name='status' value={form.status} onChange={handleChange} className={baseInputClass} required>
                {Object.entries(SESSION_STATUS_NAMES).map(([key, name]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date, Time, Staff, Room */}
          <div className='grid grid-cols-4 gap-4'>
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>Date</label>
              <input
                type='date'
                name='sessionDate'
                value={form.sessionDate}
                onChange={handleChange}
                className={baseInputClass}
                required
              />
            </div>
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>Start Time</label>
              <input
                type='time'
                name='startTime'
                value={form.startTime}
                onChange={handleChange}
                className={baseInputClass}
                required
              />
            </div>
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>End Time</label>
              <input
                type='time'
                name='endTime'
                value={form.endTime}
                onChange={handleChange}
                className={baseInputClass}
                required
              />
            </div>
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>Room</label>
              <select name='roomId' value={form.roomId} onChange={handleChange} className={baseInputClass} required>
                {roomsResponse?.data.data.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.roomName}/ {room.location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Staff ID */}
          <div>
            <label className='mb-1.5 block text-sm font-medium text-gray-700'>Staff Performing Treatment</label>
            <select name='staffId' value={form.staffId} onChange={handleChange} className={baseInputClass} required>
              {pagingData?.data
                .filter((u) => u.roleName === Role.BEAUTY_ADVISOR)
                .map((staff) => (
                  <option key={staff.userId} value={staff.userId}>
                    {staff.emailAddress}
                  </option>
                ))}
            </select>
          </div>

          {/* Devices and Kits */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>Devices Used</label>
              <input
                type='text'
                name='devices'
                value={form.devices}
                onChange={handleChange}
                placeholder='Laser, Ultrasound, etc.'
                className={baseInputClass}
              />
            </div>
            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>Kits/Materials Used</label>
              <input
                type='text'
                name='kits'
                value={form.kits}
                onChange={handleChange}
                placeholder='Gauze, Serum X, etc.'
                className={baseInputClass}
              />
            </div>
          </div>

          {/* Treatment Procedure */}
          <div>
            <label className='mb-1.5 block text-sm font-medium text-gray-700'>Treatment Procedure Details</label>
            <textarea
              name='treatmentProcedure'
              rows={4}
              value={form.treatmentProcedure}
              onChange={handleChange}
              placeholder='Detailed steps taken during the session.'
              className={`${baseInputClass} resize-none`}
              required
            />
          </div>

          {/* Result Summary */}
          <div>
            <label className='mb-1.5 block text-sm font-medium text-gray-700'>Result Summary</label>
            <textarea
              name='resultSummary'
              rows={3}
              value={form.resultSummary}
              onChange={handleChange}
              placeholder='Patient response, immediate outcome, and any notes.'
              className={`${baseInputClass} resize-none`}
              required
            />
          </div>

          {/* Modal Footer */}
          <div className='pt-6 border-t border-gray-200 flex justify-end space-x-3'>
            <button
              onClick={onClose}
              type='button'
              className='px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:bg-brand-400'
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update Session' : 'Schedule Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
