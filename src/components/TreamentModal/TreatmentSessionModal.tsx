/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { TreatmentSession, TreatmentSessionForm, TreatmentSessionStatus } from '../../types/treatmentSession.type'
import { useEffect, useState } from 'react'
import { sessionApi } from '../../api/treatmentSession.api'

const SESSION_STATUS_NAMES: { [key: number]: string } = {
  [TreatmentSessionStatus.Scheduled]: 'Đã lên lịch',
  [TreatmentSessionStatus.InProgress]: 'Đang thực hiện',
  [TreatmentSessionStatus.Completed]: 'Hoàn thành',
  [TreatmentSessionStatus.Cancelled]: 'Bị hủy',
  [TreatmentSessionStatus.Rescheduled]: 'Hoãn lại',
  [TreatmentSessionStatus.NoShow]: 'Không đến'
}

// Giả định Staff và Room list
const MOCK_STAFFS = [
  { id: 'S100', name: 'Dr. Nguyễn Văn A' },
  { id: 'S101', name: 'Nurse Lê Thị B' }
]
const MOCK_ROOMS = ['Room 101', 'Room 102', 'Room 203']

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
}

export default function TreatmentSessionModal({
  isOpen,
  onClose,
  session,
  planId,
  onSave
}: TreatmentSessionModalProps) {
  const [form, setForm] = useState<TreatmentSessionForm>(initialFormState)
  const isEditing = !!session
  const title = isEditing ? `Session #${session.sessionNumber} Details` : 'Schedule New Session'
  const queryClient = useQueryClient()

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
      if (isEditing && session) {
        return sessionApi.updateSession(session.id, data)
      } else {
        return sessionApi.createSession(data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatmentPlans', planId] as any })
      onSave()
      onClose()
    },
    onError: (error) => {
      console.error('Save Session Error:', error)
      // Thêm toast thông báo lỗi thực tế
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
    saveMutation.mutate(form)
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
                {MOCK_ROOMS.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Staff ID */}
          <div>
            <label className='mb-1.5 block text-sm font-medium text-gray-700'>Staff Performing Treatment</label>
            <select name='staffId' value={form.staffId} onChange={handleChange} className={baseInputClass} required>
              {MOCK_STAFFS.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} ({staff.id})
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
