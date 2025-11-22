import React, { useCallback, useEffect, useState } from 'react'
import { registrationApi } from '../../api/registration.api'
import { roomApi } from '../../api/room.api'
import { scheduleApi } from '../../api/schedulars.api'
import userApi from '../../api/user.api'
import { WorkScheduleStatus } from '../../constants/SchedularConstants'
import { ScheduleWork } from '../../types/appoinment.type'
import { ScheduleRegistration } from '../../types/registration.type'
import { Room } from '../../types/room.type'
import { FormUpdateSchedular, ScheduleRequest } from '../../types/schedula.type'
import { User } from '../../types/user.type'
import { formatDateValue } from '../../utils/utils.type'
import { toast } from 'react-toastify'

// Simple Toast/Message Function (replacing Ant Design notification)
const showToast = (msg: string, type: 'success' | 'error') => {
  console.log(`${type.toUpperCase()}: ${msg}`)
  alert(`${type.toUpperCase()}: ${msg}`)
}

interface ScheduleFormModalProps {
  visible: boolean
  onClose: () => void
  scheduleToEdit: ScheduleWork | null
  onSuccess: () => void
  refetch: () => void
}

const ScheduleFormModal: React.FC<ScheduleFormModalProps> = ({
  visible,
  onClose,
  scheduleToEdit,
  onSuccess,
  refetch
}) => {
  const isEditMode = !!scheduleToEdit

  // --- STATE QUẢN LÝ DATA & LOADING ---
  const [roomList, setRoomList] = useState<Room[]>([])
  const [staffList, setStaffList] = useState<User[]>([]) // Danh sách Beauty Advisors
  //   const [slotList, setSlotList] = useState<Slot[]>([]) // Danh sách Slots
  const [registrationList, setRegistrationList] = useState<ScheduleRegistration[]>([]) // Danh sách Registrations

  // --- FORM DATA (Updated to include slotId and registrationId) ---
  const [formData, setFormData] = useState({
    staffId: '',
    shiftDate: formatDateValue(new Date().toISOString()),
    startTime: '09:00',
    endTime: '17:00',
    roomId: '',
    status: WorkScheduleStatus.Active.toString(),
    notes: '',
    slotIndex: 0, // New field
    registrationId: '' // New field
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isRoomLoading, setIsRoomLoading] = useState(false)
  const [isStaffLoading, setIsStaffLoading] = useState(false)
  //   const [isSlotLoading, setIsSlotLoading] = useState(false)
  const [isRegistrationLoading, setIsRegistrationLoading] = useState(false)

  // --- DATA FETCHING FUNCTIONS ---

  // Hàm lấy danh sách phòng
  const fetchRooms = async () => {
    setIsRoomLoading(true)
    try {
      const response = await roomApi.getRooms()
      const rooms = response.data.data || []
      setRoomList(rooms)
      if (rooms.length > 0 && formData.roomId === '') {
        setFormData((prev) => ({ ...prev, roomId: rooms[0].id }))
      }
    } catch (error) {
      console.error('Error fetching room list:', error)
      showToast('Failed to load room list.', 'error')
    } finally {
      setIsRoomLoading(false)
    }
  }

  // Hàm lấy danh sách Staff (Beauty Advisors)
  const fetchStaff = async () => {
    setIsStaffLoading(true)
    try {
      const response = await userApi.getUsers()
      const beautyAdvisors = (response.data.data || []).filter((user) => user.roleName === 'BeautyAdvisor')
      setStaffList(beautyAdvisors)

      if (beautyAdvisors.length > 0 && formData.staffId === '') {
        setFormData((prev) => ({ ...prev, staffId: beautyAdvisors[0].userId }))
      }
    } catch (error) {
      console.error('Error fetching staff list:', error)
      showToast('Failed to load staff list.', 'error')
    } finally {
      setIsStaffLoading(false)
    }
  }

  // Hàm lấy danh sách Slot
  //   const fetchSlots = async () => {
  //     setIsSlotLoading(true)
  //     try {
  //       const response = await slotApi.getSlots()
  //       const slots = response.data.data || []
  //       setSlotList(slots)

  //       if (slots.length > 0 && formData.slotId === '') {
  //         setFormData((prev) => ({ ...prev, slotId: slots[0].id }))
  //       }
  //     } catch (error) {
  //       console.error('Error fetching slot list:', error)
  //       showToast('Failed to load slot list.', 'error')
  //     } finally {
  //       setIsSlotLoading(false)
  //     }
  //   }

  // Hàm lấy danh sách Registration theo Staff ID
  const fetchRegistrations = useCallback(async (staffId: string) => {
    if (!staffId) {
      setRegistrationList([])
      setFormData((prev) => ({ ...prev, registrationId: '' }))
      return
    }

    setIsRegistrationLoading(true)
    try {
      const response = await registrationApi.getRegistrationByBeatyAdvisorId(staffId)
      const registrations = response.data.data || []
      setRegistrationList(registrations)

      if (registrations.length > 0) {
        setFormData((prev) => ({ ...prev, registrationId: registrations[0].id }))
      } else {
        setFormData((prev) => ({ ...prev, registrationId: '' }))
      }
    } catch (error) {
      console.error(`Error fetching registrations for ${staffId}:`, error)
      showToast('Failed to load registrations.', 'error')
    } finally {
      setIsRegistrationLoading(false)
    }
  }, [])

  // --- EFFECT: Initial Data Loading (Rooms, Staff, Slots) ---
  useEffect(() => {
    if (visible) {
      // Fetch static data lists
      fetchRooms()
      fetchStaff()
      //   fetchSlots()

      // Populate form data for edit mode
      if (isEditMode && scheduleToEdit) {
        // Remove seconds for time inputs (HH:mm:ss -> HH:mm)
        const startTime =
          scheduleToEdit.startTime.length > 5 ? scheduleToEdit.startTime.substring(0, 5) : scheduleToEdit.startTime
        const endTime =
          scheduleToEdit.endTime.length > 5 ? scheduleToEdit.endTime.substring(0, 5) : scheduleToEdit.endTime

        setFormData({
          staffId: scheduleToEdit.staffId,
          shiftDate: formatDateValue(scheduleToEdit.shiftDate),
          startTime: startTime,
          endTime: endTime,
          roomId: scheduleToEdit.room.id,
          status: scheduleToEdit.status.toString(),
          notes: scheduleToEdit.notes,
          // Assume these are not pre-filled from the schedule object
          slotIndex: scheduleToEdit.slotIndex,
          registrationId: ''
        })
      } else {
        // Reset/Default for Create Mode
        setFormData((prev) => ({
          ...prev,
          shiftDate: formatDateValue(new Date().toISOString()),
          startTime: '09:00',
          endTime: '17:00',
          status: WorkScheduleStatus.Active.toString(),
          notes: '',
          registrationId: '',
          slotId: ''
          // staffId and roomId will be set by the fetch functions' logic
        }))
      }
    }
  }, [visible, isEditMode, scheduleToEdit])

  // --- EFFECT: Dependent Fetching (Registrations based on selected Staff) ---
  useEffect(() => {
    if (visible && formData.staffId) {
      fetchRegistrations(formData.staffId)
    }
  }, [visible, formData.staffId, fetchRegistrations]) // Chạy lại khi staffId thay đổi

  // --- Input Change Handler ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // --- Form Submission and API Call Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation check
    if (
      !formData.staffId ||
      !formData.shiftDate ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.roomId ||
      !formData.slotIndex ||
      !formData.registrationId
    ) {
      showToast('Please fill in all required fields.', 'error')
      return
    }

    setIsSaving(true)
    try {
      // Prepare Body for API
      const body: FormUpdateSchedular = {
        ...formData,
        status: parseInt(formData.status),
        slotIndex: formData.slotIndex as number,
        startTime: formData.startTime + ':00',
        endTime: formData.endTime + ':00'
      }

      if (isEditMode && scheduleToEdit) {
        const data = await scheduleApi.updateScheduleById(scheduleToEdit.id, body)
        refetch()
        toast.success(data.data.message)
      } else {
        const bodyCreate: ScheduleRequest = {
          ...formData,
          status: parseInt(formData.status),
          slotIndex: formData.slotIndex as number,
          startTime: formData.startTime + ':00',
          endTime: formData.endTime + ':00'
        }

        // Assuming createSchedule is the correct method name
        const res = await scheduleApi.createSchedule(bodyCreate)
        refetch()
        toast.success(res.data.message)
      }

      onClose()
      onSuccess()
    } catch (error) {
      console.error('Error submitting form:', error)
      showToast(isEditMode ? 'Update failed.' : 'Creation failed.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  if (!visible) return null

  // --- RENDERING MODAL (Tailwind) ---
  const baseInputClasses =
    'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700/50'

  return (
    // Modal Overlay
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm'>
      {/* Modal Content */}
      <div className='bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-xl mx-4'>
        {/* Modal Header */}
        <div className='flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 '>
          <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
            {isEditMode ? 'Edit Work Schedule' : 'Create New Work Schedule'}
          </h3>
          <button
            onClick={onClose}
            className='text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg w-8 h-8 flex items-center justify-center transition-colors'
          >
            <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        {/* Modal Body (Form) */}
        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          <div className='p-6 space-y-4 max-h-[70vh] overflow-y-auto'>
            {/* Staff Selection (Replaced Staff ID Input) */}
            <div>
              <label htmlFor='staffId' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Staff (Beauty Advisor) <span className='text-red-500'>*</span>
              </label>
              <select
                id='staffId'
                name='staffId'
                value={formData.staffId}
                onChange={handleChange}
                required
                disabled={isEditMode || isStaffLoading}
                className={baseInputClasses}
              >
                {isStaffLoading ? (
                  <option value='' disabled>
                    Loading staff...
                  </option>
                ) : staffList.length === 0 ? (
                  <option value='' disabled>
                    No staff found
                  </option>
                ) : (
                  staffList.map((staff) => (
                    <option key={staff.userId} value={staff.userId}>
                      {staff.emailAddress} ({staff.userId})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Registration Selection (Dependent on Staff) */}
            <div>
              <label
                htmlFor='registrationId'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
              >
                Registration Template <span className='text-red-500'>*</span>
              </label>
              <select
                id='registrationId'
                name='registrationId'
                value={formData.registrationId}
                onChange={handleChange}
                required
                disabled={isRegistrationLoading || !formData.staffId}
                className={baseInputClasses}
              >
                {isRegistrationLoading ? (
                  <option value='' disabled>
                    Loading registrations...
                  </option>
                ) : registrationList.length === 0 ? (
                  <option value='' disabled>
                    No registrations found for this staff
                  </option>
                ) : (
                  registrationList.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      {reg.template.name} ({formatDateValue(reg.startDate)} - {formatDateValue(reg.endDate)})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Room Selection */}
            <div>
              <label htmlFor='roomId' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Room <span className='text-red-500'>*</span>
              </label>
              <select
                id='roomId'
                name='roomId'
                value={formData.roomId}
                onChange={handleChange}
                required
                disabled={isRoomLoading}
                className={baseInputClasses}
              >
                {isRoomLoading ? (
                  <option value='' disabled>
                    Loading rooms...
                  </option>
                ) : roomList.length === 0 ? (
                  <option value='' disabled>
                    No rooms found
                  </option>
                ) : (
                  roomList.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.roomName} ({room.location} - Floor {room.floorNumber})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Work Date */}
            <div>
              <label htmlFor='shiftDate' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Work Date <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                id='shiftDate'
                name='shiftDate'
                value={formData.shiftDate}
                onChange={handleChange}
                required
                className={baseInputClasses}
              />
            </div>

            {/* Start Time & End Time */}
            <div className='flex space-x-4'>
              <div className='flex-1'>
                <label htmlFor='startTime' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Start Time <span className='text-red-500'>*</span>
                </label>
                <input
                  type='time'
                  id='startTime'
                  name='startTime'
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className={baseInputClasses}
                />
              </div>
              <div className='flex-1'>
                <label htmlFor='endTime' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  End Time <span className='text-red-500'>*</span>
                </label>
                <input
                  type='time'
                  id='endTime'
                  name='endTime'
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className={baseInputClasses}
                />
              </div>
            </div>

            {/* Slot Selection */}
            {/* <div>
            <label htmlFor='slotId' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Slot <span className='text-red-500'>*</span>
            </label>
            <select
              id='slotId'
              name='slotId'
              value={formData.slotId}
              onChange={handleChange}
              required
              disabled={isSlotLoading}
              className={baseInputClasses}
            >
              {isSlotLoading ? (
                <option value='' disabled>
                  Loading slots...
                </option>
              ) : slotList.length === 0 ? (
                <option value='' disabled>
                  No slots found
                </option>
              ) : (
                slotList.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.id} (Min: {slot.slotMinutes}, Break: {slot.breakMinutes})
                  </option>
                ))
              )}
            </select>
          </div> */}

            <div>
              <label htmlFor='slotIndex' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Slot Number
              </label>
              <textarea
                id='slotIndex'
                name='slotIndex'
                value={formData.slotIndex}
                onChange={handleChange}
                rows={2}
                className={baseInputClasses}
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor='status' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Status <span className='text-red-500'>*</span>
              </label>
              <select
                id='status'
                name='status'
                value={formData.status}
                onChange={handleChange}
                required
                className={baseInputClasses}
              >
                <option value={WorkScheduleStatus.Active.toString()}>Active</option>
                <option value={WorkScheduleStatus.InActive.toString()}>Inactive</option>
                <option value={WorkScheduleStatus.Booked.toString()} disabled={!isEditMode}>
                  Booked
                </option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor='notes' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Notes
              </label>
              <textarea
                id='notes'
                name='notes'
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className={baseInputClasses}
              />
            </div>

            {/* Modal Footer (Buttons) */}
            <div className='flex justify-end pt-4 space-x-3 border-t border-gray-200 dark:border-gray-700'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={isSaving}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSaving ? (isEditMode ? 'Updating...' : 'Creating...') : isEditMode ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ScheduleFormModal
