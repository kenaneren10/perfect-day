import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { PlanExercise } from '@/types/plan'

interface WorkoutExerciseCardProps {
  planExercise: PlanExercise
  effectiveSets: number
  position: number
}

export function WorkoutExerciseCard({ planExercise, effectiveSets, position }: WorkoutExerciseCardProps) {
  const { exercise, reps_min, reps_max } = planExercise
  const repsLabel =
    reps_min === reps_max ? `${reps_min} Wdh` : `${reps_min}–${reps_max} Wdh`

  return (
    <Link href={`/exercises/${exercise.id}`}>
      <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-colors group">
        <div className="h-9 w-9 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-zinc-400">{position}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-zinc-50 text-sm leading-snug">{exercise.name}</p>
          <p className="text-xs text-zinc-400 mt-0.5">
            {effectiveSets} Sätze · {repsLabel}
          </p>
          {exercise.description && (
            <p className="text-xs text-zinc-600 mt-1 line-clamp-1">{exercise.description}</p>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
      </div>
    </Link>
  )
}
