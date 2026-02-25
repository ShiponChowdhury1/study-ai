const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.10.12.28:8000/api'

/**
 * Get auth token from localStorage
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

/**
 * API helper for direct backend calls.
 * Automatically adds Authorization header if token exists.
 */
export async function api(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // If method is DELETE and no body, remove Content-Type
  if (options.method === 'DELETE' && !options.body) {
    delete headers['Content-Type']
  }

  // If body is FormData, remove Content-Type so browser sets multipart boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type']
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })
}
