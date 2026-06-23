'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Exercise,
  ExerciseFilters,
  MuscleGroup,
  Equipment,
  Difficulty,
  MUSCLE_GROUP_LABELS,
  EQUIPMENT_LABELS,
  DIFFICULTY_LABELS,
  CATEGORY_LABELS,
  equipmentAllowList,
} from '@/types/exercise'
import { ExerciseCard } from './ExerciseCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Plus, RotateCcw, Heart, Dumbbell } from 'lucide-react'
import Link from 'next/link'

interface ExerciseLibraryProps {
  initialExercises: Exercise[]
  initialFavoriteIds: string[]
  userId: string
  profileDefaults: {
    equipment: Equipment | 'all'
    difficulty: Difficulty | 'all'
  }
  totalExerciseCount: number
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
        active
          ? 'bg-green-500 text-black'
          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-50'
      }`}
    >
      {label}
    </button>
  )
}

export function ExerciseLibrary({
  initialExercises,
  initialFavoriteIds,
  userId,
  profileDefaults,
  totalExerciseCount,
}: ExerciseLibraryProps) {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises)
  const [favoriteIds] = useState<string[]>(initialFavoriteIds)
  const [loading, setLoading] = useState(false)
  const hasMounted = useRef(false)

  const defaultFilters: ExerciseFilters = {
    search: '',
    category: 'all',
    muscleGroup: 'all',
    equipment: profileDefaults.equipment,
    difficulty: profileDefaults.difficulty,
    favoritesOnly: false,
  }
  const [filters, setFilters] = useState<ExerciseFilters>(defaultFilters)

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }

    let cancelled = false

    const fetchExercises = async () => {
      setLoading(true)
      try {
        const supabase = createClient()
        let query = supabase
          .from('exercises')
          .select('*')
          .is('deleted_at', null)
          .or(`is_system.eq.true,user_id.eq.${userId}`)

        if (filters.search) {
          query = query.ilike('name', `%${filters.search}%`)
        }
        if (filters.category !== 'all') {
          query = query.eq('category', filters.category)
        }
        if (filters.muscleGroup !== 'all') {
          query = query.contains('muscle_groups', [filters.muscleGroup])
        }
        if (filters.equipment !== 'all') {
          // Show exercises the user can actually do: selected level OR less
          query = query.in('equipment', equipmentAllowList(filters.equipment))
        }
        if (filters.difficulty !== 'all') {
          query = query.eq('difficulty', filters.difficulty)
        }
        if (filters.favoritesOnly) {
          if (favoriteIds.length === 0) {
            if (!cancelled) setExercises([])
            return
          }
          query = query.in('id', favoriteIds)
        }

        query = query.order('name')

        const { data, error } = await query
        if (!cancelled && !error && data) {
          setExercises(data as Exercise[])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchExercises()
    return () => { cancelled = true }
  }, [filters, userId, favoriteIds])

  const resetFilters = () => setFilters(defaultFilters)
  const hasFavorites = favoriteIds.length > 0

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
        <Input
          placeholder="Übung suchen..."
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-500 focus:border-green-500"
        />
      </div>

      {/* Filter Bar */}
      <div className="space-y-3">
        {/* Category */}
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="Alle"
            active={filters.category === 'all'}
            onClick={() => setFilters((prev) => ({ ...prev, category: 'all' }))}
          />
          {(['strength', 'cardio'] as const).map((cat) => (
            <FilterChip
              key={cat}
              label={CATEGORY_LABELS[cat]}
              active={filters.category === cat}
              onClick={() => setFilters((prev) => ({ ...prev, category: cat }))}
            />
          ))}
        </div>

        {/* Muscle Group */}
        <Select
          value={filters.muscleGroup}
          onValueChange={(val) =>
            setFilters((prev) => ({ ...prev, muscleGroup: val as MuscleGroup | 'all' }))
          }
        >
          <SelectTrigger className="w-full sm:w-56 bg-zinc-900 border-zinc-800 text-zinc-50 focus:border-green-500">
            <SelectValue placeholder="Muskelgruppe" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="all" className="text-zinc-50 focus:bg-zinc-800">
              Alle Muskelgruppen
            </SelectItem>
            {(Object.entries(MUSCLE_GROUP_LABELS) as [MuscleGroup, string][]).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-zinc-50 focus:bg-zinc-800">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Equipment */}
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="Alle Equipment"
            active={filters.equipment === 'all'}
            onClick={() => setFilters((prev) => ({ ...prev, equipment: 'all' }))}
          />
          {(['none', 'basic', 'full'] as const).map((eq) => (
            <FilterChip
              key={eq}
              label={EQUIPMENT_LABELS[eq]}
              active={filters.equipment === eq}
              onClick={() => setFilters((prev) => ({ ...prev, equipment: eq }))}
            />
          ))}
        </div>

        {/* Difficulty */}
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="Alle Level"
            active={filters.difficulty === 'all'}
            onClick={() => setFilters((prev) => ({ ...prev, difficulty: 'all' }))}
          />
          {(['beginner', 'intermediate', 'advanced'] as const).map((diff) => (
            <FilterChip
              key={diff}
              label={DIFFICULTY_LABELS[diff]}
              active={filters.difficulty === diff}
              onClick={() => setFilters((prev) => ({ ...prev, difficulty: diff }))}
            />
          ))}
        </div>

        {/* Favorites + Reset row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          {hasFavorites && (
            <div className="flex items-center gap-2">
              <Switch
                id="favorites-only"
                checked={filters.favoritesOnly}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({ ...prev, favoritesOnly: checked }))
                }
                className="data-[state=checked]:bg-green-500"
              />
              <Label
                htmlFor="favorites-only"
                className="text-zinc-300 cursor-pointer flex items-center gap-1.5 text-sm"
              >
                <Heart className="h-3.5 w-3.5 text-red-400" />
                Nur Favoriten
              </Label>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-zinc-500 hover:text-zinc-50 hover:bg-zinc-800 text-xs ml-auto"
          >
            <RotateCcw className="h-3 w-3 mr-1.5" />
            Filter zurücksetzen
          </Button>
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <Link href="/exercises/new">
          <Button className="bg-green-500 hover:bg-green-400 text-black font-semibold">
            <Plus className="h-4 w-4 mr-1.5" />
            Übung hinzufügen
          </Button>
        </Link>
      </div>

      {/* Exercise Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl bg-zinc-800" />
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          {filters.favoritesOnly ? (
            <>
              <Heart className="h-12 w-12 text-zinc-700" />
              <p className="text-zinc-400 text-sm">
                Noch keine Favoriten — klick auf ♡ bei einer Übung
              </p>
            </>
          ) : totalExerciseCount === 0 ? (
            <>
              <Dumbbell className="h-12 w-12 text-zinc-700" />
              <p className="text-zinc-400 text-sm">Die Bibliothek wird gerade aufgebaut</p>
            </>
          ) : (
            <>
              <Dumbbell className="h-12 w-12 text-zinc-700" />
              <p className="text-zinc-400 text-sm">Keine Übungen gefunden</p>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Filter zurücksetzen
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {exercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      )}
    </div>
  )
}
