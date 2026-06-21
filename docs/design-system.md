# Design System — Perfect Day

## Brand Identity
**App Name:** Perfect Day
**Tone:** Energetisch, motivierend, klar — kein Schnickschnack

## Color Palette

| Role | Beschreibung | Tailwind | Hex |
|------|-------------|----------|-----|
| Background | App-Hintergrund | `bg-zinc-950` | `#09090B` |
| Surface | Cards, Panels | `bg-zinc-900` | `#18181B` |
| Surface Elevated | Modals, Dropdowns | `bg-zinc-800` | `#27272A` |
| Primary | Hauptakzent (CTA, aktive States) | `bg-green-500` | `#22C55E` |
| Primary Hover | Hover-State Primary | `bg-green-400` | `#4ADE80` |
| Accent | Fortschritt & Erfolge | `bg-blue-500` | `#3B82F6` |
| Accent Hover | Hover-State Accent | `bg-blue-400` | `#60A5FA` |
| Text Primary | Haupttext | `text-zinc-50` | `#FAFAFA` |
| Text Secondary | Unterstützender Text | `text-zinc-400` | `#A1A1AA` |
| Text Muted | Deaktiviert, Placeholder | `text-zinc-600` | `#52525B` |
| Border | Subtile Trennlinien | `border-zinc-800` | `#27272A` |
| Destructive | Fehler, Löschen | `bg-red-500` | `#EF4444` |
| Success | Bestätigung, Abschluss | `bg-green-500` | `#22C55E` |

## Typography

- **Font:** Inter (Google Fonts — `font-inter`)
- **Weights:** 400 (body), 500 (label/medium), 600 (subheading/semibold), 700 (heading/bold)

| Element | Klasse |
|---------|--------|
| H1 | `text-3xl font-bold` |
| H2 | `text-2xl font-semibold` |
| H3 | `text-xl font-semibold` |
| Body | `text-base font-normal` |
| Small/Label | `text-sm font-medium` |
| Caption | `text-xs text-zinc-400` |

## Design Principles

1. **Großzügige Flächen** — viel Padding, klare visuelle Hierarchie, kein Crowding
2. **Fokus auf Lesbarkeit** — hoher Kontrast, keine dekorativen Fonts
3. **Motivation durch Klarheit** — Fortschritt sofort sichtbar, nicht versteckt
4. **Minimale Animationen** — nur für bedeutungsvolles Feedback (Streak-Completion, Erfolge)

## Component Style

- **Border Radius:** `rounded-xl` (12px) für Cards; `rounded-lg` (8px) für Buttons/Inputs; `rounded-full` für Badges/Avatare
- **Shadows:** Kein helles Box-Shadow — stattdessen `shadow-black/50` oder subtile `border border-zinc-800`
- **Icons:** Lucide React (bereits im Template, konsistent verwenden)
- **Spacing:** 4px-Grid (Tailwind-Standard) — Minimum 16px Padding in Cards

## Interaction States

- **Primary Button:** `bg-green-500 hover:bg-green-400 text-black font-semibold`
- **Secondary Button:** `bg-zinc-800 hover:bg-zinc-700 text-zinc-50`
- **Ghost Button:** `hover:bg-zinc-800 text-zinc-400 hover:text-zinc-50`
- **Input:** `bg-zinc-900 border-zinc-800 focus:border-green-500 text-zinc-50`

## Dark Theme als Standard

Die App startet immer im Dark Mode. Light Mode ist kein Ziel für v1.
