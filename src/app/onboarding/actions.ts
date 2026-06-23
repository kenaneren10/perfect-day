'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const onboardingSchema = z.object({
  display_name: z.string().min(1, 'Name ist erforderlich').max(100),
  goal: z.enum(['weight_loss', 'muscle_gain', 'fitness', 'flexibility']),
  fitness_level: z.enum(['beginner', 'intermediate', 'advanced']),
  equipment: z.enum(['none', 'basic', 'full']),
})

export async function completeOnboarding(formData: z.infer<typeof onboardingSchema>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht angemeldet')

  const validated = onboardingSchema.parse(formData)

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      display_name: validated.display_name,
      goal: validated.goal,
      fitness_level: validated.fitness_level,
      equipment: validated.equipment,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (profileError) throw new Error(profileError.message)

  // Also store in user_metadata so middleware can read without a DB call
  const { error: metaError } = await supabase.auth.updateUser({
    data: { onboarding_completed: true },
  })

  if (metaError) throw new Error(metaError.message)

  redirect('/')
}
