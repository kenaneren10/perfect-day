import Link from 'next/link'
import { Dumbbell, Moon, CheckCircle2, ChevronRight, Zap } from 'lucide-react'
import type { WorkoutFocus } from '@/types/plan'

interface TodayHeroCardProps {
  isTrainingDay: boolean
  planDayOfWeek?: number
  focusLabel?: string
  exerciseCount?: number
  sessionCompleted?: boolean
  sessionInProgress?: boolean
}

const REST_TIPS = [
  'Deine Muskeln wachsen in der Erholung — genieß den Tag.',
  'Ein Ruhetag ist Teil des Plans, nicht sein Fehlen.',
  'Geh spazieren, trink viel Wasser und erhol dich bewusst.',
  'Heute regenerierst du — morgen bist du stärker.',
]

const FOCUS_ACCENT: Record<WorkoutFocus, string> = {
  full_body: 'border-green-500/50',
  upper_body: 'border-blue-500/50',
  lower_body: 'border-violet-500/50',
  cardio: 'border-orange-500/50',
  core: 'border-yellow-500/50',
}

function getTip(): string {
  return REST_TIPS[new Date().getDate() % REST_TIPS.length]
}

export function TodayHeroCard({
  isTrainingDay,
  planDayOfWeek,
  focusLabel,
  exerciseCount,
  sessionCompleted,
  sessionInProgress,
}: TodayHeroCardProps) {
  // No plan or rest day
  if (!isTrainingDay) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
            <Moon className="h-5 w-5 text-zinc-500" />
          </div>
          <div>
            <p className="font-semibold text-zinc-50">Ruhetag</p>
            <p className="text-xs text-zinc-500">Erhol dich — das gehört zum Plan.</p>
          </div>
        </div>
        <p className="text-sm text-zinc-400 border-l-2 border-zinc-700 pl-3 italic">{getTip()}</p>
      </div>
    )
  }

  // Session already done today
  if (sessionCompleted) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <p className="font-bold text-zinc-50">Heute erledigt</p>
            <p className="text-xs text-green-400/80 mt-0.5">{focusLabel} · Starke Leistung!</p>
          </div>
        </div>
      </div>
    )
  }

  // Session active (in progress)
  if (sessionInProgress) {
    return (
      <Link href={`/plan/day/${planDayOfWeek}`}>
        <div className="bg-green-500/10 border border-green-500/40 rounded-2xl p-6 cursor-pointer group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Zap className="h-5 w-5 text-green-400" />
                </div>
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse block" />
              </div>
              <div>
                <p className="font-bold text-zinc-50">Training läuft</p>
                <p className="text-xs text-green-400/80 mt-0.5">{focusLabel} · Weitermachen</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-green-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>
    )
  }

  // Ready to start — primary CTA
  return (
    <Link href={`/plan/day/${planDayOfWeek}`}>
      <div className={`bg-zinc-900 border ${FOCUS_ACCENT['full_body']} rounded-2xl p-6 cursor-pointer group hover:bg-zinc-800/80 transition-all`}>
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Heute auf dem Plan</p>
        <h2 className="text-2xl font-bold text-zinc-50 mb-1">{focusLabel}</h2>
        {exerciseCount !== undefined && (
          <p className="text-sm text-zinc-400 mb-5">
            {exerciseCount} {exerciseCount === 1 ? 'Übung' : 'Übungen'} · Bereit wenn du es bist
          </p>
        )}
        <div className="flex items-center justify-between bg-green-500 group-hover:bg-green-400 rounded-xl px-4 py-3 transition-colors">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-black" />
            <span className="font-bold text-black text-sm">Jetzt starten</span>
          </div>
          <ChevronRight className="h-4 w-4 text-black group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
