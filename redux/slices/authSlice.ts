import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface AuthUser {
  id: number
  email: string
  full_name: string
  avatar: string | null
  is_email_verified: boolean
  quiz_difficulty: string
  created_at: string
  wechat_openid: string | null
  wechat_unionid: string | null
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  // Forgot password flow
  forgotPasswordEmail: string | null
  otpSent: boolean
  otpVerified: boolean
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  forgotPasswordEmail: null,
  otpSent: false,
  otpVerified: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login
    loginStart(state) {
      state.isLoading = true
      state.error = null
    },
    loginSuccess(state, action: PayloadAction<{ user: AuthUser; access: string; refresh: string }>) {
      state.isLoading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.accessToken = action.payload.access
      state.refreshToken = action.payload.refresh
      state.error = null
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.isLoading = false
      state.error = action.payload
    },

    // Logout
    logout(state) {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.error = null
      state.forgotPasswordEmail = null
      state.otpSent = false
      state.otpVerified = false
    },

    // Forgot Password
    forgotPasswordStart(state) {
      state.isLoading = true
      state.error = null
    },
    forgotPasswordSuccess(state, action: PayloadAction<string>) {
      state.isLoading = false
      state.forgotPasswordEmail = action.payload
      state.otpSent = true
      state.error = null
    },
    forgotPasswordFailure(state, action: PayloadAction<string>) {
      state.isLoading = false
      state.error = action.payload
    },

    // OTP Verification
    verifyOtpStart(state) {
      state.isLoading = true
      state.error = null
    },
    verifyOtpSuccess(state) {
      state.isLoading = false
      state.otpVerified = true
      state.error = null
    },
    verifyOtpFailure(state, action: PayloadAction<string>) {
      state.isLoading = false
      state.error = action.payload
    },

    // Reset Password
    resetPasswordStart(state) {
      state.isLoading = true
      state.error = null
    },
    resetPasswordSuccess(state) {
      state.isLoading = false
      state.forgotPasswordEmail = null
      state.otpSent = false
      state.otpVerified = false
      state.error = null
    },
    resetPasswordFailure(state, action: PayloadAction<string>) {
      state.isLoading = false
      state.error = action.payload
    },

    // Hydrate auth from cookie/localStorage
    hydrateAuth(state, action: PayloadAction<{ user: AuthUser; access: string; refresh: string }>) {
      state.user = action.payload.user
      state.accessToken = action.payload.access
      state.refreshToken = action.payload.refresh
      state.isAuthenticated = true
    },

    clearError(state) {
      state.error = null
    },
  },
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  forgotPasswordStart,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  verifyOtpStart,
  verifyOtpSuccess,
  verifyOtpFailure,
  resetPasswordStart,
  resetPasswordSuccess,
  resetPasswordFailure,
  hydrateAuth,
  clearError,
} = authSlice.actions

export default authSlice.reducer
