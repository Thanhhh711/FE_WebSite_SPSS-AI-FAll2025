/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useAppContext } from '../context/AuthContext'
import { Role } from '../constants/Roles'
import userApi from '../api/user.api'
import { User, SystermUserForm } from '../types/user.type'

import { toast } from 'react-toastify'
import UserInfoCard from '../components/UserProfile/UserInfoCard'
import UserMetaCard from '../components/UserProfile/UserMetaCard'
import { uploadFile } from '../utils/supabaseStorage'
import UserAddressCard from '../components/UserProfile/UserAddressCard'

export default function UserProfiles() {
  const { id } = useParams<{ id: string }>()
  const { profile: myAccount } = useAppContext()
  const [userData, setUserData] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const isMyProfile = myAccount?.userId === id
  const isBAViewingExpert = myAccount?.role === Role.BEAUTY_ADVISOR

  const fetchUser = async () => {
    if (!id) return
    const res = await userApi.getUsersById(id)
    setUserData(res.data.data)
  }

  useEffect(() => {
    fetchUser()
  }, [id])

  console.log('isMyProfile', isMyProfile)
  console.log('isEditing', isEditing)

  console.log('userDataa', userData)

  const handleUpdate = async (formData: Partial<SystermUserForm>) => {
    if (!userData || !id) return
    try {
      // Mapping from User type to SystermUserForm type (Safe Mapping)
      const body: SystermUserForm = {
        roleId: userData.roleId,
        status: userData.status,
        isExpert: userData.isExpert,
        userName: userData.userName,
        password: '', // Not changing password here
        surName: formData.surName ?? userData.surName ?? '',
        firstName: formData.firstName ?? userData.firstName ?? '',
        emailAddress: formData.emailAddress ?? userData.emailAddress,
        phoneNumber: formData.phoneNumber ?? userData.phoneNumber,
        doB: formData.doB ?? userData.doB ?? new Date().toISOString(),
        avatarUrl: formData.avatarUrl ?? userData.avatarUrl ?? '',
        certificate: formData.certificate ?? userData.certificate ?? '',
        specialties: (userData as any).specialties || [],
        yearsExperience: Number((formData as any).yearsExperience) || (userData as any).yearsExperience || 0,
        education: (formData as any).education || (userData as any).education || '',
        training: (formData as any).training || (userData as any).training || '',
        clinic: (formData as any).clinic || (userData as any).clinic || ''
      }

      await userApi.editUser(id, body)
      toast.success('Profile updated!')
      setIsEditing(false)
      fetchUser()
    } catch (error) {
      toast.error('Failed to update profile.')
    }
  }

  return (
    <div className='space-y-6 max-w-5xl mx-auto p-4'>
      <div className='flex justify-between items-center'>
        <h3 className='text-xl font-bold text-gray-800 dark:text-white'>Profile Settings</h3>
        {isMyProfile && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className='px-4 py-2 bg-brand-500 text-white rounded-lg font-bold shadow-sm'
          >
            Edit Profile
          </button>
        )}
      </div>

      <UserMetaCard
        isEditing
        user={userData}
        isMyProfile={isMyProfile}
        onAvatarChange={(file) =>
          uploadFile('users', file, 'avatars').then((url) => handleUpdate({ avatarUrl: url.publicUrl }))
        }
      />

      <UserInfoCard
        user={userData}
        isEditing={isEditing}
        isMyProfile={isMyProfile}
        isBAViewingExpert={isBAViewingExpert}
        onSave={handleUpdate}
        onCancel={() => setIsEditing(false)}
        onCertificateChange={(file) =>
          uploadFile('users', file, 'certificates').then((url) => handleUpdate({ certificate: url.publicUrl }))
        }
      />

      <UserAddressCard
        user={userData || null}
        isEditing={isEditing}
        onSave={handleUpdate}
        onCancel={() => setIsEditing(false)}
      />
    </div>
  )
}
