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
import { Camera, MessageSquare, Send, X, Mail, ShieldCheck, KeyRound, Loader2, Eye, EyeOff, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdminInfo } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { api } from '@/lib/api'
import { toast } from 'react-toastify'
import { RichTextEditor } from '@/components/shared/RichTextEditor'

const defaultSettingsSections = [
  { id: 'admin-info', label: 'Admin Information' },
  { id: 'change-password', label: 'Change Password' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'privacy-policy', label: 'Privacy Policy' },
] as const

const changeEmailSections = [
  { id: 'admin-info', label: 'Admin Information' },
  { id: 'change-password', label: 'Change Password' },
  { id: 'privacy-policy', label: 'Privacy Policy' },
  { id: 'change-email', label: 'Change Email' },
] as const

interface FeedbackItem {
  id: number
  rating: number
  app_crashed_freezing: boolean
  poor_photo_quality: boolean
  gps_tracking_issues: boolean
  show_performance: boolean
  other: boolean
  comment: string
  need_quick_support: boolean
  created_at: string
}

interface PrivacyPolicyData {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
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
    fetchPrivacyPolicy()
    fetchFeedbacks()
  }, [dispatch])

  const fetchPrivacyPolicy = async () => {
    setPrivacyLoading(true)
    try {
      const res = await api('/privacy-policy/')
      const data = await res.json()
      if (res.ok) {
        setPrivacyData(data)
        setPrivacyTitle(data.title || '')
        setPrivacyContent(data.content || '')
      }
    } catch {
      // silent fail
    } finally {
      setPrivacyLoading(false)
    }
  }

  const fetchFeedbacks = async () => {
    setFeedbackLoading(true)
    try {
      const res = await api('/dashboard/feedback/')
      const data = await res.json()
      if (res.ok) {
        setFeedbacks(data.results || [])
      }
    } catch {
      // silent fail
    } finally {
      setFeedbackLoading(false)
    }
  }

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
  const [privacyTitle, setPrivacyTitle] = useState('')
  const [privacyData, setPrivacyData] = useState<PrivacyPolicyData | null>(null)
  const [privacyLoading, setPrivacyLoading] = useState(false)
  const [savingPrivacy, setSavingPrivacy] = useState(false)
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [isChangeEmailMode, setIsChangeEmailMode] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])
  const [sendingOtp, setSendingOtp] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [confirmingEmail, setConfirmingEmail] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null)
  
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

  const handlePasswordChange = async () => {
    // Validation
    if (!passwordData.currentPassword.trim()) {
      toast.error('Please enter your current password')
      return
    }
    if (!passwordData.newPassword.trim()) {
      toast.error('Please enter a new password')
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('New password must be different from current password')
      return
    }

    setChangingPassword(true)
    try {
      const res = await api('/me/password/change/', {
        method: 'POST',
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || 'Password changed successfully')
        // Clear form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      } else {
        toast.error(extractError(data))
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleEditPrivacy = () => {
    if (privacyData) {
      setPrivacyTitle(privacyData.title)
      setPrivacyContent(privacyData.content)
    }
    setIsEditingPrivacy(true)
  }

  const handleSavePrivacy = async () => {
    if (!privacyTitle.trim()) {
      toast.error('Please enter a title')
      return
    }
    if (!privacyContent.trim()) {
      toast.error('Please enter content')
      return
    }
    setSavingPrivacy(true)
    try {
      const res = await api('/privacy-policy/', {
        method: 'PUT',
        body: JSON.stringify({
          title: privacyTitle,
          content: privacyContent,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setPrivacyData(data)
        setIsEditingPrivacy(false)
        toast.success('Privacy policy updated successfully')
      } else {
        toast.error(extractError(data))
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSavingPrivacy(false)
    }
  }

  const handleCancelPrivacy = () => {
    setIsEditingPrivacy(false)
    if (privacyData) {
      setPrivacyTitle(privacyData.title)
      setPrivacyContent(privacyData.content)
    }
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

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHr = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHr / 24)
    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin} min ago`
    if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`
    if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  const getIssueLabels = (fb: FeedbackItem) => {
    const labels: string[] = []
    if (fb.app_crashed_freezing) labels.push('App Crashed/Freezing')
    if (fb.poor_photo_quality) labels.push('Poor Photo Quality')
    if (fb.gps_tracking_issues) labels.push('GPS Tracking Issues')
    if (fb.show_performance) labels.push('Slow Performance')
    if (fb.other) labels.push('Other')
    return labels
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'admin-info':
        return (
          <Card className="border-gray-200 shadow-sm w-2/3">
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
          <Card className="border-gray-200 shadow-sm w-2/3">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your store details and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="w-full">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Current Password</label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                      className="outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="w-full">
                  <label className="mb-2 block text-sm font-medium text-gray-700">New Password</label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                      className="outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="w-full">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                      className="outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <Button onClick={handlePasswordChange} disabled={changingPassword} className="w-full bg-blue-500 hover:bg-blue-600 sm:w-auto gap-2">
                {changingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                {changingPassword ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        )

      case 'privacy-policy':
        return (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
              
                {privacyData?.updated_at && !isEditingPrivacy && (
                  <p className="text-xs text-gray-400 mt-1">
                    Last updated: {new Date(privacyData.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>
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
                    disabled={savingPrivacy}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-blue-500 hover:bg-blue-600 gap-2"
                    onClick={handleSavePrivacy}
                    disabled={savingPrivacy}
                  >
                    {savingPrivacy && <Loader2 className="h-4 w-4 animate-spin" />}
                    {savingPrivacy ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="prose max-w-none">
              {privacyLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : isEditingPrivacy ? (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Title</label>
                    <Input
                      value={privacyTitle}
                      onChange={(e) => setPrivacyTitle(e.target.value)}
                      placeholder="Privacy Policy Title"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Content</label>
                    <RichTextEditor
                      value={privacyContent}
                      onChange={setPrivacyContent}
                      placeholder="Enter privacy policy content..."
                      minHeight="400px"
                    />
                  </div>
                </div>
              ) : privacyData ? (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{privacyData.title}</h2>
                  <div
                    className="text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-h1:text-xl prose-h2:text-lg prose-a:text-blue-500 prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5 prose-img:rounded-lg prose-img:max-w-full"
                    dangerouslySetInnerHTML={{ __html: privacyData.content }}
                  />
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-gray-500">No privacy policy found.</p>
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

      case 'feedback':
        return (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900">All Feedback</CardTitle>
              <CardDescription>User feedback and reported issues</CardDescription>
            </CardHeader>
            <CardContent>
              {feedbackLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : feedbacks.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">No feedback yet.</p>
              ) : (
                <div className="divide-y divide-gray-200">
                  {feedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      onClick={() => setSelectedFeedback(fb)}
                      className={cn(
                        'cursor-pointer py-4 transition-colors hover:bg-gray-50/50',
                        selectedFeedback?.id === fb.id && 'border-l-3 border-l-blue-500 pl-4 -ml-4 bg-blue-50/30'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {/* Star rating */}
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={cn(
                                    'h-3.5 w-3.5',
                                    s <= fb.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                  )}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-400">{formatTimeAgo(fb.created_at)}</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{fb.comment}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {getIssueLabels(fb).map((label) => (
                              <span key={label} className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-medium text-red-600">
                                {label}
                              </span>
                            ))}
                            {fb.need_quick_support && (
                              <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-medium text-orange-600">
                                Needs Quick Support
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

      {/* Feedback Detail Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
        <DialogContent className="max-w-lg p-0 gap-0 rounded-xl overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <DialogTitle className="text-base font-semibold text-gray-900">Feedback Details</DialogTitle>
            </div>
          </DialogHeader>

          {selectedFeedback && (
            <div className="px-6 py-5 space-y-5">
              {/* Rating */}
              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Rating</h4>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        'h-5 w-5',
                        s <= selectedFeedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      )}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">{selectedFeedback.rating}/5</span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Comment</h4>
                <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedFeedback.comment}</p>
                </div>
              </div>

              {/* Issues */}
              {getIssueLabels(selectedFeedback).length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Reported Issues</h4>
                  <div className="flex flex-wrap gap-2">
                    {getIssueLabels(selectedFeedback).map((label) => (
                      <span key={label} className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Support */}
              {selectedFeedback.need_quick_support && (
                <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-4 py-3">
                  <span className="text-sm font-medium text-orange-700">This user needs quick support</span>
                </div>
              )}

              {/* Date */}
              <div className="text-xs text-gray-400">
                Submitted: {new Date(selectedFeedback.created_at).toLocaleString()}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => setSelectedFeedback(null)} className="rounded-lg px-6">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
