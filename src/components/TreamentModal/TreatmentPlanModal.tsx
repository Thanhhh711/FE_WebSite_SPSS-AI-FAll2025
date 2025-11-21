import { useEffect, useState } from 'react'
import { CreateTreatmentPlanDto, TreatmentPlan, TreatmentPlanStatus } from '../../types/treatmentPlan.type'
import TreatmentSessionList from './TreamentSessionList'

const PLAN_STATUS_NAMES: { [key: number]: string } = {
  [TreatmentPlanStatus.Draft]: 'Nháp',
  [TreatmentPlanStatus.PendingApproval]: 'Chờ Phê duyệt',
  [TreatmentPlanStatus.Approved]: 'Đã Phê duyệt',
  [TreatmentPlanStatus.InProgress]: 'Đang điều trị',
  [TreatmentPlanStatus.Completed]: 'Hoàn thành',
  [TreatmentPlanStatus.Cancelled]: 'Bị hủy',
  [TreatmentPlanStatus.OnHold]: 'Tạm ngưng'
}

const initialFormState: CreateTreatmentPlanDto = {
  createdByStaffId: 'MOCK_STAFF_ID', // Cần lấy từ context
  customerId: '',
  estimatedCost: 0,
  durationWeeks: 0,
  totalSessions: 0,
  diagnosis: '',
  goal: '',
  startDate: '',
  endDate: '',
  status: TreatmentPlanStatus.Draft,
  description: ''
}

interface TreatmentPlanModalProps {
  isOpen: boolean
  onClose: () => void
  plan: TreatmentPlan | null // Dữ liệu cho Edit/View, null cho Create
  customerId: string // ID bắt buộc khi tạo mới
  onSave: (data: CreateTreatmentPlanDto, planId?: string) => void
  refetch: () => void
}

