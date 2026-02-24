import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { DashboardStats, ChartDataPoint } from '@/types'

// API response types matching backend
interface DashboardApiResponse {
  stats: {
    total_students: number
    active_students: number
    blocked_students: number
    total_quizzes: number
    total_flashcards: number
    today_uploads: number
    students_change: number
    active_change: number
    blocked_change: number
    quizzes_change: number
    flashcards_change: number
    uploads_change: number
  }
  quiz_flashcard_chart: {
    labels: string[]
    flashcards: number[]
    quizzes: number[]
  }
  daily_active_students: {
    labels: string[]
    students: number[]
  }
}

// Async thunk to fetch dashboard data
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/proxy/dashboard')
      const data = await res.json()

      if (!res.ok) {
        return rejectWithValue(data.message || 'Failed to fetch dashboard data')
      }

      return data as DashboardApiResponse
    } catch {
      return rejectWithValue('Network error. Please try again.')
    }
  }
)

interface DashboardState {
  stats: DashboardStats
  quizFlashcardData: ChartDataPoint[]
  dailyActiveStudents: ChartDataPoint[]
  loading: boolean
  error: string | null
}

const initialState: DashboardState = {
  stats: {
    totalStudents: 0,
    totalStudentsChange: 0,
    activeStudents: 0,
    activeStudentsChange: 0,
    blockedStudents: 0,
    blockedStudentsChange: 0,
    totalQuizzes: 0,
    totalQuizzesChange: 0,
    totalFlashcards: 0,
    totalFlashcardsChange: 0,
    todaysUploads: 0,
    todaysUploadsChange: 0,
  },
  quizFlashcardData: [],
  dailyActiveStudents: [],
  loading: false,
  error: null,
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        const data = action.payload

        // Map stats from snake_case API response to camelCase
        state.stats = {
          totalStudents: data.stats.total_students,
          totalStudentsChange: data.stats.students_change,
          activeStudents: data.stats.active_students,
          activeStudentsChange: data.stats.active_change,
          blockedStudents: data.stats.blocked_students,
          blockedStudentsChange: data.stats.blocked_change,
          totalQuizzes: data.stats.total_quizzes,
          totalQuizzesChange: data.stats.quizzes_change,
          totalFlashcards: data.stats.total_flashcards,
          totalFlashcardsChange: data.stats.flashcards_change,
          todaysUploads: data.stats.today_uploads,
          todaysUploadsChange: data.stats.uploads_change,
        }

        // Map quiz_flashcard_chart to ChartDataPoint[]
        state.quizFlashcardData = data.quiz_flashcard_chart.labels.map((label, i) => ({
          name: label,
          quizzes: data.quiz_flashcard_chart.quizzes[i],
          flashcards: data.quiz_flashcard_chart.flashcards[i],
        }))

        // Map daily_active_students to ChartDataPoint[]
        state.dailyActiveStudents = data.daily_active_students.labels.map((label, i) => ({
          name: label,
          value: data.daily_active_students.students[i],
        }))

        state.loading = false
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default dashboardSlice.reducer
