export function toISODateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function toDayOfWeek(date: Date): number {
  const d = date.getDay()
  return d === 0 ? 7 : d // 1=Mon … 7=Sun
}

/**
 * Pure streak calculation — no DB dependencies.
 *
 * Rules:
 * - Training days with a completed session extend the streak
 * - Rest days (not in trainingWeekdays) are skipped without breaking streak
 * - A training day in the past with no completed session breaks the streak
 * - Future days are ignored
 */
export function calculateStreak(
  trainingWeekdays: Set<number>,
  completedDates: Set<string>,
  today: Date,
): number {
  if (trainingWeekdays.size === 0) return 0

  const todayNorm = new Date(today)
  todayNorm.setHours(0, 0, 0, 0)

  let streak = 0

  // Check today first
  const todayStr = toISODateStr(todayNorm)
  const todayDow = toDayOfWeek(todayNorm)
  if (trainingWeekdays.has(todayDow) && completedDates.has(todayStr)) {
    streak++
  }

  // Walk backwards up to 1 year
  for (let daysBack = 1; daysBack <= 365; daysBack++) {
    const d = new Date(todayNorm)
    d.setDate(todayNorm.getDate() - daysBack)
    const dateStr = toISODateStr(d)
    const dow = toDayOfWeek(d)

    if (!trainingWeekdays.has(dow)) continue // rest day — skip

    if (completedDates.has(dateStr)) {
      streak++
    } else {
      break // missed training day — streak ends
    }
  }

  return streak
}
