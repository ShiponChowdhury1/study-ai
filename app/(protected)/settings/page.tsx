'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { updateAdminInfo, setActiveSection, fetchAdminProfile, updateAdminProfile } from '@/redux/slices/settingsSlice'
import { updateUserProfile } from '@/redux/slices/authSlice'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, MessageSquare, Send, X, Mail, ShieldCheck, KeyRound, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdminInfo } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { api } from '@/lib/api'
import { toast } from 'react-toastify'

const defaultSettingsSections = [
  { id: 'admin-info', label: 'Admin Information' },
  { id: 'change-password', label: 'Change Password' },
  { id: 'comment', label: 'Comments' },
  { id: 'privacy-policy', label: 'Privacy Policy' },
] as const

const changeEmailSections = [
  { id: 'admin-info', label: 'Admin Information' },
  { id: 'change-password', label: 'Change Password' },
  { id: 'privacy-policy', label: 'Privacy Policy' },
  { id: 'change-email', label: 'Change Email' },
] as const

interface StudentFeedback {
  id: string
  studentName: string
  timeAgo: string
  status: 'NEW' | 'RESPONDED'
  message: string
  avatarColor: string
}

const mockFeedbacks: StudentFeedback[] = [
  {
    id: '1',
    studentName: 'Zhang Wei',
    timeAgo: '2 hours ago',
    status: 'NEW',
    message: 'I would love to be able to export my flashcards to Anki.',
    avatarColor: 'bg-green-500',
  },
  {
    id: '2',
    studentName: 'Emma Johnson',
    timeAgo: '5 hours ago',
    status: 'NEW',
    message: 'The physics formulas are sometimes rendered incorrectly on smaller screens.',
    avatarColor: 'bg-purple-500',
  },
  {
    id: '3',
    studentName: 'Michael Chen',
    timeAgo: '1 day ago',
    status: 'RESPONDED',
    message: 'Can we get a dark mode option for late night studying?',
    avatarColor: 'bg-purple-500',
  },
  {
    id: '4',
    studentName: 'Sarah Williams',
    timeAgo: '2 days ago',
    status: 'RESPONDED',
    message: 'The AI sometimes generates duplicate questions in my quizzes.',
    avatarColor: 'bg-purple-500',
  },
]

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-500 text-white',
  RESPONDED: 'bg-green-500 text-white',
}