export default function TreatmentPlanModal({
  isOpen,
  onClose,
  plan,
  customerId,
  onSave,
  refetch
}: TreatmentPlanModalProps) {
  const [form, setForm] = useState<CreateTreatmentPlanDto>(initialFormState)
  const isEditing = !!plan
  const isViewMode =
    isEditing && (plan?.status === TreatmentPlanStatus.Completed || plan?.status === TreatmentPlanStatus.Cancelled)

  const title = isEditing ? 'Edit Treatment Plan' : 'Create New Treatment Plan'

  // Tab trong Modal
  const [activeTab, setActiveTab] = useState<'Details' | 'Sessions'>('Details')

  useEffect(() => {
    if (plan) {
      setForm({
        ...plan,
        startDate: plan.startDate.substring(0, 10), // Giữ định dạng YYYY-MM-DD cho input
        endDate: plan.endDate.substring(0, 10)
      })
    } else {
      setForm({ ...initialFormState, customerId: customerId })
    }
  }, [plan, customerId])

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'estimatedCost' || name === 'durationWeeks' || name === 'totalSessions' ? Number(value) : value
    }))
  }

  // Trong TreatmentPlanModal.tsx

  const handleFormSave = () => {
    // 1. ✅ Kiểm tra bước 1: Hàm có được gọi không?
    console.log('[MODAL] handleFormSave: Bắt đầu chạy.')

    // ******************************************************
    // Kiểm tra Vùng Validation/Form Logic (NƠI LỖI THƯỜNG XẢY RA)
    // ******************************************************

    // Ví dụ: Nếu bạn dùng react-hook-form, logic có thể trông như sau:
    // handleSubmit((data) => {
    //     // Logic này sẽ bị chặn nếu form không hợp lệ
    //     onSave(data, plan?.id)
    // })()

    // Ví dụ: Nếu bạn dùng Validation thủ công
    // if (form.diagnosis.length < 5) {
    //     console.log('[MODAL] handleFormSave: Lỗi validation, đã RETURN.')
    //     return // Dòng này sẽ chặn hàm
    // }

    // ******************************************************

    const planId = plan?.id

    // 2. ✅ Kiểm tra bước 2: Hàm có gọi onSave không?
    console.log('[MODAL] handleFormSave: Gọi onSave. PlanId:', planId)

    // Đây là dòng cuối cùng trước khi chuyển giao quyền kiểm soát
    onSave(form, planId)

    // 3. ✅ Kiểm tra bước 3: Dòng này có chạy không?
    console.log('[MODAL] handleFormSave: Hoàn thành.')
  }

  const baseInputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Modal Header */}
        <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
          <h3 className='text-xl font-bold text-gray-900 dark:text-white'>{title}</h3>
        </div>

        {/* Tab Navigation */}
        <div className='border-b border-gray-200 dark:border-gray-700 px-6 pt-3'>
          <nav className='-mb-px flex space-x-8'>
            {['Details', 'Sessions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'Details' | 'Sessions')}
                className={`pb-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                    : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {tab === 'Details' ? 'Plan Details' : `Sessions (${plan?.treatmentSessions.length || 0})`}
              </button>
            ))}
          </nav>
        </div>

        {/* Modal Body */}
        <div className='flex-grow overflow-y-auto p-6'>
          {activeTab === 'Details' && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Row 1: Diagnosis & Goal */}
              <div className='md:col-span-2'>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>Diagnosis</label>
                <textarea
                  name='diagnosis'
                  rows={2}
                  value={form.diagnosis}
                  onChange={handleChange}
                  readOnly={isViewMode}
                  className={`${baseInputClass} resize-none`}
                />
              </div>

              <div className='md:col-span-2'>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>Goal</label>
                <textarea
                  name='goal'
                  rows={2}
                  value={form.goal}
                  onChange={handleChange}
                  readOnly={isViewMode}
                  className={`${baseInputClass} resize-none`}
                />
              </div>

              {/* Row 2: Dates */}
              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>Start Date</label>
                <input
                  type='date'
                  name='startDate'
                  value={form.startDate}
                  onChange={handleChange}
                  readOnly={isViewMode}
                  className={baseInputClass}
                />
              </div>

              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>End Date</label>
                <input
                  type='date'
                  name='endDate'
                  value={form.endDate}
                  onChange={handleChange}
                  readOnly={isViewMode}
                  className={baseInputClass}
                />
              </div>

              {/* Row 3: Cost & Duration & Total Sessions */}
              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>
                  Estimated Cost (VND)
                </label>
                <input
                  type='number'
                  name='estimatedCost'
                  value={form.estimatedCost}
                  onChange={handleChange}
                  readOnly={isViewMode}
                  className={baseInputClass}
                />
              </div>

              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>
                  Duration (Weeks)
                </label>
                <input
                  type='number'
                  name='durationWeeks'
                  value={form.durationWeeks}
                  onChange={handleChange}
                  readOnly={isViewMode}
                  className={baseInputClass}
                />
              </div>

              <div>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>
                  Total Sessions
                </label>
                <input
                  type='number'
                  name='totalSessions'
                  value={form.totalSessions}
                  onChange={handleChange}
                  readOnly={isViewMode}
                  className={baseInputClass}
                />
              </div>

              {/* Row 4: Status (chỉ cho Edit) */}
              {isEditing && (
                <div>
                  <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>Status</label>
                  <select
                    name='status'
                    value={form.status}
                    onChange={handleChange}
                    // readOnly={isViewMode}
                    className={baseInputClass}
                    disabled={isViewMode}
                  >
                    {Object.entries(PLAN_STATUS_NAMES).map(([key, name]) => (
                      <option key={key} value={key}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Row 5: Description */}
              <div className='md:col-span-2'>
                <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'>Description</label>
                <textarea
                  name='description'
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  readOnly={isViewMode}
                  className={`${baseInputClass} resize-none`}
                />
              </div>
            </div>
          )}

          {/* Sessions Tab Content */}
          {activeTab === 'Sessions' && plan?.id && (
            <TreatmentSessionList
              planId={plan.id}
              sessions={plan.treatmentSessions}
              isViewMode={isViewMode}
              refetchPlan={refetch}
            />
          )}

          {activeTab === 'Sessions' && !plan?.id && (
            <div className='p-8 text-center text-gray-500 border border-dashed rounded-lg'>
              Please save the Treatment Plan first to manage sessions.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className='p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3'>
          <button
            onClick={onClose}
            type='button'
            className='px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700/50'
          >
            {isViewMode ? 'Close' : 'Cancel'}
          </button>
          {!isViewMode && (
            <button
              onClick={handleFormSave}
              type='button'
              className='px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700'
            >
              {isEditing ? 'Save Changes' : 'Create Plan'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
