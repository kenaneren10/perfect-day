import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ExerciseLibrary } from '@/components/exercises/ExerciseLibrary'
import { Exercise, Equipment, Difficulty, equipmentAllowList } from '@/types/exercise'

export default async function ExercisesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // Load user profile for filter defaults
  const { data: profile } = await supabase
    .from('profiles')
    .select('equipment, fitness_level')
    .eq('id', user.id)
    .single()

  const profileDefaults = {
    equipment: (profile?.equipment as Equipment | null) ?? 'all' as const,
    difficulty: (profile?.fitness_level as Difficulty | null) ?? 'all' as const,
  }

  // Load initial exercise list filtered by profile defaults
  let query = supabase
    .from('exercises')
    .select('*')
    .is('deleted_at', null)
    .or(`is_system.eq.true,user_id.eq.${user.id}`)

  if (profileDefaults.equipment !== 'all') {
    // Show exercises this user can actually do: selected level OR less
    query = query.in('equipment', equipmentAllowList(profileDefaults.equipment))
  }
  if (profileDefaults.difficulty !== 'all') {
    query = query.eq('difficulty', profileDefaults.difficulty)
  }

  const [{ data: exercises }, { count: totalCount }, { data: favorites }] = await Promise.all([
    query.order('name'),
    supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .or(`is_system.eq.true,user_id.eq.${user.id}`),
    supabase
      .from('favorites')
      .select('exercise_id')
      .eq('user_id', user.id),
  ])

  const favoriteIds = favorites?.map((f) => f.exercise_id) ?? []

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-50">Übungsbibliothek</h1>
          <p className="text-zinc-400 mt-1">Entdecke Kraft- und Cardio-Übungen</p>
        </div>

        <ExerciseLibrary
          initialExercises={(exercises as Exercise[]) ?? []}
          initialFavoriteIds={favoriteIds}
          userId={user.id}
          profileDefaults={profileDefaults}
          totalExerciseCount={totalCount ?? 0}
        />
      </div>
    </main>
  )
}
