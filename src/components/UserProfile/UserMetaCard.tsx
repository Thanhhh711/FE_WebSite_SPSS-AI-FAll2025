/* eslint-disable @typescript-eslint/no-unused-vars */
import { CameraIcon, Mail, Phone } from 'lucide-react'
import { SystermUserForm, User } from '../../types/user.type'

interface UserMetaCardProps {
  user: User | null
  isMyProfile: boolean
  isEditing: boolean // Thêm prop này để đồng bộ với trang Profile
  onAvatarChange: (file: File) => void
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void // Để cập nhật dữ liệu khi gõ
  formData?: Partial<SystermUserForm> // Dữ liệu tạm thời đang sửa
}

export default function UserMetaCard({
  user,
  isMyProfile,
  isEditing,
  onAvatarChange,
  onInputChange
  // formData
}: UserMetaCardProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAvatarChange(e.target.files[0])
    }
  }

  return (
    <div className='p-6 bg-white rounded-2xl shadow-sm dark:bg-gray-800/20 border border-gray-100 dark:border-gray-700'>
      <div className='flex flex-col sm:flex-row items-center gap-6'>
        {/* Avatar Section */}
        <div className='relative h-28 w-28 flex-shrink-0'>
          <div className='h-full w-full overflow-hidden rounded-full aspect-square border-4 border-white dark:border-gray-700 shadow-md'>
            <img
              src={user?.avatarUrl || '/default-avatar.png'}
              alt='Profile'
              className='h-full w-full rounded-full object-cover'
            />
          </div>
          {isMyProfile && (
            <label className='absolute bottom-1 right-1 p-2 bg-brand-500 text-white rounded-full cursor-pointer hover:bg-brand-600 shadow-lg transition-transform active:scale-90'>
              <CameraIcon size={18} />
              <input type='file' className='hidden' accept='image/*' onChange={handleFileChange} />
            </label>
          )}
        </div>

        {/* Info Section */}
        <div className='flex-1 text-center sm:text-left'>
          <div className='mb-3'>
            <h3 className='text-2xl font-bold text-gray-800 dark:text-white'>
              {user?.firstName} {user?.surName}
            </h3>
            <p className='text-sm font-semibold text-brand-500 uppercase tracking-widest'>
              {user?.roleName || 'Member'}
            </p>
          </div>

          <div className='flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-3'>
            {/* Email Field */}
            <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400 w-full sm:w-auto'>
              <Mail size={16} className='text-brand-500 flex-shrink-0' />
              {isEditing ? (
                <input
                  name='emailAddress'
                  value={user?.emailAddress}
                  onChange={onInputChange}
                  className='text-sm border-b border-gray-300 focus:border-brand-500 outline-none bg-transparent pb-1 w-full sm:w-64'
                  placeholder='Enter email'
                />
              ) : (
                <span className='text-sm font-medium'>{user?.emailAddress || 'No email'}</span>
              )}
            </div>

            {/* Phone Field */}
            <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400 w-full sm:w-auto'>
              <Phone size={16} className='text-brand-500 flex-shrink-0' />
              {isEditing ? (
                <input
                  name='phoneNumber'
                  value={user?.phoneNumber}
                  onChange={onInputChange}
                  className='text-sm border-b border-gray-300 focus:border-brand-500 outline-none bg-transparent pb-1 w-full sm:w-48'
                  placeholder='Enter phone'
                />
              ) : (
                <span className='text-sm font-medium'>{user?.phoneNumber || 'No phone'}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
