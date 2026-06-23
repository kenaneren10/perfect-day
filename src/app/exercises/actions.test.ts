import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks (must be hoisted before any imports) ────────────

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

// ── Imports after mocks ───────────────────────────────────

import { toggleFavorite, createExercise, updateExercise, deleteExercise } from './actions'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const mockCreateClient = vi.mocked(createClient)
const mockRevalidatePath = vi.mocked(revalidatePath)
const mockRedirect = vi.mocked(redirect)

// ── Mock builder helpers ──────────────────────────────────

const USER_ID = 'user-123'
const EXERCISE_ID = 'exercise-456'

function makeAuthMock(userId: string | null = USER_ID) {
  return {
    getUser: vi.fn().mockResolvedValue({
      data: { user: userId ? { id: userId } : null },
      error: null,
    }),
  }
}

/**
 * Builds a chainable Supabase query builder.
 * Terminal methods (.match, .single) resolve to `terminalResult`.
 * Non-terminal methods return `this` for chaining.
 */
function makeBuilder(terminalResult: { data: unknown; error: unknown }) {
  const self: Record<string, unknown> = {}
  const returnSelf = vi.fn(() => self)
  const returnResult = vi.fn(() => Promise.resolve(terminalResult))

  self.select = returnSelf
  self.insert = returnSelf
  self.update = returnSelf
  self.delete = returnSelf
  self.eq     = returnSelf
  self.in     = returnSelf
  self.match  = returnResult
  self.single = returnResult

  return self
}

function makeClientWith(
  auth: ReturnType<typeof makeAuthMock>,
  fromImpl: (table: string) => Record<string, unknown>
) {
  mockCreateClient.mockResolvedValue({
    auth,
    from: vi.fn().mockImplementation(fromImpl),
  } as unknown as Awaited<ReturnType<typeof createClient>>)
}

// ── Tests ─────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
})

// ─────────────────────────────────────────────────────────
describe('toggleFavorite', () => {
  it('inserts favorite when not yet favorited', async () => {
    const insertBuilder = makeBuilder({ data: null, error: null })

    makeClientWith(makeAuthMock(), (table) => {
      if (table === 'favorites') return insertBuilder
      return makeBuilder({ data: null, error: null })
    })

    await toggleFavorite(EXERCISE_ID, false)

    expect(insertBuilder.insert).toHaveBeenCalledWith({
      user_id: USER_ID,
      exercise_id: EXERCISE_ID,
    })
    expect(mockRevalidatePath).toHaveBeenCalledWith(`/exercises/${EXERCISE_ID}`)
    expect(mockRevalidatePath).toHaveBeenCalledWith('/exercises')
  })

  it('deletes favorite when already favorited', async () => {
    const deleteBuilder = makeBuilder({ data: null, error: null })

    makeClientWith(makeAuthMock(), (table) => {
      if (table === 'favorites') return deleteBuilder
      return makeBuilder({ data: null, error: null })
    })

    await toggleFavorite(EXERCISE_ID, true)

    expect(deleteBuilder.delete).toHaveBeenCalled()
    expect(deleteBuilder.match).toHaveBeenCalledWith({
      user_id: USER_ID,
      exercise_id: EXERCISE_ID,
    })
  })

  it('throws when user is not authenticated', async () => {
    makeClientWith(makeAuthMock(null), () => makeBuilder({ data: null, error: null }))

    await expect(toggleFavorite(EXERCISE_ID, false)).rejects.toThrow('Nicht angemeldet')
  })
})

