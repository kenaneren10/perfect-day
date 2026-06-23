import type { ActivityLevel, BiologicalSex, MacroTargets } from '@/types/nutrition'

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
}

export function calculateTDEE(
  weight_kg: number,
  height_cm: number,
  birth_year: number,
  sex: BiologicalSex,
  activity_level: ActivityLevel,
): { bmr: number; tdee: number } {
  const age = new Date().getFullYear() - birth_year
  const bmr =
    sex === 'male'
      ? 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
      : 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[activity_level])
  return { bmr: Math.round(bmr), tdee }
}

export function applyGoalAdjustment(tdee: number, goal: string | null): number {
  if (goal === 'weight_loss') return Math.max(1200, tdee - 500)
  if (goal === 'muscle_gain') return tdee + 300
  return tdee
}

export function deriveMacroTargets(calorie_goal: number, weight_kg: number): MacroTargets {
  const protein_g = Math.round(weight_kg * 2)
  const fat_g = Math.round((calorie_goal * 0.25) / 9)
  const remainingKcal = calorie_goal - protein_g * 4 - fat_g * 9
  const carbs_g = Math.max(0, Math.round(remainingKcal / 4))
  return { protein_g, fat_g, carbs_g }
}

export function calcPortionNutrients(
  per100g: { kcal: number; protein: number; carbs: number; fat: number },
  serving_g: number,
): { kcal: number; protein_g: number; carbs_g: number; fat_g: number } {
  const f = serving_g / 100
  return {
    kcal: Math.round(per100g.kcal * f * 10) / 10,
    protein_g: Math.round(per100g.protein * f * 10) / 10,
    carbs_g: Math.round(per100g.carbs * f * 10) / 10,
    fat_g: Math.round(per100g.fat * f * 10) / 10,
  }
}
