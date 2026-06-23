import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ExerciseImage } from './ExerciseImage'
import {
  Exercise,
  MUSCLE_GROUP_LABELS,
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  CATEGORY_LABELS,
} from '@/types/exercise'

interface ExerciseCardProps {
  exercise: Exercise
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  return (
    <Link href={`/exercises/${exercise.id}`} className="block h-full">
      <Card className="bg-zinc-900 border-zinc-800 hover:border-green-500/50 transition-colors cursor-pointer h-full flex flex-col">
        <div className="relative aspect-video overflow-hidden rounded-t-xl bg-zinc-800 shrink-0">
          <ExerciseImage
            imageUrl={exercise.image_url}
            name={exercise.name}
            className="absolute inset-0"
          />
        </div>
        <CardContent className="p-4 space-y-2.5 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-zinc-50 font-semibold text-sm line-clamp-2 flex-1 leading-snug">
              {exercise.name}
            </h3>
            {!exercise.is_system && (
              <Badge
                variant="outline"
                className="text-xs border-zinc-600 text-zinc-400 shrink-0 rounded-full"
              >
                Eigene
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            {exercise.muscle_groups.slice(0, 3).map((mg) => (
              <Badge
                key={mg}
                className="text-xs bg-zinc-800 text-zinc-300 border-zinc-700 rounded-full font-normal"
              >
                {MUSCLE_GROUP_LABELS[mg]}
              </Badge>
            ))}
            {exercise.muscle_groups.length > 3 && (
              <Badge className="text-xs bg-zinc-800 text-zinc-500 border-zinc-700 rounded-full font-normal">
                +{exercise.muscle_groups.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-1 mt-auto pt-1">
            <Badge
              className={`text-xs border-0 rounded-full ${
                exercise.category === 'strength'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-orange-500/20 text-orange-400'
              }`}
            >
              {CATEGORY_LABELS[exercise.category]}
            </Badge>
            <Badge className="text-xs bg-zinc-800 text-zinc-400 border-zinc-700 rounded-full font-normal">
              {EQUIPMENT_LABELS[exercise.equipment]}
            </Badge>
            <Badge className="text-xs bg-zinc-800 text-zinc-400 border-zinc-700 rounded-full font-normal">
              {DIFFICULTY_LABELS[exercise.difficulty]}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
