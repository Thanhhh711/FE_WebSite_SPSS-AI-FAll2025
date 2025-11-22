import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { sessionApi } from '../../api/treatmentSession.api'
import { TreatmentSession, TreatmentSessionStatus } from '../../types/treatmentSession.type'
import { formatDateToDDMMYYYY } from '../../utils/utils.type'
import TreatmentSessionModal from './TreatmentSessionModal'
import StaffEmailLookup from '../../utils/StaffEmailLookup'
import { toast } from 'react-toastify'
import ConfirmModal from '../CalendarModelDetail/ConfirmModal'

// Mapping trạng thái phiên điều trị
const SESSION_STATUS_MAP: { [key: number]: { text: string; color: string } } = {
  [TreatmentSessionStatus.Scheduled]: { text: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
  [TreatmentSessionStatus.InProgress]: { text: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
  [TreatmentSessionStatus.Completed]: { text: 'Completed', color: 'bg-green-100 text-green-700' },
  [TreatmentSessionStatus.Cancelled]: { text: 'Cancelled', color: 'bg-red-100 text-red-700' },
  [TreatmentSessionStatus.Rescheduled]: { text: 'Rescheduled', color: 'bg-orange-100 text-orange-700' },
  [TreatmentSessionStatus.NoShow]: { text: 'No Show', color: 'bg-gray-100 text-gray-700' }
}

interface TreatmentSessionListProps {
  planId: string
  sessions: TreatmentSession[]
  isViewMode: boolean
  refetchPlan: () => void
}

export default function TreatmentSessionList({ planId, isViewMode, refetchPlan }: TreatmentSessionListProps) {
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<TreatmentSession | null>(null)

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [sessionToDeleteId, setSessionToDeleteId] = useState<string | null>(null)
  const [sessionToDeleteTitle, setSessionToDeleteTitle] = useState<string>('')

  const {
    data: sessionResponse,

    refetch
  } = useQuery({
    queryKey: ['treatmentPlans', planId],
    queryFn: () => sessionApi.getSessionsByPlanId(planId), // Cần cập nhật API để filter theo customerId
    enabled: !!planId
    // Hiện tại: Mock data hoặc giả định API trả về hết và tự filter
  })

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => sessionApi.deleteSession(sessionId),
    onSuccess: (data) => {
      toast.success(data.data.message)
      refetch() // Cập nhật danh sách sau khi xóa
      setIsConfirmDeleteOpen(false) // Đóng modal xác nhận
      setSessionToDeleteId(null)
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const handleDeleteClick = (session: TreatmentSession) => {
    setSessionToDeleteId(session.id)
    setSessionToDeleteTitle(`Session  ${session.sessionNumber} - ${formatDateToDDMMYYYY(session.sessionDate)}`)
    setIsConfirmDeleteOpen(true)
  }

  // Hàm xác nhận xóa (chạy API) - được gọi từ ConfirmModal
  const confirmDeleteAction = () => {
    if (sessionToDeleteId) {
      deleteSessionMutation.mutate(sessionToDeleteId)
    }
  }

  // Sắp xếp theo sessionNumber
  // const sortedSessions = [...sessions].sort((a, b) => a.sessionNumber - b.sessionNumber)

  const handleCreateSession = () => {
    setSelectedSession(null)
    setIsSessionModalOpen(true)
  }

  const handleEditSession = (session: TreatmentSession) => {
    setSelectedSession(session)
    setIsSessionModalOpen(true)
  }

  // Cần thêm logic save session và delete session (Mutation)

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h4 className='text-lg font-semibold text-gray-900 dark:text-white'>Session List</h4>
        {!isViewMode && (
          <button
            onClick={handleCreateSession}
            className='px-3 py-1 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition'
          >
            + Add Session
          </button>
        )}
      </div>

      {/* Table/List View of Sessions */}
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
          <thead className='bg-gray-50 dark:bg-gray-700'>
            <tr>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase'>#</th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase'>
                Date & Time
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase'>
                Staff ID
              </th>
              <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase'>
                Status
              </th>
              <th className='px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
            {sessionResponse?.data.data.map((session) => {
              const statusInfo = SESSION_STATUS_MAP[session.status]
              return (
                <tr key={session.id || session.sessionNumber}>
                  <td className='px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
                    {session.sessionNumber}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                    {formatDateToDDMMYYYY(session.sessionDate)} ({session.startTime.substring(0, 5)})
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                    <StaffEmailLookup staffId={session.staffId} />
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap'>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}
                    >
                      {statusInfo.text}
                    </span>
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-right text-sm font-medium flex justify-end space-x-2'>
                    <button
                      onClick={() => handleEditSession(session)}
                      className='text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300'
                    >
                      View/Edit
                    </button>

                    {/* ✅ NÚT XÓA MỚI */}
                    {!isViewMode && ( // Chỉ hiển thị nút xóa khi không ở chế độ chỉ xem
                      <button
                        onClick={() => handleDeleteClick(session)}
                        className='text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                        disabled={deleteSessionMutation.isPending} // Vô hiệu hóa khi đang xóa
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal cho Session Detail */}
      <TreatmentSessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        session={selectedSession}
        planId={planId}
        refetch={refetch}
        refetchPlan={refetchPlan}
        onSave={() => {
          /* Logic save session */ setIsSessionModalOpen(false)
        }}
      />
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={confirmDeleteAction}
        title='Confirm Delete Treatment Session'
        message={`Are you sure you want to delete the treatment session "${sessionToDeleteTitle}"? This action cannot be undone.`}
      />
    </div>
  )
}
