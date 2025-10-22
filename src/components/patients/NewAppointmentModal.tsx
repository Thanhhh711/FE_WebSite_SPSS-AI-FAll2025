import React, { useState } from 'react'

interface NewAppointmentInlineFormProps {
  onCancel: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (data: any) => void
}

const NewAppointmentInlineForm: React.FC<NewAppointmentInlineFormProps> = ({ onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    doctor: '',
    specialty: '',
    reason: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Bổ sung các trường dữ liệu cần thiết khác khi lưu
    onSave({
      ...formData,
      id: Date.now(), // ID tạm thời
      status: 'Upcoming',
      nextSteps: '',
      doctorNotes: '' // Mặc định trống cho cuộc hẹn mới
    })
  }

  return (
    <div className='border border-blue-400 bg-blue-50 p-5 rounded-xl shadow-lg mb-6 transition duration-500 ease-in-out'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <h3 className='text-xl font-bold text-blue-800 mb-4'>New Appointment Details</h3>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>Date & Time</label>
            <div className='flex space-x-2 mt-1'>
              <input
                type='date'
                name='date'
                value={formData.date}
                onChange={handleChange}
                className='w-full p-2 border border-gray-300 rounded-lg'
                required
              />
              <input
                type='time'
                name='time'
                value={formData.time}
                onChange={handleChange}
                className='w-full p-2 border border-gray-300 rounded-lg'
                required
              />
            </div>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>Doctor</label>
            <input
              type='text'
              name='doctor'
              placeholder='Dr. Jane Doe'
              value={formData.doctor}
              onChange={handleChange}
              className='w-full p-2 mt-1 border border-gray-300 rounded-lg'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>Specialty</label>
            <input
              type='text'
              name='specialty'
              placeholder='Cardiology'
              value={formData.specialty}
              onChange={handleChange}
              className='w-full p-2 mt-1 border border-gray-300 rounded-lg'
              required
            />
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700'>Reason for Visit</label>
          <textarea
            name='reason'
            rows={3}
            placeholder='Brief description of the appointment purpose.'
            value={formData.reason}
            onChange={handleChange}
            className='w-full p-2 mt-1 border border-gray-300 rounded-lg resize-none'
          ></textarea>
        </div>

        <div className='flex justify-end space-x-3 pt-2'>
          <button
            type='button'
            onClick={onCancel}
            className='px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition'
          >
            Cancel
          </button>
          <button
            type='submit'
            className='px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition'
            disabled={!formData.date || !formData.time || !formData.doctor}
          >
            Save Appointment
          </button>
        </div>
      </form>
    </div>
  )
}

export default NewAppointmentInlineForm
