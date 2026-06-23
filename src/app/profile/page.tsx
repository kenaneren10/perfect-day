import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { Profile } from '@/types/profile'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const initials = (profile.display_name ?? user.email ?? '?')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-50 text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Zum Dashboard
        </Link>

        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.display_name ?? ''} />
            <AvatarFallback className="bg-green-500/20 text-green-400 text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-zinc-50">{profile.display_name ?? 'Profil'}</h1>
            <p className="text-sm text-zinc-400">{user.email}</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-zinc-50 mb-6">Profil bearbeiten</h2>
          <ProfileForm profile={profile as Profile} />
        </div>
      </div>
    </main>
  )
}
