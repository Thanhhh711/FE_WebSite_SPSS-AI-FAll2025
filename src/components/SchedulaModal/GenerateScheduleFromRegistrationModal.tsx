/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AuthContext'
import { useMutation, useQuery } from '@tanstack/react-query'
import { registrationApi } from '../../api/registration.api'
import { ScheduleRegistration } from '../../types/registration.type'
import { toast } from 'react-toastify'
import { scheduleApi } from '../../api/schedulars.api'
import { formatDateToDDMMYYYY } from '../../utils/validForm'
import { StaffEmailLookupString } from '../../utils/StaffEmailLookup'

interface GenerateScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  selectedBAId?: string // ID của Beauty Advisor đang được chọn/filter
  onScheduleGenerated: () => void // Hàm refetch lịch làm việc
}

export const GenerateScheduleFromRegistrationModal: React.FC<GenerateScheduleModalProps> = ({
  isOpen,
  onClose,
  selectedBAId,
  onScheduleGenerated
}) => {
  console.log('beaty', selectedBAId)

  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null)
  const { profile } = useAppContext()
  const staffIdToUse = selectedBAId || profile?.userId

  const { data: registrationsResponse, isLoading: isLoadingRegistrations } = useQuery({
    queryKey: ['registrationsForGeneration', staffIdToUse],
    queryFn: async () => {
      if (!staffIdToUse) return []
      try {
        const res = await registrationApi.getRegistrationByBeatyAdvisorId(staffIdToUse)
        return res.data.data as ScheduleRegistration[]
      } catch (error) {
        toast.error('Error fetching registrations for generation.')
        return []
      }
    },
    enabled: isOpen && !!staffIdToUse,
    staleTime: 1000 * 60
  })

  const availableRegistrations = registrationsResponse || []

  // 2. Mutation để gọi API tạo Schedule
  const { mutate: generateSchedule, isPending: isGenerating } = useMutation({
    mutationFn: (registrationId: string) =>
      // Sử dụng API createGenerateSchedule theo yêu cầu
      scheduleApi.createGenerateSchedule(registrationId),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Work schedule generated successfully!')
      onScheduleGenerated() // Refetch data của bảng chính
      onClose()
      setSelectedRegistrationId(null)
    },
    onError: (error: any) => {
      toast.error(error.data?.res || 'Error generating work schedule.')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedRegistrationId) {
      generateSchedule(selectedRegistrationId)
    } else {
      toast.error('Please select a registration.')
    }
  }

  useEffect(() => {
    if (availableRegistrations.length > 0) {
      setSelectedRegistrationId(availableRegistrations[0].id)
    }
  }, [availableRegistrations])

  if (!isOpen) return null

  // UI (Minimal Tailwind Modal structure)
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-2xl'>
        <h3 className='text-xl font-bold mb-4 text-gray-900 dark:text-white'>Generate Schedule from Registration</h3>
        <p className='text-sm text-gray-600 dark:text-gray-300 mb-4'>
          <span className='font-semibold'>
            Beaty: {staffIdToUse ? <StaffEmailLookupString staffId={staffIdToUse} /> : 'N/A'}
          </span>
        </p>
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Select Registration:
            </label>
            <select
              value={selectedRegistrationId || ''}
              onChange={(e) => setSelectedRegistrationId(e.target.value)}
              className='w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              disabled={isLoadingRegistrations || isGenerating || availableRegistrations.length === 0}
            >
              {isLoadingRegistrations && <option value=''>Loading registrations...</option>}
              {!isLoadingRegistrations && availableRegistrations.length === 0 && (
                <option value=''>No registrations available for this staff.</option>
              )}
              {availableRegistrations.map((reg) => (
                <option key={reg.id} value={reg.id}>
                  {reg.template.name} ({formatDateToDDMMYYYY(reg.startDate)} - {formatDateToDDMMYYYY(reg.endDate)})
                </option>
              ))}
            </select>
          </div>

          <div className='flex justify-end gap-3'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              disabled={isGenerating}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50'
              disabled={isGenerating || !selectedRegistrationId}
            >
              {isGenerating ? 'Generating...' : 'Generate Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
