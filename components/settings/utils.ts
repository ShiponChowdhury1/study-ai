export function extractError(data: Record<string, unknown>): string {
  if (typeof data === 'string') return data
  if (data.message) return String(data.message)
  if (data.detail) return String(data.detail)
  if (data.error) return String(data.error)
  for (const key of Object.keys(data)) {
    const val = data[key]
    if (Array.isArray(val) && val.length > 0) return String(val[0])
    if (typeof val === 'string') return val
  }
  return 'Something went wrong'
}

export function formatTimeAgo(dateStr: string): string {
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

export interface FeedbackItem {
  id: number
  user_name?: string
  user_email?: string
  rating: number
  app_crashed_freezing: boolean
  poor_photo_quality: boolean
  gps_tracking_issues: boolean
  show_performance: boolean
  other: boolean
  comment: string
  need_quick_support: boolean
  created_at: string
  is_responded?: boolean
}

export interface PrivacyPolicyData {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
}

export function getIssueLabels(fb: FeedbackItem): string[] {
  const labels: string[] = []
  if (fb.app_crashed_freezing) labels.push('App Crashed/Freezing')
  if (fb.poor_photo_quality) labels.push('Poor Photo Quality')
  if (fb.gps_tracking_issues) labels.push('GPS Tracking Issues')
  if (fb.show_performance) labels.push('Slow Performance')
  if (fb.other) labels.push('Other')
  return labels
}
