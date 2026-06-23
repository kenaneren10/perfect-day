'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
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
import { deleteExercise } from '@/app/exercises/actions'
import { toast } from 'sonner'

interface DeleteButtonProps {
  exerciseId: string
}

export function DeleteButton({ exerciseId }: DeleteButtonProps) {
  const [isPending, setIsPending] = useState(false)

  const handleDelete = async () => {
    setIsPending(true)
    try {
      await deleteExercise(exerciseId)
    } catch {
      toast.error('Fehler beim Löschen der Übung')
      setIsPending(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-400 hover:text-red-300"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Löschen
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-zinc-900 border-zinc-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-zinc-50">Übung wirklich löschen?</AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            Diese Aktion kann nicht rückgängig gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-50 hover:bg-zinc-700 hover:text-zinc-50">
            Abbrechen
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-500 hover:bg-red-600 text-white border-0"
          >
            {isPending ? 'Löschen...' : 'Löschen'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
