'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const registerSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen lang sein'),
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsPending(true)
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })
    if (error) {
      // Generic error — don't reveal whether email exists
      setServerError('Registrierung fehlgeschlagen. Bitte versuche es erneut.')
      setIsPending(false)
      return
    }
    // Store email in sessionStorage for the resend flow (never in URL)
    sessionStorage.setItem('pendingEmail', data.email)
    window.location.href = '/auth/confirm-pending'
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-200">E-Mail</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="deine@email.de"
                  autoComplete="email"
                  className="bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-500 focus:border-green-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-200">Passwort</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="Mindestens 6 Zeichen"
                  autoComplete="new-password"
                  className="bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-500 focus:border-green-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverError && (
          <p className="text-sm text-red-400">{serverError}</p>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold"
        >
          {isPending ? 'Konto wird erstellt...' : 'Konto erstellen'}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-400 mt-6">
        Bereits registriert?{' '}
        <Link href="/login" className="text-green-400 hover:text-green-300 font-medium">
          Einloggen
        </Link>
      </p>
    </Form>
  )
}
