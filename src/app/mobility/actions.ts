'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function completeMobilityRoutine(): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht authentifiziert' }

  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase
    .from('mobility_completions')
    .upsert({ user_id: user.id, completed_on: today }, { onConflict: 'user_id,completed_on', ignoreDuplicates: true })

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/mobility')
  return {}
}
