/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { User, SystermUserForm } from '../../types/user.type'
import { UploadCloud, X, Check } from 'lucide-react'
import Label from '../form/Label'

interface Props {
  user: User | null
  isEditing: boolean
  isMyProfile: boolean
  isAdmin: boolean
  isBAViewingExpert: boolean
  onSave: (data: Partial<SystermUserForm>) => void
  onCancel: () => void
  onCertificateChange: (file: File) => void
}

export default function UserInfoCard({
  user,
  isEditing,
  isMyProfile,
  isAdmin,
  isBAViewingExpert,
  onSave,
  onCancel,
  onCertificateChange
}: Props) {
  const [formData, setFormData] = useState<Partial<SystermUserForm>>({})

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        surName: user.surName || '',
        phoneNumber: user.phoneNumber || '',
        emailAddress: user.emailAddress || '',
        clinic: (user as any)?.clinic || '',
        education: (user as any)?.education || '',
        yearsExperience: (user as any)?.yearsExperience || 0
      })
    }
  }, [user, isEditing])

  if (!user) return <div className='p-6 text-gray-500'>Loading...</div>

  return (
    <div className='p-6 bg-white border border-gray-200 rounded-2xl dark:bg-gray-800/10'>
      {/* SECTION: Personal Information */}
      <h4 className='text-lg font-bold mb-6 text-gray-800 dark:text-white'>Personal Information</h4>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Surname */}
        <div>
          <Label>Surname</Label>
          {isEditing ? (
            <input
              name='surName'
              value={formData.surName}
              onChange={(e) => setFormData({ ...formData, surName: e.target.value })}
              className='w-full mt-1 border rounded-lg px-3 py-2 dark:bg-gray-900 outline-none focus:ring-1 focus:ring-brand-500'
            />
          ) : (
            <p className='mt-1 font-medium'>{user.surName || 'N/A'}</p>
          )}
        </div>

        {/* First Name */}
        <div>
          <Label>First Name</Label>
          {isEditing ? (
            <input
              name='firstName'
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className='w-full mt-1 border rounded-lg px-3 py-2 dark:bg-gray-900 outline-none focus:ring-1 focus:ring-brand-500'
            />
          ) : (
            <p className='mt-1 font-medium'>{user.firstName || 'N/A'}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <Label>Date of Birth</Label>
          {isEditing ? (
            <input
              type='date'
              name='doB'
              value={formData.doB}
              onChange={(e) => setFormData({ ...formData, doB: e.target.value })}
              className='w-full mt-1 border rounded-lg px-3 py-2 dark:bg-gray-900 outline-none focus:ring-1 focus:ring-brand-500'
            />
          ) : (
            <p className='mt-1 font-medium'>{user.doB ? new Date(user.doB).toLocaleDateString() : 'N/A'}</p>
          )}
        </div>
      </div>

      {/* SECTION: Professional Expertise (Chỉ hiện cho Expert/Admin/BA) */}
      {(isAdmin || isBAViewingExpert || (isMyProfile && user.isExpert)) && (
        <div className='mt-8 pt-8 border-t border-gray-100 dark:border-gray-800'>
          <div className='flex justify-between items-center mb-4'>
            <h4 className='text-lg font-semibold text-brand-500'>Professional Expertise</h4>
            {isMyProfile && isEditing && (
              <label className='flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer text-xs font-bold hover:bg-indigo-100 transition-colors'>
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
            {/* Cột trái: Kinh nghiệm & Học vấn */}
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label>Years of Experience</Label>
                  {isEditing ? (
                    <input
                      type='number'
                      value={formData.yearsExperience}
                      onChange={(e) => setFormData({ ...formData, yearsExperience: Number(e.target.value) })}
                      className='w-full mt-1 border rounded-lg px-3 py-2 dark:bg-gray-900 outline-none focus:ring-1 focus:ring-brand-500'
                    />
                  ) : (
                    <p className='font-medium'>{user.yearsExperience ?? 0} years</p>
                  )}
                </div>
                <div>
                  <Label>Clinic / Workplace</Label>
                  {isEditing ? (
                    <input
                      value={formData.clinic}
                      onChange={(e) => setFormData({ ...formData, clinic: e.target.value })}
                      className='w-full mt-1 border rounded-lg px-3 py-2 dark:bg-gray-900 outline-none focus:ring-1 focus:ring-brand-500'
                    />
                  ) : (
                    <p className='font-medium'>{(user as any)?.clinic || 'Not Specified'}</p>
                  )}
                </div>
              </div>

              <div>
                <Label>Education</Label>
                {isEditing ? (
                  <input
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    className='w-full mt-1 border rounded-lg px-3 py-2 dark:bg-gray-900 outline-none focus:ring-1 focus:ring-brand-500'
                  />
                ) : (
                  <p className='font-medium'>{(user as any)?.education || 'Not Specified'}</p>
                )}
              </div>

              <div>
                <Label>Training & Courses</Label>
                {isEditing ? (
                  <textarea
                    value={formData.training}
                    onChange={(e) => setFormData({ ...formData, training: e.target.value })}
                    className='w-full mt-1 border rounded-lg px-3 py-2 dark:bg-gray-900 outline-none focus:ring-1 focus:ring-brand-500 min-h-[80px]'
                  />
                ) : (
                  <p className='font-medium text-sm text-gray-600'>{user.training || 'No training records'}</p>
                )}
              </div>
            </div>

            {/* Cột phải: Chuyên môn & Bằng cấp */}
            <div className='space-y-4'>
              <div>
                <Label>Specialties</Label>
                {isEditing ? (
                  <input
                    placeholder='E.g. Acne, Anti-aging (comma separated)'
                    value={Array.isArray(formData.specialties) ? formData.specialties.join(', ') : ''}
                    onChange={(e) =>
                      setFormData({ ...formData, specialties: e.target.value.split(',').map((s) => s.trim()) })
                    }
                    className='w-full mt-1 border rounded-lg px-3 py-2 dark:bg-gray-900 outline-none focus:ring-1 focus:ring-brand-500'
                  />
                ) : (
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {user.specialties && user.specialties.length > 0 ? (
                      user.specialties.map((s, i) => (
                        <span
                          key={i}
                          className='px-2 py-1 bg-brand-50 text-brand-600 text-xs font-bold rounded-md uppercase'
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className='text-sm italic text-gray-400'>No specialties listed</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label>Verified Certificate</Label>
                <div className='mt-2 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 dark:bg-gray-900 relative group'>
                  {user.certificate ? (
                    <img
                      src={user.certificate}
                      alt='Certificate'
                      className='w-full h-auto object-contain max-h-[300px]'
                    />
                  ) : (
                    <div className='p-10 text-center text-gray-400 italic text-sm'>No certificate provided</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: Action Buttons (Chỉ hiện khi đang Edit) */}
      {isEditing && (
        <div className='flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100'>
          <button
            onClick={onCancel}
            className='flex items-center gap-1 px-4 py-2 border rounded-lg text-gray-500 hover:bg-gray-50'
          >
            <X size={16} /> Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className='flex items-center gap-1 px-6 py-2 bg-brand-500 text-white rounded-lg font-bold hover:bg-brand-600'
          >
            <Check size={16} /> Save Changes
          </button>
        </div>
      )}
    </div>
  )
}
