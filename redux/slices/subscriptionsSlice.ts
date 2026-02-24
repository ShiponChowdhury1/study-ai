import { createSlice, PayloadAction } from '@reduxjs/toolkit'

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
  monthlyRevenue: 84250,
  growth: 18.7,
  failedPayments: 5,
  activeSubscribers: 3247,
  revenueTrend: [
    { name: 'Jan', revenue: 50000 },
    { name: 'Feb', revenue: 48000 },
    { name: 'Mar', revenue: 55000 },
    { name: 'Apr', revenue: 60000 },
    { name: 'May', revenue: 62000 },
    { name: 'Jun', revenue: 65000 },
    { name: 'Jul', revenue: 68000 },
    { name: 'Aug', revenue: 70000 },
    { name: 'Sep', revenue: 72000 },
    { name: 'Oct', revenue: 71000 },
    { name: 'Nov', revenue: 75000 },
    { name: 'Dec', revenue: 78000 },
  ],
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
