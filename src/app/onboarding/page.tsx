import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Already completed → middleware handles this redirect, but guard here too
  if (user.user_metadata?.onboarding_completed === true) redirect('/')

  // Pre-fill name from OAuth provider if available
  const defaultName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    ''

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-50">Willkommen bei Perfect Day</h1>
          <p className="text-zinc-400 mt-1 text-sm">Lass uns deinen Plan personalisieren — dauert nur 1 Minute.</p>
        </div>
        <OnboardingFlow defaultName={defaultName} />
      </div>
    </main>
  )
}