export default function SettingsPage() {
  const dispatch = useAppDispatch()
  const { adminInfo, activeSection, profileLoading, updatingProfile } = useAppSelector((state) => state.settings)
  const [formData, setFormData] = useState<AdminInfo>(adminInfo)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    dispatch(fetchAdminProfile())
  }, [dispatch])

  // Sync formData when adminInfo is fetched from API
  useEffect(() => {
    setFormData(adminInfo)
  }, [adminInfo])
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isEditingPrivacy, setIsEditingPrivacy] = useState(false)
  const [privacyContent, setPrivacyContent] = useState('')
  const [isChangeEmailMode, setIsChangeEmailMode] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])
  const [sendingOtp, setSendingOtp] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [confirmingEmail, setConfirmingEmail] = useState(false)
  const [commentFilter, setCommentFilter] = useState<'ALL' | 'NEW' | 'RESPONDED'>('ALL')
  const [selectedFeedback, setSelectedFeedback] = useState<StudentFeedback | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  
  const settingsSections = isChangeEmailMode ? changeEmailSections : defaultSettingsSections

  const handleInputChange = (field: keyof AdminInfo, value: string) => {
    setFormData((prev: AdminInfo) => ({ ...prev, [field]: value }))
  }

  const extractError = (data: Record<string, unknown>): string => {
    if (typeof data === 'string') return data
    if (data.message) return String(data.message)
    if (data.detail) return String(data.detail)
    if (data.error) return String(data.error)
    // Handle DRF field-level errors like { "new_email": ["error msg"] }
    for (const key of Object.keys(data)) {
      const val = data[key]
      if (Array.isArray(val) && val.length > 0) return String(val[0])
      if (typeof val === 'string') return val
    }
    return 'Something went wrong'
  }

  const handleSubmit = async () => {
    try {
      await dispatch(updateAdminProfile({
        fullName: formData.fullName,
        avatarFile: avatarFile || undefined,
      })).unwrap()
      toast.success('Profile updated successfully')
      setAvatarFile(null)
      setAvatarPreview(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile'
      try {
        const parsed = JSON.parse(msg)
        toast.error(extractError(parsed))
      } catch {
        toast.error(msg)
      }
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setAvatarPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handlePasswordChange = () => {
    console.log('Password change submitted')
    // Add password change logic
  }

  const handleEditPrivacy = () => {
    setIsEditingPrivacy(true)
  }

  const handleSavePrivacy = () => {
    console.log('Privacy policy updated:', privacyContent)
    setIsEditingPrivacy(false)
    // Add save logic
  }

  const handleCancelPrivacy = () => {
    setIsEditingPrivacy(false)
    setPrivacyContent('')
  }

  const handleChangeEmail = () => {
    setIsChangeEmailMode(true)
    dispatch(setActiveSection('change-email'))
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtpValues = [...otpValues]
      newOtpValues[index] = value
      setOtpValues(newOtpValues)
      
      // Auto-focus next input
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
        // Clear current field
        newOtpValues[index] = ''
        setOtpValues(newOtpValues)
      } else if (index > 0) {
        // If already empty, clear previous and focus it
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
        setIsChangeEmailMode(false)
        setNewEmail('')
        setOtpValues(['', '', '', '', '', ''])
        setOtpSent(false)
        dispatch(setActiveSection('admin-info'))
      } else {
        toast.error(extractError(data))
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setConfirmingEmail(false)
    }
  }

  const filteredFeedbacks = commentFilter === 'ALL' 
    ? mockFeedbacks 
    : mockFeedbacks.filter(f => f.status === commentFilter)

  const handleSendResponse = () => {
    console.log('Sending response:', replyMessage, 'to', selectedFeedback?.studentName)
    setReplyMessage('')
    setSelectedFeedback(null)
  }

  const handleDiscard = () => {
    setReplyMessage('')
    setSelectedFeedback(null)
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'admin-info':
        return (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Admin Information</CardTitle>
              <CardDescription>Update your store details and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    {(avatarPreview || adminInfo.avatar) && (
                      <AvatarImage src={avatarPreview || adminInfo.avatar} />
                    )}
                    <AvatarFallback className="bg-blue-500 text-white">
                      {adminInfo.fullName
                        ? adminInfo.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                        : 'AD'}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <button
                    onClick={handleAvatarClick}
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white shadow-md hover:bg-blue-600"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Admin Information</h4>
                  <p className="text-sm text-gray-500">admin</p>
                  <p className="text-xs text-gray-400">Click camera icon to upload profile picture</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Full Name</label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Admin User"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="admin@luxestore.com"
                  />
                  <button
                    type="button"
                    onClick={handleChangeEmail}
                    className="mt-2 text-sm text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Change email
                  </button>
                </div>
        
              </div>
              <Button onClick={handleSubmit} disabled={updatingProfile} className="w-full bg-blue-500 hover:bg-blue-600 sm:w-auto gap-2">
                {updatingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                {updatingProfile ? 'Saving...' : 'Confirm'}
              </Button>
            </CardContent>
          </Card>
        )

      case 'change-password':
        return (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your store details and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Current Password</label>
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">New Password</label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <Button onClick={handlePasswordChange} className="w-full bg-blue-500 hover:bg-blue-600 sm:w-auto">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        )

      case 'privacy-policy':
        return (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Privacy Policy</CardTitle>
              {!isEditingPrivacy ? (
                <Button 
                  className="bg-blue-500 hover:bg-blue-600"
                  onClick={handleEditPrivacy}
                >
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={handleCancelPrivacy}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={handleSavePrivacy}
                  >
                    Save
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="prose max-w-none">
              {isEditingPrivacy ? (
                <Textarea
                  value={privacyContent}
                  onChange={(e) => setPrivacyContent(e.target.value)}
                  className="min-h-[500px] font-mono text-sm"
                  placeholder="Enter privacy policy content..."
                />
              ) : (
              <>
              <h2 className="text-lg font-semibold">1. Introduction</h2>
              <p className="text-gray-600 text-sm">
                Form-Cert SRL (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform and use our services.
              </p>
              
              <h2 className="mt-6 text-lg font-semibold">2. Information We Collect</h2>
              <h3 className="mt-4 text-base font-medium">Personal Data</h3>
              <p className="text-gray-600 text-sm">We may collect personally identifiable information, such as:</p>
              <ul className="text-gray-600 text-sm list-disc pl-5 space-y-1">
                <li>Name and contact information (email address, phone number)</li>
                <li>Professional information (job title, company, industry)</li>
                <li>Account credentials (username, password)</li>
                <li>Payment information (processed securely through third-party payment processors)</li>
                <li>Course enrollment and progress data</li>
              </ul>
              
              <h3 className="mt-4 text-base font-medium">Usage Data</h3>
              <p className="text-gray-600 text-sm">
                We automatically collect information about your device and how you interact with our platform, including IP address, browser type, pages visited, time spent on pages, and other diagnostic data.
              </p>
              
              <h2 className="mt-6 text-lg font-semibold">6. Data Security</h2>
              <p className="text-gray-600 text-sm">
                We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
              </p>
              
              <h2 className="mt-6 text-lg font-semibold">7. Data Retention</h2>
              <p className="text-gray-600 text-sm">
                We retain your personal data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
              </p>
              
              <h2 className="mt-6 text-lg font-semibold">8. Your Rights and Choices</h2>
              <p className="text-gray-600 text-sm">
                You can update your account information, unsubscribe from marketing communications, or request deletion of your data by contacting us at privacy@form-cert.eu.
              </p>
              
              <h2 className="mt-6 text-lg font-semibold">10. Changes to This Policy</h2>
              <p className="text-gray-600 text-sm">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &ldquo;Last updated&rdquo; date.
              </p>
              
              <h2 className="mt-6 text-lg font-semibold">11. Contact Us</h2>
              <p className="text-gray-600 text-sm">If you have questions about this Privacy Policy, please contact us:</p>
              <p className="text-blue-500 text-sm">Email: privacy@form-cert.eu</p>
              <p className="text-blue-500 text-sm">Address: Via Roma 123, 20121 Milano, Italy</p>
              </>
              )}
            </CardContent>
          </Card>
        )

      case 'change-email':
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

      case 'comment':
        return (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-0">
              <CardTitle className="text-base font-semibold text-gray-900">All Comments</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="divide-y divide-gray-200">
                {filteredFeedbacks.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">No comments found.</p>
                ) : (
                  filteredFeedbacks.map((feedback, index) => (
                    <div
                      key={feedback.id}
                      onClick={() => setSelectedFeedback(feedback)}
                      className={cn(
                        'cursor-pointer py-4 transition-colors hover:bg-gray-50/50',
                        index === 0 && 'pt-0',
                        selectedFeedback?.id === feedback.id && 'border-l-3 border-l-blue-500 pl-4 -ml-4 bg-blue-50/30'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9 shrink-0 mt-0.5">
                          <AvatarFallback className={cn('text-xs text-white font-semibold', feedback.avatarColor)}>
                            {feedback.studentName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-semibold text-gray-900">{feedback.studentName}</span>
                              <p className="text-xs text-gray-400">{feedback.timeAgo}</p>
                            </div>
                            <span className={cn('rounded-md px-3 py-1 text-[11px] font-bold tracking-wide', statusColors[feedback.status])}>
                              {feedback.status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-gray-600">{feedback.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex-1">
      <Header title="Settings" />
      
      <main className="p-4 lg:p-6">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar Navigation */}
          <div className="space-y-4">
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="flex flex-col items-center p-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    {adminInfo.avatar && <AvatarImage src={adminInfo.avatar} />}
                    <AvatarFallback className="bg-orange-200 text-2xl">
                      {adminInfo.fullName
                        ? adminInfo.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                        : 'AD'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {profileLoading ? 'Loading...' : adminInfo.fullName || 'Admin'}
                </h3>
                <p className="text-sm text-gray-500">{adminInfo.email || 'Settings'}</p>
              </CardContent>
            </Card>

            <div className="space-y-1">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => dispatch(setActiveSection(section.id))}
                  className={cn(
                    'w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors',
                    activeSection === section.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  )}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          {renderContent()}
        </div>
      </main>

      {/* Response Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={(open) => !open && handleDiscard()}>
        <DialogContent className="max-w-lg p-0 gap-0 rounded-xl overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <DialogTitle className="text-base font-semibold text-gray-900">Response to Student</DialogTitle>
            </div>
          </DialogHeader>

          <div className="px-6 py-5 space-y-5">
            {/* Student Inquiry */}
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Student Inquiry</h4>
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                <p className="text-sm italic text-gray-700 leading-relaxed">&ldquo;{selectedFeedback?.message}&rdquo;</p>
              </div>
            </div>

            {/* Compose Reply */}
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Compose Reply</h4>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 pt-3 pb-1 text-sm text-gray-900">
                  <p>Hi</p>
                  <p>{selectedFeedback?.studentName?.split(' ')[0]},</p>
                </div>
                <Textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response here..."
                  className="min-h-[100px] resize-none border-0 shadow-none focus-visible:ring-0 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <Button variant="outline" onClick={handleDiscard} className="rounded-lg px-6">
              Discard
            </Button>
            <Button onClick={handleSendResponse} className="gap-2 rounded-lg bg-blue-500 hover:bg-blue-600 px-6">
              <Send className="h-4 w-4" />
              Send Response
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
