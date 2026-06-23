'use client'

import { useState } from 'react'
import { Dumbbell } from 'lucide-react'

interface ExerciseImageProps {
  imageUrl: string | null
  name: string
  className?: string
}

export function ExerciseImage({ imageUrl, name, className = '' }: ExerciseImageProps) {
  const [hasError, setHasError] = useState(false)

  if (!imageUrl || hasError) {
    return (
      <div className={`flex items-center justify-center bg-zinc-800 ${className}`}>
        <Dumbbell className="h-12 w-12 text-zinc-600" />
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={name}
      className={`object-cover w-full h-full ${className}`}
      onError={() => setHasError(true)}
    />
  )
}
