import { Navigate, Outlet } from 'react-router'
import { AppPath } from '../constants/Paths'
import { Role } from '../constants/Roles'

interface ProtectedRouteProps {
  allowedRoles: Role[]
  userRole: Role | null
}

export default function ProtectedRoute({ allowedRoles, userRole }: ProtectedRouteProps) {
  // Nếu chưa có role -> yêu cầu đăng nhập
  if (!userRole) return <Navigate to={AppPath.SIGN_IN} replace />

  // Nếu role hợp lệ -> render nội dung
  if (allowedRoles.includes(userRole)) return <Outlet />

  // Nếu role không hợp lệ -> báo lỗi
  return <Navigate to={AppPath.NOT_FOUND} replace />
}
