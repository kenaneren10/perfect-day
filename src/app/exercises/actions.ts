'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const validUrl = z
  .string()
  .optional()
  .refine(
    (val) => !val || /^https?:\/\/.+\..+/.test(val),
    'Bitte eine gültige URL eingeben'
  )

export const exerciseSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich').max(200, 'Maximal 200 Zeichen'),
  category: z.enum(['strength', 'cardio']),
  muscle_groups: z
    .array(z.enum(['chest', 'back', 'shoulders', 'arms', 'core', 'legs', 'glutes', 'full_body']))
    .min(1, 'Mindestens eine Muskelgruppe wählen'),
  equipment: z.enum(['none', 'basic', 'full']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  description: z.string().optional().nullable(),
  image_url: validUrl,
  video_url: validUrl,
})

export type ExerciseFormData = z.infer<typeof exerciseSchema>

export async function toggleFavorite(exerciseId: string, isFavorited: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht angemeldet')

  if (isFavorited) {
    await supabase
      .from('favorites')
      .delete()
      .match({ user_id: user.id, exercise_id: exerciseId })
  } else {
    await supabase
      .from('favorites')
      .insert({ user_id: user.id, exercise_id: exerciseId })
  }

  revalidatePath(`/exercises/${exerciseId}`)
  revalidatePath('/exercises')
}

export async function createExercise(formData: ExerciseFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht angemeldet')

  const validated = exerciseSchema.parse(formData)

  const { data, error } = await supabase
    .from('exercises')
    .insert({
      ...validated,
      image_url: validated.image_url || null,
      video_url: validated.video_url || null,
      is_system: false,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/exercises')
  redirect(`/exercises/${data.id}`)
}

export async function updateExercise(id: string, formData: ExerciseFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht angemeldet')

  const validated = exerciseSchema.parse(formData)

  const { error } = await supabase
    .from('exercises')
    .update({
      ...validated,
      image_url: validated.image_url || null,
      video_url: validated.video_url || null,
      updated_at: new Date().toISOString(),
    })
    .match({ id, user_id: user.id, is_system: false })

  if (error) throw new Error(error.message)

  revalidatePath(`/exercises/${id}`)
  revalidatePath('/exercises')
  redirect(`/exercises/${id}`)
}

export async function deleteExercise(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht angemeldet')

  const { error } = await supabase
    .from('exercises')
    .update({ deleted_at: new Date().toISOString() })
    .match({ id, user_id: user.id, is_system: false })

  if (error) throw new Error(error.message)

  revalidatePath('/exercises')
  redirect('/exercises')
}
