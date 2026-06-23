import Link from 'next/link'
import { Timer, CheckCircle2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  completedToday: boolean
}

export function MobilityWidget({ completedToday }: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
            <Timer className="h-4 w-4 text-green-400" />
          </div>
          <p className="font-semibold text-zinc-50 text-sm">Tägliche Mobility</p>
        </div>
        {completedToday ? (
          <CheckCircle2 className="h-5 w-5 text-green-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-zinc-600" />
        )}
      </div>

      <p className="text-sm text-zinc-400 mb-4">
        {completedToday ? 'Heute erledigt — gut gemacht!' : '8 Übungen · ca. 8 Minuten · noch offen'}
      </p>

      {!completedToday && (
        <Link href="/mobility">
          <Button className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold h-10">
            <Timer className="h-4 w-4 mr-1.5" />
            Routine starten
          </Button>
        </Link>
      )}
    </div>
  )
}
