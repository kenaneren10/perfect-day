import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Flame, Dumbbell } from 'lucide-react'
import { TrainingCalendar } from '@/components/history/TrainingCalendar'
import { calculateStreak } from '@/lib/session/streak'
import type { DayStatus } from '@/types/session'

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getDayOfWeek(date: Date): number {
  const d = date.getDay()
  return d === 0 ? 7 : d
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Build 28-day range starting from the Monday 4 weeks ago
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayDow = getDayOfWeek(today)
  // Align start to Monday
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - todayDow + 1 - 21) // 4 weeks back from current Monday

  const days: DayStatus[] = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    return {
      date: toLocalDateStr(d),
      dayOfWeek: getDayOfWeek(d),
      isTrainingDay: false,
      isToday: toLocalDateStr(d) === toLocalDateStr(today),
      isFuture: d > today,
      sessionCompleted: false,
      sessionMissed: false,
    }
  })

  let currentStreak = 0
  let totalCompleted = 0
  const sessionDetails: Record<string, { sessionId: string; exerciseCount: number; volumeKg: number; durationMinutes: number }> = {}

  try {
    // Get plan training days
    const { data: plan } = await supabase
      .from('workout_plans')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (plan) {
      const { data: planDays } = await supabase
        .from('plan_days')
        .select('day_of_week')
        .eq('plan_id', plan.id)
        .eq('is_rest_day', false)

      const trainingWeekdays = new Set((planDays ?? []).map((d: { day_of_week: number }) => d.day_of_week))

      // Mark training days
      for (const day of days) {
        if (trainingWeekdays.has(day.dayOfWeek)) {
          day.isTrainingDay = true
        }
      }

      // Load completed sessions in date range
      const startStr = days[0].date
      const endStr = days[days.length - 1].date

      const { data: sessions, count } = await supabase
        .from('workout_sessions')
        .select('id, completed_at, started_at', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', `${startStr}T00:00:00`)
        .lte('completed_at', `${endStr}T23:59:59`)

      // Count total completed (all time)
      const { count: total } = await supabase
        .from('workout_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed')

      totalCompleted = total ?? 0

      // Map sessions to days
      const completedByDate: Record<string, string> = {}
      for (const s of sessions ?? []) {
        const dateStr = s.completed_at.split('T')[0]
        completedByDate[dateStr] = s.id
      }

      for (const day of days) {
        if (!day.isTrainingDay) continue
        const sessionId = completedByDate[day.date]
        if (sessionId) {
          day.sessionCompleted = true
          day.sessionId = sessionId
        } else if (!day.isToday && !day.isFuture) {
          day.sessionMissed = true
        }
      }

      // Load session set details for completed sessions
      const completedSessionIds = Object.values(completedByDate)
      if (completedSessionIds.length > 0) {
        const { data: setsData } = await supabase
          .from('session_sets')
          .select('session_id, plan_exercise_id, weight_kg, reps, duration_minutes')
          .in('session_id', completedSessionIds)

        const setsGrouped: Record<string, typeof setsData> = {}
        for (const s of setsData ?? []) {
          if (!setsGrouped[s.session_id]) setsGrouped[s.session_id] = []
          setsGrouped[s.session_id]!.push(s)
        }

        for (const [sessionId, sets] of Object.entries(setsGrouped)) {
          const session = (sessions ?? []).find((s) => s.id === sessionId)
          const volumeKg = (sets ?? []).reduce(
            (sum, s) => sum + (s.weight_kg ?? 0) * (s.reps ?? 0),
            0,
          )
          const durationMinutes = session
            ? Math.round(
                (new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()) / 60000,
              )
            : 0

          const exerciseCount = new Set((sets ?? []).map((s) => s.plan_exercise_id)).size

          sessionDetails[sessionId] = {
            sessionId,
            exerciseCount,
            volumeKg: Math.round(volumeKg),
            durationMinutes,
          }
        }
      }

      // Compute streak from all-time completed sessions (not just 4-week window)
      const { data: allSessions } = await supabase
        .from('workout_sessions')
        .select('completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')

      const allCompletedDates = new Set(
        (allSessions ?? []).map((s: { completed_at: string }) => s.completed_at.split('T')[0]),
      )
      currentStreak = calculateStreak(trainingWeekdays, allCompletedDates, today)
    }
  } catch {
    // Tables not yet migrated
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-10 pb-8">
        {/* Back */}
        <h1 className="text-3xl font-black text-zinc-50 mb-6">Verlauf</h1>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-5 card-shadow">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-amber-400" />
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Streak</p>
            </div>
            <p className="text-4xl font-black text-zinc-50 tabular-nums">{currentStreak}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Tage</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-5 card-shadow">
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell className="h-4 w-4 text-zinc-500" />
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Gesamt</p>
            </div>
            <p className="text-4xl font-black text-zinc-50 tabular-nums">{totalCompleted}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Einheiten</p>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-5 card-shadow">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Letzte 4 Wochen</p>
          <TrainingCalendar days={days} sessionDetails={sessionDetails} />
        </div>

        {totalCompleted === 0 && (
          <div className="mt-6 text-center py-8">
            <p className="text-zinc-400 text-sm">Noch kein Training abgeschlossen.</p>
            <p className="text-zinc-600 text-xs mt-1">
              Starte eine Einheit über deinen <Link href="/plan" className="text-green-400 hover:underline">Trainingsplan</Link>.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
