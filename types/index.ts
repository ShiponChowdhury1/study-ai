// User types
export interface User {
  id: number
  full_name: string
  email: string
  join_date: string
  status: 'Active' | 'Blocked'
  is_active: boolean
}

// Content types
export interface Content {
  id: number
  title: string
  content_type: string
  source_file: string
  created_date: string
}

// Dashboard stats types
export interface DashboardStats {
  totalStudents: number
  totalStudentsChange: number
  activeStudents: number
  activeStudentsChange: number
  blockedStudents: number
  blockedStudentsChange: number
  totalQuizzes: number
  totalQuizzesChange: number
  totalFlashcards: number
  totalFlashcardsChange: number
  todaysUploads: number
  todaysUploadsChange: number
}

// Chart data types
export interface ChartDataPoint {
  name: string
  quizzes?: number
  flashcards?: number
  value?: number
  [key: string]: string | number | undefined
}

export interface WeeklyData {
  week: string
  value: number
  [key: string]: string | number | undefined
}

// Analytics types
export interface AnalyticsData {
  quizGenerationTrend: WeeklyData[]
  flashcardEngagement: WeeklyData[]
  mostActiveStudent: {
    name: string
    quizzesCompleted: number
  }
  mostUsedDocument: {
    title: string
    timesAccessed: number
  }
  peakUsageTime: {
    timeRange: string
    averageActiveUsers: number
  }
}

// Settings types
export interface AdminInfo {
  fullName: string
  email: string
  phoneNumber: string
  avatar?: string
}

// Sidebar types
export interface SidebarItem {
  id: string
  label: string
  icon: string
  href: string
}
