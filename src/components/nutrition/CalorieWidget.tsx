import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Props {
  consumed: number
  goal: number
}

function CalorieRing({ pct }: { pct: number }) {
  const r = 22
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(1, pct / 100))
  const isOver = pct >= 100

  return (
    <svg width="56" height="56" className="-rotate-90 shrink-0">
      <circle cx="28" cy="28" r={r} fill="none" stroke="#27272a" strokeWidth="5" />
      <circle
        cx="28" cy="28" r={r}
        fill="none"
        stroke={isOver ? '#f59e0b' : '#22c55e'}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        className="transition-all duration-700"
      />
    </svg>
  )
}

export function CalorieWidget({ consumed, goal }: Props) {
  const pct = Math.min(100, Math.round((consumed / goal) * 100))
  const remaining = Math.max(0, goal - consumed)
  const isOver = consumed > goal

  return (
    <Link href="/nutrition">
      <div className="bg-zinc-900 rounded-2xl p-4 card-shadow border border-zinc-800/60 flex items-center gap-4 group hover:border-zinc-700 transition-all">
        <CalorieRing pct={pct} />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-zinc-500 mb-1">Kalorien heute</p>
          <p className="font-black text-xl text-zinc-50 tabular-nums leading-none">
            {Math.round(consumed).toLocaleString('de-DE')}
            <span className="text-sm font-normal text-zinc-500 ml-1">/ {goal.toLocaleString('de-DE')} kcal</span>
          </p>
          <p className="text-xs mt-1 text-zinc-500">
            {isOver ? 'Ziel überschritten' : `${Math.round(remaining)} kcal verbleibend`}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
      </div>
    </Link>
  )
}
