import { TreatmentPlan, TreatmentPlanStatus } from '../../types/treatmentPlan.type'
import { formatDateToDDMMYYYY } from '../../utils/validForm'

const STATUS_MAP: { [key: number]: { text: string; color: string } } = {
  [TreatmentPlanStatus.Draft]: { text: 'Draft', color: 'bg-gray-100 text-gray-700' },
  [TreatmentPlanStatus.PendingApproval]: { text: 'Pending Approval', color: 'bg-yellow-100 text-yellow-700' },
  [TreatmentPlanStatus.Approved]: { text: 'Approved', color: 'bg-blue-100 text-blue-700' },
  [TreatmentPlanStatus.InProgress]: { text: 'In Progress', color: 'bg-green-100 text-green-700' },
  [TreatmentPlanStatus.Completed]: { text: 'Completed', color: 'bg-indigo-100 text-indigo-700' },
  [TreatmentPlanStatus.Cancelled]: { text: 'Cancelled', color: 'bg-red-100 text-red-700' },
  [TreatmentPlanStatus.OnHold]: { text: 'On Hold', color: 'bg-orange-100 text-orange-700' }
}

interface TreatmentPlanCardProps {
  plan: TreatmentPlan
  onViewDetails: (plan: TreatmentPlan) => void
  onDelete: (planId: string) => void
}

export default function TreatmentPlanCard({ plan, onViewDetails, onDelete }: TreatmentPlanCardProps) {
  console.log('TreatmentPlanCard props received:', { planId: plan.id, onDeleteExists: typeof onDelete === 'function' })

  const statusInfo = STATUS_MAP[plan.status] || STATUS_MAP[TreatmentPlanStatus.Draft]
  const completedSessions = plan.treatmentSessions.filter((s) => s.status === 2).length // Status 2 = Completed
  const totalSessions = plan.totalSessions || plan.treatmentSessions.length
  const canDelete = plan.status === TreatmentPlanStatus.Draft
  return (
    <div className='border border-gray-200 p-5 rounded-xl shadow-sm bg-white hover:shadow-md transition duration-300'>
      <div className='flex justify-between items-start border-b pb-3 mb-3'>
        {/* Title & Dates */}
        <div className='flex-1 min-w-0'>
          <h4 className='text-lg font-bold text-gray-800 truncate'>
            Treatment Plan: {plan.diagnosis || 'No Diagnosis'}
          </h4>
          <div className='text-sm text-gray-500 mt-1'>
            <span className='font-medium'>Start:</span> {formatDateToDDMMYYYY(plan.startDate)} |
            <span className='font-medium ml-2'>End:</span> {formatDateToDDMMYYYY(plan.endDate)}
          </div>
        </div>

        {/* Status Badge */}
        <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ml-4 ${statusInfo.color}`}>
          {statusInfo.text}
        </span>
      </div>

      {/* Details Grid */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
        <div className='flex flex-col'>
          <span className='text-xs font-medium text-gray-500 uppercase'>Goal</span>
          <span className='font-semibold text-gray-800 line-clamp-2'>{plan.goal || 'N/A'}</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-xs font-medium text-gray-500 uppercase'>Cost</span>
          <span className='font-semibold text-green-600'>{plan.estimatedCost.toLocaleString()} VND</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-xs font-medium text-gray-500 uppercase'>Duration</span>
          <span className='font-semibold text-gray-800'>{plan.durationWeeks} Weeks</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-xs font-medium text-gray-500 uppercase'>Sessions</span>
          <span className='font-semibold text-gray-800'>
            {completedSessions} / {totalSessions} Completed
          </span>
        </div>
      </div>

      {/* Action */}
      <div className='pt-4 mt-4 border-t border-gray-100 flex justify-end'>
        {canDelete && (
          <button
            type='button'
            onClick={() => onDelete(plan.id)}
            className='px-3 py-1 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/[0.03]'
          >
            Delete
          </button>
        )}
        <button
          onClick={() => onViewDetails(plan)}
          className='px-3 py-1 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition'
        >
          View Details & Sessions
        </button>
      </div>
    </div>
  )
}
