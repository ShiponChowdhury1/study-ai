import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { User } from '@/types'
import { api } from '@/lib/api'

interface UsersState {
  users: User[]
  filter: 'all' | 'active' | 'blocked'
  searchQuery: string
  loading: boolean
  error: string | null
  togglingId: number | null
}

const initialState: UsersState = {
  users: [],
  filter: 'all',
  searchQuery: '',
  loading: false,
  error: null,
  togglingId: null,
}

// Async thunk to fetch users from the backend
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api('/dashboard/users/')
      if (!res.ok) {
        const err = await res.json()
        return rejectWithValue(err.message || err.detail || 'Failed to fetch users')
      }
      const data = await res.json()
      return data.results as User[]
    } catch {
      return rejectWithValue('Network error. Please try again.')
    }
  }
)

// Async thunk to toggle block/unblock a user
export const toggleBlockUser = createAsyncThunk(
  'users/toggleBlockUser',
  async (userId: number, { rejectWithValue }) => {
    try {
      const res = await api(`/dashboard/users/${userId}/toggle-block/`, {
        method: 'POST',
      })
      if (!res.ok) {
        const err = await res.json()
        return rejectWithValue(err.message || err.detail || 'Failed to toggle user status')
      }
      const data = await res.json()
      return { userId, is_active: data.is_active, message: data.message } as {
        userId: number
        is_active: boolean
        message: string
      }
    } catch {
      return rejectWithValue('Network error. Please try again.')
    }
  }
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<'all' | 'active' | 'blocked'>) => {
      state.filter = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Toggle block
      .addCase(toggleBlockUser.pending, (state, action) => {
        state.togglingId = action.meta.arg
      })
      .addCase(toggleBlockUser.fulfilled, (state, action) => {
        state.togglingId = null
        const user = state.users.find(u => u.id === action.payload.userId)
        if (user) {
          user.is_active = action.payload.is_active
          user.status = action.payload.is_active ? 'Active' : 'Blocked'
        }
      })
      .addCase(toggleBlockUser.rejected, (state) => {
        state.togglingId = null
      })
  },
})

export const { setFilter, setSearchQuery } = usersSlice.actions
export default usersSlice.reducer
