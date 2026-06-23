import type { SupabaseClient } from '@supabase/supabase-js'

// ── Domain types ────────────────────────────────────────────────────────────

export type Goal = 'weight_loss' | 'muscle_gain' | 'fitness' | 'flexibility'
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced'
export type Equipment = 'none' | 'basic' | 'full'
export type Focus = 'full_body' | 'upper_body' | 'lower_body' | 'cardio' | 'core'

export interface UserProfile {
  goal: Goal
  fitness_level: FitnessLevel
  equipment: Equipment
}

export interface ExerciseConfig {
  count: number
  baseSets: number
  repsMin: number
  repsMax: number
}

// ── Pure rule tables ────────────────────────────────────────────────────────

// Which week-days are training days (1=Mon … 7=Sun)
export const TRAINING_DAY_MAP: Record<3 | 4 | 5, number[]> = {
  3: [1, 3, 5],       // Mon, Wed, Fri
  4: [1, 2, 4, 5],    // Mon, Tue, Thu, Fri
  5: [1, 2, 3, 4, 5], // Mon–Fri
}

// Focus sequence per (goal × days)
export const FOCUS_SEQUENCE_MAP: Record<Goal, Record<3 | 4 | 5, Focus[]>> = {
  weight_loss: {
    3: ['full_body', 'full_body', 'full_body'],
    4: ['full_body', 'cardio', 'full_body', 'cardio'],
    5: ['upper_body', 'cardio', 'lower_body', 'cardio', 'full_body'],
  },
  muscle_gain: {
    3: ['full_body', 'full_body', 'full_body'],
    4: ['upper_body', 'lower_body', 'upper_body', 'lower_body'],
    5: ['upper_body', 'lower_body', 'upper_body', 'lower_body', 'full_body'],
  },
  fitness: {
    3: ['full_body', 'full_body', 'full_body'],
    4: ['full_body', 'cardio', 'full_body', 'core'],
    5: ['upper_body', 'cardio', 'lower_body', 'cardio', 'full_body'],
  },
  flexibility: {
    3: ['full_body', 'full_body', 'full_body'],
    4: ['full_body', 'core', 'full_body', 'core'],
    5: ['full_body', 'core', 'full_body', 'core', 'full_body'],
  },
}

export const FOCUS_LABELS: Record<Focus, string> = {
  full_body: 'Ganzkörper',
  upper_body: 'Oberkörper',
  lower_body: 'Unterkörper',
  cardio: 'Ausdauer',
  core: 'Core',
}

// Muscle groups per focus (for strength exercises)
export const FOCUS_MUSCLE_GROUPS: Record<Exclude<Focus, 'cardio'>, string[]> = {
  full_body: ['chest', 'back', 'shoulders', 'arms', 'core', 'legs', 'glutes', 'full_body'],
  upper_body: ['chest', 'back', 'shoulders', 'arms'],
  lower_body: ['legs', 'glutes'],
  core: ['core'],
}

// Equipment hierarchy: user's level determines which exercises are accessible
export const EQUIPMENT_ALLOW_LIST: Record<Equipment, string[]> = {
  none: ['none'],
  basic: ['none', 'basic'],
  full: ['none', 'basic', 'full'],
}

// ── Pure accessor functions (unit-testable, no Supabase) ────────────────────

export function getTrainingDays(days: 3 | 4 | 5): number[] {
  return TRAINING_DAY_MAP[days]
}

export function getFocusSequence(goal: Goal, days: 3 | 4 | 5): Focus[] {
  return FOCUS_SEQUENCE_MAP[goal][days]
}

export function getAllowedEquipment(equipment: Equipment): string[] {
  return EQUIPMENT_ALLOW_LIST[equipment]
}

export function getExerciseConfig(level: FitnessLevel, goal: Goal): ExerciseConfig {
  const countMap: Record<FitnessLevel, number> = { beginner: 4, intermediate: 5, advanced: 6 }
  const setsMap: Record<FitnessLevel, number> = { beginner: 3, intermediate: 3, advanced: 4 }
  const repsMap: Record<Goal, [number, number]> = {
    weight_loss: [15, 20],
    muscle_gain: [8, 12],
    fitness: [12, 15],
    flexibility: [12, 15],
  }
  const [repsMin, repsMax] = repsMap[goal]
  return { count: countMap[level], baseSets: setsMap[level], repsMin, repsMax }
}

