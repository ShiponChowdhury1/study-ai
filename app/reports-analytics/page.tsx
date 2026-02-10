'use client'

import { useAppSelector } from '@/redux/hooks'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, FileText, Clock, Download, Calendar } from 'lucide-react'

export default function ReportsAnalyticsPage() {
  const { data } = useAppSelector((state) => state.analytics)

  return (
    <div className="flex-1">
      <Header title="Reports & Analytics" />
      
      <main className="p-4 lg:p-6">
        {/* Charts Section */}
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          {/* Quiz Generation Trend */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-900">
                Quiz Generation Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.quizGenerationTrend}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="week"
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
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Flashcard Engagement */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-900">
                Flashcard Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.flashcardEngagement}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey="week"
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
                      }}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:mt-6 lg:gap-6">
          {/* Most Active Student */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Most Active Student</p>
                  <h3 className="mt-1 text-lg font-semibold text-gray-900">
                    {data.mostActiveStudent.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {data.mostActiveStudent.quizzesCompleted} quizzes completed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Most Used Document */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                  <FileText className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Most Used Document</p>
                  <h3 className="mt-1 text-lg font-semibold text-gray-900">
                    {data.mostUsedDocument.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {data.mostUsedDocument.timesAccessed} times accessed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Peak Usage Time */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Peak Usage Time</p>
                  <h3 className="mt-1 text-lg font-semibold text-gray-900">
                    {data.peakUsageTime.timeRange}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Average {data.peakUsageTime.averageActiveUsers} active users
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Section */}
        <Card className="mt-4 border-gray-200 shadow-sm lg:mt-6">
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Export Reports</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="date"
                    className="w-40 pl-9"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button className="flex-1 bg-blue-500 hover:bg-blue-600">
                <Download className="mr-2 h-4 w-4" />
                Download CSV Report
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download PDF Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
