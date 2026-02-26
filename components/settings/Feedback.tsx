/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, MessageSquare, Send, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { FeedbackItem, formatTimeAgo } from '@/components/settings/utils'
import { toast } from 'react-toastify'

const avatarColors = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-purple-600',
  'bg-orange-500',
  'bg-pink-600',
  'bg-teal-600',
  'bg-indigo-600',
  'bg-rose-600',
]

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function Feedback() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const fetchFeedbacks = async () => {
    setFeedbackLoading(true)
    try {
      const res = await api('/dashboard/feedback/')
      const data = await res.json()
      
      if (res.ok) {
        // Get replied feedback IDs from localStorage
        const repliedIds = JSON.parse(localStorage.getItem('repliedFeedbacks') || '[]')
        
        // Fix undefined is_responded field by defaulting to false
        const feedbacksWithDefaults = (data.results || []).map((fb: { is_responded: any; id: any }) => ({
          ...fb,
          is_responded: fb.is_responded ?? repliedIds.includes(fb.id)
        }))
        
        setFeedbacks(feedbacksWithDefaults)
      }
    } catch (error) {
      console.error('❌ Fetch feedbacks error:', error)
    } finally {
      setFeedbackLoading(false)
    }
  }

  const handleSelectFeedback = (fb: FeedbackItem) => {
    setSelectedFeedback(fb)
    setReplyText('')
  }

  const handleDiscard = () => {
    setSelectedFeedback(null)
    setReplyText('')
  }

  const handleSendResponse = async () => {
    if (!selectedFeedback || !replyText.trim()) return
    setSending(true)
    
    try {
      const res = await api(`/dashboard/feedback/${selectedFeedback.id}/reply/`, {
        method: 'POST',
        body: JSON.stringify({ message: replyText }),
      })
      
      if (res.ok) {
        // Save replied feedback ID to localStorage
        const repliedIds = JSON.parse(localStorage.getItem('repliedFeedbacks') || '[]')
        
        if (!repliedIds.includes(selectedFeedback.id)) {
          repliedIds.push(selectedFeedback.id)
          localStorage.setItem('repliedFeedbacks', JSON.stringify(repliedIds))
        }
        
        // Update local state immediately to mark as responded
        setFeedbacks((prev) =>
          prev.map((fb) =>
            fb.id === selectedFeedback.id ? { ...fb, is_responded: true } : fb
          )
        )
        
        setSelectedFeedback(null)
        setReplyText('')
        toast.success('Reply sent successfully!')
      } else {
        const responseData = await res.json()
        toast.error(`Failed to send reply: ${responseData.message || 'Please try again.'}`)
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const pendingCount = feedbacks.filter((fb) => !fb.is_responded).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="flex items-center justify-between py-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Student Comments &amp; Feedback</h2>
            <p className="text-sm text-gray-500 mt-1">
              Review and respond to student inquiries and suggestions
            </p>
          </div>
          {pendingCount > 0 && (
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-600">
              {pendingCount} Pending Response{pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </CardContent>
      </Card>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — Feedback List */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">
              All Comments &amp; Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            {feedbackLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : feedbacks.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No feedback yet.</p>
            ) : (
              <div className="space-y-1">
                {feedbacks.map((fb) => {
                  const isSelected = selectedFeedback?.id === fb.id
                  const displayName = fb.user_name || 'Unknown User'
                  return (
                    <div
                      key={fb.id}
                      onClick={() => handleSelectFeedback(fb)}
                      className={cn(
                        'cursor-pointer rounded-xl p-4 transition-colors',
                        isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div
                          className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white',
                            isSelected ? 'bg-white/20' : getAvatarColor(displayName)
                          )}
                        >
                          {getInitials(displayName)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={cn(
                                  'text-sm font-semibold truncate',
                                  isSelected ? 'text-white' : 'text-gray-900'
                                )}
                              >
                                {displayName}
                              </span>
                              <span
                                className={cn(
                                  'text-xs whitespace-nowrap',
                                  isSelected ? 'text-white/70' : 'text-gray-400'
                                )}
                              >
                                {formatTimeAgo(fb.created_at)}
                              </span>
                            </div>
                            <span
                              className={cn(
                                'inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold shrink-0',
                                fb.is_responded
                                  ? 'bg-green-100 text-green-700'
                                  : isSelected
                                    ? 'bg-white/20 text-white'
                                    : 'bg-blue-100 text-blue-700'
                              )}
                            >
                              {fb.is_responded ? 'RESPONDED' : 'NEW'}
                            </span>
                          </div>
                          <p
                            className={cn(
                              'mt-1.5 text-sm leading-relaxed',
                              isSelected ? 'text-white/80' : 'text-gray-600'
                            )}
                          >
                            {fb.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right — Response Panel */}
        {selectedFeedback && (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-gray-500" />
                <CardTitle className="text-base font-semibold text-gray-900">
                  Response to Student
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDiscard}
                className="h-8 w-8 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Student Inquiry */}
              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Student Inquiry
                </h4>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm text-gray-700 italic leading-relaxed">
                    &ldquo;{selectedFeedback.comment}&rdquo;
                  </p>
                </div>
              </div>

              {/* Compose Reply */}
              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Compose Reply
                </h4>
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-4 pt-3 pb-1">
                    <p className="text-sm text-gray-900 font-medium">
                      Hi {(selectedFeedback.user_name || 'Student').split(' ')[0]},
                    </p>
                  </div>
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response here..."
                    className="border-0 focus-visible:ring-0 resize-none min-h-30 shadow-none rounded-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleDiscard}
                  className="rounded-lg px-6"
                >
                  Discard
                </Button>
                <Button
                  onClick={handleSendResponse}
                  disabled={!replyText.trim() || sending}
                  className="rounded-lg px-6 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send Response
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
