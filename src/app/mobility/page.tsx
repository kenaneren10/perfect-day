import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MobilityPlayer } from '@/components/mobility/MobilityPlayer'

export default async function MobilityPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  let completedToday = false
  try {
    const { data } = await supabase
      .from('mobility_completions')
      .select('id')
      .eq('user_id', user.id)
      .eq('completed_on', today)
      .maybeSingle()
    completedToday = !!data
  } catch {
    // table not yet migrated — gracefully degrade
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-8">
        <MobilityPlayer completedToday={completedToday} />
      </div>
    </main>
  )
}
