import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AdminInfo } from '@/types'

interface SettingsState {
  adminInfo: AdminInfo
  activeSection: 'admin-info' | 'change-password' | 'notification' | 'privacy-policy' | 'terms-conditions'
  loading: boolean
}

const initialState: SettingsState = {
  adminInfo: {
    fullName: 'Admin User',
    email: 'admin@luxestore.com',
    phoneNumber: '+1 (555) 000-0000',
    avatar: undefined,
  },
  activeSection: 'admin-info',
  loading: false,
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
})

export const { updateAdminInfo, setActiveSection, setLoading } = settingsSlice.actions
export default settingsSlice.reducer
