import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '@/types'

interface UsersState {
  users: User[]
  filter: 'all' | 'active' | 'blocked'
  searchQuery: string
  loading: boolean
}

const initialUsers: User[] = [
  { id: '1', name: 'Emma Johnson', email: 'emma.j@university.edu', joinDate: 'Jan 15, 2026', status: 'Active' },
  { id: '2', name: 'Michael Chen', email: 'michael.chen@university.edu', joinDate: 'Jan 18, 2026', status: 'Active' },
  { id: '3', name: 'Sarah Williams', email: 'sarah.w@university.edu', joinDate: 'Jan 20, 2026', status: 'Blocked' },
  { id: '4', name: 'James Brown', email: 'james.brown@university.edu', joinDate: 'Jan 22, 2026', status: 'Active' },
  { id: '5', name: 'Lisa Anderson', email: 'lisa.a@university.edu', joinDate: 'Jan 25, 2026', status: 'Active' },
  { id: '6', name: 'David Martinez', email: 'david.m@university.edu', joinDate: 'Jan 28, 2026', status: 'Blocked' },
  { id: '7', name: 'Jennifer Taylor', email: 'jennifer.t@university.edu', joinDate: 'Feb 1, 2026', status: 'Active' },
  { id: '8', name: 'Robert Garcia', email: 'robert.g@university.edu', joinDate: 'Feb 3, 2026', status: 'Active' },
  { id: '9', name: 'Maria Rodriguez', email: 'maria.r@university.edu', joinDate: 'Feb 5, 2026', status: 'Active' },
  { id: '10', name: 'William Davis', email: 'william.d@university.edu', joinDate: 'Feb 7, 2026', status: 'Active' },
]

const initialState: UsersState = {
  users: initialUsers,
  filter: 'all',
  searchQuery: '',
  loading: false,
}

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
    toggleUserStatus: (state, action: PayloadAction<string>) => {
      const user = state.users.find(u => u.id === action.payload)
      if (user) {
        user.status = user.status === 'Active' ? 'Blocked' : 'Active'
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const { setFilter, setSearchQuery, toggleUserStatus, setLoading } = usersSlice.actions
export default usersSlice.reducer
