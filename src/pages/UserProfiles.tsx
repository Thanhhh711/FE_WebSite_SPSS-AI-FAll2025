import PageBreadcrumb from '../components/common/PageBreadCrumb'
import UserMetaCard from '../components/UserProfile/UserMetaCard'
import UserInfoCard from '../components/UserProfile/UserInfoCard'
import UserAddressCard from '../components/UserProfile/UserAddressCard'
import PageMeta from '../components/common/PageMeta'
import { useParams } from 'react-router'
import { useEffect, useState } from 'react'
import { User } from '../types/user.type'
import userApi from '../api/user.api'

export default function UserProfiles() {
  const { id } = useParams<{ id: string }>()
  const [userData, setUserData] = useState<User>()

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return

      const res = await userApi.getUsersById(id)
      setUserData(res.data.data)
      console.log('data', res.data.data)
    }
    fetchUser()
  }, [id])

  return (
    <>
      <PageMeta
        title='React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template'
        description='This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template'
      />
      <PageBreadcrumb pageTitle='Profile' />
      <div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6'>
        <h3 className='mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7'>Profile</h3>
        <div className='space-y-6'>
          <UserMetaCard user={userData || null} />
          <UserInfoCard user={userData || null} />
          <UserAddressCard user={userData || null} />
        </div>
      </div>
    </>
  )
}
