'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  forgotPasswordStart,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  clearError,
} from '@/redux/slices/authSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((state) => state.auth)

  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())

    if (!email) {
      dispatch(forgotPasswordFailure('Please enter your email address'))
      return
    }

    dispatch(forgotPasswordStart())

    try {
      const res = await fetch('/api/proxy/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        dispatch(forgotPasswordFailure(data.message || 'Failed to send OTP'))
        return
      }

      dispatch(forgotPasswordSuccess(email))
      router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`)
    } catch {
      dispatch(forgotPasswordFailure('Something went wrong. Please try again.'))
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
          <Mail className="h-7 w-7 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          No worries! Enter your email and we&apos;ll send you an OTP to reset your password.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-11"
              disabled={isLoading}
            />
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
              Sending OTP...
            </span>
          ) : (
            'Send OTP'
          )}
        </Button>
      </form>

      {/* Back to login */}
      <div className="mt-6 text-center">
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
