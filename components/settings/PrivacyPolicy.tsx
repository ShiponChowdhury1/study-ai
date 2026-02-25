'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'react-toastify'
import { RichTextEditor } from '@/components/shared/RichTextEditor'
import { extractError, PrivacyPolicyData } from '@/components/settings/utils'

export function PrivacyPolicy() {
  const [isEditing, setIsEditing] = useState(false)
  const [privacyContent, setPrivacyContent] = useState('')
  const [privacyTitle, setPrivacyTitle] = useState('')
  const [privacyData, setPrivacyData] = useState<PrivacyPolicyData | null>(null)
  const [privacyLoading, setPrivacyLoading] = useState(false)
  const [savingPrivacy, setSavingPrivacy] = useState(false)

  useEffect(() => {
    fetchPrivacyPolicy()
  }, [])

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

  const handleEdit = () => {
    if (privacyData) {
      setPrivacyTitle(privacyData.title)
      setPrivacyContent(privacyData.content)
    }
    setIsEditing(true)
  }

  const handleSave = async () => {
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
        setIsEditing(false)
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

  const handleCancel = () => {
    setIsEditing(false)
    if (privacyData) {
      setPrivacyTitle(privacyData.title)
      setPrivacyContent(privacyData.content)
    }
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          {privacyData?.updated_at && !isEditing && (
            <p className="text-xs text-gray-400 mt-1">
              Last updated: {new Date(privacyData.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>
        {!isEditing ? (
          <Button
            className="bg-blue-500 hover:bg-blue-600"
            onClick={handleEdit}
          >
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={savingPrivacy}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 gap-2"
              onClick={handleSave}
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
        ) : isEditing ? (
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
}
