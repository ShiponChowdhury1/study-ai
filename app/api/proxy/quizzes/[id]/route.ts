import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.10.12.28:8000/api'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.cookies.get('auth_token')?.value

    const res = await fetch(`${API_URL}/dashboard/quizzes/${id}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (res.status === 204) {
      return NextResponse.json({ message: 'Deleted successfully' })
    }

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || data.detail || 'Failed to delete quiz' },
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
