'use client'

import { Sidebar } from '@/components/sidebar'
import { AuthGuard } from '@/components/auth/AuthGuard'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          {children}
        </div>
      </div>
    </AuthGuard>
  )
}
