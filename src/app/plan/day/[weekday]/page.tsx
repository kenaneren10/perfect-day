import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Dumbbell, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WorkoutExerciseCard } from '@/components/plan/WorkoutExerciseCard'
import { DAY_NAMES, FOCUS_LABELS, WorkoutFocus } from '@/types/plan'
import type { PlanExercise, WorkoutPlan } from '@/types/plan'

interface Props {
  params: Promise<{ weekday: string }>
}

export default async function WorkoutDayPage({ params }: Props) {
  const { weekday } = await params
  const dayOfWeek = parseInt(weekday, 10)

  if (isNaN(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Load plan
  const { data: plan, error: planError } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (planError || !plan) redirect('/plan')

  // Load the specific day
  const { data: planDay, error: dayError } = await supabase
    .from('plan_days')
    .select('*')
    .eq('plan_id', (plan as WorkoutPlan).id)
    .eq('day_of_week', dayOfWeek)
    .single()

  if (dayError || !planDay) redirect('/plan')
  if (planDay.is_rest_day) redirect('/plan')

  // Load exercises for this day (joined with exercise details)
  const { data: exercises } = await supabase
    .from('plan_exercises')
    .select(`
      *,
      exercise:exercises (
        id,
        name,
        description,
        equipment,
        muscle_groups
      )
    `)
    .eq('day_id', planDay.id)
    .order('position')

  const dayName = DAY_NAMES[dayOfWeek]
  const focusLabel =
    planDay.display_label ??
    (planDay.focus ? FOCUS_LABELS[planDay.focus as WorkoutFocus] : 'Training')
  const setsBonus = (plan as WorkoutPlan).sets_bonus
  const exerciseList = (exercises as PlanExercise[]) ?? []

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Back navigation */}
        <Link href="/plan" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-50 transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Zurück zum Plan
        </Link>

        {/* Day header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-zinc-50">{focusLabel}</h1>
            <Badge className="bg-zinc-800 text-zinc-400 border-0 text-xs">{dayName}</Badge>
          </div>
          <p className="text-sm text-zinc-400">
            {exerciseList.length} Übungen ·{' '}
            {exerciseList.length > 0
              ? `${exerciseList[0].base_sets + setsBonus} Sätze je`
              : '–'}
          </p>
        </div>

        {/* Exercise list */}
        {exerciseList.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center space-y-3">
            <div className="h-12 w-12 bg-zinc-800 rounded-xl flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-zinc-600" />
            </div>
            <p className="text-zinc-400 text-sm">Noch keine Übungen zugewiesen</p>
            <p className="text-zinc-600 text-xs">Erstell deinen Plan neu, um Übungen zu erhalten.</p>
            <Link href="/plan">
              <Button variant="ghost" size="sm" className="text-zinc-400 mt-2">
                Zurück zum Plan
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {exerciseList.map((pe, index) => (
              <WorkoutExerciseCard
                key={pe.id}
                planExercise={pe}
                effectiveSets={pe.base_sets + setsBonus}
                position={index + 1}
              />
            ))}
          </div>
        )}

        {/* Start workout button — placeholder for PROJ-5 */}
        {exerciseList.length > 0 && (
          <div className="mt-8">
            <Button
              disabled
              className="w-full h-12 bg-zinc-800 text-zinc-500 border border-zinc-700 font-semibold cursor-not-allowed"
            >
              <Play className="h-4 w-4 mr-2" />
              Training starten — kommt bald
            </Button>
            <p className="text-xs text-zinc-600 text-center mt-2">
              Session-Tracking kommt mit dem Fortschritts-Feature
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
