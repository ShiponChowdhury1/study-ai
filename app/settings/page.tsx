'use client'

import { useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { updateAdminInfo, setActiveSection } from '@/redux/slices/settingsSlice'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Bell, MessageSquare, Send, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdminInfo } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const defaultSettingsSections = [
  { id: 'admin-info', label: 'Admin Information' },
  { id: 'change-password', label: 'Change Password' },
  { id: 'notification', label: 'Notification' },
   { id: 'comment', label: 'Comments' },
  { id: 'privacy-policy', label: 'Privacy Policy' },
] as const

const changeEmailSections = [
  { id: 'admin-info', label: 'Admin Information' },
  { id: 'change-password', label: 'Change Password' },
  { id: 'notification', label: 'Notification' },
  { id: 'privacy-policy', label: 'Privacy Policy' },
  { id: 'change-email', label: 'Change Email' },
] as const

const notificationRules = [
  { id: 'failed-ai', title: 'Failed AI Analysis', description: 'Notify when AI analysis fails', enabled: true },
  { id: 'payment-failures', title: 'Payment Failures', description: 'Alert on failed payment transactions', enabled: true },
  { id: 'support-tickets', title: 'High Priority Support Tickets', description: 'Immediate notification for urgent tickets', enabled: true },
  { id: 'flagged-content', title: 'Flagged Content', description: 'Alert when videos are flagged', enabled: true },
]

interface StudentFeedback {
  id: string
  studentName: string
  timeAgo: string
  status: 'NEW' | 'REVIEWING' | 'RESOLVED'
  category: 'BUG' | 'FEATURE REQUEST' | 'QUESTION' | 'OTHER'
  message: string
}

const mockFeedbacks: StudentFeedback[] = [
  {
    id: '1',
    studentName: 'Zhang Wei',
    timeAgo: '2H AGO',
    status: 'NEW',
    category: 'BUG',
    message: 'The physics formulas are sometimes rendered incorrectly on smaller screens.',
  },
  {
    id: '2',
    studentName: 'Li Na',
    timeAgo: '5H AGO',
    status: 'REVIEWING',
    category: 'FEATURE REQUEST',
    message: 'I would love to be able to export my flashcards to Anki.',
  },
  {
    id: '3',
    studentName: 'Wang Yong',
    timeAgo: '1D AGO',
    status: 'RESOLVED',
    category: 'QUESTION',
    message: 'How do I change the difficulty level of the generated quizzes?',
  },
  {
    id: '4',
    studentName: 'Liu Yang',
    timeAgo: '2D AGO',
    status: 'RESOLVED',
    category: 'OTHER',
    message: 'Great app! It really helped me with my finals.',
  },
  {
    id: '5',
    studentName: 'Chen Xia',
    timeAgo: '3D AGO',
    status: 'REVIEWING',
    category: 'BUG',
    message: 'The app crashes when I try to upload large PDF files.',
  },
]

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700 border-blue-200',
  REVIEWING: 'bg-orange-100 text-orange-700 border-orange-200',
  RESOLVED: 'bg-green-100 text-green-700 border-green-200',
}

const categoryColors: Record<string, string> = {
  'BUG': 'bg-purple-100 text-purple-700',
  'FEATURE REQUEST': 'bg-blue-100 text-blue-700',
  'QUESTION': 'bg-indigo-100 text-indigo-700',
  'OTHER': 'bg-gray-100 text-gray-700',
}

