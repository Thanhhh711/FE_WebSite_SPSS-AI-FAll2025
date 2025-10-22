import React from 'react'

interface VitalItemProps {
  value: string
  label: string
  subtitle: string
}

const VitalItem: React.FC<VitalItemProps> = ({ value, label, subtitle }) => (
  <div className='flex-1 min-w-[100px] text-center border-r last:border-r-0 px-2 py-1'>
    <p className='text-xl font-bold text-blue-600'>{value}</p>
    <p className='text-xs text-gray-500 font-medium'>{label}</p>
    <p className='text-[10px] text-gray-400 mt-1'>{subtitle}</p>
  </div>
)

const VitalsCard: React.FC = () => {
  // Dữ liệu mô phỏng
  const vitals = [
    { value: '120 mg/dL', label: 'Blood glucose level', subtitle: '' },
    { value: '55 Kg', label: 'Weight', subtitle: '' },
    { value: '70 bpm', label: 'Heart rate', subtitle: '' },
    { value: '71%', label: 'Oxygen saturation', subtitle: '' },
    { value: '98.1°F', label: 'Body temperature', subtitle: '' },
    { value: '120/80 mm hg', label: 'Blood pressure', subtitle: '' }
  ]

  return (
    <div className='bg-white p-6 border border-gray-200 rounded-lg shadow-sm mt-4'>
      <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
        {/* Thay thế bằng Icon thực tế */}
        <div className='mr-2 text-gray-500'>Icon Placeholder</div>
        Vitals
      </h3>
      <div className='flex flex-wrap justify-between -mx-2'>
        {vitals.map((vital, index) => (
          <VitalItem key={index} {...vital} />
        ))}
      </div>
    </div>
  )
}

export default VitalsCard
