import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlanSetupCard } from '@/components/plan/PlanSetupCard'
import { WeeklyPlanView } from '@/components/plan/WeeklyPlanView'
import { ProgressionBanner } from '@/components/plan/ProgressionBanner'
import { RegeneratePlanDialog } from '@/components/plan/RegeneratePlanDialog'
import type { WorkoutPlan, PlanDay } from '@/types/plan'

export default async function PlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const firstName = profile?.display_name?.split(' ')[0] ?? 'du'

  // Try to load existing plan — table may not exist yet (before backend migration)
  const { data: plan, error: planError } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const hasPlan = !planError && !!plan

  // Load plan days if plan exists
  const { data: planDays } = hasPlan
    ? await supabase
        .from('plan_days')
        .select('*')
        .eq('plan_id', (plan as WorkoutPlan).id)
        .order('day_of_week')
    : { data: null }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-zinc-400 text-sm">Hey {firstName},</p>
            <h1 className="text-2xl font-bold text-zinc-50">Dein Trainingsplan</h1>
          </div>
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {!hasPlan ? (
          <PlanSetupCard />
        ) : (
          <>
            {(plan as WorkoutPlan).progression_pending && <ProgressionBanner />}

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-50">Diese Woche</h2>
                <p className="text-xs text-zinc-500">
                  {(plan as WorkoutPlan).training_days_per_week} Trainingstage
                  {(plan as WorkoutPlan).sets_bonus > 0 && (
                    <span className="ml-2 text-green-500">
                      +{(plan as WorkoutPlan).sets_bonus} Satz (Fortschritt)
                    </span>
                  )}
                </p>
              </div>
            </div>

            <WeeklyPlanView
              days={(planDays as PlanDay[]) ?? []}
              setsBonus={(plan as WorkoutPlan).sets_bonus}
            />

            <RegeneratePlanDialog />
          </>
        )}
      </div>
    </main>
  )
}
