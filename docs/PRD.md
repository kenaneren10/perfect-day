# Product Requirements Document

## Vision
Perfect Day ist eine Web-App für Privatnutzer aller Fitnesslevel, die einen regelbasierten, personalisierten Trainingsplan, Kalorientracking und Fortschrittsvisualisierung in einer klaren, motivierenden Oberfläche vereint. Das Ziel: die tägliche Fitness-Routine einfacher, messbarer und nachhaltig motivierender machen.

## Target Users
**Privatnutzer aller Fitnesslevel** — vom Einsteiger bis zum Fortgeschrittenen.

- **Einsteiger:** Überwältigt von Informationen, brauchen einen klaren Startpunkt und Orientierung
- **Fortgeschrittene:** Wollen Fortschritt systematisch tracken und sich strukturiert verbessern
- **Pain Points:** Bestehende Apps sind zu komplex (zu viele Features), zu teuer (Premium-Walls) oder bieten keine echte Personalisierung

## Core Features (Roadmap)

| Priority | Feature | Status |
|----------|---------|--------|
| P0 (MVP) | Supabase Infrastructure Setup | Planned |
| P0 (MVP) | User Onboarding & Profil | Planned |
| P0 (MVP) | Übungsbibliothek | Planned |
| P0 (MVP) | Adaptiver Trainingsplan | Planned |
| P0 (MVP) | Fortschritts-Tracking & Streaks | Planned |
| P1 | Kalorienrechner mit Food-Tracking & Barcode Scanner | Planned |
| P1 | Mobility Routine | Roadmap |

## Success Metrics
- 50+ aktive Nutzer nach dem ersten Monat nach Launch
- 60% der Nutzer trainieren mindestens 3× pro Woche (gemessen an Streak-Daten)
- 7-Tage-Retention > 40%

## Constraints
- Solo-Projekt, Zielzeitraum: 2–3 Monate bis MVP-Launch
- Tech-Stack: Next.js 16, Supabase, Tailwind CSS + shadcn/ui
- Kein dediziertes Marketing-Budget
- Design system: dunkel/modern/energetisch — siehe `docs/design-system.md`
- Kalorientracking basiert auf Open Food Facts API (kostenlos, kein eigener Lebensmittel-Datenbankaufbau)
- Trainingsplan-Logik: regelbasiert (kein LLM/KI) für den MVP

## Non-Goals
- Kein Social-Feed oder Community-Features in v1
- Kein KI-generierter Trainingsplan (kommt als Erweiterung nach MVP)
- Keine native Mobile App — Start als Web App (PWA optional später)
- Kein Premium-Modell / Paywall in v1
- Keine Synchronisation mit Wearables (Apple Watch, Garmin, Fitbit) in v1
- Kein Ernährungsplan-Generator — nur manuelles Food-Tracking
