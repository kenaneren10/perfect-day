import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NutritionDiary } from '@/components/nutrition/NutritionDiary'
import { deriveMacroTargets } from '@/lib/nutrition/tdee'
import type { FoodDiaryEntry } from '@/types/nutrition'

function todayISOStr(): string {
  return new Date().toISOString().split('T')[0]
}

export default async function NutritionPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('calorie_goal, weight_kg')
    .eq('id', user.id)
    .single()

  const calorieGoal: number | null = profile?.calorie_goal ?? null
  const weightKg: number = profile?.weight_kg ?? 70
  const todayStr = todayISOStr()

  let entries: FoodDiaryEntry[] = []
  try {
    const { data } = await supabase
      .from('food_diary_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', todayStr)
      .order('logged_at', { ascending: true })
    entries = (data as FoodDiaryEntry[]) ?? []
  } catch {
    // table not yet migrated — gracefully degrade
  }

  const macroTargets = calorieGoal
    ? deriveMacroTargets(calorieGoal, weightKg)
    : { protein_g: 150, fat_g: 55, carbs_g: 200 }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-10 pb-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-zinc-50">Ernährung</h1>
          <Link href="/nutrition/setup">
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-500 hover:text-zinc-50 hover:bg-zinc-800 rounded-full"
              title="Einstellungen"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {!calorieGoal ? (
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-8 text-center space-y-4">
            <div className="text-4xl">🥗</div>
            <div>
              <p className="font-semibold text-zinc-50 text-lg">Kalorienziel einrichten</p>
              <p className="text-sm text-zinc-400 mt-1 max-w-xs mx-auto">
                Trag einmalig deine Körperdaten ein — wir berechnen dein tägliches Ziel automatisch.
              </p>
            </div>
            <Link href="/nutrition/setup">
              <Button className="bg-green-500 hover:bg-green-400 text-black font-semibold">
                Jetzt einrichten
              </Button>
            </Link>
          </div>
        ) : (
          <NutritionDiary
            entries={entries}
            calorieGoal={calorieGoal}
            macroTargets={macroTargets}
            weightKg={weightKg}
            todayStr={todayStr}
          />
        )}
      </div>
    </main>
  )
}
