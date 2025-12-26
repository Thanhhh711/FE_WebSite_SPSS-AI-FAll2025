// Trong BasicTableRegistration.tsx (định nghĩa hàm này trước BasicTableRegistration())

import { useQuery } from '@tanstack/react-query'
import userApi from '../api/user.api'

export default function StaffEmailLookup({ staffId }: { staffId: string }) {
  console.log('Staff Id', staffId)

  const { data: staffName, isLoading } = useQuery({
    queryKey: ['staffName', staffId],
    enabled: !!staffId,
    queryFn: async () => {
      const res = await userApi.getUsersById(staffId)
      const { surName, firstName, emailAddress } = res.data.data
      return surName && firstName ? `${surName} ${firstName}` : emailAddress
    }
  })

  if (!staffId) {
    return <span>N/A</span>
  }

  if (isLoading) {
    return <span>{staffId} (loading...)</span> // Hiển thị ID tạm thời trong khi tải
  }

  // Hiển thị email hoặc ID nếu không tìm thấy email
  return <span>{staffName || staffId}</span>
}

export function StaffEmailLookupString({ staffId }: { staffId: string }) {
  console.log('Staff Id', staffId)

  const { data: staffDisplayName } = useQuery({
    queryKey: ['staffDisplayName', staffId],
    queryFn: () => userApi.getUsersById(staffId),
    enabled: !!staffId,
    staleTime: Infinity,
    select: (res) => {
      const { surName, firstName, emailAddress } = res.data.data
      return surName && firstName ? `${surName} ${firstName}` : emailAddress
    }
  })

  return staffDisplayName
}

export function AvatarStaff({ staffId, className }: { staffId: string; className?: string }) {
  const { data: avatarUrl } = useQuery({
    queryKey: ['staffAvatar', staffId],
    queryFn: async () => {
      const res = await userApi.getUsersById(staffId)
      return res.data.data.avatarUrl
    },
    enabled: !!staffId,
    staleTime: Infinity
  })

  return (
    <img
      src={avatarUrl || '/default-avatar.png'}
      alt='Staff Avatar'
      className={className ?? 'w-full h-full object-cover'}
    />
  )
}
