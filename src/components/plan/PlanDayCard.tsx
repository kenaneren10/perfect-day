import Link from 'next/link'
import { ChevronRight, Moon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { PlanDay, DAY_NAMES, DAY_ABBREVIATIONS, FOCUS_LABELS, WorkoutFocus } from '@/types/plan'

interface PlanDayCardProps {
  day: PlanDay
  isToday: boolean
}

const focusColors: Record<WorkoutFocus, string> = {
  full_body: 'text-green-400',
  upper_body: 'text-blue-400',
  lower_body: 'text-violet-400',
  cardio: 'text-orange-400',
  core: 'text-yellow-400',
}

export function PlanDayCard({ day, isToday }: PlanDayCardProps) {
  const dayName = DAY_NAMES[day.day_of_week]
  const dayAbbr = DAY_ABBREVIATIONS[day.day_of_week]

  if (day.is_rest_day) {
    return (
      <div
        className={`flex items-center gap-4 p-4 rounded-xl border ${
          isToday
            ? 'border-zinc-600 bg-zinc-800/50'
            : 'border-zinc-800/50 bg-zinc-900/30'
        }`}
      >
        <div className="w-8 text-center shrink-0">
          <span className={`text-xs font-medium ${isToday ? 'text-zinc-300' : 'text-zinc-600'}`}>
            {dayAbbr}
          </span>
        </div>
        <Moon className="h-4 w-4 text-zinc-600 shrink-0" />
        <div className="flex-1">
          <span className="text-sm text-zinc-500">Ruhetag</span>
          {isToday && (
            <p className="text-xs text-zinc-500 mt-0.5">Erhol dich gut!</p>
          )}
        </div>
        {isToday && (
          <Badge className="bg-zinc-700 text-zinc-300 text-xs border-0">Heute</Badge>
        )}
      </div>
    )
  }

  const focusKey = day.focus as WorkoutFocus
  const focusLabel = day.display_label ?? (day.focus ? FOCUS_LABELS[focusKey] : '')
  const colorClass = focusKey ? focusColors[focusKey] : 'text-zinc-400'

  return (
    <Link href={`/plan/day/${day.day_of_week}`}>
      <div
        className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer group ${
          isToday
            ? 'border-green-500/50 bg-zinc-900 shadow-[0_0_0_1px_rgba(34,197,94,0.15)]'
            : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
        }`}
      >
        <div className="w-8 text-center shrink-0">
          <span className={`text-xs font-medium ${isToday ? 'text-green-400' : 'text-zinc-400'}`}>
            {dayAbbr}
          </span>
        </div>
        <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
          <span className={`text-sm font-bold ${colorClass}`}>
            {focusLabel.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-50 text-sm">{dayName}</span>
            {isToday && (
              <Badge className="bg-green-500/20 text-green-400 text-xs border-0">Heute</Badge>
            )}
          </div>
          <span className={`text-xs ${colorClass}`}>{focusLabel}</span>
        </div>
        <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
      </div>
    </Link>
  )
}
