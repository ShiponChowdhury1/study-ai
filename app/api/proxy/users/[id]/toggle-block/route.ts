import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.10.12.28:8000/api'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.cookies.get('auth_token')?.value

    const res = await fetch(`${API_URL}/dashboard/users/${id}/toggle-block/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || data.detail || 'Failed to toggle user status' },
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
