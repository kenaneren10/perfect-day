import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { User } from 'lucide-react'
import { ProgressStatsWidget } from '@/components/stats/ProgressStatsWidget'
import { CalorieWidget } from '@/components/nutrition/CalorieWidget'
import { MobilityWidget } from '@/components/mobility/MobilityWidget'
import { TodayHeroCard } from '@/components/dashboard/TodayHeroCard'
import { calculateStreak, toDayOfWeek } from '@/lib/session/streak'
import { getGreeting, getMotivationLine } from '@/lib/greeting'
import type { ProgressStats } from '@/types/session'
import type { WorkoutFocus } from '@/types/plan'
import { FOCUS_LABELS } from '@/types/plan'

async function loadProgressStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<ProgressStats> {
  const empty: ProgressStats = { currentStreak: 0, completedThisWeek: 0, plannedThisWeek: 0, totalCompleted: 0 }

  try {
    const { count: total } = await supabase
      .from('workout_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (!total) return empty

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

    const { data: plan } = await supabase
      .from('workout_plans')
      .select('id, training_days_per_week')
      .eq('user_id', userId)
      .single()

    const plannedThisWeek = plan?.training_days_per_week ?? 0

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

interface TodayStatus {
  isTrainingDay: boolean
  planDayOfWeek?: number
  focusLabel?: string
  exerciseCount?: number
  sessionCompleted?: boolean
  sessionInProgress?: boolean
}

async function loadTodayStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<TodayStatus> {
  try {
    const { data: plan } = await supabase
      .from('workout_plans')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!plan) return { isTrainingDay: false }

    const jsDay = new Date().getDay()
    const dow = jsDay === 0 ? 7 : jsDay

    const { data: planDay } = await supabase
      .from('plan_days')
      .select('id, day_of_week, is_rest_day, focus, display_label')
      .eq('plan_id', plan.id)
      .eq('day_of_week', dow)
      .single()

    if (!planDay || planDay.is_rest_day) return { isTrainingDay: false }

    const { count: exerciseCount } = await supabase
      .from('plan_exercises')
      .select('id', { count: 'exact', head: true })
      .eq('day_id', planDay.id)

    const today = new Date()
    const todayStart = new Date(today.setHours(0, 0, 0, 0))
    const todayEnd = new Date(new Date().setHours(23, 59, 59, 999))

    const { data: session } = await supabase
      .from('workout_sessions')
      .select('status')
      .eq('user_id', userId)
      .eq('plan_day_id', planDay.id)
      .gte('started_at', todayStart.toISOString())
      .lte('started_at', todayEnd.toISOString())
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const focusLabel =
      planDay.display_label ??
      (planDay.focus ? FOCUS_LABELS[planDay.focus as WorkoutFocus] : 'Training')

    return {
      isTrainingDay: true,
      planDayOfWeek: dow,
      focusLabel,
      exerciseCount: exerciseCount ?? 0,
      sessionCompleted: session?.status === 'completed',
      sessionInProgress: session?.status === 'in_progress',
    }
  } catch {
    return { isTrainingDay: false }
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

  const [stats, todayStatus] = await Promise.all([
    loadProgressStats(supabase, user.id),
    loadTodayStatus(supabase, user.id),
  ])

  // Calorie widget
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

  // Mobility widget
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

  // Contextual greeting (QW-3) — Berlin timezone
  const berlinHour = parseInt(
    new Date().toLocaleString('de-DE', {
      timeZone: 'Europe/Berlin',
      hour: 'numeric',
      hour12: false,
    }),
  )
  const greeting = getGreeting(berlinHour)
  const motivationLine = getMotivationLine(
    stats.currentStreak,
    stats.completedThisWeek,
    stats.plannedThisWeek,
  )

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-zinc-500 text-sm">{greeting},</p>
            <h1 className="text-3xl font-bold text-zinc-50">{firstName}</h1>
            <p className="text-sm text-zinc-400 mt-1">{motivationLine}</p>
          </div>
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 mt-1">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Today Hero Card (QW-1) */}
        <TodayHeroCard {...todayStatus} />

        {/* Progress stats */}
        <ProgressStatsWidget stats={stats} />

        {/* Calorie widget — only when goal is configured */}
        {calorieGoal && (
          <CalorieWidget consumed={consumedKcal} goal={calorieGoal} />
        )}

        {/* Mobility widget */}
        <MobilityWidget completedToday={mobilityCompletedToday} />
      </div>
    </main>
  )
}
