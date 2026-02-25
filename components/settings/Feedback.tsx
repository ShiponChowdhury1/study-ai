'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, MessageSquare, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { FeedbackItem, formatTimeAgo, getIssueLabels } from '@/components/settings/utils'

export function Feedback() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null)

  useEffect(() => {
    fetchFeedbacks()
  }, [])

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

  return (
    <>
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
    </>
  )
}
