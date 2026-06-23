'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function generatePlan(trainingDaysPerWeek: number): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht authentifiziert' }

  // TODO: Implemented by /backend skill
  // Will: 1) Save training_days_per_week to profiles
  //       2) Generate plan_days based on goal/days rule matrix
  //       3) Select exercises for each day based on equipment/level
  //       4) Save workout_plans, plan_days, plan_exercises to DB
  void trainingDaysPerWeek

  revalidatePath('/plan')
  return {}
}

export async function regeneratePlan(): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht authentifiziert' }

  // TODO: Implemented by /backend skill
  // Will: 1) Delete existing workout_plans row (cascades to plan_days + plan_exercises)
  //       2) Call generatePlan with existing training_days_per_week from profile

  revalidatePath('/plan')
  return {}
}

export async function confirmProgression(): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht authentifiziert' }

  // TODO: Implemented by /backend skill
  // Will: INCREMENT sets_bonus by 1, set progression_pending = false

  revalidatePath('/plan')
  return {}
}

export async function dismissProgression(): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht authentifiziert' }

  // TODO: Implemented by /backend skill
  // Will: SET progression_pending = false

  revalidatePath('/plan')
  return {}
}
