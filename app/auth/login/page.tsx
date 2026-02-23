'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { loginStart, loginSuccess, loginFailure, clearError } from '@/redux/slices/authSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((state) => state.auth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())

    if (!email || !password) {
      dispatch(loginFailure('Please fill in all fields'))
      return
    }

    dispatch(loginStart())

    try {
      const res = await fetch('/api/proxy/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        dispatch(loginFailure(data.message || 'Invalid email or password'))
        return
      }

      // Set auth cookie (access token)
      document.cookie = `auth_token=${data.access}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('refresh_token', data.refresh)

      dispatch(loginSuccess({ user: data.user, access: data.access, refresh: data.refresh }))
      router.push(callbackUrl)
    } catch {
      dispatch(loginFailure('Something went wrong. Please try again.'))
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600">
          <span className="text-2xl font-bold text-white">S</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to your admin account</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="email"
              placeholder="admin@studyai.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-11"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-11"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
