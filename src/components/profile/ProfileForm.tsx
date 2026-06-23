'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { updateProfile } from '@/app/profile/actions'
import {
  Goal,
  GOAL_LABELS,
  FITNESS_LEVEL_LABELS,
  EQUIPMENT_LABELS_ONBOARDING,
  Profile,
} from '@/types/profile'
import { TrendingDown, Dumbbell, Zap, Activity, Home, Building, LogOut, ChevronRight } from 'lucide-react'

type FitnessLevel = 'beginner' | 'intermediate' | 'advanced'
type Equipment = 'none' | 'basic' | 'full'

const GOAL_ICONS: Record<Goal, React.ReactNode> = {
  weight_loss: <TrendingDown className="h-4 w-4" />,
  muscle_gain: <Dumbbell className="h-4 w-4" />,
  fitness: <Zap className="h-4 w-4" />,
  flexibility: <Activity className="h-4 w-4" />,
}

const EQUIPMENT_ICONS: Record<Equipment, React.ReactNode> = {
  none: <Home className="h-4 w-4" />,
  basic: <Dumbbell className="h-4 w-4" />,
  full: <Building className="h-4 w-4" />,
}

function SelectionRow<T extends string>({
  value,
  selected,
  icon,
  label,
  onClick,
}: {
  value: T
  selected: boolean
  icon: React.ReactNode
  label: string
  onClick: (value: T) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
        selected
          ? 'border-green-500 bg-green-500/10 text-zinc-50'
          : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600'
      }`}
    >
      <div
        className={`shrink-0 h-8 w-8 rounded-md flex items-center justify-center ${
          selected ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-400'
        }`}
      >
        {icon}
      </div>
      <span className="text-sm font-medium flex-1">{label}</span>
      {selected && <ChevronRight className="h-3.5 w-3.5 text-green-400 shrink-0" />}
    </button>
  )
}

const profileFormSchema = z.object({
  display_name: z.string().min(1, 'Name ist erforderlich').max(100),
  goal: z.enum(['weight_loss', 'muscle_gain', 'fitness', 'flexibility']),
  fitness_level: z.enum(['beginner', 'intermediate', 'advanced']),
  equipment: z.enum(['none', 'basic', 'full']),
})

type ProfileFormData = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
  profile: Profile
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isPending, setIsPending] = useState(false)

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      display_name: profile.display_name ?? '',
      goal: profile.goal ?? 'fitness',
      fitness_level: profile.fitness_level ?? 'beginner',
      equipment: profile.equipment ?? 'none',
    },
  })

  const goal = form.watch('goal')
  const fitness_level = form.watch('fitness_level')
  const equipment = form.watch('equipment')

  const onSubmit = async (data: ProfileFormData) => {
    setIsPending(true)
    try {
      await updateProfile(data)
      toast.success('Profil gespeichert')
    } catch {
      toast.error('Fehler beim Speichern')
    } finally {
      setIsPending(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Name */}
        <FormField
          control={form.control}
          name="display_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-200">Anzeigename</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="bg-zinc-900 border-zinc-800 text-zinc-50 focus:border-green-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Goal */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-zinc-200">Fitnessziel</p>
          <div className="space-y-2">
            {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
              <SelectionRow
                key={g}
                value={g}
                selected={goal === g}
                icon={GOAL_ICONS[g]}
                label={GOAL_LABELS[g].label}
                onClick={(v) => form.setValue('goal', v)}
              />
            ))}
          </div>
        </div>

        {/* Fitness Level */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-zinc-200">Fitnesslevel</p>
          <div className="space-y-2">
            {(['beginner', 'intermediate', 'advanced'] as FitnessLevel[]).map((level) => (
              <SelectionRow
                key={level}
                value={level}
                selected={fitness_level === level}
                icon={
                  <span className="text-xs font-bold">
                    {level === 'beginner' ? '🌱' : level === 'intermediate' ? '💪' : '🔥'}
                  </span>
                }
                label={FITNESS_LEVEL_LABELS[level].label}
                onClick={(v) => form.setValue('fitness_level', v)}
              />
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-zinc-200">Equipment</p>
          <div className="space-y-2">
            {(['none', 'basic', 'full'] as Equipment[]).map((eq) => (
              <SelectionRow
                key={eq}
                value={eq}
                selected={equipment === eq}
                icon={EQUIPMENT_ICONS[eq]}
                label={EQUIPMENT_LABELS_ONBOARDING[eq].label}
                onClick={(v) => form.setValue('equipment', v)}
              />
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold"
        >
          {isPending ? 'Wird gespeichert...' : 'Speichern'}
        </Button>

        <Separator className="bg-zinc-800" />

        <Button
          type="button"
          variant="ghost"
          onClick={handleSignOut}
          className="w-full text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Abmelden
        </Button>
      </form>
    </Form>
  )
}
