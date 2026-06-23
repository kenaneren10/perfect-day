export interface MobilityExercise {
  id: number
  name: string
  instruction: string
  duration_seconds: number
}

export const MOBILITY_EXERCISES: MobilityExercise[] = [
  {
    id: 1,
    name: 'Nackenrollen',
    instruction: 'Langsames Kreisen des Kopfes, Schultern locker lassen. Beide Richtungen.',
    duration_seconds: 30,
  },
  {
    id: 2,
    name: 'Schulterkreise',
    instruction: 'Große Kreisbewegung beider Schultern nach hinten, dann nach vorne.',
    duration_seconds: 30,
  },
  {
    id: 3,
    name: 'Brustdehnung',
    instruction: 'Hände hinter dem Rücken verschränken, Brust raus, Schulterblätter zusammenziehen.',
    duration_seconds: 30,
  },
  {
    id: 4,
    name: 'Oberkörperdrehung',
    instruction: 'Aufrecht sitzen oder stehen, Oberkörper abwechselnd langsam links und rechts drehen.',
    duration_seconds: 30,
  },
  {
    id: 5,
    name: 'Hüftkreise',
    instruction: 'Hände auf den Hüften, große Kreisbewegung des Beckens. Beide Richtungen.',
    duration_seconds: 30,
  },
  {
    id: 6,
    name: 'Hüftbeuger-Dehnung links',
    instruction: 'Ausfallschritt nach vorne links, hinteres Knie am Boden, Becken vorwärts schieben.',
    duration_seconds: 30,
  },
  {
    id: 7,
    name: 'Hüftbeuger-Dehnung rechts',
    instruction: 'Gleiche Position auf der rechten Seite. Becken tief halten.',
    duration_seconds: 30,
  },
  {
    id: 8,
    name: 'Waden dehnen',
    instruction: 'Ferse fest auf dem Boden, Zehen zur Wand hin ziehen, Bein gestreckt halten.',
    duration_seconds: 30,
  },
]

export const TOTAL_EXERCISES = MOBILITY_EXERCISES.length
export const TOTAL_MINUTES = Math.round((MOBILITY_EXERCISES.reduce((s, e) => s + e.duration_seconds, 0)) / 60)
