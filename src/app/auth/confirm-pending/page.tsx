import Link from 'next/link'
import { Mail } from 'lucide-react'
import { ResendButton } from '@/components/auth/ResendButton'

export default function ConfirmPendingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-zinc-50">E-Mail bestätigen</h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Wir haben dir eine Bestätigungs-E-Mail gesendet. Klicke auf den Link in der E-Mail,
            um dein Konto zu aktivieren und loszulegen.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <p className="text-sm text-zinc-400">Keine E-Mail erhalten?</p>
          <ResendButton />
        </div>

        <Link
          href="/login"
          className="block text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Zurück zum Login
        </Link>
      </div>
    </main>
  )
}
