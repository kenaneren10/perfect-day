import Link from 'next/link'
import { ChevronRight, Moon } from 'lucide-react'
import { PlanDay, DAY_NAMES, DAY_ABBREVIATIONS, FOCUS_LABELS, WorkoutFocus } from '@/types/plan'

interface PlanDayCardProps {
  day: PlanDay
  isToday: boolean
}

const FOCUS_DOT: Record<WorkoutFocus, string> = {
  full_body: 'bg-green-400',
  upper_body: 'bg-blue-400',
  lower_body: 'bg-violet-400',
  cardio: 'bg-orange-400',
  core: 'bg-yellow-400',
}

const FOCUS_TEXT: Record<WorkoutFocus, string> = {
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
        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
          isToday ? 'bg-zinc-800/50 border border-zinc-700/50' : 'bg-zinc-900/50 border border-zinc-800/40'
        }`}
      >
        <span className={`text-xs font-semibold w-7 shrink-0 ${isToday ? 'text-zinc-300' : 'text-zinc-600'}`}>
          {dayAbbr}
        </span>
        <Moon className="h-3.5 w-3.5 text-zinc-700 shrink-0" />
        <span className={`text-sm flex-1 ${isToday ? 'text-zinc-400' : 'text-zinc-600'}`}>Ruhetag</span>
        {isToday && (
          <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full uppercase tracking-wide">
            Heute
          </span>
        )}
      </div>
    )
  }

  const focusKey = day.focus as WorkoutFocus
  const focusLabel = day.display_label ?? (day.focus ? FOCUS_LABELS[focusKey] : '')
  const dotColor = focusKey ? FOCUS_DOT[focusKey] : 'bg-zinc-400'
  const textColor = focusKey ? FOCUS_TEXT[focusKey] : 'text-zinc-400'

  return (
    <Link href={`/plan/day/${day.day_of_week}`}>
      <div
        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all cursor-pointer group card-shadow ${
          isToday
            ? 'bg-zinc-900 border-green-500/30 glow-green'
            : 'bg-zinc-900 border-zinc-800/60 hover:border-zinc-700'
        }`}
      >
        <span className={`text-xs font-semibold w-7 shrink-0 ${isToday ? 'text-green-400' : 'text-zinc-500'}`}>
          {dayAbbr}
        </span>
        <span className={`h-2 w-2 rounded-full shrink-0 ${dotColor}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-zinc-50">{dayName}</span>
            {isToday && (
              <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                Heute
              </span>
            )}
          </div>
          <span className={`text-xs ${textColor} mt-0.5 block`}>{focusLabel}</span>
        </div>
        <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
      </div>
    </Link>
  )
}
