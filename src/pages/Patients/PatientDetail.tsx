/* eslint-disable @typescript-eslint/no-unused-vars */

import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router'
import { toast } from 'react-toastify'
import { treatmentPlanApi } from '../../api/treatmentPlan.api'
import ConfirmModal from '../../components/CalendarModelDetail/ConfirmModal'
import TreatmentPlanCard from '../../components/TreamentModal/TreatmentPlanCard'
import TreatmentPlanModal from '../../components/TreamentModal/TreatmentPlanModal'
import { CreateTreatmentPlanDto, TreatmentPlan } from '../../types/treatmentPlan.type'

export default function TreatmentPlanTab() {
  const { id } = useParams<{ id: string }>()
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlan | null>(null)

  const {
    data: plansResponse,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['treatmentPlans', id],
    queryFn: () => treatmentPlanApi.getTreateMentsyCustomerId(id as string),
    enabled: !!id
  })

  const treatmentPlans: TreatmentPlan[] = plansResponse?.data.data?.filter((p) => p.customerId === id) || []

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
      customerId: id as string,
      createdByStaffId: '60bdbc72-5b01-4c17-9682-90f6b56d7aea'
    }

    if (planId) {
      // Logic CẬP NHẬT
      updateTreatmentPlanMutation.mutate({ planId, body })
      setIsModalOpen(false)
    } else {
      console.log('create')

      // Logic TẠO MỚI
      createTreatmentPlanMutation.mutate(body)
      setIsModalOpen(false)
    }
  }

  // Cần thêm logic onSave và Mutation (tạo/cập nhật) vào đây hoặc trong PatientDetail
  // const handleSave = () => {
  //   // Logic save và invalidate queries
  //   setIsModalOpen(false)
  // }

  const handleDeletePlan = (planId: string) => {
    console.log('id', planId)

    setPlanToDelete(planId)
    setIsConfirmDeleteOpen(true)
  }

  // 2. Hàm Xóa thực tế (gọi khi bấm Confirm trong Popup)
  // Trong TreatmentPlanTab.tsx

  const confirmDeleteAction = async () => {
    if (!planToDelete) return

    deleteTreatmentPlanMutation.mutate(planToDelete)

    setIsConfirmDeleteOpen(false)
    setPlanToDelete(null)
  }

  if (isLoading) {
    console.log('11')

    return <div className='p-6 text-center text-gray-500'>Loading treatment plans...</div>
  }

  return (
    <div className='p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg min-h-[500px]'>
      <div className='flex justify-between items-center mb-6'>
        <h3 className='text-xl font-bold dark:text-white text-gray-900'>Treatment Plans ({treatmentPlans.length})</h3>
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
            <TreatmentPlanCard onDelete={handleDeletePlan} key={plan.id} plan={plan} onViewDetails={handleViewOrEdit} />
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
        customerId={id as string}
        refetch={refetch}
        onSave={handleSave}
      />
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={confirmDeleteAction} // Khi người dùng xác nhận, gọi hàm xóa API
        title='Confirm Delete Treatment Plan'
        message={`Are you sure you want to delete this Treatment Plan? This action cannot be undone.`}
      />
    </div>
  )
}
