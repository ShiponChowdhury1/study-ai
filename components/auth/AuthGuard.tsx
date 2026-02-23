'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/redux/hooks'
import { hydrateAuth } from '@/redux/slices/authSlice'
import { Loader2 } from 'lucide-react'

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const token = getCookie('auth_token')
    if (!token) {
      router.replace('/auth/login')
    } else {
      // Hydrate Redux state from localStorage
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
      setIsChecking(false)
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
