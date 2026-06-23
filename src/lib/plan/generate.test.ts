import { describe, it, expect } from 'vitest'
import {
  getTrainingDays,
  getFocusSequence,
  getAllowedEquipment,
  getExerciseConfig,
  FOCUS_SEQUENCE_MAP,
  TRAINING_DAY_MAP,
} from './generate'

describe('getTrainingDays', () => {
  it('returns Mon/Wed/Fri for 3 days', () => {
    expect(getTrainingDays(3)).toEqual([1, 3, 5])
  })

  it('returns Mon/Tue/Thu/Fri for 4 days', () => {
    expect(getTrainingDays(4)).toEqual([1, 2, 4, 5])
  })

  it('returns Mon–Fri for 5 days', () => {
    expect(getTrainingDays(5)).toEqual([1, 2, 3, 4, 5])
  })

  it('training day count matches requested days', () => {
    expect(getTrainingDays(3)).toHaveLength(3)
    expect(getTrainingDays(4)).toHaveLength(4)
    expect(getTrainingDays(5)).toHaveLength(5)
  })
})

describe('getFocusSequence', () => {
  it('length matches training days', () => {
    const goals = ['weight_loss', 'muscle_gain', 'fitness', 'flexibility'] as const
    const days = [3, 4, 5] as const
    for (const goal of goals) {
      for (const d of days) {
        expect(getFocusSequence(goal, d)).toHaveLength(d)
      }
    }
  })

  it('muscle_gain 4 days is upper/lower split', () => {
    const seq = getFocusSequence('muscle_gain', 4)
    expect(seq).toEqual(['upper_body', 'lower_body', 'upper_body', 'lower_body'])
  })

  it('weight_loss 5 days includes cardio', () => {
    const seq = getFocusSequence('weight_loss', 5)
    expect(seq.filter((f) => f === 'cardio').length).toBeGreaterThan(0)
  })

  it('all focus values are valid', () => {
    const validFocuses = ['full_body', 'upper_body', 'lower_body', 'cardio', 'core']
    const goals = Object.keys(FOCUS_SEQUENCE_MAP) as Array<keyof typeof FOCUS_SEQUENCE_MAP>
    const dayOptions = Object.keys(TRAINING_DAY_MAP).map(Number) as (3 | 4 | 5)[]
    for (const goal of goals) {
      for (const d of dayOptions) {
        const seq = getFocusSequence(goal, d)
        for (const focus of seq) {
          expect(validFocuses).toContain(focus)
        }
      }
    }
  })
})

describe('getAllowedEquipment', () => {
  it('none → only none', () => {
    expect(getAllowedEquipment('none')).toEqual(['none'])
  })

  it('basic → none and basic', () => {
    expect(getAllowedEquipment('basic')).toContain('none')
    expect(getAllowedEquipment('basic')).toContain('basic')
    expect(getAllowedEquipment('basic')).not.toContain('full')
  })

  it('full → includes all levels', () => {
    const result = getAllowedEquipment('full')
    expect(result).toContain('none')
    expect(result).toContain('basic')
    expect(result).toContain('full')
  })
})

describe('getExerciseConfig', () => {
  it('beginner gets 4 exercises, 3 sets', () => {
    const config = getExerciseConfig('beginner', 'muscle_gain')
    expect(config.count).toBe(4)
    expect(config.baseSets).toBe(3)
  })

  it('intermediate gets 5 exercises', () => {
    expect(getExerciseConfig('intermediate', 'fitness').count).toBe(5)
  })

  it('advanced gets 6 exercises, 4 sets', () => {
    const config = getExerciseConfig('advanced', 'muscle_gain')
    expect(config.count).toBe(6)
    expect(config.baseSets).toBe(4)
  })

  it('muscle_gain → 8–12 reps', () => {
    const config = getExerciseConfig('beginner', 'muscle_gain')
    expect(config.repsMin).toBe(8)
    expect(config.repsMax).toBe(12)
  })

  it('weight_loss → 15–20 reps', () => {
    const config = getExerciseConfig('beginner', 'weight_loss')
    expect(config.repsMin).toBe(15)
    expect(config.repsMax).toBe(20)
  })

  it('fitness and flexibility → 12–15 reps', () => {
    expect(getExerciseConfig('beginner', 'fitness').repsMin).toBe(12)
    expect(getExerciseConfig('beginner', 'flexibility').repsMax).toBe(15)
  })

  it('repsMin is always less than or equal to repsMax', () => {
    const goals = ['weight_loss', 'muscle_gain', 'fitness', 'flexibility'] as const
    const levels = ['beginner', 'intermediate', 'advanced'] as const
    for (const goal of goals) {
      for (const level of levels) {
        const { repsMin, repsMax } = getExerciseConfig(level, goal)
        expect(repsMin).toBeLessThanOrEqual(repsMax)
      }
    }
  })
})
