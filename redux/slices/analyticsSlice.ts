import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AnalyticsData } from '@/types'

interface AnalyticsState {
  data: AnalyticsData
  loading: boolean
}

const initialState: AnalyticsState = {
  data: {
    quizGenerationTrend: [
      { week: 'Week 1', value: 145 },
      { week: 'Week 2', value: 170 },
      { week: 'Week 3', value: 160 },
      { week: 'Week 4', value: 145 },
      { week: 'Week 5', value: 190 },
      { week: 'Week 6', value: 230 },
      { week: 'Week 7', value: 260 },
      { week: 'Week 8', value: 295 },
    ],
    flashcardEngagement: [
      { week: 'Week 1', value: 2800 },
      { week: 'Week 2', value: 3200 },
      { week: 'Week 3', value: 3000 },
      { week: 'Week 4', value: 2900 },
      { week: 'Week 5', value: 3400 },
      { week: 'Week 6', value: 3600 },
      { week: 'Week 7', value: 3500 },
      { week: 'Week 8', value: 3900 },
    ],
    mostActiveStudent: {
      name: 'Emma Johnson',
      quizzesCompleted: 127,
    },
    mostUsedDocument: {
      title: 'Machine Learning Basics',
      timesAccessed: 342,
    },
    peakUsageTime: {
      timeRange: '2:00 PM - 4:00 PM',
      averageActiveUsers: 890,
    },
  },
  loading: false,
}

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    updateAnalytics: (state, action: PayloadAction<Partial<AnalyticsData>>) => {
      state.data = { ...state.data, ...action.payload }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const { updateAnalytics, setLoading } = analyticsSlice.actions
export default analyticsSlice.reducer
