import { useState } from 'react'
import { TreatmentPlan } from '../../types/treatmentPlan.type'
import { useQuery } from '@tanstack/react-query'
import { treatmentPlanApi } from '../../api/treatmentPlan.api'
import TreatmentPlanModal from './TreatmentPlanModal'
import TreatmentPlanCard from './TreatmentPlanCard'

interface TreatmentPlanTabProps {
  customerId: string // ID của bệnh nhân từ PatientDetail.tsx
}

export default function TreatmentPlanTab({ customerId }: TreatmentPlanTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlan | null>(null)

  // Giả định API getTreateMents sẽ có filter/param là customerId
  const { data: plansResponse, isLoading } = useQuery({
    queryKey: ['treatmentPlans', customerId],
    queryFn: () => treatmentPlanApi.getTreateMents(), // Cần cập nhật API để filter theo customerId
    enabled: !!customerId
    // Hiện tại: Mock data hoặc giả định API trả về hết và tự filter
  })

  // Mock Filter (Nếu API không hỗ trợ filter)
  const treatmentPlans: TreatmentPlan[] = plansResponse?.data.data?.filter((p) => p.customerId === customerId) || []

  const handleOpenCreate = () => {
    setSelectedPlan(null)
    setIsModalOpen(true)
  }

  const handleViewOrEdit = (plan: TreatmentPlan) => {
    setSelectedPlan(plan)
    setIsModalOpen(true)
  }

  // Cần thêm logic onSave và Mutation (tạo/cập nhật) vào đây hoặc trong PatientDetail
  const handleSave = () => {
    // Logic save và invalidate queries
    setIsModalOpen(false)
  }

  if (isLoading) {
    return <div className='p-6 text-center text-gray-500'>Loading treatment plans...</div>
  }

  return (
    <div className='p-6 bg-white rounded-xl shadow-lg min-h-[500px]'>
      <div className='flex justify-between items-center mb-6'>
        <h3 className='text-xl font-bold text-gray-900'>Treatment Plans ({treatmentPlans.length})</h3>
        <button
          onClick={handleOpenCreate}
          className='flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='w-4 h-4 mr-1'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
          </svg>
          Create New Plan
        </button>
      </div>

      <div className='space-y-6'>
        {treatmentPlans.length > 0 ? (
          treatmentPlans.map((plan) => <TreatmentPlanCard key={plan.id} plan={plan} onViewDetails={handleViewOrEdit} />)
        ) : (
          <div className='text-center p-12 border border-dashed border-gray-300 rounded-lg text-gray-500'>
            <p>This patient currently has no treatment plan.</p>
            <button onClick={handleOpenCreate} className='mt-3 text-green-600 font-medium hover:text-green-700'>
              Start a new plan now
            </button>
          </div>
        )}
      </div>

      <TreatmentPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
        customerId={customerId}
        onSave={handleSave}
      />
    </div>
  )
}
