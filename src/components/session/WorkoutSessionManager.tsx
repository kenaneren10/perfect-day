'use client'

import { useState, useTransition } from 'react'
import { CheckSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SessionTimerBar } from './SessionTimerBar'
import { ExerciseSetLogger } from './ExerciseSetLogger'
import { SessionSummaryBlock } from './SessionSummaryBlock'
import { completeSession } from '@/app/session/actions'
import { toast } from 'sonner'
import type { PlanExercise } from '@/types/plan'
import type { WorkoutSession, SessionSet, SessionSummary } from '@/types/session'

interface Props {
  session: WorkoutSession
  exercises: PlanExercise[]
  sessionSets: SessionSet[]
  setsBonus: number
  totalPlannedSets: number
}

export function WorkoutSessionManager({
  session,
  exercises,
  sessionSets,
  setsBonus,
  totalPlannedSets,
}: Props) {
  const [summary, setSummary] = useState<SessionSummary | null>(null)
  const [savedSetsCount, setSavedSetsCount] = useState(sessionSets.length)
  const [isPending, startTransition] = useTransition()

  const handleComplete = () => {
    startTransition(async () => {
      const result = await completeSession(session.id)
      if (result.error) {
        toast.error(result.error)
      } else if (result.summary) {
        setSummary(result.summary)
      }
    })
  }

  if (summary) {
    return <SessionSummaryBlock summary={summary} celebrate />
  }

  const progress = totalPlannedSets > 0
    ? Math.min(100, Math.round((savedSetsCount / totalPlannedSets) * 100))
    : 0

  return (
    <div>
      <SessionTimerBar startedAt={session.started_at} />

      {/* Progress bar (QW-6) */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-zinc-500">Fortschritt</span>
          <span className="text-xs font-medium text-zinc-400 tabular-nums">
            {savedSetsCount}/{totalPlannedSets} Sätze
          </span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {exercises.map((pe) => (
          <ExerciseSetLogger
            key={pe.id}
            planExercise={pe}
            effectiveSets={pe.base_sets + setsBonus}
            sessionId={session.id}
            existingSets={sessionSets}
            onSetSaved={() => setSavedSetsCount((c) => c + 1)}
          />
        ))}
      </div>

      <Button
        onClick={handleComplete}
        disabled={isPending}
        className="w-full h-13 bg-green-500 hover:bg-green-400 text-black font-bold text-base rounded-full"
      >
        <CheckSquare className="h-5 w-5 mr-2" />
        {isPending ? 'Wird gespeichert…' : 'Einheit abschließen'}
      </Button>

      <p className="text-xs text-zinc-600 text-center mt-3">
        Auch ohne alle Sätze kannst du die Einheit abschließen.
      </p>
    </div>
  )
}
