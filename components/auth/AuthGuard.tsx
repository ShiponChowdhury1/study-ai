'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/redux/hooks'
import { hydrateAuth } from '@/redux/slices/authSlice'
import { Loader2 } from 'lucide-react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [isChecking, setIsChecking] = useState(true)
  const hasChecked = useRef(false)

  useEffect(() => {
    if (hasChecked.current) return
    hasChecked.current = true

    const token = localStorage.getItem('access_token')
    if (!token) {
      router.replace('/auth/login')
    } else {
      try {
        const userStr = localStorage.getItem('user')
        const refreshToken = localStorage.getItem('refresh_token')
        if (userStr) {
          const user = JSON.parse(userStr)
          dispatch(hydrateAuth({ user, access: token, refresh: refreshToken || '' }))
        }
      } catch {
        // ignore parse errors
      }
      requestAnimationFrame(() => setIsChecking(false))
    }
  }, [router, dispatch])

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return <>{children}</>
}
