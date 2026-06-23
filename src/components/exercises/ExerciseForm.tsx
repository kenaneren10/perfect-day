'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createExercise, updateExercise, exerciseSchema, ExerciseFormData } from '@/app/exercises/actions'
import { Exercise, MUSCLE_GROUP_LABELS, MuscleGroup } from '@/types/exercise'

const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest',
  'back',
  'shoulders',
  'arms',
  'core',
  'legs',
  'glutes',
  'full_body',
]

interface ExerciseFormProps {
  exercise?: Exercise
}

export function ExerciseForm({ exercise }: ExerciseFormProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const isEditing = !!exercise

  const form = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: exercise?.name ?? '',
      category: exercise?.category ?? 'strength',
      muscle_groups: exercise?.muscle_groups ?? [],
      equipment: exercise?.equipment ?? 'none',
      difficulty: exercise?.difficulty ?? 'beginner',
      description: exercise?.description ?? '',
      image_url: exercise?.image_url ?? undefined,
      video_url: exercise?.video_url ?? undefined,
    },
  })

  const onSubmit = async (data: ExerciseFormData) => {
    setIsPending(true)
    try {
      if (isEditing) {
        await updateExercise(exercise.id, data)
      } else {
        await createExercise(data)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unbekannter Fehler'
      toast.error(`Fehler beim Speichern: ${message}`)
      setIsPending(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-200">Name *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="z.B. Bankdrücken"
                  className="bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-500 focus:border-green-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-200">Kategorie *</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="strength" id="cat-strength" />
                    <Label htmlFor="cat-strength" className="text-zinc-300 cursor-pointer">
                      Kraft
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="cardio" id="cat-cardio" />
                    <Label htmlFor="cat-cardio" className="text-zinc-300 cursor-pointer">
                      Cardio
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Muscle Groups */}
        <FormField
          control={form.control}
          name="muscle_groups"
          render={() => (
            <FormItem>
              <FormLabel className="text-zinc-200">Muskelgruppen * (mind. 1)</FormLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {MUSCLE_GROUPS.map((mg) => (
                  <FormField
                    key={mg}
                    control={form.control}
                    name="muscle_groups"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(mg)}
                            onCheckedChange={(checked) => {
                              const current = field.value ?? []
                              if (checked) {
                                field.onChange([...current, mg])
                              } else {
                                field.onChange(current.filter((v) => v !== mg))
                              }
                            }}
                            className="border-zinc-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                          />
                        </FormControl>
                        <Label className="text-zinc-300 cursor-pointer font-normal">
                          {MUSCLE_GROUP_LABELS[mg]}
                        </Label>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Equipment */}
        <FormField
          control={form.control}
          name="equipment"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-200">Equipment *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-50 focus:border-green-500">
                    <SelectValue placeholder="Equipment wählen" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="none" className="text-zinc-50">Ohne Equipment</SelectItem>
                  <SelectItem value="basic" className="text-zinc-50">Basis</SelectItem>
                  <SelectItem value="full" className="text-zinc-50">Vollausstattung</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Difficulty */}
        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-200">Schwierigkeit *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-50 focus:border-green-500">
                    <SelectValue placeholder="Schwierigkeit wählen" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="beginner" className="text-zinc-50">Einsteiger</SelectItem>
                  <SelectItem value="intermediate" className="text-zinc-50">Fortgeschritten</SelectItem>
                  <SelectItem value="advanced" className="text-zinc-50">Profi</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-200">Beschreibung (optional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  placeholder="Übungsanleitung, Tipps, Hinweise..."
                  rows={4}
                  className="bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-500 focus:border-green-500 resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image URL */}
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-200">Bild-URL (optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                  className="bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-500 focus:border-green-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Video URL */}
        <FormField
          control={form.control}
          name="video_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-200">Video-URL (optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  placeholder="https://youtube.com/..."
                  type="url"
                  className="bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-500 focus:border-green-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-green-500 hover:bg-green-400 text-black font-semibold"
          >
            {isPending ? 'Speichern...' : 'Speichern'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/exercises')}
            disabled={isPending}
            className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800"
          >
            Abbrechen
          </Button>
        </div>
      </form>
    </Form>
  )
}
