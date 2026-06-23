'use client'

import { useState, useTransition } from 'react'
import { RefreshCw } from 'lucide-react'
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
import { regeneratePlan } from '@/app/plan/actions'
import { toast } from 'sonner'

export function RegeneratePlanDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleRegenerate = () => {
    startTransition(async () => {
      const result = await regeneratePlan()
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Neuer Plan wurde erstellt')
        setOpen(false)
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-400 transition-colors mx-auto mt-6">
          <RefreshCw className="h-3.5 w-3.5" />
          Plan neu erstellen
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-zinc-900 border-zinc-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-zinc-50">Plan neu erstellen?</AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            Dein aktueller Trainingsplan wird gelöscht und durch einen neuen Plan
            basierend auf deinen aktuellen Profileinstellungen ersetzt.
            Deine Trainingshistorie (Streaks & Fortschritt) bleibt erhalten.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-50 hover:bg-zinc-700 hover:text-zinc-50">
            Abbrechen
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRegenerate}
            disabled={isPending}
            className="bg-green-500 hover:bg-green-400 text-black font-semibold"
          >
            {isPending ? 'Wird erstellt…' : 'Neu erstellen'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
