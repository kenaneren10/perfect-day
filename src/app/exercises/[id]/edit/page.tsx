import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ExerciseForm } from '@/components/exercises/ExerciseForm'
import { Exercise } from '@/types/exercise'

interface EditExercisePageProps {
  params: Promise<{ id: string }>
}

export default async function EditExercisePage({ params }: EditExercisePageProps) {
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

  // Only owner can edit, system exercises cannot be edited
  if (exercise.is_system || exercise.user_id !== user.id) {
    redirect(`/exercises/${id}`)
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={`/exercises/${id}`}
          className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-50 text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Übung
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-50">Übung bearbeiten</h1>
          <p className="text-zinc-400 mt-1 text-sm">{exercise.name}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <ExerciseForm exercise={exercise as Exercise} />
        </div>
      </div>
    </main>
  )
}
