import Link from 'next/link'
import { Timer, CheckCircle2 } from 'lucide-react'

interface Props {
  completedToday: boolean
}

export function MobilityWidget({ completedToday }: Props) {
  if (completedToday) {
    return (
      <div className="bg-zinc-900 rounded-2xl p-4 card-shadow border border-zinc-800/60 flex items-center gap-4">
        <div className="h-10 w-10 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-5 w-5 text-green-400" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-zinc-50 text-sm">Tägliche Mobility</p>
          <p className="text-xs text-green-400/80 mt-0.5">Heute erledigt</p>
        </div>
      </div>
    )
  }

  return (
    <Link href="/mobility">
      <div className="bg-zinc-900 rounded-2xl p-4 card-shadow border border-zinc-800/60 flex items-center gap-4 group hover:border-zinc-700 transition-all">
        <div className="h-10 w-10 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
          <Timer className="h-5 w-5 text-zinc-400" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-zinc-50 text-sm">Tägliche Mobility</p>
          <p className="text-xs text-zinc-500 mt-0.5">8 Übungen · ca. 4 Minuten</p>
        </div>
        <div className="bg-zinc-800 group-hover:bg-zinc-700 rounded-full px-3 py-1.5 transition-colors shrink-0">
          <span className="text-xs font-semibold text-zinc-300">Starten</span>
        </div>
      </div>
    </Link>
  )
}
