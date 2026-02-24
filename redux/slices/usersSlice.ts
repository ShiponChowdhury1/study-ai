import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { User } from '@/types'

interface UsersState {
  users: User[]
  filter: 'all' | 'active' | 'blocked'
  searchQuery: string
  loading: boolean
  error: string | null
}

const initialState: UsersState = {
  users: [],
  filter: 'all',
  searchQuery: '',
  loading: false,
  error: null,
}

// Async thunk to fetch users from the backend
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/proxy/users')
      if (!res.ok) {
        const err = await res.json()
        return rejectWithValue(err.message || 'Failed to fetch users')
      }
      const data = await res.json()
      // API returns { count, next, previous, results: User[] }
      return data.results as User[]
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
    toggleUserStatus: (state, action: PayloadAction<number>) => {
      const user = state.users.find(u => u.id === action.payload)
      if (user) {
        const isNowActive = user.status !== 'Active'
        user.status = isNowActive ? 'Active' : 'Blocked'
        user.is_active = isNowActive
      }
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
  },
})

export const { setFilter, setSearchQuery, toggleUserStatus } = usersSlice.actions
export default usersSlice.reducer
