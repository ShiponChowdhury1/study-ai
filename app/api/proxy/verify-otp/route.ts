import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.10.12.28:8000/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const res = await fetch(`${API_URL}/auth/password/verify-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || data.detail || 'Invalid OTP' },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { message: 'Server error. Please try again later.' },
      { status: 500 }
    )
  }
}
