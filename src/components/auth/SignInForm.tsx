/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from '@tanstack/react-query'
import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import authApi from '../../api/auth.api'
import { roleRedirectPath } from '../../constants/Roles'
import { AppContext } from '../../context/AuthContext'
import { EyeCloseIcon, EyeIcon } from '../../icons'
import { AuthUser } from '../../types/user.type'
import { setProfileToLS } from '../../utils/auth'
import Label from '../form/Label'
import Checkbox from '../form/input/Checkbox'
import Input from '../form/input/InputField'
import Button from '../ui/button/Button'
import logo from '/public/images/logo/SPSS.png'
import TwoFactorModal from '../../pages/AuthPages/VerifySignIn'

interface FormData {
  usernameOrEmail: string
  password: string
}

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const { setIsAuthenticated, setProfile } = useContext(AppContext)

  const [show2FA, setShow2FA] = useState(false)
  const [tempEmail, setTempEmail] = useState('')

  // 1. Logic to handle final successful login (after 2FA)
  const handleFinalSuccess = (data: any) => {
    toast.success(data.data.message)
    setProfileToLS(data.data.data.authUserDto as AuthUser)
    setProfile(data.data.data.authUserDto as AuthUser)
    setIsAuthenticated(true)

    const redirectPath = roleRedirectPath(data.data.data.authUserDto.role)
    navigate(redirectPath)
  }

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const navigate = useNavigate()

  const loginMutation = useMutation({
    mutationFn: (body: FormData) => authApi.loginAccount(body)
  })

  const validatePassword = (password: string): string | null => {
    if (password.length === 0) return 'Password is required.'
    if (password.length < 8) return 'Password must be at least 8 characters long.'
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.'
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.'
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number.'
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
      return 'Password must contain at least one special character.'
    return null
  }

  const validateEmailOrUsername = (email: string): string | null => {
    if (email.length === 0) return 'Email or Username is required.'
    return null
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const usernameOrEmail = form.get('usernameOrEmail')?.toString() || ''
    const password = form.get('password')?.toString() || ''

    const emailError = validateEmailOrUsername(usernameOrEmail)
    const passwordError = validatePassword(password)

    setErrors({ email: emailError || undefined, password: passwordError || undefined })

    if (emailError || passwordError) return

    loginMutation.mutate(
      { usernameOrEmail, password },
      {
        onSuccess: (data) => {
          if (data.data.data.is2FARequired) {
            setTempEmail(usernameOrEmail)
            setShow2FA(true)
            toast.info('Please check your email for the verification code')
          }

          if (!data.data.data.is2FARequired) {
            toast.success(data.data.message)

            setProfileToLS(data.data.data.authUserDto as AuthUser)
            setProfile(data.data.data.authUserDto as AuthUser)
            setIsAuthenticated(true)

            const redirectPath = roleRedirectPath(data.data.data.authUserDto.role)
            navigate(redirectPath)
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onError: (_error) => {
          toast.error('Login failed. Please check your credentials.')
        }
      }
    )
  }

  return (
    <div className='w-full'>
      {show2FA && <TwoFactorModal email={tempEmail} onSuccess={handleFinalSuccess} onClose={() => setShow2FA(false)} />}
      <div className='bg-white dark:bg-gray-800 p-8 sm:p-12 rounded-3xl shadow-2xl ring-1 ring-gray-100 dark:ring-gray-700/50'>
        <div className='mb-8 text-center'>
          <div className='inline-block mb-4 p-3 rounded-full bg-pink-100 dark:bg-pink-900/50'>
            <span className='text-3xl font-light text-pink-600 dark:text-pink-400'>
              <img width={40} height={40} src={logo} alt='Logo' />
            </span>
          </div>

          <h1 className='text-3xl font-bold text-gray-900 dark:text-white tracking-tight'>Admin System Login</h1>
          <p className='text-base text-gray-500 dark:text-gray-400 mt-2'>
            Manage appointments, customers, and staff of the center.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className='space-y-6'>
            {/* Email / Username Input */}
            <div>
              <Label htmlFor='usernameOrEmail' className='text-gray-700 dark:text-gray-300 font-medium'>
                Email / Username <span className='text-red-400'>*</span>
              </Label>
              <Input
                id='usernameOrEmail'
                name='usernameOrEmail'
                placeholder='admin.hoang@spa.vn'
                error={errors.email}
                className='focus:border-pink-400 focus:ring-1 focus:ring-pink-200 dark:focus:ring-pink-400/30'
              />
              {errors.email && <p className='mt-1 text-sm text-red-500'>{errors.email}</p>}
            </div>

            {/* Password Input */}
            <div>
              <Label htmlFor='password' className='text-gray-700 dark:text-gray-300 font-medium'>
                Password <span className='text-red-400'>*</span>
              </Label>
              <div className='relative'>
                <Input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter your password'
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
                  Remember me
                </Label>
              </div>
              <Link
                to='/reset-password'
                className='text-sm font-semibold text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 transition-colors'
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <div className='pt-2'>
              <Button className='w-full py-3.5 text-base font-semibold bg-pink-500 hover:bg-pink-600 text-white transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl focus:ring-4 focus:ring-pink-200 dark:focus:ring-pink-400/50'>
                Sign In
              </Button>
            </div>
          </div>
        </form>

        {/* Footer Text */}
        <div className='mt-10 text-center border-t border-gray-100 dark:border-gray-700/50 pt-6'>
          <p className='text-xs font-normal text-gray-500 dark:text-gray-400'>
            Internal Management System — Please do not share your login credentials.
          </p>
        </div>
      </div>
    </div>
  )
}
