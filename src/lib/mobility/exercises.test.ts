import { describe, it, expect } from 'vitest'
import { MOBILITY_EXERCISES, TOTAL_EXERCISES, TOTAL_MINUTES } from './exercises'

describe('MOBILITY_EXERCISES', () => {
  it('enthält genau 8 Übungen', () => {
    expect(MOBILITY_EXERCISES).toHaveLength(8)
    expect(TOTAL_EXERCISES).toBe(8)
  })

  it('jede Übung hat id, name, instruction und duration_seconds', () => {
    for (const ex of MOBILITY_EXERCISES) {
      expect(typeof ex.id).toBe('number')
      expect(ex.name.length).toBeGreaterThan(0)
      expect(ex.instruction.length).toBeGreaterThan(0)
      expect(ex.duration_seconds).toBeGreaterThan(0)
    }
  })

  it('alle Übungen haben 30 Sekunden Dauer', () => {
    for (const ex of MOBILITY_EXERCISES) {
      expect(ex.duration_seconds).toBe(30)
    }
  })

  it('IDs sind eindeutig und beginnen bei 1', () => {
    const ids = MOBILITY_EXERCISES.map((e) => e.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(MOBILITY_EXERCISES.length)
    expect(Math.min(...ids)).toBe(1)
  })

  it('Gesamtdauer beträgt 240 Sekunden (4 Minuten)', () => {
    const totalSeconds = MOBILITY_EXERCISES.reduce((s, e) => s + e.duration_seconds, 0)
    expect(totalSeconds).toBe(240) // 8 × 30s
    expect(TOTAL_MINUTES).toBe(4) // Math.round(240/60) = 4
  })

  it('enthält Hüftbeuger-Dehnung für beide Seiten', () => {
    const names = MOBILITY_EXERCISES.map((e) => e.name)
    expect(names).toContain('Hüftbeuger-Dehnung links')
    expect(names).toContain('Hüftbeuger-Dehnung rechts')
  })

  it('Nackenrollen ist die erste Übung, Waden dehnen die letzte', () => {
    expect(MOBILITY_EXERCISES[0].name).toBe('Nackenrollen')
    expect(MOBILITY_EXERCISES[7].name).toBe('Waden dehnen')
  })
})
