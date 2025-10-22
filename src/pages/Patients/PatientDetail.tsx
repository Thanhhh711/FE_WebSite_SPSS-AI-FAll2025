/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import AppointmentHistory from '../../components/patients/AppointmentHistory'
import SectionCard from '../../components/patients/SectionCard'
import VitalsCard from '../../components/patients/VitalsCard'

// Component con để hiển thị thông tin chi tiết trong các SectionCard
const DetailItem: React.FC<{ title: string; subtitle: string; time: string; note: string }> = ({
  title,
  subtitle,
  time,
  note
}) => (
  <div className='border-l-4 border-gray-200 pl-4 py-2'>
    <div className='font-semibold text-gray-900'>{title}</div>
    <div className='text-sm text-blue-600 mb-1'>
      {subtitle} - {time}
    </div>
    <p className='text-sm text-gray-600 italic'>{note}</p>
  </div>
)

const mockInitialAppointments = [
  {
    id: 1,
    date: 'Sunday, July 21, 2024',
    time: '02:00 PM',
    doctor: 'Dr. Sarah Johnson',
    specialty: 'Dermatology',
    status: 'Completed',
    assessment: 'Mild acne with some inflammatory lesions on the T-zone area',
    treatment: 'Prescribed topical retinoid cream and gentle cleanser',
    nextSteps: 'Follow-up in 4 weeks to assess improvement',
    doctorNotes:
      'Patient shows good response to previous treatment. Skin texture has improved significantly. Continue current regimen with slight adjustment to retinoid concentration.'
  }
  // Thêm cuộc hẹn khác nếu cần
]

