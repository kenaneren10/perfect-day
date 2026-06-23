export type ExerciseCategory = 'strength' | 'cardio'
export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'core' | 'legs' | 'glutes' | 'full_body'
export type Equipment = 'none' | 'basic' | 'full'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface Exercise {
  id: string
  name: string
  category: ExerciseCategory
  muscle_groups: MuscleGroup[]
  equipment: Equipment
  difficulty: Difficulty
  description: string | null
  image_url: string | null
  video_url: string | null
  is_system: boolean
  user_id: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface ExerciseFilters {
  search: string
  category: ExerciseCategory | 'all'
  muscleGroup: MuscleGroup | 'all'
  equipment: Equipment | 'all'
  difficulty: Difficulty | 'all'
  favoritesOnly: boolean
}

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'Brust',
  back: 'Rücken',
  shoulders: 'Schultern',
  arms: 'Arme',
  core: 'Core',
  legs: 'Beine',
  glutes: 'Gesäß',
  full_body: 'Ganzkörper',
}

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  none: 'Ohne Equipment',
  basic: 'Basis',
  full: 'Vollausstattung',
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Einsteiger',
  intermediate: 'Fortgeschritten',
  advanced: 'Profi',
}

export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  strength: 'Kraft',
  cardio: 'Cardio',
}

// Returns all equipment values the user can use (selected level + everything below).
// Equipment hierarchy: none < basic < full
export function equipmentAllowList(equipment: Equipment): Equipment[] {
  if (equipment === 'full') return ['none', 'basic', 'full']
  if (equipment === 'basic') return ['none', 'basic']
  return ['none']
}
