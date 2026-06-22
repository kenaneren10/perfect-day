import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockExchangeCodeForSession = vi.fn()
const mockCookieStore = {
  getAll: vi.fn().mockReturnValue([]),
  set: vi.fn(),
}

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { exchangeCodeForSession: mockExchangeCodeForSession },
  })),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue(mockCookieStore),
}))

// Dynamic import after mocks are set up
async function getHandler() {
  const mod = await import('./route')
  return mod.GET
}

describe('GET /auth/callback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockExchangeCodeForSession.mockResolvedValue({ data: {}, error: null })
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  })

  it('exchanges code for session and redirects to origin', async () => {
    const GET = await getHandler()
    const request = new NextRequest('http://localhost:3000/auth/callback?code=abc123')

    const response = await GET(request)

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('abc123')
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/')
  })

  it('redirects to origin even when no code is present', async () => {
    const GET = await getHandler()
    const request = new NextRequest('http://localhost:3000/auth/callback')

    const response = await GET(request)

    expect(mockExchangeCodeForSession).not.toHaveBeenCalled()
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/')
  })
})
