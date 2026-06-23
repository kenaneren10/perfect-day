import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dumbbell, User, Calendar } from 'lucide-react'
import { ProgressStatsWidget } from '@/components/stats/ProgressStatsWidget'
import { CalorieWidget } from '@/components/nutrition/CalorieWidget'
import { MobilityWidget } from '@/components/mobility/MobilityWidget'
import { calculateStreak, toDayOfWeek } from '@/lib/session/streak'
import type { ProgressStats } from '@/types/session'

async function loadProgressStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<ProgressStats> {
  const empty: ProgressStats = { currentStreak: 0, completedThisWeek: 0, plannedThisWeek: 0, totalCompleted: 0 }

  try {
    // Total completed sessions
    const { count: total } = await supabase
      .from('workout_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (!total) return empty

    // This week (Mon–Sun)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dow = toDayOfWeek(today)
    const monday = new Date(today)
    monday.setDate(today.getDate() - dow + 1)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    const mondayStr = monday.toISOString().split('T')[0]
    const sundayStr = sunday.toISOString().split('T')[0]

    const { count: thisWeek } = await supabase
      .from('workout_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', `${mondayStr}T00:00:00`)
      .lte('completed_at', `${sundayStr}T23:59:59`)

    // Planned training days this week (from workout plan)
    const { data: plan } = await supabase
      .from('workout_plans')
      .select('id, training_days_per_week')
      .eq('user_id', userId)
      .single()

    const plannedThisWeek = plan?.training_days_per_week ?? 0

    // Compute streak using pure function
    let streak = 0
    const { data: allSessions } = await supabase
      .from('workout_sessions')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (plan) {
      const { data: planDays } = await supabase
        .from('plan_days')
        .select('day_of_week')
        .eq('plan_id', plan.id)
        .eq('is_rest_day', false)

      const trainingWeekdays = new Set((planDays ?? []).map((d: { day_of_week: number }) => d.day_of_week))
      const completedDates = new Set(
        (allSessions ?? []).map((s: { completed_at: string }) => s.completed_at.split('T')[0]),
      )

      streak = calculateStreak(trainingWeekdays, completedDates, today)
    }

    return {
      currentStreak: streak,
      completedThisWeek: thisWeek ?? 0,
      plannedThisWeek,
      totalCompleted: total,
    }
  } catch {
    return empty
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const firstName = profile?.display_name?.split(' ')[0] ?? 'du'
  const stats = await loadProgressStats(supabase, user.id)

  // Calorie widget: only if user has set up a calorie goal
  const { data: nutritionProfile } = await supabase
    .from('profiles')
    .select('calorie_goal')
    .eq('id', user.id)
    .single()
  const calorieGoal: number | null = nutritionProfile?.calorie_goal ?? null

  let consumedKcal = 0
  if (calorieGoal) {
    try {
      const todayStr = new Date().toISOString().split('T')[0]
      const { data: entries } = await supabase
        .from('food_diary_entries')
        .select('kcal')
        .eq('user_id', user.id)
        .eq('date', todayStr)
      consumedKcal = (entries ?? []).reduce((s: number, e: { kcal: number }) => s + e.kcal, 0)
    } catch {
      // table not yet migrated
    }
  }

  // Mobility widget: today's completion status
  let mobilityCompletedToday = false
  try {
    const todayStr = new Date().toISOString().split('T')[0]
    const { data: mc } = await supabase
      .from('mobility_completions')
      .select('id')
      .eq('user_id', user.id)
      .eq('completed_on', todayStr)
      .maybeSingle()
    mobilityCompletedToday = !!mc
  } catch {
    // table not yet migrated
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-zinc-400 text-sm">Guten Tag,</p>
            <h1 className="text-3xl font-bold text-zinc-50">{firstName} 👋</h1>
          </div>
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Progress stats (PROJ-5) */}
        <div className="mb-4">
          <ProgressStatsWidget stats={stats} />
        </div>

        {/* Calorie widget (PROJ-6) — only shown when goal is configured */}
        {calorieGoal && (
          <div className="mb-4">
            <CalorieWidget consumed={consumedKcal} goal={calorieGoal} />
          </div>
        )}

        {/* Mobility widget (PROJ-7) */}
        <div className="mb-4">
          <MobilityWidget completedToday={mobilityCompletedToday} />
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <Link href="/exercises">
            <div className="bg-zinc-900 border border-zinc-800 hover:border-green-500/50 rounded-xl p-5 flex items-center gap-4 transition-colors cursor-pointer group">
              <div className="h-12 w-12 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
                <Dumbbell className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-zinc-50 group-hover:text-green-400 transition-colors">
                  Übungsbibliothek
                </p>
                <p className="text-sm text-zinc-400">Kraft- &amp; Cardio-Übungen entdecken</p>
              </div>
            </div>
          </Link>

          <Link href="/plan">
            <div className="bg-zinc-900 border border-zinc-800 hover:border-green-500/50 rounded-xl p-5 flex items-center gap-4 transition-colors cursor-pointer group">
              <div className="h-12 w-12 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
                <Calendar className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-zinc-50 group-hover:text-green-400 transition-colors">
                  Trainingsplan
                </p>
                <p className="text-sm text-zinc-400">Dein personalisierter Wochenplan</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}
