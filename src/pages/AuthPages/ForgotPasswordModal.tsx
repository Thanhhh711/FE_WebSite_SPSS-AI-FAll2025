/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'

import { AlertCircle, Loader2, Mail, Lock, KeyRound, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react'
import authApi from '../../api/auth.api'
import { useNavigate } from 'react-router'
import { AppPath } from '../../constants/Paths'
import { toast } from 'react-toastify'

type Step = 'FORGOT' | 'RESET' | 'SUCCESS'

export default function ForgotPasswordModal() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('FORGOT')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  })

  // 1. Xử lý gửi Email lấy OTP
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      console.log('formData', formData.email)

      const data = await authApi.forgotPassword({ email: formData.email })

      toast.success(data.data.message)
      setStep('RESET') // Chuyển sang bước nhập OTP
    } catch (error: any) {
      setErrors({ apiError: error.response?.data?.message || 'Email not found' })
    } finally {
      setLoading(false)
    }
  }

  // 2. Xử lý Reset Password với OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' })
      return
    }

    setLoading(true)
    try {
      await authApi.resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      })
      setStep('SUCCESS')
    } catch (error: any) {
      setErrors({ apiError: error.response?.data?.message || 'Invalid OTP or request' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 z-[999] flex items-center justify-center bg-black backdrop-blur-md transition-all duration-300'>
      <div className='w-full max-w-md bg-slate-950 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden relative'>
        {/* Header Section */}
        <div className='bg-slate-900/50 p-6 text-center border-b border-slate-800'>
          <h2 className='text-xl font-bold text-white uppercase tracking-tight'>
            {step === 'FORGOT' ? 'Forgot Password' : step === 'RESET' ? 'Reset Password' : 'Verified'}
          </h2>
          <p className='text-slate-400 text-sm mt-1'>
            {step === 'FORGOT'
              ? 'Enter email to receive OTP code'
              : step === 'RESET'
                ? `Code sent to ${formData.email}`
                : 'Your password has been updated'}
          </p>
        </div>

        <div className='p-8'>
          {/* API Global Error */}
          {errors.apiError && (
            <div className='flex items-center gap-2 p-3 mb-4 text-sm text-red-400 bg-red-950/30 rounded-lg border border-red-900/50'>
              <AlertCircle className='w-4 h-4 flex-shrink-0' />
              <p>{errors.apiError}</p>
            </div>
          )}

          {/* BƯỚC 1: NHẬP EMAIL */}
          {step === 'FORGOT' && (
            <form onSubmit={handleForgotPassword} className='space-y-5'>
              <div>
                <label className='block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5'>
                  Email Address
                </label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4' />
                  <input
                    type='email'
                    required
                    placeholder='example@gmail.com'
                    className='w-full pl-10 pr-4 py-2.5 bg-slate-900 text-white border border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-600 transition-all'
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <button
                type='submit'
                disabled={loading}
                className='w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50'
              >
                {loading ? <Loader2 className='animate-spin' size={20} /> : 'Send OTP Code'}
              </button>
            </form>
          )}

          {/* BƯỚC 2: NHẬP OTP & MẬT KHẨU MỚI */}
          {step === 'RESET' && (
            <form onSubmit={handleResetPassword} className='space-y-4'>
              {/* OTP Input */}
              <div>
                <label className='block text-xs font-bold text-slate-400 uppercase mb-1.5'>OTP Code</label>
                <div className='relative'>
                  <KeyRound className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4' />
                  <input
                    type='text'
                    required
                    placeholder='Enter 6-digit code'
                    className='w-full pl-10 pr-4 py-2.5 bg-slate-900 text-white border border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-600 transition-all'
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className='block text-xs font-bold text-slate-400 uppercase mb-1.5'>New Password</label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4' />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className='w-full pl-10 pr-11 py-2.5 bg-slate-900 text-white border border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-600 transition-all'
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white'
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className='block text-xs font-bold text-slate-400 uppercase mb-1.5'>Confirm Password</label>
                <input
                  type='password'
                  required
                  className={`w-full px-4 py-2.5 bg-slate-900 text-white border rounded-xl outline-none transition-all ${errors.confirmPassword ? 'border-red-500' : 'border-slate-800 focus:border-blue-600'}`}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                {errors.confirmPassword && <p className='text-xs text-red-500 mt-1'>{errors.confirmPassword}</p>}
              </div>

              <button
                type='submit'
                disabled={loading}
                className='w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all mt-2'
              >
                {loading ? <Loader2 className='animate-spin' size={20} /> : 'Reset Password'}
              </button>

              <button
                type='button'
                onClick={() => setStep('FORGOT')}
                className='w-full text-slate-500 text-sm hover:text-slate-300 flex items-center justify-center gap-2 mt-2'
              >
                <ArrowLeft size={14} /> Back to email
              </button>
            </form>
          )}

          {/* BƯỚC 3: THÀNH CÔNG */}
          {step === 'SUCCESS' && (
            <div className='text-center py-4 animate-in zoom-in duration-300'>
              <div className='mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/20'>
                <CheckCircle2 className='text-green-500 w-10 h-10' />
              </div>
              <h3 className='text-white font-bold text-lg'>Success!</h3>
              <p className='text-slate-400 text-sm mb-6'>Your password has been reset successfully.</p>
              <button
                onClick={() => navigate(AppPath.SIGN_IN)}
                className='w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-slate-200 transition-all'
              >
                Login Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
