'use client'

import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { fetchDashboardData } from '@/redux/slices/dashboardSlice'
import { Header } from '@/components/layout/Header'
import { StatsCard, LineChartCard, BarChartCard } from '@/components/shared'
import { Users, UserCheck, UserX, FileQuestion, Layers, Upload, Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const { stats, quizFlashcardData, dailyActiveStudents, loading, error } = useAppSelector(
    (state) => state.dashboard
  )

  useEffect(() => {
    dispatch(fetchDashboardData())
  }, [dispatch])

  return (
    <div className="flex-1">
      <Header title="Dashboard" />
      
      <main className="p-4 lg:p-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {error}
            <button
              onClick={() => dispatch(fetchDashboardData())}
              className="ml-2 font-medium underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && (
          <>
            {/* Stats Grid - Top Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          <StatsCard
            title="Total Students"
            value={stats.totalStudents}
            change={stats.totalStudentsChange}
            icon={Users}
            iconColor="text-blue-500"
            iconBgColor="bg-blue-50"
          />
          <StatsCard
            title="Active Students"
            value={stats.activeStudents}
            change={stats.activeStudentsChange}
            icon={UserCheck}
            iconColor="text-green-500"
            iconBgColor="bg-green-50"
          />
          <StatsCard
            title="Blocked Students"
            value={stats.blockedStudents}
            change={stats.blockedStudentsChange}
            icon={UserX}
            iconColor="text-red-500"
            iconBgColor="bg-red-50"
          />
        </div>

        {/* Stats Grid - Second Row */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:mt-6 lg:gap-6">
          <StatsCard
            title="Total Quizzes"
            value={stats.totalQuizzes}
            change={stats.totalQuizzesChange}
            icon={FileQuestion}
            iconColor="text-blue-500"
            iconBgColor="bg-blue-50"
          />
          <StatsCard
            title="Total Flashcards"
            value={stats.totalFlashcards}
            change={stats.totalFlashcardsChange}
            icon={Layers}
            iconColor="text-teal-500"
            iconBgColor="bg-teal-50"
          />
          <StatsCard
            title="Today's Uploads"
            value={stats.todaysUploads}
            change={stats.todaysUploadsChange}
            icon={Upload}
            iconColor="text-green-500"
            iconBgColor="bg-green-50"
          />
        </div>

        {/* Charts Row */}
        <div className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-2 lg:gap-6">
          <LineChartCard
            title="Quiz & Flashcard Generation Over Time"
            data={quizFlashcardData}
            lines={[
              { dataKey: 'flashcards', color: '#10b981', name: 'Flashcards' },
              { dataKey: 'quizzes', color: '#3b82f6', name: 'Quizzes' },
            ]}
          />
          <BarChartCard
            title="Daily Active Students"
            data={dailyActiveStudents}
            color="#3b82f6"
          />
        </div>
          </>
        )}
      </main>
    </div>
  )
}
