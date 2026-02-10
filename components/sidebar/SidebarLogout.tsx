'use client'

import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LogoutModal } from '@/components/shared/LogoutModal'

export function SidebarLogout() {
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = () => {
    // Handle logout logic here
    console.log('User logged out')
    setShowLogoutModal(false)
    // Add actual logout logic (e.g., clear session, redirect to login)
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
