'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Flame, Dumbbell, Clock, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SessionSummary } from '@/types/session'

interface Props {
  summary: SessionSummary
  celebrate?: boolean
}

function getStreakMessage(streak: number): { headline: string; subline: string } {
  if (streak >= 30) return {
    headline: `${streak} Tage Streak`,
    subline: 'Legendary — du bist nicht mehr aufzuhalten.',
  }
  if (streak >= 14) return {
    headline: `${streak} Tage Streak`,
    subline: 'Das ist echte Disziplin.',
  }
  if (streak >= 7) return {
    headline: '1 Woche Streak',
    subline: 'Sieben Tage ohne Pause — Gewohnheit entsteht.',
  }
  if (streak >= 3) return {
    headline: `${streak} Tage Streak`,
    subline: 'Du bist im Rhythmus — bleib dran!',
  }
  if (streak === 2) return {
    headline: 'Doppelpack!',
    subline: 'Zwei Tage hintereinander — weiter so!',
  }
  if (streak === 1) return {
    headline: 'Erster Schritt!',
    subline: 'Heute hast du trainiert. Das zählt.',
  }
  return {
    headline: 'Einheit abgeschlossen!',
    subline: 'Starke Leistung — weiter so!',
  }
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} Min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} Std ${m} Min` : `${h} Std`
}

export function SessionSummaryBlock({ summary, celebrate = false }: Props) {
  const { streak, completedSets, totalSets, volumeKg, durationMinutes } = summary
  const { headline, subline } = getStreakMessage(streak)

  useEffect(() => {
    if (!celebrate) return
    import('canvas-confetti').then((mod) => {
      const confetti = mod.default
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.35 },
        colors: ['#22c55e', '#16a34a', '#4ade80', '#ffffff', '#fbbf24', '#f59e0b'],
        gravity: 0.9,
      })
    })
  }, [celebrate])

  return (
    <div className="mt-8 space-y-4 animate-slide-up">
      {/* Streak hero */}
      <div className="bg-gradient-to-br from-green-500/15 to-zinc-900 border border-green-500/30 rounded-2xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Flame className="h-5 w-5 text-amber-400" />
          <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Streak</span>
        </div>
        <p className="text-6xl font-black text-zinc-50 mb-1 tabular-nums">{streak}</p>
        <p className="text-lg font-bold text-green-400 mb-1">{headline}</p>
        <p className="text-sm text-zinc-400">{subline}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center text-center">
          <Dumbbell className="h-4 w-4 text-green-400 mb-2" />
          <p className="text-xl font-bold text-zinc-50 tabular-nums">
            {completedSets}
            <span className="text-sm text-zinc-500 font-normal">/{totalSets}</span>
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">Sätze</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center text-center">
          <Clock className="h-4 w-4 text-blue-400 mb-2" />
          <p className="text-xl font-bold text-zinc-50 tabular-nums">{formatDuration(durationMinutes)}</p>
          <p className="text-xs text-zinc-500 mt-0.5">Dauer</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center text-center">
          <TrendingUp className="h-4 w-4 text-violet-400 mb-2" />
          <p className="text-xl font-bold text-zinc-50 tabular-nums">
            {volumeKg > 0 ? volumeKg.toLocaleString('de-DE') : '—'}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">kg Volumen</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-1">
        <Link href="/plan" className="flex-1">
          <Button variant="outline" className="w-full border-zinc-700 text-zinc-50 hover:bg-zinc-800">
            Zurück zum Plan
          </Button>
        </Link>
        <Link href="/history" className="flex-1">
          <Button className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold">
            Verlauf ansehen
          </Button>
        </Link>
      </div>
    </div>
  )
}
