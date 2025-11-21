// UserMetaCard.tsx

import { useNavigate, useParams } from 'react-router'
import { AppPath } from '../../constants/Paths'
// import { useModal } from '../../hooks/useModal' // Loại bỏ hook không sử dụng
import { User } from '../../types/user.type'
// import { Modal } from '../ui/modal' // Loại bỏ import không sử dụng

interface UserMetaCardProps {
  user: User | null
}

export default function UserMetaCard({ user }: UserMetaCardProps) {
  // Lấy id từ URL, đây chính là customerId
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const customerId = id as string // Đảm bảo ID được sử dụng

  // Hàm chuyển hướng đến trang Hồ sơ Bệnh án chính
  const handleViewMedicalRecord = (userId: string) => {
    // Điều hướng đến trang hồ sơ bệnh án tổng quan
    navigate(`${AppPath.PATIENT_DETAIL}/${userId}`)
  }

  // ✅ HÀM MỚI: Chuyển hướng đến phần Báo cáo Y tế
  const handleViewReports = (userId: string) => {
    // Điều hướng đến trang Patient Detail và sử dụng query param để mở tab reports
    navigate(`${AppPath.REPORT}/${userId}`)
  }

  return (
    // Thiết kế lại: Dùng shadow và padding lớn hơn
    <div className='p-6 bg-white rounded-xl shadow-lg dark:bg-gray-800/50 dark:border dark:border-gray-700'>
      <div className='flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
        {/* PHẦN THÔNG TIN BỆNH NHÂN */}
        <div className='flex items-center gap-6'>
          {/* Avatar nổi bật hơn */}
          <div className='w-20 h-20 overflow-hidden rounded-full border-4 border-white ring-4 ring-indigo-500/20 dark:border-gray-800 dark:ring-indigo-500/30'>
            <img
              // Dùng placeholder nếu không có avatarUrl
              src={user?.avatarUrl || 'https://via.placeholder.com/150/0000FF/FFFFFF?text=USER'}
              alt={user?.userName || 'User'}
              className='object-cover w-full h-full'
            />
          </div>

          {/* Tên và Metadata */}
          <div>
            <h4 className='mb-1 text-2xl font-extrabold text-gray-900 dark:text-white'>
              {user?.emailAddress || 'Email'}
            </h4>
            <div className='flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400'>
              <span className='font-medium'>{user?.roleName || 'Khách hàng'}</span>
              <div className='h-4 w-px bg-gray-300 dark:bg-gray-700'></div>
              <span>Age: {user?.age || 'N/A'}</span>
            </div>
            {/* Thông tin liên hệ (nếu có) */}
            {user?.phoneNumber && (
              <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>Phone: {user.phoneNumber}</p>
            )}
          </div>
        </div>

        {/* PHẦN HÀNH ĐỘNG (Buttons) */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
          {/* ✅ NÚT MỚI: VIEW REPORTS */}
          <button
            onClick={() => handleViewReports(customerId)}
            type='button'
            className='px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-colors dark:bg-green-500 dark:hover:bg-green-600'
            title='Xem Danh sách Báo cáo Y tế'
          >
            View Reports
          </button>

          {/* Nút View Record */}
          <button
            onClick={() => handleViewMedicalRecord(customerId)}
            type='button'
            className='px-4 py-2 text-sm font-semibold text-indigo-600 border border-indigo-500 rounded-lg hover:bg-indigo-50 transition-colors dark:text-indigo-400 dark:border-indigo-400 dark:hover:bg-indigo-900/10'
            title='Xem Trang Hồ sơ Bệnh án'
          >
            View Record
          </button>
        </div>
      </div>
    </div>
  )
}
