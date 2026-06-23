'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface Props {
  startedAt: string
}

export function SessionTimerBar({ startedAt }: Props) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = new Date(startedAt).getTime()
    const update = () => setElapsed(Math.floor((Date.now() - start) / 1000))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [startedAt])

  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 mb-6">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse block" />
        <span className="text-sm font-medium text-green-400">Training läuft</span>
      </div>
      <div className="flex items-center gap-1.5 text-green-400">
        <Clock className="h-4 w-4" />
        <span className="font-mono font-semibold text-sm">{display}</span>
      </div>
    </div>
  )
}
