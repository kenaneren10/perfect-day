import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ExerciseForm } from '@/components/exercises/ExerciseForm'

export default async function NewExercisePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/exercises"
          className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-50 text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Zur Bibliothek
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-50">Neue Übung anlegen</h1>
          <p className="text-zinc-400 mt-1 text-sm">Füge eine eigene Übung zur Bibliothek hinzu</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <ExerciseForm />
        </div>
      </div>
    </main>
  )
}
