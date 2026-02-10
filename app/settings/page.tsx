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
import { Camera, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdminInfo } from '@/types'

const settingsSections = [
  { id: 'admin-info', label: 'Admin Information' },
  { id: 'change-password', label: 'Change Password' },
  { id: 'notification', label: 'Notification' },
  { id: 'privacy-policy', label: 'Privacy Policy' },
  { id: 'terms-conditions', label: 'Terms & Conditions' },
] as const

const notificationRules = [
  { id: 'failed-ai', title: 'Failed AI Analysis', description: 'Notify when AI analysis fails', enabled: true },
  { id: 'payment-failures', title: 'Payment Failures', description: 'Alert on failed payment transactions', enabled: true },
  { id: 'support-tickets', title: 'High Priority Support Tickets', description: 'Immediate notification for urgent tickets', enabled: true },
  { id: 'flagged-content', title: 'Flagged Content', description: 'Alert when videos are flagged', enabled: true },
]

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
  const [isEditingTerms, setIsEditingTerms] = useState(false)
  const [privacyContent, setPrivacyContent] = useState('')
  const [termsContent, setTermsContent] = useState('')

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

  const handleEditTerms = () => {
    setIsEditingTerms(true)
  }

  const handleSaveTerms = () => {
    console.log('Terms & conditions updated:', termsContent)
    setIsEditingTerms(false)
    // Add save logic
  }

  const handleCancelTerms = () => {
    setIsEditingTerms(false)
    setTermsContent('')
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

      case 'terms-conditions':
        return (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Terms & Conditions</CardTitle>
              {!isEditingTerms ? (
                <Button 
                  className="bg-blue-500 hover:bg-blue-600"
                  onClick={handleEditTerms}
                >
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={handleCancelTerms}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={handleSaveTerms}
                  >
                    Save
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="prose max-w-none">
              {isEditingTerms ? (
                <Textarea
                  value={termsContent}
                  onChange={(e) => setTermsContent(e.target.value)}
                  className="min-h-[500px] font-mono text-sm"
                  placeholder="Enter terms & conditions content..."
                />
              ) : (
              <>
              <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
              <p className="text-gray-600 text-sm">
                By accessing and using StudyAI, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
              
              <h2 className="mt-6 text-lg font-semibold">2. Use License</h2>
              <p className="text-gray-600 text-sm">
                Permission is granted to temporarily access the materials (information or software) on StudyAI for personal, non-commercial transitory viewing only.
              </p>
              
              <h2 className="mt-6 text-lg font-semibold">3. Disclaimer</h2>
              <p className="text-gray-600 text-sm">
                The materials on StudyAI are provided on an &apos;as is&apos; basis. StudyAI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.
              </p>
              
              <h2 className="mt-6 text-lg font-semibold">4. Limitations</h2>
              <p className="text-gray-600 text-sm">
                In no event shall StudyAI or its suppliers be liable for any damages arising out of the use or inability to use the materials on StudyAI.
              </p>
              
              <h2 className="mt-6 text-lg font-semibold">5. Revisions</h2>
              <p className="text-gray-600 text-sm">
                The materials appearing on StudyAI could include technical, typographical, or photographic errors. StudyAI does not warrant that any of the materials on its website are accurate, complete or current.
              </p>
              </>
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
    </div>
  )
}