// ── Shuffle helper ──────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// ── Plan build (requires Supabase client) ───────────────────────────────────

export interface PlannedExercise {
  exerciseId: string
  position: number
  baseSets: number
  repsMin: number
  repsMax: number
}

export interface PlannedDay {
  dayOfWeek: number
  isRestDay: boolean
  focus: Focus | null
  displayLabel: string | null
  exercises: PlannedExercise[]
}

export async function buildPlanDays(
  supabase: SupabaseClient,
  profile: UserProfile,
  trainingDaysPerWeek: 3 | 4 | 5,
): Promise<PlannedDay[]> {
  const trainingDays = getTrainingDays(trainingDaysPerWeek)
  const focusSequence = getFocusSequence(profile.goal, trainingDaysPerWeek)
  const { count, baseSets, repsMin, repsMax } = getExerciseConfig(
    profile.fitness_level,
    profile.goal,
  )
  const allowedEquipment = getAllowedEquipment(profile.equipment)

  const planDays: PlannedDay[] = []

  for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
    const trainingIndex = trainingDays.indexOf(dayOfWeek)

    if (trainingIndex === -1) {
      planDays.push({ dayOfWeek, isRestDay: true, focus: null, displayLabel: null, exercises: [] })
      continue
    }

    const focus = focusSequence[trainingIndex]
    const displayLabel = FOCUS_LABELS[focus]

    // Query exercises from the library
    let candidateIds: string[] = []

    if (focus === 'cardio') {
      const { data } = await supabase
        .from('exercises')
        .select('id')
        .eq('category', 'cardio')
        .in('equipment', allowedEquipment)
        .is('deleted_at', null)
      candidateIds = (data ?? []).map((r: { id: string }) => r.id)
    } else {
      const muscleGroups = FOCUS_MUSCLE_GROUPS[focus as Exclude<Focus, 'cardio'>]
      const { data } = await supabase
        .from('exercises')
        .select('id')
        .eq('category', 'strength')
        .in('equipment', allowedEquipment)
        .overlaps('muscle_groups', muscleGroups)
        .is('deleted_at', null)
      candidateIds = (data ?? []).map((r: { id: string }) => r.id)
    }

    // Randomly select N exercises (or all if fewer than N available)
    const selected = shuffle(candidateIds).slice(0, count)

    planDays.push({
      dayOfWeek,
      isRestDay: false,
      focus,
      displayLabel,
      exercises: selected.map((exerciseId, idx) => ({
        exerciseId,
        position: idx + 1,
        baseSets,
        repsMin,
        repsMax,
      })),
    })
  }

  return planDays
}

// ── Persist plan to DB ──────────────────────────────────────────────────────

export async function persistPlan(
  supabase: SupabaseClient,
  userId: string,
  trainingDaysPerWeek: 3 | 4 | 5,
  plannedDays: PlannedDay[],
): Promise<{ error?: string }> {
  // 1. Create the workout_plan row
  const { data: plan, error: planError } = await supabase
    .from('workout_plans')
    .insert({ user_id: userId, training_days_per_week: trainingDaysPerWeek })
    .select('id')
    .single()

  if (planError || !plan) {
    return { error: planError?.message ?? 'Plan konnte nicht erstellt werden' }
  }

  // 2. Create plan_days and their exercises in sequence
  for (const day of plannedDays) {
    const { data: planDay, error: dayError } = await supabase
      .from('plan_days')
      .insert({
        plan_id: plan.id,
        day_of_week: day.dayOfWeek,
        is_rest_day: day.isRestDay,
        focus: day.focus,
        display_label: day.displayLabel,
      })
      .select('id')
      .single()

    if (dayError || !planDay) continue

    if (day.exercises.length > 0) {
      await supabase.from('plan_exercises').insert(
        day.exercises.map((ex) => ({
          day_id: planDay.id,
          exercise_id: ex.exerciseId,
          position: ex.position,
          base_sets: ex.baseSets,
          reps_min: ex.repsMin,
          reps_max: ex.repsMax,
        })),
      )
    }
  }

  return {}
}
