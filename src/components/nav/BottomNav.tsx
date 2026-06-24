'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Dumbbell, Utensils, CalendarDays, User } from 'lucide-react'

const HIDDEN_PREFIXES = ['/login', '/register', '/onboarding', '/auth']

const TABS = [
  { href: '/', label: 'Home', icon: Home, exact: true },
  { href: '/plan', label: 'Training', icon: Dumbbell, exact: false },
  { href: '/nutrition', label: 'Nutrition', icon: Utensils, exact: false },
  { href: '/history', label: 'Verlauf', icon: CalendarDays, exact: false },
  { href: '/profile', label: 'Profil', icon: User, exact: false },
]

export function BottomNav() {
  const pathname = usePathname()

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-t border-zinc-800/80">
      <div className="max-w-2xl mx-auto flex items-stretch justify-around">
        {TABS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-4 py-3 min-w-0 flex-1 transition-colors ${
                isActive ? 'text-green-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-[10px] font-medium leading-none truncate">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
