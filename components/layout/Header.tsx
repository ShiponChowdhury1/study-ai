'use client'

import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { toggleMobileSidebar } from '@/redux/slices/sidebarSlice'
import { logout } from '@/redux/slices/authSlice'
import { Menu, ChevronDown, Settings, LogOut } from 'lucide-react'
import { toast } from 'react-toastify'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogoutModal } from '@/components/shared/LogoutModal'
import Link from 'next/link'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // Derived display values
  const displayName = user?.full_name || 'Admin'
  const displayEmail = user?.email || ''
  const avatarUrl = user?.avatar || ''
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleLogout = () => {
    // Clear all localStorage
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    dispatch(logout())
    toast.success('Logged out successfully!')
    setShowLogoutModal(false)
    window.location.href = '/auth/login'
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
        {/* Mobile menu button and title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => dispatch(toggleMobileSidebar())}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 lg:text-2xl">{title}</h1>
        </div>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100 focus:outline-none">
            <Avatar className="h-9 w-9">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
              <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden flex-col items-start text-left md:flex">
              <span className="text-sm font-medium text-gray-900">{displayName}</span>
              <span className="text-xs text-gray-500">{displayEmail}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-500 focus:text-red-500 cursor-pointer"
              onClick={() => setShowLogoutModal(true)}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  )
}
