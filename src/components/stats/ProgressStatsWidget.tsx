import Link from 'next/link'
import { Flame } from 'lucide-react'
import type { ProgressStats } from '@/types/session'

interface Props {
  stats: ProgressStats
}

export function ProgressStatsWidget({ stats }: Props) {
  const { currentStreak, completedThisWeek, plannedThisWeek, totalCompleted } = stats

  if (totalCompleted === 0) {
    return (
      <Link href="/plan">
        <div className="bg-zinc-900 rounded-2xl p-5 card-shadow border border-zinc-800/60 flex items-center gap-4 group hover:border-zinc-700 transition-all">
          <div className="h-11 w-11 bg-amber-500/10 rounded-2xl flex items-center justify-center shrink-0">
            <Flame className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="font-semibold text-zinc-50 group-hover:text-green-400 transition-colors">
              Starte dein erstes Training
            </p>
            <p className="text-sm text-zinc-500 mt-0.5">Öffne deinen Plan und leg los</p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href="/history">
      <div className="bg-zinc-900 rounded-2xl p-5 card-shadow border border-zinc-800/60 group hover:border-zinc-700 transition-all">
        <div className="grid grid-cols-3 divide-x divide-zinc-800">
          {/* Streak */}
          <div className="flex flex-col items-center gap-1 pr-4">
            <div className="flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-amber-400" />
              <span className="text-4xl font-black text-zinc-50 tabular-nums leading-none">{currentStreak}</span>
            </div>
            <p className="text-xs text-zinc-500">Tage Streak</p>
          </div>

          {/* This week */}
          <div className="flex flex-col items-center gap-1 px-4">
            <span className="text-4xl font-black text-zinc-50 tabular-nums leading-none">
              {completedThisWeek}
              <span className="text-xl text-zinc-600 font-medium">/{plannedThisWeek}</span>
            </span>
            <p className="text-xs text-zinc-500">Diese Woche</p>
          </div>

          {/* Total */}
          <div className="flex flex-col items-center gap-1 pl-4">
            <span className="text-4xl font-black text-zinc-50 tabular-nums leading-none">{totalCompleted}</span>
            <p className="text-xs text-zinc-500">Gesamt</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
