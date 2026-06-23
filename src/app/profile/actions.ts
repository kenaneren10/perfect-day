'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const profileSchema = z.object({
  display_name: z.string().min(1, 'Name ist erforderlich').max(100),
  goal: z.enum(['weight_loss', 'muscle_gain', 'fitness', 'flexibility']),
  fitness_level: z.enum(['beginner', 'intermediate', 'advanced']),
  equipment: z.enum(['none', 'basic', 'full']),
})

export async function updateProfile(formData: z.infer<typeof profileSchema>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht angemeldet')

  const validated = profileSchema.parse(formData)

  const { error } = await supabase
    .from('profiles')
    .update({
      ...validated,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/profile')
}
