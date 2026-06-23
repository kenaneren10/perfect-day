'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ResendButton() {
  const [email, setEmail] = useState('')
  const [hasPendingEmail, setHasPendingEmail] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  useEffect(() => {
    const pending = sessionStorage.getItem('pendingEmail')
    if (pending) {
      setEmail(pending)
      setHasPendingEmail(true)
    }
  }, [])

  const handleResend = async () => {
    if (!email) return
    setStatus('sending')
    const supabase = createClient()
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })
    setStatus(error ? 'error' : 'sent')
  }

  if (status === 'sent') {
    return (
      <p className="text-sm text-green-400 text-center">
        E-Mail wurde erneut gesendet. Bitte prüfe deinen Posteingang.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {!hasPendingEmail && (
        <Input
          type="email"
          placeholder="deine@email.de"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-500 focus:border-green-500"
        />
      )}
      <Button
        type="button"
        variant="outline"
        disabled={!email || status === 'sending'}
        onClick={handleResend}
        className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50"
      >
        {status === 'sending' ? 'Wird gesendet...' : 'Bestätigungs-E-Mail erneut senden'}
      </Button>
      {status === 'error' && (
        <p className="text-sm text-red-400 text-center">
          Fehler beim Senden. Bitte versuche es erneut.
        </p>
      )}
    </div>
  )
}
