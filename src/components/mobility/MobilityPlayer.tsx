'use client'

import { useState, useCallback, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Play, X, ChevronRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { completeMobilityRoutine } from '@/app/mobility/actions'
import { MOBILITY_EXERCISES, TOTAL_EXERCISES, TOTAL_MINUTES } from '@/lib/mobility/exercises'
import { toast } from 'sonner'
import Link from 'next/link'

type Phase = 'overview' | 'playing' | 'done'

interface Props {
  completedToday: boolean
}

export function MobilityPlayer({ completedToday }: Props) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('overview')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isPending, startTransition] = useTransition()

  const handleComplete = useCallback(() => {
    setPhase('done')
    startTransition(async () => {
      const result = await completeMobilityRoutine()
      if (result.error) toast.error(result.error)
    })
  }, [])

  const handleNext = useCallback(() => {
    if (currentIndex < MOBILITY_EXERCISES.length - 1) {
      setCurrentIndex((i) => i + 1)
      setTimeLeft(30)
    } else {
      handleComplete()
    }
  }, [currentIndex, handleComplete])

  const handleStart = () => {
    setCurrentIndex(0)
    setTimeLeft(30)
    setPhase('playing')
  }

  const handleCancel = () => {
    setPhase('overview')
    setCurrentIndex(0)
    setTimeLeft(30)
  }

  // Countdown timer
  useEffect(() => {
    if (phase !== 'playing') return
    if (timeLeft === 0) {
      handleNext()
      return
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [phase, timeLeft, handleNext])

  const exercise = MOBILITY_EXERCISES[currentIndex]
  const timerPct = ((30 - timeLeft) / 30) * 100

  // ── Overview ──────────────────────────────────────────────────────────────
  if (phase === 'overview') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50">Deine tägliche Mobility</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {TOTAL_EXERCISES} Übungen · ca. {TOTAL_MINUTES} Minuten
          </p>
        </div>

        {completedToday && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
            <p className="text-sm text-green-400 font-medium">Heute bereits erledigt</p>
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
          {MOBILITY_EXERCISES.map((ex, i) => (
            <div key={ex.id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-xs text-zinc-600 w-4 shrink-0 tabular-nums">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-50">{ex.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{ex.instruction}</p>
              </div>
              <span className="text-xs text-zinc-500 shrink-0">{ex.duration_seconds}s</span>
            </div>
          ))}
        </div>

        <Button
          onClick={handleStart}
          className="w-full h-14 text-base bg-green-500 hover:bg-green-400 text-black font-bold"
        >
          <Play className="h-5 w-5 mr-2" />
          {completedToday ? 'Erneut starten' : 'Routine starten'}
        </Button>

        <Link
          href="/"
          className="block text-center text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Zurück zum Dashboard
        </Link>
      </div>
    )
  }

  // ── Player ────────────────────────────────────────────────────────────────
  if (phase === 'playing') {
    const isLastExercise = currentIndex === MOBILITY_EXERCISES.length - 1

    return (
      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-400 font-medium">
            Übung {currentIndex + 1} von {TOTAL_EXERCISES}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="text-zinc-500 hover:text-zinc-300 -mr-2"
          >
            <X className="h-4 w-4 mr-1" />
            Abbrechen
          </Button>
        </div>

        {/* Overall progress bar */}
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${(currentIndex / TOTAL_EXERCISES) * 100}%` }}
          />
        </div>

        {/* Exercise card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center space-y-3">
          <p className="text-2xl font-bold text-zinc-50">{exercise.name}</p>
          <p className="text-sm text-zinc-400 leading-relaxed">{exercise.instruction}</p>
        </div>

        {/* Timer */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center space-y-4">
          <p
            className="text-6xl font-bold tabular-nums"
            style={{ color: timeLeft <= 5 ? '#f59e0b' : '#f4f4f5' }}
          >
            {timeLeft}
          </p>
          <p className="text-xs text-zinc-500">Sekunden</p>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${timerPct}%`,
                backgroundColor: timeLeft <= 5 ? '#f59e0b' : '#22c55e',
              }}
            />
          </div>
        </div>

        <Button
          onClick={handleNext}
          className="w-full h-14 text-base bg-zinc-800 hover:bg-zinc-700 text-zinc-50 font-semibold border border-zinc-700"
        >
          {isLastExercise ? (
            'Abschließen'
          ) : (
            <>
              Weiter
              <ChevronRight className="h-5 w-5 ml-1" />
            </>
          )}
        </Button>
      </div>
    )
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  return (
    <div className="text-center space-y-6 py-6">
      <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="h-10 w-10 text-green-400" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-zinc-50">Routine abgeschlossen!</h2>
        <p className="text-sm text-zinc-400 mt-2">
          {TOTAL_EXERCISES} von {TOTAL_EXERCISES} Übungen absolviert
        </p>
      </div>

      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
        <p className="text-sm text-green-400 leading-relaxed">
          Ausgezeichnet — täglich ein bisschen Mobility macht langfristig den Unterschied.
        </p>
      </div>

      <Button
        onClick={() => router.push('/')}
        disabled={isPending}
        className="w-full h-14 text-base bg-green-500 hover:bg-green-400 text-black font-bold"
      >
        {isPending ? 'Wird gespeichert…' : 'Zurück zum Dashboard'}
      </Button>
    </div>
  )
}
