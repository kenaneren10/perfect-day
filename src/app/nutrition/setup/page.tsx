import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { NutritionSetupForm } from '@/components/nutrition/NutritionSetupForm'
import type { NutritionProfile } from '@/types/nutrition'

export default async function NutritionSetupPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('height_cm, weight_kg, birth_year, biological_sex, activity_level, calorie_goal, goal')
    .eq('id', user.id)
    .single()

  const profile: NutritionProfile = {
    calorie_goal: profileData?.calorie_goal ?? null,
    weight_kg: profileData?.weight_kg ?? null,
    height_cm: profileData?.height_cm ?? null,
    birth_year: profileData?.birth_year ?? null,
    biological_sex: profileData?.biological_sex ?? null,
    activity_level: profileData?.activity_level ?? null,
  }

  const fitnessGoal = profileData?.goal ?? null

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/nutrition"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-50 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Ernährung
        </Link>

        <h1 className="text-2xl font-bold text-zinc-50 mb-2">Kalorienziel einrichten</h1>
        <p className="text-sm text-zinc-400 mb-8">
          Wir berechnen dein Tagesziel mit der Mifflin-St Jeor Formel.
        </p>

        <NutritionSetupForm profile={profile} fitnessGoal={fitnessGoal} />
      </div>
    </main>
  )
}
