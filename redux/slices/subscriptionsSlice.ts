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

export const fetchPlans = createAsyncThunk(
  'subscriptions/fetchPlans',
  async () => {
    const res = await api('/subscriptions/plans/')
    if (!res.ok) throw new Error('Failed to fetch plans')
    const data = await res.json()
    return data.results as SubscriptionPlan[]
  },
)

export const createPlan = createAsyncThunk(
  'subscriptions/createPlan',
  async (plan: { name: string; description: string; price: number; currency: string; period: string; is_active: boolean }) => {
    const res = await api('/subscriptions/plans/', {
      method: 'POST',
      body: JSON.stringify(plan),
    })
    if (!res.ok) throw new Error('Failed to create plan')
    return (await res.json()) as SubscriptionPlan
  },
)

export const updatePlanAsync = createAsyncThunk(
  'subscriptions/updatePlan',
  async ({ id, data }: { id: number; data: { name: string; description: string; price: number; currency: string; period: string; is_active: boolean } }) => {
    const res = await api(`/subscriptions/plans/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update plan')
    return (await res.json()) as SubscriptionPlan
  },
)

export const deletePlanAsync = createAsyncThunk(
  'subscriptions/deletePlan',
  async (id: number) => {
    const res = await api(`/subscriptions/plans/${id}/`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to delete plan')
    return id
  },
)

export const fetchUserPlans = createAsyncThunk(
  'subscriptions/fetchUserPlans',
  async () => {
    const res = await api('/subscriptions/user-subscriptions/')
    if (!res.ok) throw new Error('Failed to fetch user plans')
    return (await res.json()) as UserPlan[]
  },
)

// Types
export interface SubscriptionPlan {
  id: number
  name: string
  description: string
  price: string
  currency: string
  period: string
  is_active: boolean
  subscriber_count?: number
  features: string[]
}

export interface UserPlan {
  id: number
  user: number
  user_email: string
  user_name: string
  plan: number
  plan_name: string
  status: string
  start_date: string
  end_date: string | null
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
  plansLoading: boolean
  creatingPlan: boolean
  updatingPlan: boolean
  deletingPlanId: number | null
  // User plans
  userPlans: UserPlan[]
  userPlansLoading: boolean
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
  plans: [],
  plansLoading: false,
  creatingPlan: false,
  updatingPlan: false,
  deletingPlanId: null,
  userPlans: [],
  userPlansLoading: false,
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
    deletePlan(state, action: PayloadAction<number>) {
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
      .addCase(fetchPlans.pending, (state) => {
        state.plansLoading = true
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.plansLoading = false
        state.plans = action.payload
      })
      .addCase(fetchPlans.rejected, (state) => {
        state.plansLoading = false
      })
      .addCase(createPlan.pending, (state) => {
        state.creatingPlan = true
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.creatingPlan = false
        state.plans.push(action.payload)
        state.isCreatePlanModalOpen = false
      })
      .addCase(createPlan.rejected, (state) => {
        state.creatingPlan = false
      })
      .addCase(updatePlanAsync.pending, (state) => {
        state.updatingPlan = true
      })
      .addCase(updatePlanAsync.fulfilled, (state, action) => {
        state.updatingPlan = false
        const index = state.plans.findIndex((p) => p.id === action.payload.id)
        if (index !== -1) state.plans[index] = action.payload
        state.isCreatePlanModalOpen = false
        state.editingPlan = null
      })
      .addCase(updatePlanAsync.rejected, (state) => {
        state.updatingPlan = false
      })
      .addCase(deletePlanAsync.pending, (state, action) => {
        state.deletingPlanId = action.meta.arg
      })
      .addCase(deletePlanAsync.fulfilled, (state, action) => {
        state.deletingPlanId = null
        state.plans = state.plans.filter((p) => p.id !== action.payload)
      })
      .addCase(deletePlanAsync.rejected, (state) => {
        state.deletingPlanId = null
      })
      .addCase(fetchUserPlans.pending, (state) => {
        state.userPlansLoading = true
      })
      .addCase(fetchUserPlans.fulfilled, (state, action) => {
        state.userPlansLoading = false
        state.userPlans = action.payload
      })
      .addCase(fetchUserPlans.rejected, (state) => {
        state.userPlansLoading = false
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
