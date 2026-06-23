'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { calculateTDEE, applyGoalAdjustment, calcPortionNutrients } from '@/lib/nutrition/tdee'
import type { ActivityLevel, BiologicalSex, MealType } from '@/types/nutrition'

export async function saveNutritionSetup(formData: {
  biological_sex: BiologicalSex
  birth_year: number
  height_cm: number
  weight_kg: number
  activity_level: ActivityLevel
  calorie_goal_override?: number | null
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht authentifiziert' }

  const age = new Date().getFullYear() - formData.birth_year
  if (age < 13 || age > 100) return { error: 'Ungültiges Geburtsjahr' }
  if (formData.height_cm < 100 || formData.height_cm > 250) return { error: 'Ungültige Körpergröße' }
  if (formData.weight_kg < 30 || formData.weight_kg > 300) return { error: 'Ungültiges Gewicht' }

  const { data: profile } = await supabase.from('profiles').select('goal').eq('id', user.id).single()

  let calorieGoal: number
  if (formData.calorie_goal_override && formData.calorie_goal_override > 0) {
    calorieGoal = formData.calorie_goal_override
  } else {
    const { tdee } = calculateTDEE(
      formData.weight_kg,
      formData.height_cm,
      formData.birth_year,
      formData.biological_sex,
      formData.activity_level,
    )
    calorieGoal = applyGoalAdjustment(tdee, profile?.goal ?? null)
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      height_cm: formData.height_cm,
      weight_kg: formData.weight_kg,
      birth_year: formData.birth_year,
      biological_sex: formData.biological_sex,
      activity_level: formData.activity_level,
      calorie_goal: calorieGoal,
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/nutrition')
  redirect('/nutrition')
}

export async function logFood(entry: {
  date: string
  meal_type: MealType
  food_name: string
  food_off_id: string | null
  kcal_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  serving_g: number
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht authentifiziert' }

  if (entry.serving_g <= 0) return { error: 'Portionsgröße muss größer als 0 sein' }
  if (entry.serving_g > 9999) return { error: 'Portionsgröße zu groß' }

  const nutrients = calcPortionNutrients(
    {
      kcal: entry.kcal_per_100g,
      protein: entry.protein_per_100g,
      carbs: entry.carbs_per_100g,
      fat: entry.fat_per_100g,
    },
    entry.serving_g,
  )

  const { error } = await supabase.from('food_diary_entries').insert({
    user_id: user.id,
    date: entry.date,
    meal_type: entry.meal_type,
    food_name: entry.food_name,
    food_off_id: entry.food_off_id,
    serving_g: entry.serving_g,
    kcal: nutrients.kcal,
    protein_g: nutrients.protein_g,
    carbs_g: nutrients.carbs_g,
    fat_g: nutrients.fat_g,
  })

  if (error) return { error: error.message }

  revalidatePath('/nutrition')
  revalidatePath('/')
  return {}
}

export async function deleteFood(entryId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht authentifiziert' }

  const { error } = await supabase
    .from('food_diary_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/nutrition')
  revalidatePath('/')
  return {}
}
