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
  const repsLabel = reps_min === reps_max ? `${reps_min} Wdh` : `${reps_min}–${reps_max} Wdh`

  return (
    <Link href={`/exercises/${exercise.id}`}>
      <div className="flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-zinc-800/60 bg-zinc-900 hover:border-zinc-700 transition-all group card-shadow">
        <div className="h-9 w-9 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
          <span className="text-sm font-black text-zinc-400">{position}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-zinc-50 text-sm">{exercise.name}</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {effectiveSets} Sätze · {repsLabel}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
      </div>
    </Link>
  )
}
