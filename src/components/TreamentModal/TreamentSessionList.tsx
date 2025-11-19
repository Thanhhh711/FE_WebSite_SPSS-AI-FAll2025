import { useState } from 'react'
import { TreatmentSession, TreatmentSessionStatus } from '../../types/treatmentSession.type'
import { formatDateToDDMMYYYY } from '../../utils/utils.type'
import TreatmentSessionModal from './TreatmentSessionModal'

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
}

export default function TreatmentSessionList({ planId, sessions, isViewMode }: TreatmentSessionListProps) {
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<TreatmentSession | null>(null)

  // Sắp xếp theo sessionNumber
  const sortedSessions = [...sessions].sort((a, b) => a.sessionNumber - b.sessionNumber)

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
            {sortedSessions.map((session) => {
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
                    {session.staffId}
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap'>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}
                    >
                      {statusInfo.text}
                    </span>
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap text-right text-sm font-medium'>
                    <button
                      onClick={() => handleEditSession(session)}
                      className='text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300'
                    >
                      View/Edit
                    </button>
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
        onSave={() => {
          /* Logic save session */ setIsSessionModalOpen(false)
        }}
      />
    </div>
  )
}
