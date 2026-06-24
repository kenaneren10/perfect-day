'use client'

import { useState, useEffect } from 'react'
import { Timer } from 'lucide-react'

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
    <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800/60 rounded-2xl px-5 py-3.5 mb-6 card-shadow">
      <div className="flex items-center gap-2.5">
        <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse block" />
        <span className="text-sm font-semibold text-zinc-300">Training läuft</span>
      </div>
      <div className="flex items-center gap-2 bg-zinc-800 rounded-full px-3 py-1.5">
        <Timer className="h-3.5 w-3.5 text-zinc-400" />
        <span className="font-mono font-bold text-sm text-zinc-50 tabular-nums">{display}</span>
      </div>
    </div>
  )
}
