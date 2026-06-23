import Link from 'next/link'
import { Flame, Target, TrendingUp } from 'lucide-react'
import type { ProgressStats } from '@/types/session'

interface Props {
  stats: ProgressStats
}

export function ProgressStatsWidget({ stats }: Props) {
  const { currentStreak, completedThisWeek, plannedThisWeek, totalCompleted } = stats

  if (totalCompleted === 0) {
    return (
      <Link href="/plan">
        <div className="bg-zinc-900 border border-zinc-800 hover:border-green-500/50 rounded-xl p-5 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Flame className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <p className="font-semibold text-zinc-50 group-hover:text-green-400 transition-colors">
                Starte dein erstes Training
              </p>
              <p className="text-sm text-zinc-400">Öffne deinen Trainingsplan und leg los!</p>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href="/history">
      <div className="bg-zinc-900 border border-zinc-800 hover:border-green-500/50 rounded-xl p-5 transition-colors cursor-pointer group">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-zinc-50 group-hover:text-green-400 transition-colors">
            Fortschritt
          </p>
          <TrendingUp className="h-4 w-4 text-zinc-500 group-hover:text-green-400 transition-colors" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Streak */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="h-4 w-4 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-zinc-50">{currentStreak}</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {currentStreak === 1 ? 'Tag Streak' : 'Tage Streak'}
            </p>
          </div>

          {/* This week */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-zinc-50">
              {completedThisWeek}
              <span className="text-base text-zinc-500 font-normal">/{plannedThisWeek}</span>
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">diese Woche</p>
          </div>

          {/* Total */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-sm">🏋️</span>
            </div>
            <p className="text-2xl font-bold text-zinc-50">{totalCompleted}</p>
            <p className="text-xs text-zinc-500 mt-0.5">gesamt</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
