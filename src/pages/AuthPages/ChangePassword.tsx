/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertCircle, Eye, EyeOff, Loader2, LogOut, X } from 'lucide-react'
import React, { useState } from 'react'

import authApi from '../../api/auth.api'
import { useNavigate } from 'react-router'
import { AppPath } from '../../constants/Paths'
import { getRefreshTokenFormLS } from '../../utils/auth'
import { toast } from 'react-toastify'

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // Thêm state để quản lý ẩn hiện mật khẩu
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const toggleVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  // State for form data
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // State for inline errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validate = () => {
    const newErrors: { [key: string]: string } = {}

    if (formData.currentPassword.length < 1) {
      newErrors.currentPassword = 'Current password is required'
    }
    if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters'
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      // 1. Call Change Password
      const data = await authApi.changePassWord({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })

      toast.success(data.data.message)

      // 2. Call Logout
      const refreshToken = getRefreshTokenFormLS()
      await authApi.logoutAccount({ refreshToken })

      // 3. Cleanup & Redirect
      localStorage.clear()
      navigate(AppPath.SIGN_IN)
    } catch (error: any) {
      // Handle API errors (e.g., "Wrong current password")
      setErrors({
        apiError: error.response?.data?.message || 'Something went wrong. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 z-[999] flex items-center justify-center bg-black backdrop-blur-md transition-opacity duration-300'>
      <div className='w-full max-w-md bg-slate-950 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden relative'>
        {/* Close Button */}
        <button
          onClick={() => navigate(-1)}
          className='absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-10'
        >
          <X className='w-5 h-5' />
        </button>

        {/* Header */}
        <div className='bg-slate-900/50 p-6 text-center border-b border-slate-800'>
          <h2 className='text-xl font-bold text-white uppercase tracking-tight'>Change Password</h2>
          <p className='text-slate-400 text-sm mt-1 font-medium'>You will be logged out after updating</p>
        </div>

        <form onSubmit={handleChangePassword} className='p-8 space-y-5'>
          {/* API Global Error */}
          {errors.apiError && (
            <div className='flex items-center gap-2 p-3 text-sm text-red-400 bg-red-950/30 rounded-lg border border-red-900/50 animate-in fade-in duration-300'>
              <AlertCircle className='w-4 h-4 flex-shrink-0' />
              <p>{errors.apiError}</p>
            </div>
          )}

          {/* Current Password */}
          <div>
            <label className='block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5'>
              Current Password
            </label>
            <div className='relative'>
              <input
                type={showPasswords.current ? 'text' : 'password'}
                autoComplete='current-password'
                placeholder='••••••••'
                className={`w-full pl-4 pr-11 py-2.5 bg-slate-900 text-white border rounded-xl outline-none transition-all ${
                  errors.currentPassword
                    ? 'border-red-500 focus:ring-2 focus:ring-red-900/50'
                    : 'border-slate-800 focus:ring-2 focus:ring-blue-900/30 focus:border-blue-600'
                }`}
                value={formData.currentPassword}
                onChange={(e) => {
                  setFormData({ ...formData, currentPassword: e.target.value })
                  if (errors.currentPassword) setErrors({ ...errors, currentPassword: '' })
                }}
              />
              <button
                type='button'
                onClick={() => toggleVisibility('current')}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors'
              >
                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.currentPassword && <p className='mt-1.5 text-xs text-red-500 ml-1'>{errors.currentPassword}</p>}
          </div>

          {/* New Password */}
          <div>
            <label className='block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5'>
              New Password
            </label>
            <div className='relative'>
              <input
                type={showPasswords.new ? 'text' : 'password'}
                autoComplete='new-password'
                placeholder='••••••••'
                className={`w-full pl-4 pr-11 py-2.5 bg-slate-900 text-white border rounded-xl outline-none transition-all ${
                  errors.newPassword
                    ? 'border-red-500 focus:ring-2 focus:ring-red-900/50'
                    : 'border-slate-800 focus:ring-2 focus:ring-blue-900/30 focus:border-blue-600'
                }`}
                value={formData.newPassword}
                onChange={(e) => {
                  setFormData({ ...formData, newPassword: e.target.value })
                  if (errors.newPassword) setErrors({ ...errors, newPassword: '' })
                }}
              />
              <button
                type='button'
                onClick={() => toggleVisibility('new')}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors'
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.newPassword && <p className='mt-1.5 text-xs text-red-500 ml-1'>{errors.newPassword}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className='block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5'>
              Confirm New Password
            </label>
            <div className='relative'>
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                autoComplete='new-password'
                placeholder='••••••••'
                className={`w-full pl-4 pr-11 py-2.5 bg-slate-900 text-white border rounded-xl outline-none transition-all ${
                  errors.confirmPassword
                    ? 'border-red-500 focus:ring-2 focus:ring-red-900/50'
                    : 'border-slate-800 focus:ring-2 focus:ring-blue-900/30 focus:border-blue-600'
                }`}
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value })
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' })
                }}
              />
              <button
                type='button'
                onClick={() => toggleVisibility('confirm')}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors'
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p className='mt-1.5 text-xs text-red-500 ml-1'>{errors.confirmPassword}</p>}
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            disabled={loading}
            className='w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg shadow-blue-900/20'
          >
            {loading ? (
              <Loader2 className='w-5 h-5 animate-spin' />
            ) : (
              <>
                <LogOut className='w-4 h-4' />
                Update & Sign Out
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
