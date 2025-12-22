// Trong BasicTableRegistration.tsx (định nghĩa hàm này trước BasicTableRegistration())

import { useQuery } from '@tanstack/react-query'
import userApi from '../api/user.api'

export default function StaffEmailLookup({ staffId }: { staffId: string }) {
  console.log('Staff Id', staffId)

  const { data: staffEmail, isLoading } = useQuery({
    queryKey: ['staffEmail', staffId],
    // Dùng staffId để fetch thông tin nhân viên
    queryFn: async () => {
      const res = await userApi.getUsersById(staffId)
      return res.data.data.emailAddress
    },
    // Chỉ fetch nếu staffId tồn tại
    enabled: !!staffId,
    staleTime: Infinity // Giả sử email nhân viên ít khi thay đổi
  })

  if (!staffId) {
    return <span>N/A</span>
  }

  if (isLoading) {
    return <span>{staffId} (loading...)</span> // Hiển thị ID tạm thời trong khi tải
  }

  // Hiển thị email hoặc ID nếu không tìm thấy email
  return <span>{staffEmail || staffId}</span>
}

export function StaffEmailLookupString({ staffId }: { staffId: string }) {
  console.log('Staff Id', staffId)

  const { data: staffEmail } = useQuery({
    queryKey: ['staffEmail', staffId],
    // Dùng staffId để fetch thông tin nhân viên
    queryFn: async () => {
      const res = await userApi.getUsersById(staffId)
      return res.data.data.emailAddress
    },
    // Chỉ fetch nếu staffId tồn tại
    enabled: !!staffId,
    staleTime: Infinity // Giả sử email nhân viên ít khi thay đổi
  })

  return staffEmail
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
