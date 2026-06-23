import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/')

  const appleOAuthEnabled = process.env.NEXT_PUBLIC_APPLE_OAUTH_ENABLED === 'true'

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-50">Perfect Day</h1>
          <p className="text-zinc-400 mt-2 text-sm">Dein persönlicher Trainingsbegleiter</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-zinc-50 mb-6">Einloggen</h2>
          <LoginForm appleOAuthEnabled={appleOAuthEnabled} />
        </div>
      </div>
    </main>
  )
}
