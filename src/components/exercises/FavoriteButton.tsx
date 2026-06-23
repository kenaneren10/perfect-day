'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleFavorite } from '@/app/exercises/actions'
import { toast } from 'sonner'

interface FavoriteButtonProps {
  exerciseId: string
  isFavorited: boolean
}

export function FavoriteButton({ exerciseId, isFavorited: initialIsFavorited }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
  const [isPending, setIsPending] = useState(false)

  const handleToggle = async () => {
    if (isPending) return
    setIsPending(true)
    const previous = isFavorited
    setIsFavorited(!isFavorited)

    try {
      await toggleFavorite(exerciseId, isFavorited)
      toast.success(isFavorited ? 'Favorit entfernt' : 'Als Favorit gespeichert')
    } catch {
      setIsFavorited(previous)
      toast.error('Fehler beim Speichern des Favoriten')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isFavorited ? 'Aus Favoriten entfernen' : 'Als Favorit markieren'}
      className={`h-10 w-10 rounded-full transition-colors ${
        isFavorited
          ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
          : 'text-zinc-400 hover:text-red-400 hover:bg-red-500/10'
      }`}
    >
      <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
    </Button>
  )
}
