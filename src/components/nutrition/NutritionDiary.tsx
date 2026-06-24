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

const MEAL_META: Record<MealType, { label: string; icon: string; hint: string }> = {
  breakfast: { label: 'Frühstück', icon: '☀️', hint: 'Morgens' },
  lunch:     { label: 'Mittagessen', icon: '🌤️', hint: 'Mittags' },
  dinner:    { label: 'Abendessen', icon: '🌙', hint: 'Abends' },
  snacks:    { label: 'Snacks', icon: '⚡', hint: 'Zwischendurch' },
}

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks']

interface Props {
  entries: FoodDiaryEntry[]
  calorieGoal: number
  macroTargets: MacroTargets
  weightKg: number
  todayStr: string
}

// SVG Donut Ring
function MacroRing({
  label,
  current,
  target,
  color,
  trackColor = '#27272a',
}: {
  label: string
  current: number
  target: number
  color: string
  trackColor?: string
}) {
  const r = 28
  const circ = 2 * Math.PI * r
  const pct = Math.min(1, current / Math.max(1, target))
  const offset = circ * (1 - pct)

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative">
        <svg width="72" height="72" className="-rotate-90">
          <circle cx="36" cy="36" r={r} fill="none" stroke={trackColor} strokeWidth="6" />
          <circle
            cx="36" cy="36" r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <span className="text-sm font-black text-zinc-50 tabular-nums leading-none">{Math.round(current)}</span>
          <span className="text-[9px] text-zinc-600 font-medium">g</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-zinc-300">{label}</p>
        <p className="text-[10px] text-zinc-600 tabular-nums">/ {Math.round(target)}g</p>
      </div>
    </div>
  )
}

// Large calorie ring
function CalorieRing({ consumed, goal }: { consumed: number; goal: number }) {
  const r = 50
  const circ = 2 * Math.PI * r
  const pct = Math.min(1, consumed / Math.max(1, goal))
  const offset = circ * (1 - pct)
  const isOver = consumed > goal
  const remaining = Math.max(0, goal - consumed)

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="128" height="128" className="-rotate-90">
          <circle cx="64" cy="64" r={r} fill="none" stroke="#1f1f1f" strokeWidth="10" />
          <circle
            cx="64" cy="64" r={r}
            fill="none"
            stroke={isOver ? '#f59e0b' : '#22c55e'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-zinc-50 tabular-nums leading-none">
            {Math.round(consumed).toLocaleString('de-DE')}
          </span>
          <span className="text-xs text-zinc-500 font-medium mt-0.5">kcal</span>
        </div>
      </div>
      <p className="text-sm text-zinc-500 mt-2">
        {isOver
          ? <span className="text-amber-400 font-semibold">Ziel überschritten</span>
          : <>{remaining > 0 ? `${Math.round(remaining)} kcal verbleibend` : <span className="text-green-400 font-semibold">Ziel erreicht ✓</span>}</>
        }
      </p>
      <p className="text-xs text-zinc-600 mt-0.5">Ziel: {goal.toLocaleString('de-DE')} kcal</p>
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

  const handleDelete = (id: string) => {
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteFood(id)
      if (result.error) toast.error(result.error)
      setDeletingId(null)
    })
  }

  return (
    <div className="space-y-5">
      {/* Calorie hero ring */}
      <div className="bg-zinc-900 border border-zinc-800/60 rounded-3xl p-6 card-shadow flex flex-col items-center">
        <CalorieRing consumed={totalKcal} goal={calorieGoal} />
      </div>

      {/* Macro rings */}
      <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl px-6 py-5 card-shadow">
        <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest mb-4">Makronährstoffe</p>
        <div className="grid grid-cols-3 gap-2">
          <MacroRing label="Protein" current={totalProtein} target={macroTargets.protein_g} color="#60a5fa" />
          <MacroRing label="Kohlenhydr." current={totalCarbs} target={macroTargets.carbs_g} color="#fbbf24" />
          <MacroRing label="Fett" current={totalFat} target={macroTargets.fat_g} color="#c084fc" />
        </div>
      </div>

      {/* Meal sections */}
      <div className="space-y-3">
        {MEAL_ORDER.map((mealType) => {
          const { label, icon, hint } = MEAL_META[mealType]
          const mealEntries = entries.filter((e) => e.meal_type === mealType)
          const mealKcal = mealEntries.reduce((s, e) => s + e.kcal, 0)

          return (
            <div key={mealType} className="bg-zinc-900 border border-zinc-800/60 rounded-2xl overflow-hidden card-shadow">
              {/* Meal header */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <span className="text-lg leading-none">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-50 text-sm leading-none">{label}</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5 uppercase tracking-wider font-medium">{hint}</p>
                </div>
                {mealKcal > 0 && (
                  <span className="text-xs font-semibold text-zinc-400 tabular-nums">
                    {Math.round(mealKcal)} kcal
                  </span>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setOpenMealType(mealType)}
                  className="h-7 w-7 p-0 text-zinc-500 hover:text-green-400 hover:bg-zinc-800 rounded-full shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Entries */}
              {mealEntries.length > 0 && (
                <div className="border-t border-zinc-800/60 divide-y divide-zinc-800/40">
                  {mealEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-200 font-medium truncate">{entry.food_name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5 tabular-nums">
                          {entry.serving_g}g
                          <span className="mx-1.5 text-zinc-700">·</span>
                          {Math.round(entry.kcal)} kcal
                          {entry.protein_g > 0 && (
                            <>
                              <span className="mx-1.5 text-zinc-700">·</span>
                              <span className="text-blue-400/80">{Math.round(entry.protein_g)}g P</span>
                            </>
                          )}
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-zinc-700 hover:text-red-400 hover:bg-red-400/10 shrink-0 rounded-full"
                            disabled={isPending && deletingId === entry.id}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-zinc-900 border-zinc-800 rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-zinc-50">Eintrag löschen?</AlertDialogTitle>
                            <AlertDialogDescription className="text-zinc-400">
                              „{entry.food_name}" wird aus dem Tagebuch entfernt.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-50 hover:bg-zinc-700 rounded-full">
                              Abbrechen
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(entry.id)}
                              className="bg-red-500 hover:bg-red-600 text-white rounded-full"
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

              {mealEntries.length === 0 && (
                <div
                  className="border-t border-zinc-800/40 px-4 py-3 flex items-center gap-2 cursor-pointer group"
                  onClick={() => setOpenMealType(mealType)}
                >
                  <p className="text-xs text-zinc-600 flex-1">Noch nichts eingetragen</p>
                  <span className="text-xs text-zinc-600 group-hover:text-green-400 transition-colors">+ Hinzufügen</span>
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
