'use client'

import { useTransition } from 'react'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { startSession } from '@/app/session/actions'
import { toast } from 'sonner'

interface Props {
  planDayId: string
}

export function StartWorkoutButton({ planDayId }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleStart = () => {
    startTransition(async () => {
      const result = await startSession(planDayId)
      if (result.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="mt-8">
      <Button
        onClick={handleStart}
        disabled={isPending}
        className="w-full h-12 bg-green-500 hover:bg-green-400 text-black font-bold text-base rounded-full"
      >
        <Play className="h-5 w-5 mr-2" />
        {isPending ? 'Wird gestartet…' : 'Training starten'}
      </Button>
    </div>
  )
}
