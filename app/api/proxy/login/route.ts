import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.10.12.28:8000/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const res = await fetch(`${API_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || data.detail || 'Invalid credentials' },
        { status: res.status }
      )
    }

    // Set auth cookies
    const response = NextResponse.json(data)
    response.cookies.set('auth_token', data.access, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    response.cookies.set('refresh_token', data.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json(
      { message: 'Server error. Please try again later.' },
      { status: 500 }
    )
  }
}
