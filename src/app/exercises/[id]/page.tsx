import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FavoriteButton } from '@/components/exercises/FavoriteButton'
import { DeleteButton } from '@/components/exercises/DeleteButton'
import { ExerciseImage } from '@/components/exercises/ExerciseImage'
import {
  Exercise,
  MUSCLE_GROUP_LABELS,
  EQUIPMENT_LABELS,
  DIFFICULTY_LABELS,
  CATEGORY_LABELS,
} from '@/types/exercise'
import { ArrowLeft, ExternalLink, Pencil } from 'lucide-react'

interface ExerciseDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ExerciseDetailPage({ params }: ExerciseDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: exercise, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error || !exercise) notFound()

  // If it's a custom exercise by another user, deny access
  if (!exercise.is_system && exercise.user_id !== user.id) {
    redirect('/exercises')
  }

  const { data: favorite } = await supabase
    .from('favorites')
    .select('id')
    .match({ user_id: user.id, exercise_id: id })
    .single()

  const isFavorited = !!favorite
  const isOwner = !exercise.is_system && exercise.user_id === user.id
  const ex = exercise as Exercise

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <Link
          href="/exercises"
          className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-50 text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Zur Bibliothek
        </Link>

        {/* Hero Image */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-900 mb-6">
          <ExerciseImage imageUrl={ex.image_url} name={ex.name} className="absolute inset-0" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge
                className={`rounded-full border-0 ${
                  ex.category === 'strength'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-orange-500/20 text-orange-400'
                }`}
              >
                {CATEGORY_LABELS[ex.category]}
              </Badge>
              <Badge className="rounded-full bg-zinc-800 text-zinc-300 border-zinc-700">
                {DIFFICULTY_LABELS[ex.difficulty]}
              </Badge>
              {!ex.is_system && (
                <Badge variant="outline" className="rounded-full border-zinc-600 text-zinc-400">
                  Eigene
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-zinc-50 leading-tight">{ex.name}</h1>
          </div>
          <FavoriteButton exerciseId={ex.id} isFavorited={isFavorited} />
        </div>

        {/* Meta */}
        <div className="space-y-4">
          {/* Muscle Groups */}
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Muskelgruppen
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ex.muscle_groups.map((mg) => (
                <Badge
                  key={mg}
                  className="rounded-full bg-zinc-800 text-zinc-300 border-zinc-700"
                >
                  {MUSCLE_GROUP_LABELS[mg]}
                </Badge>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Equipment
            </p>
            <Badge className="rounded-full bg-zinc-800 text-zinc-300 border-zinc-700">
              {EQUIPMENT_LABELS[ex.equipment]}
            </Badge>
          </div>
        </div>

        <Separator className="my-6 bg-zinc-800" />

        {/* Description */}
        {ex.description && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-zinc-200 mb-2">Beschreibung</h2>
            <p className="text-zinc-400 leading-relaxed whitespace-pre-line">{ex.description}</p>
          </div>
        )}

        {/* Video Link */}
        {ex.video_url && (
          <div className="mb-6">
            <a
              href={ex.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-medium transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Video ansehen
            </a>
          </div>
        )}

        {/* Owner Actions */}
        {isOwner && (
          <>
            <Separator className="my-6 bg-zinc-800" />
            <div className="flex gap-3">
              <Link href={`/exercises/${ex.id}/edit`}>
                <Button
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Bearbeiten
                </Button>
              </Link>
              <DeleteButton exerciseId={ex.id} />
            </div>
          </>
        )}
      </div>
    </main>
  )
}
