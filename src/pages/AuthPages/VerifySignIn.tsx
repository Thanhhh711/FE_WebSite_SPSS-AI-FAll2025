/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import authApi from '../../api/auth.api'
import { toast } from 'react-toastify'

interface Props {
  email: string
  onSuccess: (data: any) => void
  onClose: () => void
}

export default function TwoFactorModal({ email, onSuccess, onClose }: Props) {
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(60) // 60 seconds cooldown

  // 1. Mutation for Verification
  const verifyMutation = useMutation({
    mutationFn: (body: { email: string; code: string }) => authApi.verifyLoginOtp(body)
  })

  // 2. Mutation for Resending (Assuming your loginAccount triggers the OTP)
  // If you have a specific resend API, replace authApi.loginAccount here
  const resendMutation = useMutation({
    mutationFn: (email: string) => authApi.loginAccount({ usernameOrEmail: email, password: '' })
    // Note: Adjust the payload according to your backend's resend requirements
  })

  // 3. Countdown Timer Logic
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length < 4) {
      toast.error('Please enter a valid code')
      return
    }
    verifyMutation.mutate(
      { email, code },
      {
        onSuccess: (data) => {
          console.log('Verify response:', data)
          onSuccess(data)
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Invalid verification code')
        }
      }
    )
  }

  const handleResend = () => {
    if (countdown > 0) return

    resendMutation.mutate(email, {
      onSuccess: () => {
        toast.success('A new code has been sent to your email')
        setCountdown(60) // Reset timer
      },
      onError: () => {
        toast.error('Failed to resend code. Please try again later.')
      }
    })
  }

  return (
    <div className='fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
      <div className='w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl'>
        <div className='text-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Two-Step Verification</h2>
          <p className='text-sm text-gray-500 mt-2'>
            Code sent to: <span className='font-semibold text-gray-700 dark:text-gray-200'>{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className='space-y-5'>
          <div>
            <input
              type='text'
              placeholder='Enter 6-digit code'
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className='w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-center text-2xl tracking-[0.5em] font-bold outline-none focus:ring-2 focus:ring-pink-500'
              autoFocus
            />
          </div>

          <div className='flex gap-3'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors'
            >
              Cancel
            </button>

            <button
              type='submit'
              disabled={verifyMutation.isPending}
              className='flex-1 py-3 px-4 bg-pink-500 text-white font-semibold rounded-xl hover:bg-pink-600 disabled:bg-pink-300 transition-all'
            >
              {verifyMutation.isPending ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>

        {/* Resend Section */}
        <div className='mt-8 text-center border-t border-gray-100 pt-4'>
          <p className='text-sm text-gray-500'>Didn't receive the code?</p>
          <button
            type='button'
            onClick={handleResend}
            disabled={countdown > 0 || resendMutation.isPending}
            className={`mt-2 font-semibold transition-colors ${
              countdown > 0 || resendMutation.isPending
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-pink-500 hover:text-pink-600'
            }`}
          >
            {resendMutation.isPending ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  )
}
