'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { completeOnboarding } from '@/app/onboarding/actions'
import {
  Goal,
  GOAL_LABELS,
  FITNESS_LEVEL_LABELS,
  EQUIPMENT_LABELS_ONBOARDING,
} from '@/types/profile'
import { TrendingDown, Dumbbell, Zap, Activity, Home, Building, ChevronRight, ArrowLeft } from 'lucide-react'

type Step = 1 | 2 | 3 | 4
type FitnessLevel = 'beginner' | 'intermediate' | 'advanced'
type Equipment = 'none' | 'basic' | 'full'

interface FlowData {
  display_name: string
  goal: Goal | null
  fitness_level: FitnessLevel | null
  equipment: Equipment | null
}

const GOAL_ICONS: Record<Goal, React.ReactNode> = {
  weight_loss: <TrendingDown className="h-5 w-5" />,
  muscle_gain: <Dumbbell className="h-5 w-5" />,
  fitness: <Zap className="h-5 w-5" />,
  flexibility: <Activity className="h-5 w-5" />,
}

const EQUIPMENT_ICONS: Record<Equipment, React.ReactNode> = {
  none: <Home className="h-5 w-5" />,
  basic: <Dumbbell className="h-5 w-5" />,
  full: <Building className="h-5 w-5" />,
}

function SelectionCard<T extends string>({
  value,
  selected,
  icon,
  label,
  description,
  onClick,
}: {
  value: T
  selected: boolean
  icon: React.ReactNode
  label: string
  description: string
  onClick: (value: T) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
        selected
          ? 'border-green-500 bg-green-500/10 text-zinc-50'
          : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800'
      }`}
    >
      <div
        className={`shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${
          selected ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-400'
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
      </div>
      {selected && <ChevronRight className="h-4 w-4 text-green-400 shrink-0" />}
    </button>
  )
}

function ProgressBar({ step }: { step: Step }) {
  return (
    <div className="space-y-2 mb-8">
      <div className="flex justify-between text-xs text-zinc-500">
        <span>Schritt {step} von 4</span>
        <span>{Math.round((step / 4) * 100)}%</span>
      </div>
      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>
    </div>
  )
}

const nameSchema = z.object({
  display_name: z.string().min(1, 'Name ist erforderlich').max(100),
})

export function OnboardingFlow({ defaultName }: { defaultName: string }) {
  const [step, setStep] = useState<Step>(1)
  const [isPending, setIsPending] = useState(false)
  const [data, setData] = useState<FlowData>({
    display_name: defaultName,
    goal: null,
    fitness_level: null,
    equipment: null,
  })

  const nameForm = useForm<z.infer<typeof nameSchema>>({
    resolver: zodResolver(nameSchema),
    defaultValues: { display_name: defaultName },
  })

  // Step 1: Name
  const handleNameNext = nameForm.handleSubmit((values) => {
    setData((prev) => ({ ...prev, display_name: values.display_name }))
    setStep(2)
  })

  // Step 2: Goal — auto-advance
  const handleGoalSelect = (goal: Goal) => {
    setData((prev) => ({ ...prev, goal }))
    setStep(3)
  }

  // Step 3: Fitness level — auto-advance
  const handleLevelSelect = (fitness_level: FitnessLevel) => {
    setData((prev) => ({ ...prev, fitness_level }))
    setStep(4)
  }

  // Step 4: Equipment — select then submit
  const handleEquipmentSelect = (equipment: Equipment) => {
    setData((prev) => ({ ...prev, equipment }))
  }

  const handleLoslegen = async () => {
    if (!data.goal || !data.fitness_level || !data.equipment) return
    setIsPending(true)
    try {
      await completeOnboarding({
        display_name: data.display_name,
        goal: data.goal,
        fitness_level: data.fitness_level,
        equipment: data.equipment,
      })
    } catch {
      toast.error('Fehler beim Speichern. Bitte versuche es erneut.')
      setIsPending(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <ProgressBar step={step} />

      {/* Step 1: Name */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-zinc-50">Wie heißt du?</h2>
            <p className="text-zinc-400 mt-1 text-sm">So werden wir dich in der App ansprechen.</p>
          </div>
          <Form {...nameForm}>
            <form onSubmit={handleNameNext} className="space-y-4">
              <FormField
                control={nameForm.control}
                name="display_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-200">Dein Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="z.B. Max"
                        autoFocus
                        className="bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-500 focus:border-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold"
              >
                Weiter
              </Button>
            </form>
          </Form>
        </div>
      )}

      {/* Step 2: Goal */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-zinc-50">Dein Ziel</h2>
            <p className="text-zinc-400 mt-1 text-sm">Was möchtest du hauptsächlich erreichen?</p>
          </div>
          <div className="space-y-3">
            {(Object.keys(GOAL_LABELS) as Goal[]).map((goal) => (
              <SelectionCard
                key={goal}
                value={goal}
                selected={data.goal === goal}
                icon={GOAL_ICONS[goal]}
                label={GOAL_LABELS[goal].label}
                description={GOAL_LABELS[goal].description}
                onClick={handleGoalSelect}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep(1)}
            className="w-full text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
        </div>
      )}

      {/* Step 3: Fitness Level */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-zinc-50">Dein Fitnesslevel</h2>
            <p className="text-zinc-400 mt-1 text-sm">Schätze deine aktuelle Erfahrung ein.</p>
          </div>
          <div className="space-y-3">
            {(['beginner', 'intermediate', 'advanced'] as FitnessLevel[]).map((level) => (
              <SelectionCard
                key={level}
                value={level}
                selected={data.fitness_level === level}
                icon={
                  <span className="text-base font-bold">
                    {level === 'beginner' ? '🌱' : level === 'intermediate' ? '💪' : '🔥'}
                  </span>
                }
                label={FITNESS_LEVEL_LABELS[level].label}
                description={FITNESS_LEVEL_LABELS[level].description}
                onClick={handleLevelSelect}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep(2)}
            className="w-full text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
        </div>
      )}

      {/* Step 4: Equipment */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-zinc-50">Dein Equipment</h2>
            <p className="text-zinc-400 mt-1 text-sm">Was steht dir für das Training zur Verfügung?</p>
          </div>
          <div className="space-y-3">
            {(['none', 'basic', 'full'] as Equipment[]).map((eq) => (
              <SelectionCard
                key={eq}
                value={eq}
                selected={data.equipment === eq}
                icon={EQUIPMENT_ICONS[eq]}
                label={EQUIPMENT_LABELS_ONBOARDING[eq].label}
                description={EQUIPMENT_LABELS_ONBOARDING[eq].description}
                onClick={handleEquipmentSelect}
              />
            ))}
          </div>
          <div className="space-y-3">
            <Button
              type="button"
              disabled={!data.equipment || isPending}
              onClick={handleLoslegen}
              className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold disabled:opacity-50"
            >
              {isPending ? 'Wird gespeichert...' : 'Loslegen'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep(3)}
              disabled={isPending}
              className="w-full text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
