'use client'

import { useState } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { logSet } from '@/app/session/actions'
import { toast } from 'sonner'
import type { PlanExercise } from '@/types/plan'
import type { SessionSet } from '@/types/session'

interface SetState {
  weightKg: string
  reps: string
  durationMinutes: string
  saved: boolean
  saving: boolean
}

interface Props {
  planExercise: PlanExercise
  effectiveSets: number
  sessionId: string
  existingSets: SessionSet[]
  onSetSaved?: () => void
}

export function ExerciseSetLogger({ planExercise, effectiveSets, sessionId, existingSets, onSetSaved }: Props) {
  const isCardio = planExercise.exercise.category === 'cardio'

  const initialSets: SetState[] = Array.from({ length: effectiveSets }, (_, i) => {
    const existing = existingSets.find(
      (s) => s.plan_exercise_id === planExercise.id && s.set_number === i + 1,
    )
    if (existing) {
      return {
        weightKg: existing.weight_kg?.toString() ?? '',
        reps: existing.reps?.toString() ?? '',
        durationMinutes: existing.duration_minutes?.toString() ?? '',
        saved: true,
        saving: false,
      }
    }
    return {
      weightKg: '',
      reps: planExercise.reps_min.toString(),
      durationMinutes: '',
      saved: false,
      saving: false,
    }
  })

  const [sets, setSets] = useState<SetState[]>(initialSets)

  const update = (index: number, patch: Partial<SetState>) => {
    setSets((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  const handleSave = async (index: number) => {
    const set = sets[index]
    update(index, { saving: true })

    const result = await logSet(sessionId, planExercise.id, index + 1, {
      weightKg: set.weightKg ? parseFloat(set.weightKg) : undefined,
      reps: isCardio ? undefined : set.reps ? parseInt(set.reps) : undefined,
      durationMinutes: isCardio && set.durationMinutes ? parseFloat(set.durationMinutes) : undefined,
    })

    if (result.error) {
      toast.error(result.error)
      update(index, { saving: false })
    } else {
      update(index, { saved: true, saving: false })
      onSetSaved?.()
    }
  }

  const savedCount = sets.filter((s) => s.saved).length

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      {/* Exercise header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-zinc-50">{planExercise.exercise.name}</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            {isCardio
              ? `${effectiveSets} Runden`
              : `${effectiveSets} Sätze · ${planExercise.reps_min}–${planExercise.reps_max} Wdh`}
          </p>
        </div>
        <span className="text-xs text-zinc-500 mt-1">
          {savedCount}/{effectiveSets} ✓
        </span>
      </div>

      {/* Set rows */}
      <div className="space-y-2">
        {sets.map((set, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 rounded-lg p-2 transition-colors ${
              set.saved ? 'bg-green-500/5 border border-green-500/20' : 'bg-zinc-800/50'
            }`}
          >
            {/* Set number */}
            <span className="text-xs text-zinc-500 w-5 shrink-0 text-center font-mono">
              {index + 1}
            </span>

            {isCardio ? (
              /* Cardio: duration only */
              <Input
                type="number"
                placeholder="Min"
                value={set.durationMinutes}
                onChange={(e) => update(index, { durationMinutes: e.target.value })}
                disabled={set.saved || set.saving}
                className="h-8 text-sm bg-zinc-900 border-zinc-700 focus:border-green-500 text-zinc-50 w-24"
                min={0}
              />
            ) : (
              /* Strength: weight + reps */
              <>
                <Input
                  type="number"
                  placeholder="kg"
                  value={set.weightKg}
                  onChange={(e) => update(index, { weightKg: e.target.value })}
                  disabled={set.saved || set.saving}
                  className="h-8 text-sm bg-zinc-900 border-zinc-700 focus:border-green-500 text-zinc-50 w-20"
                  min={0}
                  step={0.5}
                />
                <span className="text-zinc-600 text-xs">×</span>
                <Input
                  type="number"
                  placeholder="Wdh"
                  value={set.reps}
                  onChange={(e) => update(index, { reps: e.target.value })}
                  disabled={set.saved || set.saving}
                  className="h-8 text-sm bg-zinc-900 border-zinc-700 focus:border-green-500 text-zinc-50 w-20"
                  min={1}
                />
              </>
            )}

            {/* Save / Done indicator */}
            <div className="ml-auto shrink-0">
              {set.saved ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleSave(index)}
                  disabled={set.saving}
                  className="h-7 px-2.5 text-xs bg-green-500 hover:bg-green-400 text-black font-semibold"
                >
                  {set.saving ? '…' : '✓'}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
