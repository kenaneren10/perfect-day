import Link from 'next/link'
import { Utensils, ChevronRight } from 'lucide-react'

interface Props {
  consumed: number
  goal: number
}

export function CalorieWidget({ consumed, goal }: Props) {
  const pct = Math.min(100, Math.round((consumed / goal) * 100))
  const remaining = Math.max(0, goal - consumed)

  return (
    <Link href="/nutrition">
      <div className="bg-zinc-900 border border-zinc-800 hover:border-green-500/50 rounded-xl p-5 transition-colors cursor-pointer group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
              <Utensils className="h-4 w-4 text-green-400" />
            </div>
            <p className="font-semibold text-zinc-50 text-sm group-hover:text-green-400 transition-colors">
              Kalorien heute
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-green-400 transition-colors" />
        </div>

        <div className="flex items-end justify-between mb-2">
          <div>
            <span className="text-2xl font-bold text-zinc-50">
              {Math.round(consumed).toLocaleString('de-DE')}
            </span>
            <span className="text-sm text-zinc-500 ml-1">
              / {goal.toLocaleString('de-DE')} kcal
            </span>
          </div>
          <p className="text-xs text-zinc-500 mb-0.5">
            {remaining > 0 ? `${Math.round(remaining)} verbleibend` : 'Ziel erreicht ✓'}
          </p>
        </div>

        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </Link>
  )
}
