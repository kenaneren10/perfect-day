'use client'

import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DAY_ABBREVIATIONS } from '@/types/plan'
import type { DayStatus } from '@/types/session'

interface SessionDetail {
  sessionId: string
  exerciseCount: number
  volumeKg: number
  durationMinutes: number
}

interface Props {
  days: DayStatus[]
  sessionDetails: Record<string, SessionDetail>
}

export function TrainingCalendar({ days, sessionDetails }: Props) {
  const [openPopover, setOpenPopover] = useState<string | null>(null)

  // Group days into weeks (rows of 7, Mon–Sun)
  const weeks: DayStatus[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const getDayStyle = (day: DayStatus): string => {
    if (day.isFuture) return 'bg-zinc-800 border-zinc-700 text-zinc-600 cursor-default'
    if (!day.isTrainingDay) return 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-default'
    if (day.sessionCompleted) return 'bg-green-500/20 border-green-500/60 text-green-400 cursor-pointer hover:bg-green-500/30'
    if (day.sessionMissed) return 'bg-red-500/10 border-red-500/30 text-red-400 cursor-default'
    if (day.isToday) return 'bg-blue-500/20 border-blue-500/60 text-blue-400 cursor-default'
    return 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-default'
  }

  const getDayLabel = (day: DayStatus): string => {
    const date = new Date(day.date)
    return String(date.getDate())
  }

  const getStatusIcon = (day: DayStatus): string => {
    if (!day.isTrainingDay) return ''
    if (day.sessionCompleted) return '✓'
    if (day.sessionMissed) return '✗'
    if (day.isToday) return '·'
    return ''
  }

  const formatDuration = (min: number) => min < 60 ? `${min} Min` : `${Math.floor(min / 60)}h ${min % 60}m`

  return (
    <div className="space-y-3">
      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7].map((dow) => (
          <div key={dow} className="text-center text-xs text-zinc-600 font-medium py-1">
            {DAY_ABBREVIATIONS[dow]}
          </div>
        ))}
      </div>

      {/* Calendar weeks */}
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 gap-1.5">
          {week.map((day) => {
            const detail = day.sessionId ? sessionDetails[day.sessionId] : null

            if (day.sessionCompleted && detail) {
              return (
                <Popover
                  key={day.date}
                  open={openPopover === day.date}
                  onOpenChange={(open) => setOpenPopover(open ? day.date : null)}
                >
                  <PopoverTrigger asChild>
                    <button
                      className={`aspect-square rounded-lg border flex flex-col items-center justify-center text-xs font-semibold transition-colors ${getDayStyle(day)}`}
                    >
                      <span>{getDayLabel(day)}</span>
                      <span className="text-green-500 text-[10px] leading-none mt-0.5">
                        {getStatusIcon(day)}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="top"
                    className="w-48 bg-zinc-900 border-zinc-700 text-zinc-50 p-3"
                  >
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-green-400">
                        {new Date(day.date).toLocaleDateString('de-DE', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                      <div className="text-xs text-zinc-400 space-y-0.5">
                        <p>{detail.exerciseCount} Übungen</p>
                        {detail.volumeKg > 0 && <p>{detail.volumeKg.toLocaleString('de-DE')} kg Volumen</p>}
                        {detail.durationMinutes > 0 && <p>{formatDuration(detail.durationMinutes)}</p>}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )
            }

            return (
              <div
                key={day.date}
                className={`aspect-square rounded-lg border flex flex-col items-center justify-center text-xs font-semibold ${getDayStyle(day)}`}
              >
                <span>{getDayLabel(day)}</span>
                {getStatusIcon(day) && (
                  <span className={`text-[10px] leading-none mt-0.5 ${day.sessionMissed ? 'text-red-500' : 'text-blue-400'}`}>
                    {getStatusIcon(day)}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      ))}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-2 text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-green-500/20 border border-green-500/60" />
          Abgeschlossen
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-red-500/10 border border-red-500/30" />
          Verpasst
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-zinc-900 border border-zinc-800" />
          Ruhetag
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-blue-500/20 border border-blue-500/60" />
          Heute
        </div>
      </div>
    </div>
  )
}
