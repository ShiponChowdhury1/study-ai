import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { AdminInfo } from '@/types'
import { api } from '@/lib/api'
import { updateUserProfile } from './authSlice'

export const fetchAdminProfile = createAsyncThunk(
  'settings/fetchAdminProfile',
  async (_, { dispatch }) => {
    const res = await api('/me/')
    if (!res.ok) throw new Error('Failed to fetch profile')
    const data = await res.json()
    
    // Update auth user state as well
    dispatch(updateUserProfile({
      full_name: data.full_name,
      avatar: data.avatar,
      email: data.email,
    }))
    
    return {
      fullName: data.full_name || '',
      email: data.email || '',
      phoneNumber: '',
      avatar: data.avatar || undefined,
    } as AdminInfo
  }
)

export const updateAdminProfile = createAsyncThunk(
  'settings/updateAdminProfile',
  async (payload: { fullName: string; avatarFile?: File }, { dispatch }) => {
    const formData = new FormData()
    formData.append('full_name', payload.fullName)
    if (payload.avatarFile) {
      formData.append('avatar', payload.avatarFile)
    }
    const res = await api('/me/edit/', {
      method: 'PUT',
      body: formData,
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(JSON.stringify(err))
    }
    const data = await res.json()
    
    // Update auth user state as well
    dispatch(updateUserProfile({
      full_name: data.full_name,
      avatar: data.avatar,
      email: data.email,
    }))
    
    return {
      fullName: data.full_name || '',
      email: data.email || '',
      phoneNumber: '',
      avatar: data.avatar || undefined,
    } as AdminInfo
  }
)

interface SettingsState {
  adminInfo: AdminInfo
  activeSection: 'admin-info' | 'change-password' | 'privacy-policy' | 'change-email' | 'feedback'
  loading: boolean
  profileLoading: boolean
  updatingProfile: boolean
}

const initialState: SettingsState = {
  adminInfo: {
    fullName: '',
    email: '',
    phoneNumber: '',
    avatar: undefined,
  },
  activeSection: 'admin-info',
  loading: false,
  profileLoading: false,
  updatingProfile: false,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateAdminInfo: (state, action: PayloadAction<Partial<AdminInfo>>) => {
      state.adminInfo = { ...state.adminInfo, ...action.payload }
    },
    setActiveSection: (state, action: PayloadAction<SettingsState['activeSection']>) => {
      state.activeSection = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProfile.pending, (state) => {
        state.profileLoading = true
      })
      .addCase(fetchAdminProfile.fulfilled, (state, action) => {
        state.adminInfo = action.payload
        state.profileLoading = false
      })
      .addCase(fetchAdminProfile.rejected, (state) => {
        state.profileLoading = false
      })
      .addCase(updateAdminProfile.pending, (state) => {
        state.updatingProfile = true
      })
      .addCase(updateAdminProfile.fulfilled, (state, action) => {
        state.adminInfo = action.payload
        state.updatingProfile = false
      })
      .addCase(updateAdminProfile.rejected, (state) => {
        state.updatingProfile = false
      })
  },
})

export const { updateAdminInfo, setActiveSection, setLoading } = settingsSlice.actions
export default settingsSlice.reducer
