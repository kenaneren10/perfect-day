export type SessionStatus = 'in_progress' | 'completed'

export interface WorkoutSession {
  id: string
  user_id: string
  plan_day_id: string
  status: SessionStatus
  started_at: string
  completed_at: string | null
}

export interface SessionSet {
  id: string
  session_id: string
  plan_exercise_id: string
  set_number: number
  weight_kg: number | null
  reps: number | null
  duration_minutes: number | null
  logged_at: string
}

export interface SessionSummary {
  streak: number
  completedSets: number
  totalSets: number
  volumeKg: number
  durationMinutes: number
}

export interface DayStatus {
  date: string // ISO date YYYY-MM-DD
  dayOfWeek: number // 1=Mon … 7=Sun
  isTrainingDay: boolean
  isToday: boolean
  isFuture: boolean
  sessionCompleted: boolean
  sessionMissed: boolean
  sessionId?: string
}

export interface ProgressStats {
  currentStreak: number
  completedThisWeek: number
  plannedThisWeek: number
  totalCompleted: number
}