const PatientDetail: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Overview') // 'Overview' hoặc 'Appointment History'

  const [appointments, setAppointments] = useState(mockInitialAppointments)
  // --- Dữ liệu mô phỏng ---
  const patient = {
    name: 'Marvin McKinney',
    age: 32,
    gender: 'Male',
    status: 'ICU',
    condition: 'Brain, Spinal Cord, and Nerve Disorders',
    email: 'mamckinder@gmail.com',
    phone: '+880 172524123123',
    medications: [
      { title: 'Ursofalk 300', subtitle: '2 Pills', time: '02:00 PM', note: '' },
      {
        title: 'Indever 20',
        subtitle: '1 Pill',
        time: '02:20 PM',
        note: 'Patient observed to be having seizures. Indever given to reduce blood pressure'
      }
    ],
    tests: [
      {
        title: 'UV Invasive Ultrasound',
        time: '02:00 PM',
        note: 'A small nerve in the left-mid section of the neck has shown swollen properties. A brain scan is suggested'
      },
      { title: 'Nerve Disorder', time: '', note: '' }
    ]
  }

  const handleSaveNewAppointment = (newAppointmentData: any) => {
    // Thêm cuộc hẹn mới vào đầu danh sách (giả định đây là cuộc hẹn mới nhất)
    const newAppointment = {
      ...newAppointmentData,
      id: Date.now(), // ID duy nhất
      doctorNotes: '',
      assessment: 'Pending',
      treatment: 'Pending'
    }

    setAppointments([newAppointment, ...appointments])
    console.log('New appointment saved:', newAppointment)
  }

  const renderOverviewContent = () => (
    <>
      <VitalsCard />

      {/* Medications Section */}
      <SectionCard title='Medications'>
        <div className='space-y-4'>
          {/* Routine Medicine - Tách riêng vì có subtitle khác */}
          <div className='border-l-4 border-gray-200 pl-4 py-2'>
            <div className='font-semibold text-gray-900'>Routine Medicine</div>
            <div className='text-sm text-gray-500 mb-1'>No observations or notes</div>
          </div>
          {patient.medications.map((m, index) => (
            <DetailItem
              key={index}
              title={m.title}
              subtitle={m.subtitle}
              time={m.time}
              note={m.note || 'No observations or notes'}
            />
          ))}
        </div>
      </SectionCard>

      {/* Test Results Section */}
      <SectionCard title='Test Results'>
        {patient.tests.map((t, index) => (
          <DetailItem
            key={index}
            title={t.title}
            subtitle={t.note.includes('Nerve Disorder') ? 'Nerve Disorder' : 'Test Result'} // Logic tùy chỉnh
            time={t.time}
            note={t.note}
          />
        ))}
      </SectionCard>

      {/* Thêm các Section khác nếu cần */}
    </>
  )

  return (
    <div className='min-h-screen bg-gray-50 p-4 sm:p-8'>
      {/* Breadcrumb và Tiêu đề */}
      <div className='flex items-center text-sm mb-6 text-gray-500'>
        <div className='cursor-pointer text-gray-600 mr-2'>
          {/* Icon quay lại */}
          <div className='text-xl'>{'<'}</div>
        </div>
        <span className='cursor-pointer hover:text-gray-700'>Patients</span>
        <span className='mx-2'>/</span>
        <span className='font-semibold text-gray-800'>Patient Detail</span>
      </div>

      {/* --- Patient Header --- */}
      <div className='bg-white p-6 rounded-xl shadow-lg'>
        <div className='flex justify-between items-start mb-4'>
          <div className='flex items-center space-x-4'>
            <img
              src='https://via.placeholder.com/60' // Thay bằng ảnh đại diện thực
              alt='Profile'
              className='w-16 h-16 rounded-full border-2 border-blue-500 object-cover'
            />
            <div>
              <div className='text-2xl font-bold text-gray-900'>{patient.name}</div>
              <p className='text-sm text-gray-600'>
                {patient.gender} - Age {patient.age}
              </p>
              <div className='text-sm text-purple-600 font-medium flex items-center mt-1'>
                {/* Thay bằng Icon thực tế */}
                <div className='mr-1 text-xs'>ICU Icon</div>
                {patient.status}
              </div>
            </div>
          </div>
          <div className='flex space-x-2'>
            <button className='flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition'>
              {/* Icon Edit */}
              <div className='mr-1'>Icon Placeholder</div>
              Edit
            </button>
            <button className='flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition'>
              {/* Icon Remove */}
              <div className='mr-1'>Icon Placeholder</div>
              Remove Patient
            </button>
          </div>
        </div>

        {/* Contact & Medical Info */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4 mb-4'>
          <div className='text-sm text-gray-600'>
            <p className='font-medium text-gray-800'>{patient.condition}</p>
            <p>{patient.email}</p>
            <p>{patient.phone}</p>
          </div>

          {/* Nút hành động liên lạc */}
          <div className='flex space-x-3 mt-2 md:mt-0 md:justify-end'>
            <button className='text-blue-600 border border-blue-200 px-3 py-1 text-sm rounded-lg hover:bg-blue-50 transition'>
              Send Alert
            </button>
            <button className='text-green-600 border border-green-200 px-3 py-1 text-sm rounded-lg hover:bg-green-50 transition'>
              Video Call
            </button>
            <button className='text-yellow-600 border border-yellow-200 px-3 py-1 text-sm rounded-lg hover:bg-yellow-50 transition'>
              Voice Call
            </button>
            <button className='text-indigo-600 border border-indigo-200 px-3 py-1 text-sm rounded-lg hover:bg-indigo-50 transition'>
              Email
            </button>
          </div>
        </div>

        {/* --- Navigation Tabs --- */}
        <div className='flex space-x-8 border-b border-gray-200'>
          {['Overview', 'Appointment History'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 text-sm font-medium transition duration-150 ease-in-out ${
                activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* --- Nội dung chính theo Tab --- */}
      <div className='mt-4'>
        {activeTab === 'Overview' && (
          <div className='bg-white p-6 rounded-xl shadow-lg'>
            {/* Date Picker (Mô phỏng) */}
            <div className='flex items-center space-x-4 mb-6'>
              <h4 className='text-sm font-semibold'>Today</h4>
              <div className='flex items-center border rounded-lg p-1 text-sm'>
                <button className='p-1 text-gray-500 hover:bg-gray-100 rounded'>{'<'}</button>
                <span className='px-3 font-medium'>Fri, 21 Jul 2024</span>
                <button className='p-1 text-gray-500 hover:bg-gray-100 rounded'>{'>'}</button>
              </div>
              <div className='text-sm text-gray-500'>02:00 PM to 11:20 PM</div>
            </div>

            {/* Render các Section chi tiết */}
            {renderOverviewContent()}
          </div>
        )}

        {/* NEW: Appointment History Tab */}
        {/* NEW: Appointment History Tab */}
        {activeTab === 'Appointment History' && (
          <div className='bg-white rounded-xl shadow-lg'>
            <AppointmentHistory
              appointments={appointments} // Truyền dữ liệu state
              onSaveNewAppointment={handleSaveNewAppointment} // Truyền hàm xử lý
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientDetail
