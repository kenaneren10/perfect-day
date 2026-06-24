import Link from 'next/link'
import { Dumbbell, Moon, CheckCircle2, ChevronRight, Zap } from 'lucide-react'

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
  // Rest day
  if (!isTrainingDay) {
    return (
      <div className="bg-zinc-900 rounded-3xl p-6 card-shadow border border-zinc-800/60">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-11 w-11 bg-zinc-800 rounded-2xl flex items-center justify-center shrink-0">
            <Moon className="h-5 w-5 text-zinc-500" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-0.5">Heute</p>
            <p className="font-bold text-lg text-zinc-50">Ruhetag</p>
          </div>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed border-l-2 border-zinc-700 pl-3">{getTip()}</p>
      </div>
    )
  }

  // Completed
  if (sessionCompleted) {
    return (
      <div className="bg-zinc-900 rounded-3xl p-6 glow-green border border-green-500/20">
        <p className="text-xs text-green-500 uppercase tracking-widest font-medium mb-3">Heute</p>
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 bg-green-500/15 rounded-2xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <p className="font-black text-2xl text-zinc-50 leading-tight">{focusLabel}</p>
            <p className="text-sm text-green-400/80 mt-0.5">Erledigt — starke Leistung!</p>
          </div>
        </div>
      </div>
    )
  }

  // In progress
  if (sessionInProgress) {
    return (
      <Link href={`/plan/day/${planDayOfWeek}`}>
        <div className="bg-zinc-900 rounded-3xl p-6 glow-green border border-green-500/30 cursor-pointer group">
          <p className="text-xs text-green-500 uppercase tracking-widest font-medium mb-3">Läuft gerade</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-11 w-11 bg-green-500/15 rounded-2xl flex items-center justify-center">
                  <Zap className="h-5 w-5 text-green-400" />
                </div>
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse block" />
              </div>
              <div>
                <p className="font-black text-2xl text-zinc-50 leading-tight">{focusLabel}</p>
                <p className="text-sm text-zinc-400 mt-0.5">Training fortsetzen</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-green-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>
    )
  }

  // Ready to start — dominant hero
  return (
    <Link href={`/plan/day/${planDayOfWeek}`}>
      <div className="bg-zinc-900 rounded-3xl p-6 card-shadow-lg border border-zinc-800/60 cursor-pointer group hover:border-zinc-700 transition-all">
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">Heute auf dem Plan</p>

        <p className="font-black text-4xl text-zinc-50 leading-none mb-1">{focusLabel}</p>
        {exerciseCount !== undefined && (
          <p className="text-sm text-zinc-500 mb-6">
            {exerciseCount} {exerciseCount === 1 ? 'Übung' : 'Übungen'}
          </p>
        )}

        <div className="flex items-center justify-center gap-2 bg-green-500 group-hover:bg-green-400 rounded-full py-3.5 px-6 transition-colors">
          <Dumbbell className="h-4 w-4 text-black" />
          <span className="font-bold text-black text-sm tracking-wide">Jetzt starten</span>
        </div>
      </div>
    </Link>
  )
}
