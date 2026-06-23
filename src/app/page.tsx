import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dumbbell, User } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const firstName = profile?.display_name?.split(' ')[0] ?? 'du'

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-zinc-400 text-sm">Guten Tag,</p>
            <h1 className="text-3xl font-bold text-zinc-50">{firstName} 👋</h1>
          </div>
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <Link href="/exercises">
            <div className="bg-zinc-900 border border-zinc-800 hover:border-green-500/50 rounded-xl p-5 flex items-center gap-4 transition-colors cursor-pointer group">
              <div className="h-12 w-12 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
                <Dumbbell className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-zinc-50 group-hover:text-green-400 transition-colors">
                  Übungsbibliothek
                </p>
                <p className="text-sm text-zinc-400">Kraft- & Cardio-Übungen entdecken</p>
              </div>
            </div>
          </Link>

          {/* Coming soon placeholders */}
          {[
            { title: 'Trainingsplan', description: 'Dein personalisierter Wochenplan' },
            { title: 'Fortschritt & Streaks', description: 'Deine Trainingshistorie & Erfolge' },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5 flex items-center gap-4 opacity-50"
            >
              <div className="h-12 w-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-xl">🔒</span>
              </div>
              <div>
                <p className="font-semibold text-zinc-400">{item.title}</p>
                <p className="text-sm text-zinc-600">{item.description} — kommt bald</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
