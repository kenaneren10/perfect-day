'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { calculateStreak, toISODateStr, toDayOfWeek } from '@/lib/session/streak'
import type { SessionSummary } from '@/types/session'

export async function startSession(
  planDayId: string,
): Promise<{ sessionId?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht authentifiziert' }

  const today = new Date()
  const todayStart = new Date(today)
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(today)
  todayEnd.setHours(23, 59, 59, 999)

  // Check for existing session TODAY for this plan_day
  const { data: existing } = await supabase
    .from('workout_sessions')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('plan_day_id', planDayId)
    .gte('started_at', todayStart.toISOString())
    .lte('started_at', todayEnd.toISOString())
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  if (existing) {
    // Resume in_progress or return completed session
    revalidatePath('/plan')
    return { sessionId: existing.id }
  }

  const { data: session, error } = await supabase
    .from('workout_sessions')
    .insert({ user_id: user.id, plan_day_id: planDayId, status: 'in_progress' })
    .select('id')
    .single()

  if (error || !session) {
    return { error: error?.message ?? 'Session konnte nicht gestartet werden' }
  }

  revalidatePath('/plan')
  return { sessionId: session.id }
}

export async function logSet(
  sessionId: string,
  planExerciseId: string,
  setNumber: number,
  data: { weightKg?: number; reps?: number; durationMinutes?: number },
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht authentifiziert' }

  const { error } = await supabase
    .from('session_sets')
    .upsert(
      {
        session_id: sessionId,
        plan_exercise_id: planExerciseId,
        set_number: setNumber,
        weight_kg: data.weightKg ?? null,
        reps: data.reps ?? null,
        duration_minutes: data.durationMinutes ?? null,
      },
      { onConflict: 'session_id,plan_exercise_id,set_number' },
    )

  if (error) return { error: error.message }
  return {}
}

export async function completeSession(
  sessionId: string,
): Promise<{ summary?: SessionSummary; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht authentifiziert' }

  // Mark session as completed
  const { data: session, error: updateError } = await supabase
    .from('workout_sessions')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .select('started_at, completed_at, plan_day_id')
    .single()

  if (updateError || !session) {
    return { error: updateError?.message ?? 'Session konnte nicht abgeschlossen werden' }
  }

  // Load session sets for summary
  const { data: sets } = await supabase
    .from('session_sets')
    .select('weight_kg, reps, duration_minutes')
    .eq('session_id', sessionId)

  const sessionSets = sets ?? []
  const completedSets = sessionSets.length
  const volumeKg = sessionSets.reduce((sum, s) => {
    return sum + (s.weight_kg ?? 0) * (s.reps ?? 0)
  }, 0)

  const startedAt = new Date(session.started_at)
  const completedAt = new Date(session.completed_at!)
  const durationMinutes = Math.round((completedAt.getTime() - startedAt.getTime()) / 60000)

  // Load total planned sets across all plan exercises for this plan_day
  const { data: planExercises } = await supabase
    .from('plan_exercises')
    .select('base_sets')
    .eq('day_id', session.plan_day_id)

  const { data: planRow } = await supabase
    .from('workout_plans')
    .select('sets_bonus')
    .eq('user_id', user.id)
    .single()

  const setsBonus = planRow?.sets_bonus ?? 0
  const totalSets = (planExercises ?? []).reduce((sum, pe) => sum + pe.base_sets + setsBonus, 0)

  // Count total completed sessions and check progression threshold
  const { count } = await supabase
    .from('workout_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')

  const totalCompleted = count ?? 0
  const threshold = 8 * (setsBonus + 1)

  if (totalCompleted >= threshold) {
    await supabase
      .from('workout_plans')
      .update({ progression_pending: true })
      .eq('user_id', user.id)
  }

  // Compute streak using pure function
  const streak = await fetchAndComputeStreak(supabase, user.id)

  revalidatePath('/plan')
  revalidatePath('/')
  revalidatePath('/history')

  return {
    summary: {
      streak,
      completedSets,
      totalSets,
      volumeKg: Math.round(volumeKg),
      durationMinutes,
    },
  }
}

async function fetchAndComputeStreak(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<number> {
  const { data: plan } = await supabase
    .from('workout_plans')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!plan) return 0

  const { data: trainingDays } = await supabase
    .from('plan_days')
    .select('day_of_week')
    .eq('plan_id', plan.id)
    .eq('is_rest_day', false)

  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('completed_at')
    .eq('user_id', userId)
    .eq('status', 'completed')

  const trainingWeekdays = new Set(
    (trainingDays ?? []).map((d: { day_of_week: number }) => d.day_of_week),
  )
  const completedDates = new Set(
    (sessions ?? []).map((s: { completed_at: string }) => s.completed_at.split('T')[0]),
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return calculateStreak(trainingWeekdays, completedDates, today)
}
