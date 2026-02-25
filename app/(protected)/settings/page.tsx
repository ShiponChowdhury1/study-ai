'use client'

import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { setActiveSection, fetchAdminProfile } from '@/redux/slices/settingsSlice'
import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { AdminInformation, ChangePassword, Feedback, PrivacyPolicy, ChangeEmail } from '@/components/settings'

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

export default function SettingsPage() {
  const dispatch = useAppDispatch()
  const { adminInfo, activeSection, profileLoading } = useAppSelector((state) => state.settings)
  const [isChangeEmailMode, setIsChangeEmailMode] = useState(false)

  useEffect(() => {
    dispatch(fetchAdminProfile())
  }, [dispatch])

  const settingsSections = isChangeEmailMode ? changeEmailSections : defaultSettingsSections

  const handleChangeEmail = () => {
    setIsChangeEmailMode(true)
    dispatch(setActiveSection('change-email'))
  }

  const handleChangeEmailDone = () => {
    setIsChangeEmailMode(false)
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'admin-info':
        return <AdminInformation onChangeEmail={handleChangeEmail} />
      case 'change-password':
        return <ChangePassword />
      case 'privacy-policy':
        return <PrivacyPolicy />
      case 'change-email':
        return <ChangeEmail onDone={handleChangeEmailDone} />
      case 'feedback':
        return <Feedback />
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
    </div>
  )
}
