/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  const isAdmin = myAccount?.role === Role.ADMIN

  const fetchUser = async () => {
    if (!id) return
    try {
      const res = await userApi.getUsersById(id)

      console.log('dataUser', res.data.data)

      setUserData(res.data.data)
    } catch (error) {
      toast.error('Failed to load user information')
    }
  }

  useEffect(() => {
    fetchUser()
  }, [id])

  const mapUserToSystemUserForm = (user: User, formData: Partial<SystermUserForm>): SystermUserForm => {
    return {
      roleId: formData.roleId ?? user.roleId,
      status: formData.status ?? user.status,
      isExpert: formData.isExpert ?? user.isExpert,

      userName: user.userName, // thường không cho edit

      surName: formData.surName ?? user.surName ?? '',
      firstName: formData.firstName ?? user.firstName ?? '',
      emailAddress: formData.emailAddress ?? user.emailAddress,
      phoneNumber: formData.phoneNumber ?? user.phoneNumber,
      doB: formData.doB ?? user.doB ?? '',
      avatarUrl: formData.avatarUrl ?? user.avatarUrl ?? '',

      certificate: formData.certificate ?? user.certificate ?? '',
      specialties: formData.specialties ?? [],

      yearsExperience:
        formData.yearsExperience !== undefined ? Number(formData.yearsExperience) : (user.yearsExperience ?? 0),

      education: formData.education ?? user.education ?? '',
      training: formData.training ?? user.training ?? '',
      clinic: formData.clinic ?? user.clinic ?? ''
    }
  }

  const handleUpdate = async (formData: Partial<SystermUserForm>) => {
    if (!userData || !id) return
    try {
      const body: SystermUserForm = mapUserToSystemUserForm(userData, formData)
      console.log('EditUserForm', body)

      // await userApi.editUser(id, body)
      toast.success('Profile updated successfully!')
      setIsEditing(false)
      fetchUser()
    } catch (error) {
      toast.error('Update failed.')
    }
  }

  return (
    <div className='space-y-6 max-w-5xl mx-auto p-4'>
      <div className='flex justify-between items-center'>
        <h3 className='text-xl font-bold text-gray-800 dark:text-white'>User Profile</h3>
        {isMyProfile && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className='px-4 py-2 bg-brand-500 text-white rounded-lg font-bold shadow-sm hover:bg-brand-600 transition-colors'
          >
            Edit Profile
          </button>
        )}
      </div>

      <UserMetaCard
        user={userData}
        isEditing={isEditing}
        isMyProfile={isMyProfile}
        onAvatarChange={(file) =>
          uploadFile('avatars', file, 'avatars').then((url) => handleUpdate({ avatarUrl: url.publicUrl }))
        }
        onInputChange={(e) => {
          const { name, value } = e.target
          setUserData((prev) => (prev ? ({ ...prev, [name]: value } as any) : null))
        }}
      />

      <UserInfoCard
        user={userData}
        isEditing={isEditing}
        isMyProfile={isMyProfile}
        isAdmin={isAdmin}
        isBAViewingExpert={isBAViewingExpert}
        onSave={handleUpdate}
        onCancel={() => setIsEditing(false)}
        onCertificateChange={(file) =>
          uploadFile('users', file, 'certificates').then((url) => handleUpdate({ certificate: url.publicUrl }))
        }
      />

      <UserAddressCard
        user={userData}
        isEditing={isEditing}
        isMyProfile={isMyProfile}
        isAdmin={isAdmin}
        onSave={handleUpdate}
        onCancel={() => setIsEditing(false)}
      />
    </div>
  )
}
