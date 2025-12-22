/* eslint-disable @typescript-eslint/no-explicit-any */
// UserInfoCard.tsx

import { useState, useEffect } from 'react'
import { User, SystermUserForm } from '../../types/user.type'
import { UploadCloud, X, Check } from 'lucide-react'
import Label from '../form/Label'

interface Props {
  user: User | null
  isEditing: boolean
  isMyProfile: boolean
  isBAViewingExpert: boolean
  onSave: (data: Partial<SystermUserForm>) => void
  onCancel: () => void
  onCertificateChange: (file: File) => void
}

export default function UserInfoCard({
  user,
  isEditing,
  isMyProfile,
  isBAViewingExpert,
  onSave,
  onCancel,
  onCertificateChange
}: Props) {
  const [formData, setFormData] = useState<Partial<SystermUserForm>>({})

  // Cập nhật formData khi user có dữ liệu hoặc khi bật/tắt mode edit
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        surName: user.surName || '',
        phoneNumber: user.phoneNumber || '',
        emailAddress: user.emailAddress || '',
        // Sử dụng optional chaining để gán giá trị mặc định an toàn
        clinic: (user as any)?.clinic || '',
        education: (user as any)?.education || '',
        yearsExperience: (user as any)?.yearsExperience || 0
      })
    }
  }, [user, isEditing])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Nếu user chưa tải xong, có thể hiển thị một bộ khung loading hoặc null
  if (!user) return <div className='p-6'>Loading user information...</div>

  return (
    <div className='p-6 bg-white border border-gray-200 rounded-2xl dark:bg-gray-800/10'>
      <div className='flex justify-between items-center mb-6'>
        <h4 className='text-lg font-bold text-gray-800 dark:text-white'>Personal Details</h4>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Các trường cơ bản */}
        <div>
          <Label>First Name</Label>
          {isEditing ? (
            <input
              name='firstName'
              value={formData.firstName}
              onChange={handleChange}
              className='w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-900'
            />
          ) : (
            <p className='mt-1 font-medium'>{user.firstName || 'N/A'}</p>
          )}
        </div>

        <div>
          <Label>Surname</Label>
          {isEditing ? (
            <input
              name='surName'
              value={formData.surName}
              onChange={handleChange}
              className='w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-900'
            />
          ) : (
            <p className='mt-1 font-medium'>{user.surName || 'N/A'}</p>
          )}
        </div>

        {/* ... các trường khác tương tự ... */}
      </div>

      {/* Professional Section: SỬA LỖI TẠI ĐÂY */}
      {(isBAViewingExpert || (isMyProfile && user.isExpert)) && (
        <div className='mt-8 pt-8 border-t border-gray-100 dark:border-gray-800'>
          <div className='flex justify-between items-center mb-4'>
            <h4 className='text-lg font-semibold text-brand-500'>Professional Expertise</h4>
            {isMyProfile && isEditing && (
              <label className='flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer text-xs font-bold border border-indigo-200'>
                <UploadCloud size={14} /> UPDATE CERTIFICATE
                <input
                  type='file'
                  className='hidden'
                  accept='image/*'
                  onChange={(e) => e.target.files && onCertificateChange(e.target.files[0])}
                />
              </label>
            )}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className='space-y-4'>
              <div>
                <Label>Clinic / Workplace</Label>
                {isEditing ? (
                  <input
                    name='clinic'
                    value={(formData as any).clinic}
                    onChange={handleChange}
                    className='w-full mt-1 border rounded-lg px-3 py-2 dark:bg-gray-900'
                  />
                ) : (
                  /* FIX: Thêm dấu ? sau user */
                  <p className='font-medium'>{(user as any)?.clinic || 'N/A'}</p>
                )}
              </div>

              <div>
                <Label>Education</Label>
                {isEditing ? (
                  <input
                    name='education'
                    value={(formData as any).education}
                    onChange={handleChange}
                    className='w-full mt-1 border rounded-lg px-3 py-2 dark:bg-gray-900'
                  />
                ) : (
                  <p className='font-medium'>{(user as any)?.education || 'N/A'}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Verified Certificate</Label>
              <div className='mt-2 rounded-xl overflow-hidden border bg-gray-50 dark:bg-gray-900'>
                {user.certificate ? (
                  <img src={user.certificate} alt='Cert' className='w-full h-auto' />
                ) : (
                  <div className='p-10 text-center text-gray-400 italic text-sm'>No certificate provided</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buttons: Show only in Edit Mode */}
      {isEditing && (
        <div className='flex justify-end gap-3 mt-8 pt-4 border-t'>
          <button onClick={onCancel} className='flex items-center gap-1 px-4 py-2 border rounded-lg text-gray-500'>
            <X size={16} /> Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className='flex items-center gap-1 px-6 py-2 bg-brand-500 text-white rounded-lg font-bold shadow-md'
          >
            <Check size={16} /> Save Changes
          </button>
        </div>
      )}
    </div>
  )
}
