import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DashboardStats, ChartDataPoint } from '@/types'

interface DashboardState {
  stats: DashboardStats
  quizFlashcardData: ChartDataPoint[]
  dailyActiveStudents: ChartDataPoint[]
  loading: boolean
}

const initialState: DashboardState = {
  stats: {
    totalStudents: 2847,
    totalStudentsChange: 12.5,
    activeStudents: 2603,
    activeStudentsChange: 8.3,
    blockedStudents: 244,
    blockedStudentsChange: -2.1,
    totalQuizzes: 15392,
    totalQuizzesChange: 15.7,
    totalFlashcards: 28541,
    totalFlashcardsChange: 18.2,
    todaysUploads: 127,
    todaysUploadsChange: 24.5,
  },
  quizFlashcardData: [
    { name: 'Jan 15', quizzes: 150, flashcards: 280 },
    { name: 'Jan 22', quizzes: 120, flashcards: 380 },
    { name: 'Jan 29', quizzes: 180, flashcards: 320 },
    { name: 'Feb 5', quizzes: 200, flashcards: 400 },
    { name: 'Feb 12', quizzes: 170, flashcards: 450 },
    { name: 'Feb 19', quizzes: 220, flashcards: 480 },
    { name: 'Feb 26', quizzes: 250, flashcards: 520 },
  ],
  dailyActiveStudents: [
    { name: 'Mon', value: 1800 },
    { name: 'Tue', value: 2000 },
    { name: 'Wed', value: 1900 },
    { name: 'Thu', value: 2200 },
    { name: 'Fri', value: 2400 },
    { name: 'Sat', value: 1400 },
    { name: 'Sun', value: 1700 },
  ],
  loading: false,
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    updateStats: (state, action: PayloadAction<Partial<DashboardStats>>) => {
      state.stats = { ...state.stats, ...action.payload }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const { updateStats, setLoading } = dashboardSlice.actions
export default dashboardSlice.reducer
