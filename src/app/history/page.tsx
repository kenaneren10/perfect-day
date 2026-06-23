import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Flame, Dumbbell } from 'lucide-react'
import { TrainingCalendar } from '@/components/history/TrainingCalendar'
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

      // Compute streak (consecutive training days completed)
      for (let i = days.length - 1; i >= 0; i--) {
        const day = days[i]
        if (day.isFuture) continue
        if (!day.isTrainingDay) continue
        if (day.sessionCompleted) {
          currentStreak++
        } else if (!day.isToday) {
          break
        }
      }
    }
  } catch {
    // Tables not yet migrated
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-50 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-zinc-50 mb-6">Trainingshistorie</h1>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 bg-orange-500/10 rounded-lg flex items-center justify-center shrink-0">
              <Flame className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-50">{currentStreak}</p>
              <p className="text-xs text-zinc-400">
                {currentStreak === 1 ? 'Tag Streak' : 'Tage Streak'}
              </p>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
              <Dumbbell className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-50">{totalCompleted}</p>
              <p className="text-xs text-zinc-400">Einheiten gesamt</p>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm font-medium text-zinc-400 mb-4">Letzte 4 Wochen</p>
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
