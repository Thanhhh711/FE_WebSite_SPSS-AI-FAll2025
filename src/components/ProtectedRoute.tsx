import { Navigate, Outlet } from 'react-router'
import { AppPath } from '../constants/Paths'
import { Role } from '../constants/Roles'

// interface ProtectedRouteProps {
//   allowedRoles: Role[]
//   userRole?: Role
// }

export const ProtectedRoute = ({ allowedRoles, userRole }: { allowedRoles: Role[]; userRole?: string | undefined }) => {
  if (!userRole) return <Navigate to={AppPath.SIGN_IN} /> // chưa login
  if (!allowedRoles.some((r) => r.toLowerCase() === userRole)) return <Navigate to={AppPath.NOT_FOUND} />

  return <Outlet />
}

// export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
//   const { isAuthenticated, token, profile } = useContext(AppContext)

//   // Nếu chưa đăng nhập → về trang đăng nhập
//   if (!isAuthenticated || !token) {
//     return <Navigate to={AppPath.SIGN_IN} replace />
//   }

//   // Nếu có yêu cầu role mà user không thuộc danh sách được phép
//   if (allowedRoles && !allowedRoles.includes(profile?.role as Role)) {
//     // Điều hướng riêng theo role
//     switch (profile?.role) {
//       case Role.ADMIN:
//         return <Navigate to={AppPath.HOME} replace />
//       case Role.PRODUCT_STAFF:
//         return <Navigate to={AppPath.BASIC_TABLES_ORDER} replace />
//       case Role.SKINCARE_SPECIALIST:
//         return <Navigate to={AppPath.PATIENTS} replace />
//       case Role.SCHEDULAR_STAFF:
//         return <Navigate to={AppPath.CALENDAR} replace />
//       default:
//         return <Navigate to={AppPath.NOT_FOUND} replace />
//     }
//   }

//   // Nếu hợp lệ → cho phép render nội dung con
//   return <Outlet />
// }

// // chưa đăng nhập
// export function RejectedRoute() {
//   const { isAuthenticated, token, profile } = useContext(AppContext)

//   if (!isAuthenticated || !token) return <Outlet />

//   // Nếu đã đăng nhập thì điều hướng về dashboard tương ứng
//   switch (profile?.role) {
//     case Role.ADMIN:
//       return <Navigate to={AppPath.HOME} replace />
//     case Role.PRODUCT_STAFF:
//       return <Navigate to={AppPath.BASIC_TABLES_ORDER} replace />
//     case Role.SKINCARE_SPECIALIST:
//       return <Navigate to={AppPath.PATIENTS} replace />
//     case Role.SCHEDULAR_STAFF:
//       return <Navigate to={AppPath.CALENDAR} replace />
//     default:
//       return <Navigate to={AppPath.NOT_FOUND} replace />
//   }
// }
