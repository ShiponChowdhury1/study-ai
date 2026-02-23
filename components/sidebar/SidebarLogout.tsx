'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LogoutModal } from '@/components/shared/LogoutModal'
import { useAppDispatch } from '@/redux/hooks'
import { logout } from '@/redux/slices/authSlice'

export function SidebarLogout() {
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const router = useRouter()
  const dispatch = useAppDispatch()

  const handleLogout = () => {
    // Clear auth cookie & localStorage
    document.cookie = 'auth_token=; path=/; max-age=0'
    document.cookie = 'refresh_token=; path=/; max-age=0'
    localStorage.removeItem('user')
    localStorage.removeItem('refresh_token')
    dispatch(logout())
    setShowLogoutModal(false)
    router.push('/auth/login')
  }

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setShowLogoutModal(true)}
        className="flex w-full items-center justify-start gap-3 px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600"
      >
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </Button>
      
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  )
}
