export type Goal = 'weight_loss' | 'muscle_gain' | 'fitness' | 'flexibility'

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  goal: Goal | null
  fitness_level: 'beginner' | 'intermediate' | 'advanced' | null
  equipment: 'none' | 'basic' | 'full' | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface OnboardingFormData {
  display_name: string
  goal: Goal
  fitness_level: 'beginner' | 'intermediate' | 'advanced'
  equipment: 'none' | 'basic' | 'full'
}

export const GOAL_LABELS: Record<Goal, { label: string; description: string }> = {
  weight_loss: { label: 'Gewicht verlieren', description: 'Fett reduzieren & schlanker werden' },
  muscle_gain: { label: 'Muskeln aufbauen', description: 'Kraft & Muskelmasse aufbauen' },
  fitness: { label: 'Fitness & Ausdauer', description: 'Kondition & allgemeine Fitness verbessern' },
  flexibility: { label: 'Beweglichkeit steigern', description: 'Mobilität & Flexibilität erhöhen' },
}

export const FITNESS_LEVEL_LABELS: Record<string, { label: string; description: string }> = {
  beginner: { label: 'Einsteiger', description: '0–6 Monate Erfahrung' },
  intermediate: { label: 'Fortgeschrittener', description: '6–24 Monate Erfahrung' },
  advanced: { label: 'Profi', description: '24+ Monate Erfahrung' },
}

export const EQUIPMENT_LABELS_ONBOARDING: Record<string, { label: string; description: string }> = {
  none: { label: 'Ohne Equipment', description: 'Nur Körpergewicht (Bodyweight)' },
  basic: { label: 'Basis-Equipment', description: 'Kurzhanteln, Widerstandsbänder' },
  full: { label: 'Vollausrüstung', description: 'Fitnessstudio oder Heimstudio' },
}
