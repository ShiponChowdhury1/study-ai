import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Content } from '@/types'
import { api } from '@/lib/api'

interface ContentState {
  contents: Content[]
  activeTab: 'quizzes' | 'flashcards'
  loading: boolean
  error: string | null
  count: number
  page: number
  next: string | null
  previous: string | null
  deletingId: number | null
}

const initialState: ContentState = {
  contents: [],
  activeTab: 'quizzes',
  loading: false,
  error: null,
  count: 0,
  page: 1,
  next: null,
  previous: null,
  deletingId: null,
}

// Async thunk to fetch quizzes/flashcards
export const fetchContent = createAsyncThunk(
  'content/fetchContent',
  async (
    { quizType, page }: { quizType: 'quiz' | 'flashcard'; page?: number },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams({ quiz_type: quizType })
      if (page && page > 1) params.set('page', page.toString())
      const res = await api(`/dashboard/quizzes/?${params.toString()}`)
      if (!res.ok) {
        const err = await res.json()
        return rejectWithValue(err.message || err.detail || 'Failed to fetch content')
      }
      const data = await res.json()
      return data as {
        count: number
        next: string | null
        previous: string | null
        results: Content[]
      }
    } catch {
      return rejectWithValue('Network error. Please try again.')
    }
  }
)

// Async thunk to delete a quiz/flashcard
export const deleteContent = createAsyncThunk(
  'content/deleteContent',
  async (contentId: number, { rejectWithValue }) => {
    try {
      const res = await api(`/dashboard/quizzes/${contentId}/`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json()
        return rejectWithValue(err.message || err.detail || 'Failed to delete content')
      }
      return contentId
    } catch {
      return rejectWithValue('Network error. Please try again.')
    }
  }
)

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<'quizzes' | 'flashcards'>) => {
      state.activeTab = action.payload
      state.page = 1
      state.contents = []
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchContent.fulfilled, (state, action) => {
        state.loading = false
        state.contents = action.payload.results
        state.count = action.payload.count
        state.next = action.payload.next
        state.previous = action.payload.previous
      })
      .addCase(fetchContent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Delete content
      .addCase(deleteContent.pending, (state, action) => {
        state.deletingId = action.meta.arg
      })
      .addCase(deleteContent.fulfilled, (state, action) => {
        state.deletingId = null
        state.contents = state.contents.filter(c => c.id !== action.payload)
        state.count = Math.max(0, state.count - 1)
      })
      .addCase(deleteContent.rejected, (state) => {
        state.deletingId = null
      })
  },
})

export const { setActiveTab, setPage } = contentSlice.actions
export default contentSlice.reducer
