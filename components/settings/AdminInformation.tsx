'use client'

import { useState, useRef, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { updateAdminProfile } from '@/redux/slices/settingsSlice'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Loader2 } from 'lucide-react'
import { AdminInfo } from '@/types'
import { toast } from 'react-toastify'
import { extractError } from '@/components/settings/utils'

interface AdminInformationProps {
  onChangeEmail: () => void
}

export function AdminInformation({ onChangeEmail }: AdminInformationProps) {
  const dispatch = useAppDispatch()
  const { adminInfo, updatingProfile } = useAppSelector((state) => state.settings)
  const [formData, setFormData] = useState<AdminInfo>(adminInfo)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setFormData(adminInfo)
  }, [adminInfo])

  const handleInputChange = (field: keyof AdminInfo, value: string) => {
    setFormData((prev: AdminInfo) => ({ ...prev, [field]: value }))
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

  return (
    <Card className="border-gray-200 shadow-sm w-full lg:w-2/3">
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
              onClick={onChangeEmail}
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
}
