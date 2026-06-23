'use client'

import { useState, useTransition } from 'react'
import { TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { confirmProgression, dismissProgression } from '@/app/plan/actions'
import { toast } from 'sonner'

export function ProgressionBanner() {
  const [visible, setVisible] = useState(true)
  const [isPendingConfirm, startConfirm] = useTransition()
  const [isPendingDismiss, startDismiss] = useTransition()

  if (!visible) return null

  const handleConfirm = () => {
    startConfirm(async () => {
      const result = await confirmProgression()
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Plan angepasst — du schaffst das!')
        setVisible(false)
      }
    })
  }

  const handleDismiss = () => {
    startDismiss(async () => {
      await dismissProgression()
      setVisible(false)
    })
  }

  return (
    <div className="mb-6 p-4 rounded-xl border border-green-500/30 bg-green-500/5">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
          <TrendingUp className="h-5 w-5 text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-zinc-50 text-sm">Du machst Fortschritte!</p>
          <p className="text-xs text-zinc-400 mt-0.5">
            Du hast genug Einheiten absolviert — dein Plan wird jetzt anspruchsvoller.
            Jede Übung bekommt einen zusätzlichen Satz.
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={isPendingConfirm || isPendingDismiss}
              className="bg-green-500 hover:bg-green-400 text-black font-semibold text-xs h-8"
            >
              {isPendingConfirm ? 'Wird angepasst…' : 'Anpassen'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              disabled={isPendingConfirm || isPendingDismiss}
              className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 text-xs h-8"
            >
              Nicht jetzt
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
