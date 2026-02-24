'use client'

import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import {
  openCreatePlanModal,
  openEditPlanModal,
  closeCreatePlanModal,
  addPlan,
  updatePlan,
  deletePlan,
  SubscriptionPlan,
} from '@/redux/slices/subscriptionsSlice'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Plus,
  Loader2,
} from 'lucide-react'
import { useState, useEffect } from 'react'

// ─── Stats Card (inline small variant) ─────────────────────────────────
function SubscriptionStatsCard({
  icon: Icon,
  iconColor,
  iconBgColor,
  label,
  value,
}: {
  icon: React.ElementType
  iconColor: string
  iconBgColor: string
  label: string
  value: string
}) {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="flex items-center gap-4 p-4 lg:p-5">
        <div className={`rounded-full p-3 ${iconBgColor}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Plan Card ──────────────────────────────────────────────────────────
function PlanCard({
  plan,
  onEdit,
  onDelete,
}: {
  plan: SubscriptionPlan
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <Card className="border-gray-200 shadow-sm relative">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
            <p className="text-sm text-gray-500">{plan.duration}</p>
          </div>
          <button
            onClick={onDelete}
            className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600 transition"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        {/* Price */}
        <div className="mt-4">
          <span className="text-3xl font-bold text-gray-900">
            {plan.currency} {plan.price.toLocaleString()} RMB
          </span>
          {plan.duration !== 'Forever' && (
            <span className="text-sm text-gray-500"> /{plan.duration}</span>
          )}
        </div>

        {/* Features */}
        <div className="mt-5 space-y-3">
          {plan.features.map((feature, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{feature.label}</span>
              <span className="font-medium text-gray-900">{feature.value}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Subscribers</p>
            <p className="text-lg font-bold text-blue-600">
              {plan.subscribers.toLocaleString()}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            Edit Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Create/Edit Plan Modal ─────────────────────────────────────────────
function CreatePlanModal({
  isOpen,
  onClose,
  editingPlan,
  onSave,
}: {
  isOpen: boolean
  onClose: () => void
  editingPlan: SubscriptionPlan | null
  onSave: (plan: SubscriptionPlan) => void
}) {
  const [name, setName] = useState('')
  const [duration, setDuration] = useState('')
  const [price, setPrice] = useState('')
  const [features, setFeatures] = useState<{ label: string; value: string }[]>([
    { label: '', value: '' },
  ])

  useEffect(() => {
    if (editingPlan) {
      setName(editingPlan.name)
      setDuration(editingPlan.duration)
      setPrice(editingPlan.price.toString())
      setFeatures(
        editingPlan.features.map((f) => ({
          label: f.label,
          value: String(f.value),
        }))
      )
    } else {
      setName('')
      setDuration('')
      setPrice('')
      setFeatures([{ label: '', value: '' }])
    }
  }, [editingPlan, isOpen])

  const handleAddFeature = () => {
    setFeatures([...features, { label: '', value: '' }])
  }

  const handleFeatureChange = (
    index: number,
    field: 'label' | 'value',
    val: string
  ) => {
    const updated = [...features]
    updated[index][field] = val
    setFeatures(updated)
  }

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    const plan: SubscriptionPlan = {
      id: editingPlan?.id || name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      name,
      duration,
      price: Number(price),
      currency: '¥',
      features: features
        .filter((f) => f.label.trim())
        .map((f) => ({
          label: f.label,
          value: isNaN(Number(f.value)) ? f.value : Number(f.value),
        })),
      subscribers: editingPlan?.subscribers || 0,
    }
    onSave(plan)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingPlan ? 'Edit Plan' : 'Create New Plan'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Plan Name
              </label>
              <Input
                placeholder="e.g. Premium"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Duration
              </label>
              <Input
                placeholder="e.g. 1 Month"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Price (RMB)
            </label>
            <Input
              type="number"
              placeholder="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Features
              </label>
              <button
                type="button"
                onClick={handleAddFeature}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500"
              >
                <Plus className="h-3 w-3" /> Add Feature
              </button>
            </div>
            <div className="space-y-2">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder="Feature name"
                    value={feature.label}
                    onChange={(e) =>
                      handleFeatureChange(i, 'label', e.target.value)
                    }
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value"
                    value={feature.value}
                    onChange={(e) =>
                      handleFeatureChange(i, 'value', e.target.value)
                    }
                    className="w-28"
                  />
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(i)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name || !duration}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {editingPlan ? 'Update Plan' : 'Create Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────
export default function SubscriptionsPage() {
  const dispatch = useAppDispatch()
  const {
    monthlyRevenue,
    growth,
    failedPayments,
    activeSubscribers,
    revenueTrend,
    plans,
    userPlans,
    loading,
    isCreatePlanModalOpen,
    editingPlan,
  } = useAppSelector((state) => state.subscriptions)

  const handleSavePlan = (plan: SubscriptionPlan) => {
    if (editingPlan) {
      dispatch(updatePlan(plan))
    } else {
      dispatch(addPlan(plan))
    }
  }

  if (loading) {
    return (
      <div className="flex-1">
        <Header title="Subscriptions & Payments" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1">
      <Header title="Subscriptions & Payments" />

      <main className="p-4 lg:p-6">
        {/* Subtitle */}
        <p className="mb-6 -mt-1 text-sm text-gray-500">
          Manage subscription plans and monitor revenue
        </p>

        {/* Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <SubscriptionStatsCard
            icon={DollarSign}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            label="Monthly Revenue"
            value={`$${monthlyRevenue.toLocaleString()}`}
          />
          <SubscriptionStatsCard
            icon={TrendingUp}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            label="Growth"
            value={`+${growth}%`}
          />
          <SubscriptionStatsCard
            icon={AlertCircle}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
            label="Failed Payments"
            value={failedPayments.toString()}
          />
          <SubscriptionStatsCard
            icon={CheckCircle2}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            label="Active Subscribers"
            value={activeSubscribers.toLocaleString()}
          />
        </div>

        {/* Revenue Trend Chart */}
        <Card className="mt-6 border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">
              Revenue Trend (1 Year)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueTrend}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    formatter={(value: number | undefined) => [
                      `$${(value ?? 0).toLocaleString()}`,
                      'Revenue',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Plans */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Subscription Plans
            </h2>
            <Button
              onClick={() => dispatch(openCreatePlanModal())}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Plan
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onEdit={() => dispatch(openEditPlanModal(plan))}
                onDelete={() => dispatch(deletePlan(plan.id))}
              />
            ))}
          </div>
        </div>

        {/* User Plans Table */}
        <Card className="mt-6 border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">
              User Plans
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-16 pl-6">SL</TableHead>
                  <TableHead>USER</TableHead>
                  <TableHead>PLAN</TableHead>
                  <TableHead className="pr-6">DATE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userPlans.map((row) => (
                  <TableRow key={row.sl}>
                    <TableCell className="pl-6 text-gray-500">
                      {row.sl}.
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {row.user}
                    </TableCell>
                    <TableCell className="text-gray-600">{row.plan}</TableCell>
                    <TableCell className="pr-6 text-gray-500">
                      {row.date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Create/Edit Plan Modal */}
      <CreatePlanModal
        isOpen={isCreatePlanModalOpen}
        onClose={() => dispatch(closeCreatePlanModal())}
        editingPlan={editingPlan}
        onSave={handleSavePlan}
      />
    </div>
  )
}
