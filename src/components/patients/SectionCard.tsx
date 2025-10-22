import React from 'react'

interface SectionCardProps {
  title: string
  children: React.ReactNode
}

const SectionCard: React.FC<SectionCardProps> = ({ title, children }) => {
  return (
    <div className='bg-white p-6 border border-gray-200 rounded-lg shadow-sm mt-6'>
      <h3 className='text-lg font-semibold text-gray-800 flex items-center mb-4'>
        {/* Thay thế bằng Icon thực tế (Medications/Test) */}
        <div className='mr-2 text-gray-500'>Icon Placeholder</div>
        {title}
      </h3>
      <div className='space-y-4'>{children}</div>
    </div>
  )
}

export default SectionCard
