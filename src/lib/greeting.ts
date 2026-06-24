export function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 11) return 'Guten Morgen'
  if (hour >= 11 && hour < 13) return 'Mahlzeit'
  if (hour >= 13 && hour < 18) return 'Hey'
  if (hour >= 18 && hour < 22) return 'Guten Abend'
  return 'Hey'
}

export function getMotivationLine(
  streak: number,
  completedThisWeek: number,
  plannedThisWeek: number,
): string {
  if (streak >= 30) return `${streak} Tage Streak — du bist nicht mehr aufzuhalten.`
  if (streak >= 14) return `${streak} Tage am Stück — das ist echte Disziplin.`
  if (streak >= 7) return 'Eine Woche ohne Pause — Gewohnheit entsteht gerade.'
  if (streak >= 3) return 'Du bist im Rhythmus — bleib dran!'
  if (streak >= 1) return 'Gut gestartet — jeder Tag zählt.'
  if (plannedThisWeek > 0 && completedThisWeek >= plannedThisWeek) return 'Wochenziel erreicht — stark!'
  if (completedThisWeek > 0) return 'Diese Woche läuft — weiter so!'
  return 'Bereit für deinen perfekten Tag?'
}
