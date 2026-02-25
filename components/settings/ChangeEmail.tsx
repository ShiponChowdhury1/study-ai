'use client'

import { useState } from 'react'
import { useAppDispatch } from '@/redux/hooks'
import { updateAdminInfo } from '@/redux/slices/settingsSlice'
import { updateUserProfile } from '@/redux/slices/authSlice'
import { setActiveSection } from '@/redux/slices/settingsSlice'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, ShieldCheck, KeyRound } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'react-toastify'
import { extractError } from '@/components/settings/utils'

interface ChangeEmailProps {
  onDone: () => void
}

export function ChangeEmail({ onDone }: ChangeEmailProps) {
  const dispatch = useAppDispatch()
  const [newEmail, setNewEmail] = useState('')
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])
  const [sendingOtp, setSendingOtp] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [confirmingEmail, setConfirmingEmail] = useState(false)

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtpValues = [...otpValues]
      newOtpValues[index] = value
      setOtpValues(newOtpValues)

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const newOtpValues = [...otpValues]
      if (otpValues[index]) {
        newOtpValues[index] = ''
        setOtpValues(newOtpValues)
      } else if (index > 0) {
        newOtpValues[index - 1] = ''
        setOtpValues(newOtpValues)
        const prevInput = document.getElementById(`otp-${index - 1}`)
        prevInput?.focus()
      }
    }
  }

  const handleSendOtp = async () => {
    if (!newEmail.trim()) {
      toast.error('Please enter a new email address')
      return
    }
    setSendingOtp(true)
    try {
      const res = await api('/dashboard/change-email/request/', {
        method: 'POST',
        body: JSON.stringify({ new_email: newEmail }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || 'Verification code sent to new email')
        setOtpSent(true)
      } else {
        toast.error(extractError(data))
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSendingOtp(false)
    }
  }

  const handleResendOtp = async () => {
    setOtpValues(['', '', '', '', '', ''])
    await handleSendOtp()
  }

  const handleConfirmEmail = async () => {
    const otp = otpValues.join('')
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP')
      return
    }
    setConfirmingEmail(true)
    try {
      const res = await api('/dashboard/change-email/verify/', {
        method: 'POST',
        body: JSON.stringify({ new_email: newEmail, otp }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || 'Email changed successfully')
        dispatch(updateAdminInfo({ email: newEmail }))
        dispatch(updateUserProfile({ email: newEmail }))
        setNewEmail('')
        setOtpValues(['', '', '', '', '', ''])
        setOtpSent(false)
        dispatch(setActiveSection('admin-info'))
        onDone()
      } else {
        toast.error(extractError(data))
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setConfirmingEmail(false)
    }
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <Mail className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <CardTitle>Change Email</CardTitle>
            <CardDescription>Update your email address securely with OTP verification</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {/* Step 1: New Email */}
        <div className="w-full sm:w-1/2">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">1</div>
            <span className="text-sm font-semibold text-gray-800">Enter New Email</span>
          </div>
          <div className="relative">
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="newemail@example.com"
              className="pr-24"
            />
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sendingOtp}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingOtp ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : otpSent ? 'Resend OTP' : 'Send OTP'}
            </button>
          </div>
          {otpSent && (
            <p className="mt-1.5 text-xs text-green-600">OTP sent! Check your email.</p>
          )}
          {!otpSent && (
            <p className="mt-1.5 text-xs text-gray-400">A 6-digit code will be sent to this email</p>
          )}
        </div>

        <div className="border-t border-dashed border-gray-200" />

        {/* Step 2: OTP Verification */}
        <div className="w-full sm:w-1/2">
          <label className="mb-3 block text-sm font-semibold text-gray-800">Verify OTP Code</label>
          <div className="flex gap-3">
            {otpValues.map((value, index) => (
              <Input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                title=""
                autoComplete="off"
                value={value}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-semibold border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            ))}
          </div>
          <div className="mt-2 flex items-center gap-1 text-sm">
            <span className="text-gray-500">Didn&apos;t receive code?</span>
            <button
              type="button"
              onClick={handleResendOtp}
              className="text-blue-500 hover:text-blue-600 font-semibold underline-offset-2 hover:underline"
            >
              Resend
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-2">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <span className="text-xs text-gray-500">Your email change is secured with two-step verification</span>
          </div>
          <Button onClick={handleConfirmEmail} disabled={confirmingEmail} className="bg-blue-500 hover:bg-blue-600 gap-2">
            {confirmingEmail ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            {confirmingEmail ? 'Verifying...' : 'Confirm Email Change'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