export default function SettingsPage() {
  const dispatch = useAppDispatch()
  const { adminInfo, activeSection } = useAppSelector((state) => state.settings)
  const [formData, setFormData] = useState<AdminInfo>(adminInfo)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [notifications, setNotifications] = useState(notificationRules)
  const [isEditingPrivacy, setIsEditingPrivacy] = useState(false)
  const [privacyContent, setPrivacyContent] = useState('')
  const [isChangeEmailMode, setIsChangeEmailMode] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])
  const [commentFilter, setCommentFilter] = useState<'ALL' | 'NEW' | 'REVIEWING' | 'RESOLVED'>('ALL')
  const [selectedFeedback, setSelectedFeedback] = useState<StudentFeedback | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  
  const settingsSections = isChangeEmailMode ? changeEmailSections : defaultSettingsSections

  const handleInputChange = (field: keyof AdminInfo, value: string) => {
    setFormData((prev: AdminInfo) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    dispatch(updateAdminInfo(formData))
  }

  const handlePasswordChange = () => {
    console.log('Password change submitted')
    // Add password change logic
  }

  const toggleNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n)
    )
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

  const handleSendOtp = () => {
    console.log('Sending OTP to:', newEmail)
    // Add OTP sending logic
  }

  const handleResendOtp = () => {
    console.log('Resending OTP')
    setOtpValues(['', '', '', '', '', ''])
    // Add resend OTP logic
  }

  const handleConfirmEmail = () => {
    const otp = otpValues.join('')
    console.log('Confirming email change with OTP:', otp)
    setIsChangeEmailMode(false)
    dispatch(setActiveSection('admin-info'))
    // Add email confirmation logic
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
                    <AvatarImage src="/logo/shipon.jpg" />
                    <AvatarFallback className="bg-blue-500 text-white">AD</AvatarFallback>
                  </Avatar>
                  <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white shadow-md hover:bg-blue-600">
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
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Phone Number</label>
                  <Input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full bg-blue-500 hover:bg-blue-600 sm:w-auto">
                Confirm
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

      case 'notification':
        return (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <Bell className="h-5 w-5 text-orange-500" />
                </div>
                <CardTitle>Notification Rules</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{notification.title}</h4>
                    <p className="text-sm text-gray-500">{notification.description}</p>
                  </div>
                  <Switch
                    checked={notification.enabled}
                    onCheckedChange={() => toggleNotification(notification.id)}
                  />
                </div>
              ))}
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
            <CardHeader>
              <CardTitle>Change Mail</CardTitle>
              <CardDescription>Update your store details and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">New Mail</label>
                  <div className="relative">
                    <Input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="admin@luxestore.com"
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-900"
                    >
                      Send OTP
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">OTP Verification</label>
                  <div className="flex gap-2">
                    {otpValues.map((value, index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={value}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        className="w-12 h-12 text-center text-lg"
                      />
                    ))}
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="text-gray-600">Didn&apos;t receive code ? </span>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-blue-500 hover:text-blue-600 font-medium"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
              </div>
              <Button onClick={handleConfirmEmail} className="w-full bg-blue-500 hover:bg-blue-600 sm:w-auto">
                Confirm
              </Button>
            </CardContent>
          </Card>
        )

      case 'comment':
        return (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Student Voice</CardTitle>
                    <CardDescription>Review and respond to student feedback</CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['ALL', 'NEW', 'REVIEWING', 'RESOLVED'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setCommentFilter(filter)}
                      className={cn(
                        'rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
                        commentFilter === filter
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredFeedbacks.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">No feedback found for this filter.</p>
              ) : (
                filteredFeedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    onClick={() => setSelectedFeedback(feedback)}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                  >
                    <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-300" onClick={(e) => e.stopPropagation()} />
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-blue-100 text-xs text-blue-700">
                        {feedback.studentName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{feedback.studentName}</span>
                        <span className="text-xs text-gray-400">{feedback.timeAgo}</span>
                        <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold', statusColors[feedback.status])}>
                          {feedback.status}
                        </span>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', categoryColors[feedback.category])}>
                          {feedback.category}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-1">{feedback.message}</p>
                    </div>
                    <svg className="mt-2 h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                ))
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
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback className="bg-orange-200 text-2xl">DW</AvatarFallback>
                  </Avatar>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Dexter Watts</h3>
                <p className="text-sm text-gray-500">Update your store details and branding</p>
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
        <DialogContent className="max-w-lg p-0 gap-0">
          <DialogHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <DialogTitle className="text-base font-semibold">RESPONSE TO STUDENT</DialogTitle>
            </div>
            <button onClick={handleDiscard} className="rounded-full p-1 hover:bg-gray-100">
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </DialogHeader>

          <div className="px-6 py-4 space-y-4">
            {/* Student Inquiry */}
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Student Inquiry</h4>
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-blue-100 text-[10px] text-blue-700">
                      {selectedFeedback?.studentName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-900">{selectedFeedback?.studentName}</span>
                  <span className="text-xs text-gray-400">{selectedFeedback?.timeAgo}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">&ldquo;{selectedFeedback?.message}&rdquo;</p>
              </div>
            </div>

            {/* Compose Reply */}
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Compose Reply</h4>
              <Textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your response here..."
                className="min-h-[120px] resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
            <Button variant="outline" onClick={handleDiscard} className="gap-2">
              <X className="h-4 w-4" />
              Discard
            </Button>
            <Button onClick={handleSendResponse} className="gap-2 bg-blue-500 hover:bg-blue-600">
              <Send className="h-4 w-4" />
              Send Response
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
