export type WorkoutFocus = 'full_body' | 'upper_body' | 'lower_body' | 'cardio' | 'core'

export const FOCUS_LABELS: Record<WorkoutFocus, string> = {
  full_body: 'Ganzkörper',
  upper_body: 'Oberkörper',
  lower_body: 'Unterkörper',
  cardio: 'Ausdauer',
  core: 'Core',
}

export const DAY_NAMES: Record<number, string> = {
  1: 'Montag',
  2: 'Dienstag',
  3: 'Mittwoch',
  4: 'Donnerstag',
  5: 'Freitag',
  6: 'Samstag',
  7: 'Sonntag',
}

export const DAY_ABBREVIATIONS: Record<number, string> = {
  1: 'Mo',
  2: 'Di',
  3: 'Mi',
  4: 'Do',
  5: 'Fr',
  6: 'Sa',
  7: 'So',
}

export interface WorkoutPlan {
  id: string
  user_id: string
  training_days_per_week: number
  sets_bonus: number
  progression_pending: boolean
  created_at: string
  updated_at: string
}

export interface PlanDay {
  id: string
  plan_id: string
  day_of_week: number
  is_rest_day: boolean
  focus: WorkoutFocus | null
  display_label: string | null
}

export interface PlanExercise {
  id: string
  day_id: string
  exercise_id: string
  position: number
  base_sets: number
  reps_min: number
  reps_max: number
  exercise: {
    id: string
    name: string
    description: string | null
    equipment: string
    muscle_groups: string[]
    category: string
  }
}

export interface PlanDayWithExercises extends PlanDay {
  exercises: PlanExercise[]
}
