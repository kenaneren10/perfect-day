import Link from 'next/link'
import { CheckCircle, Flame, Dumbbell, Clock, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SessionSummary } from '@/types/session'

interface Props {
  summary: SessionSummary
}

export function SessionSummaryBlock({ summary }: Props) {
  const { streak, completedSets, totalSets, volumeKg, durationMinutes } = summary

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} Min`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h} Std ${m} Min` : `${h} Std`
  }

  return (
    <div className="mt-8 space-y-4">
      {/* Success header */}
      <div className="flex flex-col items-center text-center py-6 space-y-3">
        <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-50">Einheit abgeschlossen!</h2>
          <p className="text-sm text-zinc-400 mt-1">Starke Leistung — weiter so!</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center text-center">
          <Flame className="h-5 w-5 text-orange-400 mb-1" />
          <p className="text-2xl font-bold text-zinc-50">{streak}</p>
          <p className="text-xs text-zinc-400">
            {streak === 1 ? 'Tag Streak' : 'Tage Streak'}
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center text-center">
          <Dumbbell className="h-5 w-5 text-green-400 mb-1" />
          <p className="text-2xl font-bold text-zinc-50">
            {completedSets}
            <span className="text-base text-zinc-500 font-normal">/{totalSets}</span>
          </p>
          <p className="text-xs text-zinc-400">Sätze</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center text-center">
          <Clock className="h-5 w-5 text-blue-400 mb-1" />
          <p className="text-2xl font-bold text-zinc-50">{formatDuration(durationMinutes)}</p>
          <p className="text-xs text-zinc-400">Dauer</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center text-center">
          <span className="text-lg mb-1">🏋️</span>
          <p className="text-2xl font-bold text-zinc-50">{volumeKg.toLocaleString('de-DE')}</p>
          <p className="text-xs text-zinc-400">kg Volumen</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <Link href="/plan" className="flex-1">
          <Button
            variant="outline"
            className="w-full border-zinc-700 text-zinc-50 hover:bg-zinc-800"
          >
            Zurück zum Plan
          </Button>
        </Link>
        <Link href="/history" className="flex-1">
          <Button className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold">
            <History className="h-4 w-4 mr-2" />
            Verlauf
          </Button>
        </Link>
      </div>
    </div>
  )
}
