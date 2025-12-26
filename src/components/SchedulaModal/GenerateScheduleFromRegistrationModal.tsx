/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { registrationApi } from '../../api/registration.api'
import { ScheduleRegistration } from '../../types/registration.type'
import { toast } from 'react-toastify'
import { scheduleApi } from '../../api/schedulars.api'

import { formatDateToDDMMYYYY } from '../../utils/validForm'
import userApi from '../../api/user.api'
import { User } from '../../types/user.type'

interface GenerateScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onScheduleGenerated: () => void
}

export const GenerateScheduleFromRegistrationModal: React.FC<GenerateScheduleModalProps> = ({
  isOpen,
  onClose,
  onScheduleGenerated
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>('')
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null)

  // 1. Lấy danh sách Beauty Advisors
  const { data: staffList, isLoading: isLoadingStaff } = useQuery({
    queryKey: ['beautyAdvisors'],
    queryFn: async () => {
      const res = await userApi.getBeatyAdvisor()
      return res.data.data
    },
    enabled: isOpen
  })

  // 2. Lấy danh sách Registration dựa trên Staff được chọn
  const { data: registrationsResponse, isLoading: isLoadingRegistrations } = useQuery({
    queryKey: ['registrationsForGeneration', selectedStaffId],
    queryFn: async () => {
      if (!selectedStaffId) return []
      try {
        const res = await registrationApi.getRegistrationByBeatyAdvisorId(selectedStaffId)
        return res.data.data as ScheduleRegistration[]
      } catch (error) {
        return []
      }
    },
    enabled: !!selectedStaffId,
    staleTime: 1000 * 60
  })

  const availableRegistrations = registrationsResponse || []

  // 3. Mutation tạo Schedule
  const { mutate: generateSchedule, isPending: isGenerating } = useMutation({
    mutationFn: (registrationId: string) => scheduleApi.createGenerateSchedule(registrationId),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Work schedule generated successfully!')
      onScheduleGenerated()
      onClose()
      setSelectedRegistrationId(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error generating work schedule.')
    }
  })

  // Tự động chọn registration đầu tiên khi danh sách thay đổi
  useEffect(() => {
    if (availableRegistrations.length > 0) {
      setSelectedRegistrationId(availableRegistrations[0].id)
    } else {
      setSelectedRegistrationId(null)
    }
  }, [availableRegistrations])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedRegistrationId) {
      generateSchedule(selectedRegistrationId)
    } else {
      toast.error('Please select a registration.')
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto outline-none focus:outline-none'>
      {/* Lớp nền Blur mờ ảo */}
      <div
        className='fixed inset-0 bg-white/30 dark:bg-black/20 backdrop-blur-md transition-opacity'
        onClick={onClose}
      ></div>

      {/* Nội dung Modal */}
      <div className='relative w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 transform transition-all'>
        <div className='mb-6'>
          <h3 className='text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400'>
            Generate Schedule
          </h3>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
            Select a staff member and their registration to create a work schedule.
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Chọn Beauty Advisor */}
          <div>
            <label className='block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 ml-1'>
              Beauty Advisor
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className='w-full px-4 py-3 rounded-xl border-0 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-indigo-600 transition-all duration-200 outline-none'
              disabled={isLoadingStaff}
            >
              <option value=''>-- Select Advisor --</option>
              {staffList?.map((staff: User) => (
                <option key={staff.userId} value={staff.userId}>
                  {staff.surName} {staff.firstName}
                </option>
              ))}
            </select>
          </div>

          {/* Chọn Registration */}
          <div>
            <label className='block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 ml-1'>
              Select Registration Period
            </label>
            <select
              value={selectedRegistrationId || ''}
              onChange={(e) => setSelectedRegistrationId(e.target.value)}
              className='w-full px-4 py-3 rounded-xl border-0 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-indigo-600 transition-all duration-200 outline-none'
              disabled={isLoadingRegistrations || !selectedStaffId || availableRegistrations.length === 0}
            >
              {isLoadingRegistrations ? (
                <option value=''>Loading...</option>
              ) : availableRegistrations.length === 0 ? (
                <option value=''>No registration found</option>
              ) : (
                availableRegistrations.map((reg) => (
                  <option key={reg.id} value={reg.id}>
                    {reg.template.name} ({formatDateToDDMMYYYY(reg.startDate)})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Nút hành động */}
          <div className='flex items-center justify-end gap-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isGenerating || !selectedRegistrationId}
              className='relative overflow-hidden px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100'
            >
              {isGenerating ? (
                <span className='flex items-center gap-2'>
                  <svg className='animate-spin h-4 w-4 text-white' viewBox='0 0 24 24'>
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                      fill='none'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                'Generate Now'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
