'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { FoodSearchSheet } from './FoodSearchSheet'
import { deleteFood } from '@/app/nutrition/actions'
import { toast } from 'sonner'
import type { FoodDiaryEntry, MealType, MacroTargets } from '@/types/nutrition'

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Frühstück',
  lunch: 'Mittagessen',
  dinner: 'Abendessen',
  snacks: 'Snacks',
}

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks']

interface Props {
  entries: FoodDiaryEntry[]
  calorieGoal: number
  macroTargets: MacroTargets
  weightKg: number
  todayStr: string
}

interface MacroBarProps {
  label: string
  current: number
  target: number
  color: string
}

function MacroBar({ label, current, target, color }: MacroBarProps) {
  const pct = Math.min(100, (current / Math.max(1, target)) * 100)
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
      <p className="text-xs text-zinc-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-zinc-50">
        {Math.round(current)}
        <span className="text-xs font-normal text-zinc-500">/{Math.round(target)}g</span>
      </p>
      <div className="h-1.5 mt-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function NutritionDiary({ entries, calorieGoal, macroTargets, todayStr }: Props) {
  const [openMealType, setOpenMealType] = useState<MealType | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const totalKcal = entries.reduce((s, e) => s + e.kcal, 0)
  const totalProtein = entries.reduce((s, e) => s + e.protein_g, 0)
  const totalCarbs = entries.reduce((s, e) => s + e.carbs_g, 0)
  const totalFat = entries.reduce((s, e) => s + e.fat_g, 0)

  const kcalPct = Math.min(100, Math.round((totalKcal / calorieGoal) * 100))
  const remaining = Math.max(0, calorieGoal - totalKcal)

  const handleDelete = (id: string) => {
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteFood(id)
      if (result.error) toast.error(result.error)
      setDeletingId(null)
    })
  }

  return (
    <div className="space-y-6">
      {/* Calorie progress */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-3xl font-bold text-zinc-50">
              {Math.round(totalKcal).toLocaleString('de-DE')}
            </p>
            <p className="text-sm text-zinc-400">von {calorieGoal.toLocaleString('de-DE')} kcal</p>
          </div>
          <p className="text-sm text-zinc-500 mb-1">
            {remaining > 0 ? `${Math.round(remaining)} verbleibend` : 'Ziel erreicht ✓'}
          </p>
        </div>
        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${kcalPct >= 100 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${kcalPct}%` }}
          />
        </div>
      </div>

      {/* Macro progress */}
      <div className="grid grid-cols-3 gap-3">
        <MacroBar label="Protein" current={totalProtein} target={macroTargets.protein_g} color="bg-blue-500" />
        <MacroBar label="Kohlenhydrate" current={totalCarbs} target={macroTargets.carbs_g} color="bg-yellow-500" />
        <MacroBar label="Fett" current={totalFat} target={macroTargets.fat_g} color="bg-orange-500" />
      </div>

      {/* Meal sections */}
      <div className="space-y-4">
        {MEAL_ORDER.map((mealType) => {
          const mealEntries = entries.filter((e) => e.meal_type === mealType)
          const mealKcal = mealEntries.reduce((s, e) => s + e.kcal, 0)

          return (
            <div key={mealType} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <div>
                  <p className="font-semibold text-zinc-50 text-sm">{MEAL_LABELS[mealType]}</p>
                  {mealKcal > 0 && (
                    <p className="text-xs text-zinc-500 mt-0.5">{Math.round(mealKcal)} kcal</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setOpenMealType(mealType)}
                  className="text-green-400 hover:text-green-300 hover:bg-zinc-800 h-8 px-2"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Hinzufügen
                </Button>
              </div>

              {mealEntries.length === 0 ? (
                <p className="text-xs text-zinc-600 px-4 py-3">Noch nichts eingetragen</p>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {mealEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-50 truncate">{entry.food_name}</p>
                        <p className="text-xs text-zinc-500">
                          {entry.serving_g}g · {Math.round(entry.kcal)} kcal
                          {entry.protein_g > 0 && ` · ${Math.round(entry.protein_g)}g P`}
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 shrink-0"
                            disabled={isPending && deletingId === entry.id}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-zinc-900 border-zinc-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-zinc-50">Eintrag löschen?</AlertDialogTitle>
                            <AlertDialogDescription className="text-zinc-400">
                              „{entry.food_name}" wird aus dem Tagebuch entfernt.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-50 hover:bg-zinc-700">
                              Abbrechen
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(entry.id)}
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              Löschen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <FoodSearchSheet
        mealType={openMealType}
        todayStr={todayStr}
        onClose={() => setOpenMealType(null)}
      />
    </div>
  )
}
