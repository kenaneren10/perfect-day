'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { buildPlanDays, persistPlan } from '@/lib/plan/generate'
import type { Goal, FitnessLevel, Equipment } from '@/lib/plan/generate'

export async function generatePlan(trainingDaysPerWeek: number): Promise<{ error?: string }> {
  if (![3, 4, 5].includes(trainingDaysPerWeek)) {
    return { error: 'Ungültige Trainingstage — bitte 3, 4 oder 5 wählen' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht authentifiziert' }

  // Load user profile for plan generation
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('goal, fitness_level, equipment')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.goal || !profile?.fitness_level || !profile?.equipment) {
    return { error: 'Profil unvollständig — bitte Onboarding abschließen' }
  }

  // Save training frequency to profile
  await supabase
    .from('profiles')
    .update({ training_days_per_week: trainingDaysPerWeek })
    .eq('id', user.id)

  // Build plan using rule engine
  const days = trainingDaysPerWeek as 3 | 4 | 5
  const plannedDays = await buildPlanDays(
    supabase,
    {
      goal: profile.goal as Goal,
      fitness_level: profile.fitness_level as FitnessLevel,
      equipment: profile.equipment as Equipment,
    },
    days,
  )

  const result = await persistPlan(supabase, user.id, days, plannedDays)
  if (result.error) return result

  revalidatePath('/plan')
  return {}
}

export async function regeneratePlan(): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht authentifiziert' }

  // Load current training_days_per_week from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('training_days_per_week, goal, fitness_level, equipment')
    .eq('id', user.id)
    .single()

  if (!profile?.training_days_per_week || !profile?.goal || !profile?.fitness_level || !profile?.equipment) {
    return { error: 'Profil unvollständig' }
  }

  // Delete existing plan (CASCADE removes plan_days + plan_exercises)
  await supabase
    .from('workout_plans')
    .delete()
    .eq('user_id', user.id)

  // Generate new plan
  const days = profile.training_days_per_week as 3 | 4 | 5
  const plannedDays = await buildPlanDays(
    supabase,
    {
      goal: profile.goal as Goal,
      fitness_level: profile.fitness_level as FitnessLevel,
      equipment: profile.equipment as Equipment,
    },
    days,
  )

  const result = await persistPlan(supabase, user.id, days, plannedDays)
  if (result.error) return result

  revalidatePath('/plan')
  return {}
}

export async function confirmProgression(): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht authentifiziert' }

  const { data: plan } = await supabase
    .from('workout_plans')
    .select('sets_bonus')
    .eq('user_id', user.id)
    .single()

  if (!plan) return { error: 'Kein aktiver Plan gefunden' }

  await supabase
    .from('workout_plans')
    .update({ sets_bonus: plan.sets_bonus + 1, progression_pending: false })
    .eq('user_id', user.id)

  revalidatePath('/plan')
  return {}
}

export async function dismissProgression(): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht authentifiziert' }

  await supabase
    .from('workout_plans')
    .update({ progression_pending: false })
    .eq('user_id', user.id)

  revalidatePath('/plan')
  return {}
}
