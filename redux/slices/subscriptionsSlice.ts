import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { api } from '@/lib/api'

// ─── Async Thunks ───────────────────────────────────────────────────────
export const fetchSubscriptionStats = createAsyncThunk(
  'subscriptions/fetchStats',
  async () => {
    const res = await api('/subscriptions/stats/')
    if (!res.ok) throw new Error('Failed to fetch subscription stats')
    const data = await res.json()
    return {
      monthlyRevenue: parseFloat(data.monthly_revenue) || 0,
      growth: data.revenue_growth ?? 0,
      failedPayments: data.failed_payments ?? 0,
      activeSubscribers: data.active_subscribers ?? 0,
    }
  },
)

export const fetchRevenueTrend = createAsyncThunk(
  'subscriptions/fetchRevenueTrend',
  async () => {
    const res = await api('/subscriptions/revenue-trend/')
    if (!res.ok) throw new Error('Failed to fetch revenue trend')
    const data: { month: string; revenue: number }[] = await res.json()
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return data.map((item) => ({
      name: monthNames[new Date(item.month).getMonth()],
      revenue: item.revenue,
    }))
  },
)

// Types
export interface SubscriptionPlan {
  id: string
  name: string
  duration: string
  price: number
  currency: string
  features: {
    label: string
    value: string | number
  }[]
  subscribers: number
}

export interface UserPlan {
  sl: number
  user: string
  plan: string
  date: string
}

export interface RevenueTrendPoint {
  name: string
  revenue: number
}

interface SubscriptionsState {
  // Stats
  monthlyRevenue: number
  growth: number
  failedPayments: number
  activeSubscribers: number
  // Revenue trend
  revenueTrend: RevenueTrendPoint[]
  // Plans
  plans: SubscriptionPlan[]
  // User plans
  userPlans: UserPlan[]
  // UI
  loading: boolean
  error: string | null
  // Create/Edit plan modal
  isCreatePlanModalOpen: boolean
  editingPlan: SubscriptionPlan | null
}

const initialState: SubscriptionsState = {
  monthlyRevenue: 0,
  growth: 0,
  failedPayments: 0,
  activeSubscribers: 0,
  revenueTrend: [],
  plans: [
    {
      id: 'free',
      name: 'Free',
      duration: 'Forever',
      price: 0,
      currency: '¥',
      features: [
        { label: 'AI Generated Quizzes', value: 2 },
        { label: 'Feedback Depth', value: 'Basic' },
        { label: 'Education Plans', value: 'No' },
        { label: 'Set of Flashcards', value: 1 },
      ],
      subscribers: 9211,
    },
    {
      id: 'monthly',
      name: 'Monthly',
      duration: '1 Month',
      price: 99,
      currency: '¥',
      features: [
        { label: 'AI Generated Quizzes', value: 'Unlimited' },
        { label: 'Sets of Flashcards', value: 'Unlimited' },
        { label: 'Early access to updated features', value: 'Yes' },
        { label: 'Priority Support', value: 'Yes' },
      ],
      subscribers: 1847,
    },
  ],
  userPlans: [
    { sl: 1, user: 'John Smith', plan: 'Monthly', date: '2026-01-23 09:15' },
    { sl: 2, user: 'Sarah Johnson', plan: 'Monthly', date: '2026-01-23 08:42' },
    { sl: 3, user: 'Mike Davis', plan: 'Monthly', date: '2026-01-23 07:28' },
    { sl: 4, user: 'Emily Wilson', plan: 'Monthly', date: '2026-01-22 18:15' },
    { sl: 5, user: 'David Brown', plan: 'Monthly', date: '2026-01-22 16:32' },
    { sl: 6, user: 'Lisa Anderson', plan: 'Monthly', date: '2026-01-22 14:20' },
    { sl: 7, user: 'Robert Taylor', plan: 'Monthly', date: '2026-01-22 11:45' },
    { sl: 8, user: 'Jennifer Lee', plan: 'Monthly', date: '2026-01-22 09:10' },
  ],
  loading: false,
  error: null,
  isCreatePlanModalOpen: false,
  editingPlan: null,
}

const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },
    openCreatePlanModal(state) {
      state.isCreatePlanModalOpen = true
      state.editingPlan = null
    },
    openEditPlanModal(state, action: PayloadAction<SubscriptionPlan>) {
      state.isCreatePlanModalOpen = true
      state.editingPlan = action.payload
    },
    closeCreatePlanModal(state) {
      state.isCreatePlanModalOpen = false
      state.editingPlan = null
    },
    addPlan(state, action: PayloadAction<SubscriptionPlan>) {
      state.plans.push(action.payload)
    },
    updatePlan(state, action: PayloadAction<SubscriptionPlan>) {
      const index = state.plans.findIndex((p) => p.id === action.payload.id)
      if (index !== -1) {
        state.plans[index] = action.payload
      }
    },
    deletePlan(state, action: PayloadAction<string>) {
      state.plans = state.plans.filter((p) => p.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSubscriptionStats.fulfilled, (state, action) => {
        state.loading = false
        state.monthlyRevenue = action.payload.monthlyRevenue
        state.growth = action.payload.growth
        state.failedPayments = action.payload.failedPayments
        state.activeSubscribers = action.payload.activeSubscribers
      })
      .addCase(fetchSubscriptionStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch stats'
      })
      .addCase(fetchRevenueTrend.fulfilled, (state, action) => {
        state.revenueTrend = action.payload
      })
  },
})

export const {
  setLoading,
  setError,
  openCreatePlanModal,
  openEditPlanModal,
  closeCreatePlanModal,
  addPlan,
  updatePlan,
  deletePlan,
} = subscriptionsSlice.actions

export default subscriptionsSlice.reducer
