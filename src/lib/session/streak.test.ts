import { describe, it, expect } from 'vitest'
import { calculateStreak, toISODateStr, toDayOfWeek } from './streak'

function makeDate(daysFromToday: number, today = new Date('2026-06-22')): Date {
  const d = new Date(today)
  d.setDate(d.getDate() + daysFromToday)
  d.setHours(0, 0, 0, 0)
  return d
}

// 2026-06-22 is a Monday (dow=1)
const TODAY = new Date('2026-06-22')
TODAY.setHours(0, 0, 0, 0)

// Mon/Wed/Fri training days (3-day plan)
const MWF = new Set([1, 3, 5])

describe('toDayOfWeek', () => {
  it('Monday → 1', () => {
    expect(toDayOfWeek(new Date('2026-06-22'))).toBe(1) // Monday
  })

  it('Sunday → 7', () => {
    expect(toDayOfWeek(new Date('2026-06-28'))).toBe(7) // Sunday
  })

  it('Saturday → 6', () => {
    expect(toDayOfWeek(new Date('2026-06-27'))).toBe(6)
  })
})

describe('calculateStreak — no sessions', () => {
  it('returns 0 when no sessions at all', () => {
    expect(calculateStreak(MWF, new Set(), TODAY)).toBe(0)
  })

  it('returns 0 when no training weekdays defined', () => {
    expect(calculateStreak(new Set(), new Set(['2026-06-22']), TODAY)).toBe(0)
  })
})

describe('calculateStreak — today only', () => {
  it('returns 1 if today is a training day and completed', () => {
    // TODAY = Monday June 22 (dow=1 ∈ MWF)
    const completed = new Set(['2026-06-22'])
    expect(calculateStreak(MWF, completed, TODAY)).toBe(1)
  })

  it('returns 0 if today is a rest day even if completed', () => {
    // TODAY = Monday, rest days = Tue/Thu (2,4) — Monday not a training day
    const restPlan = new Set([2, 4])
    const completed = new Set(['2026-06-22'])
    expect(calculateStreak(restPlan, completed, TODAY)).toBe(0)
  })
})

describe('calculateStreak — consecutive training days', () => {
  it('2 consecutive training days → streak 2', () => {
    // TODAY = Mon June 22, previous training day = Fri June 19 (dow=5)
    const completed = new Set(['2026-06-22', '2026-06-19'])
    expect(calculateStreak(MWF, completed, TODAY)).toBe(2)
  })

  it('3 consecutive training days → streak 3', () => {
    // Mon June 22, Fri June 19, Wed June 17
    const completed = new Set(['2026-06-22', '2026-06-19', '2026-06-17'])
    expect(calculateStreak(MWF, completed, TODAY)).toBe(3)
  })

  it('rest days between training days do not break streak', () => {
    // Plan: Mon/Wed/Fri. Mon completed, skipping Sat/Sun
    // Fri (June 19) completed, Wed (June 17) missed
    const completed = new Set(['2026-06-22', '2026-06-19'])
    expect(calculateStreak(MWF, completed, TODAY)).toBe(2)
  })
})

describe('calculateStreak — streak breaks', () => {
  it('missed training day breaks streak', () => {
    // Today=Mon (done), Fri=missed, Wed=done — streak stops at Mon
    const completed = new Set(['2026-06-22', '2026-06-17'])
    expect(calculateStreak(MWF, completed, TODAY)).toBe(1)
  })

  it('today not yet done — streak still shows previous days (breaks at midnight tomorrow)', () => {
    // TODAY = Monday June 22, NO Monday session yet
    // Spec: "bricht am nächsten Tag (Mitternacht)" — streak intact until midnight
    // Fri + Wed completed = 2 days streak while Monday is pending
    const completed = new Set(['2026-06-19', '2026-06-17'])
    expect(calculateStreak(MWF, completed, TODAY)).toBe(2)
  })

  it('returns 0 if most recent training day was missed', () => {
    const completed = new Set(['2026-06-17']) // Wed done, Fri+Mon missed
    expect(calculateStreak(MWF, completed, TODAY)).toBe(0)
  })
})

describe('calculateStreak — rest days as today', () => {
  const SUNDAY = new Date('2026-06-28') // Sunday
  SUNDAY.setHours(0, 0, 0, 0)

  it('today is rest day — streak counts previous training days', () => {
    // Sunday is rest day. Fri June 26 completed, Wed June 24 completed
    const completed = new Set(['2026-06-26', '2026-06-24'])
    expect(calculateStreak(MWF, completed, SUNDAY)).toBe(2)
  })

  it('today is rest day — streak 0 if last training day was missed', () => {
    const completed = new Set(['2026-06-24']) // Fri missed
    expect(calculateStreak(MWF, completed, SUNDAY)).toBe(0)
  })
})

describe('calculateStreak — 5-day plan (Mon–Fri)', () => {
  const MOFRPLAN = new Set([1, 2, 3, 4, 5])

  it('full week completed → streak 5', () => {
    const completed = new Set(['2026-06-22', '2026-06-19', '2026-06-18', '2026-06-17', '2026-06-16'])
    expect(calculateStreak(MOFRPLAN, completed, TODAY)).toBe(5)
  })

  it('Sa/So skipped naturally', () => {
    // Mon+Fri+Thu+Wed+Tue all done, Sa/So skipped
    const completed = new Set(['2026-06-22', '2026-06-19', '2026-06-18', '2026-06-17', '2026-06-16'])
    expect(calculateStreak(MOFRPLAN, completed, TODAY)).toBe(5)
  })
})
