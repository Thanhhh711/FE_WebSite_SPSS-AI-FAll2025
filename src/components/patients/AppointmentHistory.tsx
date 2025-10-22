/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import NewAppointmentInlineForm from './NewAppointmentModal'

// Dữ liệu mẫu cho Lịch sử cuộc hẹn
interface Appointment {
  id: number
  date: string
  time: string
  doctor: string
  specialty: string
  status: 'Completed' | 'Upcoming' | string
  assessment: string
  treatment: string
  nextSteps: string
  doctorNotes: string
}

// Component hiển thị chi tiết một cuộc hẹn
const AppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => (
  <div className='border border-gray-200 p-5 rounded-xl shadow-sm mb-6 bg-white'>
    <div className='flex justify-between items-start border-b pb-3 mb-3'>
      <div className='text-sm text-gray-600'>
        <span className='font-semibold text-gray-800 mr-2'>{appointment.date}</span> at{' '}
        <span className='font-medium'>{appointment.time}</span>
      </div>
      <span
        className={`text-xs font-semibold px-3 py-1 rounded-full ${
          appointment.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
        }`}
      >
        {appointment.status}
      </span>
    </div>

    <div className='text-lg font-bold text-gray-900'>{appointment.doctor}</div>
    <div className='text-sm text-gray-500 mb-4'>{appointment.specialty}</div>

    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
      {/* Cột 1: Assessment */}
      <div>
        <h4 className='font-semibold text-gray-700'>Skin Condition Assessment</h4>
        <p className='text-sm text-gray-600'>Mild acne with some inflammatory lesions on the T-zone area</p>
      </div>
      {/* Cột 2: Treatment */}
      <div>
        <h4 className='font-semibold text-gray-700'>Treatment</h4>
        <p className='text-sm text-gray-600'>Prescribed topical retinoid cream and gentle cleanser</p>
      </div>
    </div>

    {/* Next Steps */}
    <div className='bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500 mb-4'>
      <h4 className='font-semibold text-yellow-800 text-sm'>Next Steps</h4>
      <p className='text-sm text-yellow-700'>{appointment.nextSteps}</p>
    </div>

    {/* Documentation */}
    <div className='mb-4'>
      <h4 className='font-semibold text-gray-700 mb-1'>Documentation</h4>
      <div className='flex space-x-2 text-xs'>
        <span className='bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium'>#Before treatment</span>
        <span className='bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium'>#After cleansing routine</span>
      </div>
    </div>

    {/* Doctor's Notes */}
    <div className='bg-green-50 p-3 rounded-lg mb-4'>
      <h4 className='font-semibold text-green-800 mb-1'>Doctor's Notes</h4>
      <p className='text-sm text-green-700'>{appointment.doctorNotes}</p>
    </div>

    {/* Add Follow-up Note */}
    <div className='mt-6'>
      <h4 className='font-semibold text-gray-700 mb-2'>Add Follow-up Note</h4>
      <textarea
        rows={3}
        placeholder='Add additional notes about skin condition, treatment progress, or observations...'
        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none'
      ></textarea>
      <div className='flex justify-end mt-2'>
        <button className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition'>
          Save Note
        </button>
      </div>
    </div>
  </div>
)

interface AppointmentHistoryProps {
  appointments: Appointment[]
  onSaveNewAppointment: (data: any) => void
}

const AppointmentHistory: React.FC<AppointmentHistoryProps> = ({ onSaveNewAppointment, appointments }) => {
  const [showNewForm, setShowNewForm] = useState(false)

  const handleSave = (data: any) => {
    onSaveNewAppointment(data) // Đẩy dữ liệu lên component cha (PatientDetail) để xử lý
    setShowNewForm(false) // Ẩn form sau khi lưu
  }

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h3 className='text-xl font-bold text-gray-900'>Appointment History</h3>
        {!showNewForm && (
          <button
            onClick={() => setShowNewForm(true)} // Mở Form Inline
            className='flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition'
          >
            <div className='text-lg mr-1'>+</div>
            Schedule New Appointment
          </button>
        )}
      </div>

      {/* Hiển thị Form Inline mới tại đây */}
      {showNewForm && (
        <NewAppointmentInlineForm
          onCancel={() => setShowNewForm(false)} // Ẩn form khi cancel
          onSave={handleSave}
        />
      )}

      {/* Danh sách các card cũ sẽ được đẩy xuống tự động nhờ flow layout */}
      <div className='space-y-6'>
        {appointments.length > 0 ? (
          // Đảm bảo card mới nhất (hoặc sắp xếp theo ngày) nằm ở trên
          appointments.map((app) => <AppointmentCard key={app.id} appointment={app} />)
        ) : (
          <div className='text-center p-10 border border-dashed rounded-lg text-gray-500'>
            No appointment history found for this patient.
          </div>
        )}
      </div>
    </div>
  )
}

export default AppointmentHistory
