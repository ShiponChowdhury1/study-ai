import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.10.12.28:8000/api'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    const { searchParams } = new URL(request.url)

    // Forward query params (quiz_type, page, etc.)
    const queryString = searchParams.toString()
    const url = `${API_URL}/dashboard/quizzes/${queryString ? `?${queryString}` : ''}`

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || data.detail || 'Failed to fetch quizzes' },
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
