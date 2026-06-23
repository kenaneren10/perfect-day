export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks'
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'
export type BiologicalSex = 'male' | 'female'

export interface FoodProduct {
  id: string
  name: string
  brand?: string
  kcal_100g: number
  protein_100g: number
  carbs_100g: number
  fat_100g: number
}

export interface FoodDiaryEntry {
  id: string
  meal_type: MealType
  food_name: string
  food_off_id: string | null
  serving_g: number
  kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  logged_at: string
}

export interface MacroTargets {
  protein_g: number
  fat_g: number
  carbs_g: number
}

export interface NutritionProfile {
  calorie_goal: number | null
  weight_kg: number | null
  height_cm: number | null
  birth_year: number | null
  biological_sex: BiologicalSex | null
  activity_level: ActivityLevel | null
}
