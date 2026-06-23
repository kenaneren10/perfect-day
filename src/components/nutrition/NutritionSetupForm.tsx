'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { saveNutritionSetup } from '@/app/nutrition/actions'
import { calculateTDEE, applyGoalAdjustment } from '@/lib/nutrition/tdee'
import { toast } from 'sonner'
import type { ActivityLevel, BiologicalSex, NutritionProfile } from '@/types/nutrition'

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sitzend (kaum Bewegung)',
  lightly_active: 'Leicht aktiv (1–3× Sport/Woche)',
  moderately_active: 'Mäßig aktiv (3–5× Sport/Woche)',
  very_active: 'Sehr aktiv (6–7× Sport/Woche)',
  extra_active: 'Extrem aktiv (tägl. intensiv)',
}

interface Props {
  profile: NutritionProfile
  fitnessGoal: string | null
}

export function NutritionSetupForm({ profile, fitnessGoal }: Props) {
  const [sex, setSex] = useState<BiologicalSex | ''>(profile.biological_sex ?? '')
  const [birthYear, setBirthYear] = useState(profile.birth_year?.toString() ?? '')
  const [height, setHeight] = useState(profile.height_cm?.toString() ?? '')
  const [weight, setWeight] = useState(profile.weight_kg?.toString() ?? '')
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | ''>(profile.activity_level ?? '')
  const [override, setOverride] = useState('')
  const [isPending, startTransition] = useTransition()

  const currentYear = new Date().getFullYear()

  const computedGoal = (() => {
    if (!sex || !birthYear || !height || !weight || !activityLevel) return null
    const by = parseInt(birthYear)
    const h = parseFloat(height)
    const w = parseFloat(weight)
    const age = currentYear - by
    if (isNaN(by) || isNaN(h) || isNaN(w) || age < 13 || age > 100) return null
    if (h < 100 || h > 250 || w < 30 || w > 300) return null
    const { tdee } = calculateTDEE(w, h, by, sex as BiologicalSex, activityLevel as ActivityLevel)
    return applyGoalAdjustment(tdee, fitnessGoal)
  })()

  const displayGoal = override ? parseInt(override) || null : computedGoal
  const isComplete = !!(sex && birthYear && height && weight && activityLevel)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isComplete) {
      toast.error('Bitte alle Pflichtfelder ausfüllen')
      return
    }
    startTransition(async () => {
      const result = await saveNutritionSetup({
        biological_sex: sex as BiologicalSex,
        birth_year: parseInt(birthYear),
        height_cm: parseFloat(height),
        weight_kg: parseFloat(weight),
        activity_level: activityLevel as ActivityLevel,
        calorie_goal_override: override ? parseInt(override) || null : null,
      })
      if (result?.error) toast.error(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label className="text-zinc-300">Biologisches Geschlecht</Label>
        <Select value={sex} onValueChange={(v) => setSex(v as BiologicalSex)}>
          <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-50">
            <SelectValue placeholder="Auswählen…" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="male">Männlich</SelectItem>
            <SelectItem value="female">Weiblich</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-zinc-300">Geburtsjahr</Label>
        <Input
          type="number"
          placeholder="z. B. 1990"
          value={birthYear}
          onChange={(e) => setBirthYear(e.target.value)}
          min={currentYear - 100}
          max={currentYear - 13}
          className="bg-zinc-900 border-zinc-700 focus:border-green-500 text-zinc-50"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-zinc-300">Körpergröße (cm)</Label>
        <Input
          type="number"
          placeholder="z. B. 175"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          min={100}
          max={250}
          className="bg-zinc-900 border-zinc-700 focus:border-green-500 text-zinc-50"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-zinc-300">Körpergewicht (kg)</Label>
        <Input
          type="number"
          placeholder="z. B. 75"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          min={30}
          max={300}
          step={0.5}
          className="bg-zinc-900 border-zinc-700 focus:border-green-500 text-zinc-50"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-zinc-300">Aktivitätslevel</Label>
        <Select value={activityLevel} onValueChange={(v) => setActivityLevel(v as ActivityLevel)}>
          <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-50">
            <SelectValue placeholder="Auswählen…" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            {(Object.entries(ACTIVITY_LABELS) as [ActivityLevel, string][]).map(([val, label]) => (
              <SelectItem key={val} value={val}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {computedGoal && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <p className="text-sm text-zinc-400">Berechnetes Kalorienziel</p>
          <p className="text-2xl font-bold text-green-400">{computedGoal.toLocaleString('de-DE')} kcal</p>
          {fitnessGoal === 'weight_loss' && (
            <p className="text-xs text-zinc-500 mt-1">Angepasst für Gewichtsverlust (−500 kcal)</p>
          )}
          {fitnessGoal === 'muscle_gain' && (
            <p className="text-xs text-zinc-500 mt-1">Angepasst für Muskelaufbau (+300 kcal)</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-zinc-400 text-sm">Eigenes Ziel (optional)</Label>
        <Input
          type="number"
          placeholder={computedGoal ? `Standard: ${computedGoal} kcal` : 'kcal/Tag eingeben'}
          value={override}
          onChange={(e) => setOverride(e.target.value)}
          min={800}
          max={9999}
          className="bg-zinc-900 border-zinc-700 focus:border-green-500 text-zinc-50"
        />
        {override && displayGoal && (
          <p className="text-xs text-zinc-500">Gespeichertes Ziel: {displayGoal.toLocaleString('de-DE')} kcal</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending || !isComplete}
        className="w-full h-12 bg-green-500 hover:bg-green-400 text-black font-semibold"
      >
        {isPending ? 'Wird gespeichert…' : 'Kalorienziel speichern'}
      </Button>
    </form>
  )
}
