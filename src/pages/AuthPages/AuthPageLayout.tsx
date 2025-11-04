import React from 'react'
import ThemeTogglerTwo from '../../components/common/ThemeTogglerTwo'
// Lưu ý: Đảm bảo component ThemeTogglerTwo và các import khác đã đúng

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    // Nền tổng thể: Dùng Pink-50 làm nền, thêm relative để chứa họa tiết
    <div className='relative flex min-h-screen items-center justify-center bg-pink-50 dark:bg-gray-900 overflow-hidden'>
      {/* Hiệu ứng nền - Soft Glow (Tạo chiều sâu và sự mềm mại) */}
      <div className='absolute top-0 left-0 w-full h-full opacity-30 dark:opacity-10 pointer-events-none'>
        {/* Vòng tròn glow mềm mại, màu hồng nhạt, làm nền nổi khối Form */}
        <div className='absolute w-96 h-96 bg-pink-200 rounded-full blur-3xl opacity-50 -top-20 -left-20'></div>
        <div className='absolute w-80 h-80 bg-pink-300 rounded-full blur-3xl opacity-30 bottom-10 right-10'></div>
      </div>

      {/* Khu vực trung tâm: Chứa Form (children) - Đảm bảo Form nằm trên các hiệu ứng nền */}
      <div className='relative z-10 flex w-full max-w-sm p-4 sm:p-0'>{children}</div>

      {/* Nút chuyển đổi giao diện sáng/tối */}
      <div className='fixed z-50 bottom-6 right-6'>
        <ThemeTogglerTwo />
      </div>
    </div>
  )
}
