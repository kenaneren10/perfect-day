'use client'

import { useState, useTransition } from 'react'
import { Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generatePlan } from '@/app/plan/actions'
import { toast } from 'sonner'

const options = [
  {
    days: 3,
    label: '3 Tage',
    description: 'Mo · Mi · Fr',
    hint: 'Ideal für Einsteiger und volle Terminkalender',
  },
  {
    days: 4,
    label: '4 Tage',
    description: 'Mo · Di · Do · Fr',
    hint: 'Optimale Balance aus Training und Erholung',
  },
  {
    days: 5,
    label: '5 Tage',
    description: 'Mo – Fr',
    hint: 'Maximaler Fokus für Fortgeschrittene',
  },
]

export function PlanSetupCard() {
  const [selected, setSelected] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleGenerate = () => {
    if (!selected) return
    startTransition(async () => {
      const result = await generatePlan(selected)
      if (result.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Icon + title */}
      <div className="flex flex-col items-center text-center space-y-3 pt-4">
        <div className="h-16 w-16 bg-green-500/10 rounded-2xl flex items-center justify-center">
          <Dumbbell className="h-8 w-8 text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-zinc-50">
            Wie oft trainierst du pro Woche?
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Wir passen deinen Plan an deinen Alltag an.
          </p>
        </div>
      </div>

      {/* Day options */}
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selected === option.days
          return (
            <button
              key={option.days}
              onClick={() => setSelected(option.days)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-zinc-50">{option.label}</span>
                    <span className="text-sm text-zinc-400">{option.description}</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{option.hint}</p>
                </div>
                <div
                  className={`h-5 w-5 rounded-full border-2 transition-colors shrink-0 ${
                    isSelected ? 'border-green-500 bg-green-500' : 'border-zinc-700'
                  }`}
                />
              </div>
            </button>
          )
        })}
      </div>

      <Button
        onClick={handleGenerate}
        disabled={!selected || isPending}
        className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold h-12 text-base"
      >
        {isPending ? 'Plan wird erstellt…' : 'Plan erstellen'}
      </Button>
    </div>
  )
}
