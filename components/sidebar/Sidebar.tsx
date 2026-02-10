'use client'

import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { setMobileSidebarOpen } from '@/redux/slices/sidebarSlice'
import { cn } from '@/lib/utils'
import { sidebarItems } from '@/config/sidebarItems'
import { SidebarLogo } from './SidebarLogo'
import { SidebarItem } from './SidebarItem'
import { SidebarLogout } from './SidebarLogout'
import { X } from 'lucide-react'

export function Sidebar() {
  const isMobileOpen = useAppSelector((state) => state.sidebar.isMobileOpen)
  const dispatch = useAppDispatch()

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => dispatch(setMobileSidebarOpen(false))}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header with logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-2">
          <SidebarLogo />
          <button
            onClick={() => dispatch(setMobileSidebarOpen(false))}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
              href={item.href}
            />
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 p-3">
          <SidebarLogout />
        </div>
      </aside>
    </>
  )
}
