'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SidebarLogout() {
  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logout clicked')
  }

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className="flex w-full items-center justify-start gap-3 px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600"
    >
      <LogOut className="h-5 w-5" />
      <span>Logout</span>
    </Button>
  )
}
