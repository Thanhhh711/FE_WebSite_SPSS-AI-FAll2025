import { useMutation } from '@tanstack/react-query'
import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router' // Đã sửa: dùng 'react-router-dom'
import { toast } from 'react-toastify'
import authApi from '../../api/auth.api'
import { AppPath } from '../../constants/Paths'
import { AppContext } from '../../context/AuthContext'
import { EyeCloseIcon, EyeIcon } from '../../icons'
import { User } from '../../types/user.type'
import { setProfileToLS } from '../../utils/auth'
import Label from '../form/Label'
import Checkbox from '../form/input/Checkbox'
import Input from '../form/input/InputField'
import Button from '../ui/button/Button'

interface FormData {
  usernameOrEmail: string
  password: string
}

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const { setIsAuthenticated } = useContext(AppContext)

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const navigate = useNavigate()

  const loginMutation = useMutation({
    mutationFn: (body: FormData) => authApi.loginAccount(body)
  })
  // --- Hàm Validation (Giữ nguyên logic bảo mật cao) ---
  const validatePassword = (password: string): string | null => {
    if (password.length === 0) {
      return 'Mật khẩu là bắt buộc.'
    }
    if (password.length < 8) {
      return 'Mật khẩu phải có độ dài ít nhất 8 ký tự.'
    }
    if (!/[A-Z]/.test(password)) {
      return 'Mật khẩu phải chứa ít nhất 1 chữ hoa.'
    }
    if (!/[a-z]/.test(password)) {
      return 'Mật khẩu phải chứa ít nhất 1 chữ thường.'
    }
    if (!/[0-9]/.test(password)) {
      return 'Mật khẩu phải chứa ít nhất 1 số.'
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt.'
    }
    return null
  }

  const validateEmailOrUsername = (email: string): string | null => {
    if (email.length === 0) {
      return 'Email hoặc Tên đăng nhập là bắt buộc.'
    }
    return null
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const usernameOrEmail = form.get('usernameOrEmail')?.toString() || ''
    const password = form.get('password')?.toString() || ''
    const emailError = validateEmailOrUsername(usernameOrEmail)
    const passwordError = validatePassword(password)

    console.log('email', usernameOrEmail)
    console.log('password', password)

    setErrors({ email: emailError || undefined, password: passwordError || undefined })

    if (emailError || passwordError) {
      return
    }

    loginMutation.mutate(
      { usernameOrEmail, password },
      {
        onSuccess: (data) => {
          toast.success(data.data.message)

          setProfileToLS(data.data.data.authUserDto as User)
          setIsAuthenticated(true)
          navigate(AppPath.HOME)
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error) => {
          toast.error(error.message)
        }
      }
    )
  }

  return (
    <div className='w-full'>
      {/* Card: Thiết kế Clean, Shadow tinh tế, Bo góc lớn */}
      <div className='bg-white dark:bg-gray-800 p-8 sm:p-12 rounded-3xl shadow-2xl ring-1 ring-gray-100 dark:ring-gray-700/50'>
        {/* Header - Logo Hồng Phấn */}
        <div className='mb-8 text-center'>
          {/* Logo: Sử dụng hình ảnh/thẻ Logo của bạn */}
          <div className='inline-block mb-4 p-3 rounded-full bg-pink-100 dark:bg-pink-900/50'>
            {/* Đặt thẻ <img> Logo của bạn tại đây */}
            <span className='text-3xl font-light text-pink-600 dark:text-pink-400'>
              {/* Placeholder cho Logo màu hồng nhạt/chủ đạo */}
              <img width={40} height={40} src='/public/images/logo/SPSS.png' alt='Logo' />
            </span>
          </div>

          <h1 className='text-3xl font-bold text-gray-900 dark:text-white tracking-tight'>Đăng nhập Hệ thống Admin</h1>
          <p className='text-base text-gray-500 dark:text-gray-400 mt-2'>
            Quản lý lịch hẹn, khách hàng và nhân sự của trung tâm.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className='space-y-6'>
            {/* Email Input */}
            <div>
              <Label htmlFor='usernameOrEmail' className='text-gray-700 dark:text-gray-300 font-medium'>
                Email / Tên đăng nhập <span className='text-red-400'>*</span>
              </Label>
              <Input
                id='usernameOrEmail'
                name='usernameOrEmail'
                placeholder='admin.hoang@spa.vn'
                error={errors.email}
                // Input: Focus ring màu Hồng phấn sang trọng
                className='focus:border-pink-400 focus:ring-1 focus:ring-pink-200 dark:focus:ring-pink-400/30'
              />
              {errors.email && <p className='mt-1 text-sm text-red-500'>{errors.email}</p>}
            </div>

            {/* Password Input */}
            <div>
              <Label htmlFor='password' className='text-gray-700 dark:text-gray-300 font-medium'>
                Mật khẩu <span className='text-red-400'>*</span>
              </Label>
              <div className='relative'>
                <Input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Nhập mật khẩu'
                  error={errors.password}
                  className='focus:border-pink-400 focus:ring-1 focus:ring-pink-200 dark:focus:ring-pink-400/30'
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2'
                >
                  {showPassword ? (
                    <EyeIcon className='fill-gray-500 dark:fill-gray-400 size-5 hover:fill-pink-500 transition-colors' />
                  ) : (
                    <EyeCloseIcon className='fill-gray-500 dark:fill-gray-400 size-5 hover:fill-pink-500 transition-colors' />
                  )}
                </span>
              </div>
              {errors.password && <p className='mt-1 text-sm text-red-500'>{errors.password}</p>}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className='flex items-center justify-between pt-1'>
              <div className='flex items-center gap-2'>
                <Checkbox checked={isChecked} onChange={setIsChecked} id='remember' />
                <Label
                  htmlFor='remember'
                  className='font-normal text-gray-600 dark:text-gray-400 text-sm cursor-pointer'
                >
                  Ghi nhớ đăng nhập
                </Label>
              </div>
              <Link
                to='/reset-password'
                // Link màu Hồng phấn
                className='text-sm font-semibold text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 transition-colors'
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Sign In Button */}
            <div className='pt-2'>
              <Button
                // Nút nhấn: Màu Hồng đậm, hiệu ứng bóng mờ nhẹ, bo góc mềm mại
                className='w-full py-3.5 text-base font-semibold bg-pink-500 hover:bg-pink-600 text-white transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl focus:ring-4 focus:ring-pink-200 dark:focus:ring-pink-400/50'
              >
                Đăng nhập
              </Button>
            </div>
          </div>
        </form>

        {/* Footer Text */}
        <div className='mt-10 text-center border-t border-gray-100 dark:border-gray-700/50 pt-6'>
          <p className='text-xs font-normal text-gray-500 dark:text-gray-400'>
            Hệ thống Quản lý Nội bộ - Vui lòng không chia sẻ thông tin đăng nhập.
          </p>
        </div>
      </div>
    </div>
  )
}
