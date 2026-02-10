import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  iconColor?: string
  iconBgColor?: string
}

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-blue-500',
  iconBgColor = 'bg-blue-50',
}: StatsCardProps) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-start justify-between">
          <div className={cn('rounded-xl p-3', iconBgColor)}>
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
          {change !== undefined && (
            <span
              className={cn(
                'rounded-full px-2 py-1 text-xs font-medium',
                isPositive && 'bg-green-50 text-green-600',
                isNegative && 'bg-red-50 text-red-600',
                !isPositive && !isNegative && 'bg-gray-50 text-gray-600'
              )}
            >
              {isPositive && '+'}
              {change}%
            </span>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold text-gray-900 lg:text-3xl">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          <p className="mt-1 text-sm text-gray-500">{title}</p>
        </div>
      </CardContent>
    </Card>
  )
}