// ─────────────────────────────────────────────────────────
describe('createExercise', () => {
  const validData = {
    name: 'Test Übung',
    category: 'strength' as const,
    muscle_groups: ['chest'] as ['chest'],
    equipment: 'none' as const,
    difficulty: 'beginner' as const,
    description: 'Eine Beschreibung',
    image_url: undefined,
    video_url: undefined,
  }

  it('inserts exercise and redirects to new exercise page', async () => {
    const insertBuilder = makeBuilder({ data: { id: 'new-exercise-id' }, error: null })
    // insert().select().single() — all three methods are on the same builder
    makeClientWith(makeAuthMock(), () => insertBuilder)

    await createExercise(validData)

    expect(insertBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Übung',
        category: 'strength',
        is_system: false,
        user_id: USER_ID,
      })
    )
    expect(mockRevalidatePath).toHaveBeenCalledWith('/exercises')
    expect(mockRedirect).toHaveBeenCalledWith('/exercises/new-exercise-id')
  })

  it('throws when user is not authenticated', async () => {
    makeClientWith(makeAuthMock(null), () => makeBuilder({ data: null, error: null }))

    await expect(createExercise(validData)).rejects.toThrow('Nicht angemeldet')
  })

  it('throws ZodError when name is empty', async () => {
    makeClientWith(makeAuthMock(), () => makeBuilder({ data: null, error: null }))

    await expect(
      createExercise({ ...validData, name: '' })
    ).rejects.toThrow()
  })

  it('throws ZodError when no muscle group selected', async () => {
    makeClientWith(makeAuthMock(), () => makeBuilder({ data: null, error: null }))

    await expect(
      createExercise({ ...validData, muscle_groups: [] as never })
    ).rejects.toThrow()
  })

  it('throws when database returns an error', async () => {
    const errorBuilder = makeBuilder({ data: null, error: { message: 'DB error' } })
    makeClientWith(makeAuthMock(), () => errorBuilder)

    await expect(createExercise(validData)).rejects.toThrow('DB error')
  })
})

// ─────────────────────────────────────────────────────────
describe('updateExercise', () => {
  const validData = {
    name: 'Aktualisierte Übung',
    category: 'strength' as const,
    muscle_groups: ['back'] as ['back'],
    equipment: 'basic' as const,
    difficulty: 'intermediate' as const,
    description: null,
    image_url: undefined,
    video_url: undefined,
  }

  it('updates exercise and redirects to detail page', async () => {
    const updateBuilder = makeBuilder({ data: null, error: null })
    makeClientWith(makeAuthMock(), () => updateBuilder)

    await updateExercise(EXERCISE_ID, validData)

    expect(updateBuilder.update).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Aktualisierte Übung' })
    )
    expect(updateBuilder.match).toHaveBeenCalledWith({
      id: EXERCISE_ID,
      user_id: USER_ID,
      is_system: false,
    })
    expect(mockRedirect).toHaveBeenCalledWith(`/exercises/${EXERCISE_ID}`)
  })

  it('throws when user is not authenticated', async () => {
    makeClientWith(makeAuthMock(null), () => makeBuilder({ data: null, error: null }))

    await expect(updateExercise(EXERCISE_ID, validData)).rejects.toThrow('Nicht angemeldet')
  })

  it('throws when database returns an error', async () => {
    const errorBuilder = makeBuilder({ data: null, error: { message: 'Permission denied' } })
    makeClientWith(makeAuthMock(), () => errorBuilder)

    await expect(updateExercise(EXERCISE_ID, validData)).rejects.toThrow('Permission denied')
  })
})

// ─────────────────────────────────────────────────────────
describe('deleteExercise', () => {
  it('soft-deletes exercise and redirects to library', async () => {
    const updateBuilder = makeBuilder({ data: null, error: null })
    makeClientWith(makeAuthMock(), () => updateBuilder)

    await deleteExercise(EXERCISE_ID)

    expect(updateBuilder.update).toHaveBeenCalledWith(
      expect.objectContaining({ deleted_at: expect.any(String) })
    )
    expect(updateBuilder.match).toHaveBeenCalledWith({
      id: EXERCISE_ID,
      user_id: USER_ID,
      is_system: false,
    })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/exercises')
    expect(mockRedirect).toHaveBeenCalledWith('/exercises')
  })

  it('throws when user is not authenticated', async () => {
    makeClientWith(makeAuthMock(null), () => makeBuilder({ data: null, error: null }))

    await expect(deleteExercise(EXERCISE_ID)).rejects.toThrow('Nicht angemeldet')
  })

  it('throws when database returns an error', async () => {
    const errorBuilder = makeBuilder({ data: null, error: { message: 'Not found' } })
    makeClientWith(makeAuthMock(), () => errorBuilder)

    await expect(deleteExercise(EXERCISE_ID)).rejects.toThrow('Not found')
  })
})
