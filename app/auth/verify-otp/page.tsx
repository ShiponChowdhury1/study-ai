'use client'

import { Suspense, useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  verifyOtpStart,
  verifyOtpSuccess,
  verifyOtpFailure,
  resetPasswordStart,
  resetPasswordSuccess,
  resetPasswordFailure,
  clearError,
} from '@/redux/slices/authSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShieldCheck, ArrowLeft, Loader2, Eye, EyeOff, Lock } from 'lucide-react'
import { toast } from 'react-toastify'
import Link from 'next/link'

function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const { isLoading, error, otpVerified } = useAppSelector((state) => state.auth)

  const email = searchParams.get('email') || ''
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.push('/auth/forgot-password')
    }
  }, [email, router])

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6).split('')
      const newOtp = [...otp]
      digits.forEach((digit, i) => {
        if (index + i < 6) newOtp[index + i] = digit
      })
      setOtp(newOtp)
      const nextIndex = Math.min(index + digits.length, 5)
      inputRefs.current[nextIndex]?.focus()
      return
    }

    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())

    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      dispatch(verifyOtpFailure('Please enter the complete 6-digit OTP'))
      return
    }

    dispatch(verifyOtpStart())

    try {
      const res = await fetch('/api/proxy/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode }),
      })

      const data = await res.json()

      if (!res.ok) {
        const msg = data.message || 'Invalid OTP'
        dispatch(verifyOtpFailure(msg))
        toast.error(msg)
        return
      }

      dispatch(verifyOtpSuccess())
      toast.success('OTP verified successfully!')
    } catch {
      dispatch(verifyOtpFailure('Something went wrong. Please try again.'))
      toast.error('Something went wrong. Please try again.')
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())

    if (!newPassword || !confirmPassword) {
      dispatch(resetPasswordFailure('Please fill in all fields'))
      return
    }

    if (newPassword.length < 6) {
      dispatch(resetPasswordFailure('Password must be at least 6 characters'))
      return
    }

    if (newPassword !== confirmPassword) {
      dispatch(resetPasswordFailure('Passwords do not match'))
      return
    }

    dispatch(resetPasswordStart())

    try {
      const res = await fetch('/api/proxy/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        const msg = data.message || 'Failed to reset password'
        dispatch(resetPasswordFailure(msg))
        toast.error(msg)
        return
      }

      dispatch(resetPasswordSuccess())
      toast.success('Password reset successfully!')
      router.push('/auth/login')
    } catch {
      dispatch(resetPasswordFailure('Something went wrong. Please try again.'))
      toast.error('Something went wrong. Please try again.')
    }
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return

    try {
      await fetch('/api/proxy/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setResendTimer(60)
      setOtp(['', '', '', '', '', ''])
      toast.success('OTP resent successfully!')
    } catch {
      toast.error('Failed to resend OTP')
    }
  }

  // Show reset password form after OTP is verified
  if (otpVerified) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <Lock className="h-7 w-7 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="mt-1 text-center text-sm text-gray-500">
            Enter your new password below.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10 pr-10 h-11"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10 h-11"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting...
              </span>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
          <ShieldCheck className="h-7 w-7 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          We sent a 6-digit code to{' '}
          <span className="font-medium text-gray-700">{email}</span>
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {/* OTP Input */}
      <form onSubmit={handleVerifyOtp} className="space-y-6">
        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="h-12 w-12 rounded-lg border border-gray-300 text-center text-lg font-semibold text-gray-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
              disabled={isLoading}
            />
          ))}
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </span>
          ) : (
            'Verify OTP'
          )}
        </Button>
      </form>

      {/* Resend & Back */}
      <div className="mt-6 space-y-3 text-center">
        <p className="text-sm text-gray-500">
          Didn&apos;t receive the code?{' '}
          <button
            onClick={handleResendOtp}
            disabled={resendTimer > 0}
            className={`font-medium ${
              resendTimer > 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:text-blue-500 cursor-pointer'
            }`}
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
          </button>
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  )
}
