/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { treatmentPlanApi } from '../../api/treatmentPlan.api'
import { CreateTreatmentPlanDto, TreatmentPlan } from '../../types/treatmentPlan.type'
import TreatmentPlanCard from './TreatmentPlanCard'
import TreatmentPlanModal from './TreatmentPlanModal'

interface TreatmentPlanTabProps {
  customerId: string
}

export default function TreatmentPlanTab({ customerId }: TreatmentPlanTabProps) {
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlan | null>(null)

  const {
    data: plansResponse,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['treatmentPlans', customerId],
    queryFn: () => treatmentPlanApi.getTreateMentsyCustomerId(customerId),
    enabled: !!customerId
  })

  const treatmentPlans: TreatmentPlan[] = plansResponse?.data.data ?? []

  const handleOpenCreate = () => {
    setSelectedPlan(null)
    setIsModalOpen(true)
  }

  const handleViewOrEdit = (plan: TreatmentPlan) => {
    setSelectedPlan(plan)
    setIsModalOpen(true)
  }

  const createTreatmentPlanMutation = useMutation({
    mutationFn: (body: CreateTreatmentPlanDto) => treatmentPlanApi.createTreateMent(body),
    onSuccess: (data) => {
      refetch() // Cập nhật danh sách plans
      toast.success(data.data.message)
      setIsModalOpen(false) // Đóng modal
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  // ✅ 2. MUTATION CHO CẬP NHẬT (UPDATE)
  const updateTreatmentPlanMutation = useMutation({
    mutationFn: ({ planId, body }: { planId: string; body: CreateTreatmentPlanDto }) =>
      treatmentPlanApi.updateTreateMent(planId, body),
    onSuccess: (data) => {
      refetch()
      toast.success(data.data.message)
      setIsModalOpen(false)
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const deleteTreatmentPlanMutation = useMutation({
    mutationFn: (planId: string) => treatmentPlanApi.deleteTreateMent(planId),
    onSuccess: (data) => {
      refetch()
      toast.success(data.data.message)
      setIsConfirmDeleteOpen(false)
      setPlanToDelete(null)
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const handleSave = (data: CreateTreatmentPlanDto, planId?: string) => {
    console.log('form', data)

    const body: CreateTreatmentPlanDto = {
      ...data,
      customerId: customerId
    }

    if (planId) {
      // Logic CẬP NHẬT
      updateTreatmentPlanMutation.mutate({ planId, body })
    } else {
      console.log('create')

      // Logic TẠO MỚI
      createTreatmentPlanMutation.mutate(body)
    }
  }

  const handleDeletePlan = (planId: string) => {
    console.log('id', planId)

    setPlanToDelete(planId)
    setIsConfirmDeleteOpen(true)
  }

  // 2. Hàm Xóa thực tế (gọi khi bấm Confirm trong Popup)
  // Trong TreatmentPlanTab.tsx

  const confirmDeleteAction = async () => {
    if (!planToDelete) return
    // Sử dụng mutation đã định nghĩa để gọi API xóa
    deleteTreatmentPlanMutation.mutate(planToDelete)
  }

  // Luôn đóng popup và reset state sau khi hoàn tất
  setIsConfirmDeleteOpen(false)
  setPlanToDelete(null)

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
          treatmentPlans.map((plan) => (
            <TreatmentPlanCard key={plan.id} plan={plan} onViewDetails={handleViewOrEdit} onDelete={handleDeletePlan} />
          ))
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
        refetch={refetch}
      />
    </div>
  )
}
