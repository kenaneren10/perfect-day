import { PlanDay } from '@/types/plan'
import { PlanDayCard } from './PlanDayCard'

interface WeeklyPlanViewProps {
  days: PlanDay[]
  setsBonus: number
}

function getTodayDayOfWeek(): number {
  const jsDay = new Date().getDay()
  return jsDay === 0 ? 7 : jsDay
}

export function WeeklyPlanView({ days }: WeeklyPlanViewProps) {
  const today = getTodayDayOfWeek()

  // Ensure we have all 7 days, filling gaps with rest days
  const allDays: PlanDay[] = Array.from({ length: 7 }, (_, i) => {
    const dayOfWeek = i + 1
    return (
      days.find((d) => d.day_of_week === dayOfWeek) ?? {
        id: `rest-${dayOfWeek}`,
        plan_id: '',
        day_of_week: dayOfWeek,
        is_rest_day: true,
        focus: null,
        display_label: null,
      }
    )
  })

  return (
    <div className="space-y-2">
      {allDays.map((day) => (
        <PlanDayCard
          key={day.day_of_week}
          day={day}
          isToday={day.day_of_week === today}
        />
      ))}
    </div>
  )
}
