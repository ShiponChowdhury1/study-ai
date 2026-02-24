'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  CreditCard,
  LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  CreditCard,
}

interface SidebarItemProps {
  id: string
  label: string
  icon: string
  href: string
}

export function SidebarItem({ label, icon, href }: SidebarItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
  const Icon = iconMap[icon] || LayoutDashboard

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-blue-500 text-white shadow-md'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  )
}
