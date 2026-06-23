# PROJ-4: Adaptiver Trainingsplan (regelbasiert)

## Status: In Progress
**Created:** 2026-06-23
**Last Updated:** 2026-06-23

## Dependencies
- Requires: PROJ-2 (User Onboarding & Profil) — `goal`, `fitness_level`, `equipment`, `training_days_per_week` aus Nutzerprofil
- Requires: PROJ-3 (Übungsbibliothek) — Übungspool für die Plangenerierung
- Soft-Requires: PROJ-5 (Fortschritts-Tracking & Streaks) — Anzahl abgeschlossener Einheiten für die Progression (adaptive Logik ist ohne PROJ-5 statisch)

## User Stories
- Als Nutzer möchte ich angeben, wie viele Tage pro Woche ich trainieren möchte (3, 4 oder 5), damit der Plan zu meinem Alltag passt.
- Als Nutzer möchte ich einen personalisierten Wochenplan sehen, der genau auf mein Fitnessziel, mein Level und mein Equipment abgestimmt ist.
- Als Nutzer möchte ich für jeden Trainingstag wissen, welche Übungen ich machen soll — mit Anzahl der Sätze und Wiederholungen.
- Als Nutzer möchte ich meinen heutigen Trainingstag auf einen Blick erkennen, damit ich ohne Suchen loslegen kann.
- Als Nutzer möchte ich, dass mein Plan schwieriger wird, sobald ich genug Trainingseinheiten abgeschlossen habe, damit ich kontinuierlich Fortschritte mache.
- Als Nutzer möchte ich den Plan zurücksetzen oder neu generieren können, wenn sich meine Ziele oder Umstände ändern.

## Out of Scope
- **Plan-Bearbeitung durch den Nutzer** — kein manuelles Hinzufügen/Entfernen einzelner Übungen in MVP; spätere Erweiterung
- **Mehrere Pläne gleichzeitig** — ein aktiver Plan pro Nutzer; Archivierung nach Plan-Wechsel ist Out of Scope
- **Ernährungsplan** — gehört zu PROJ-6 (Kalorienrechner)
- **Mobility-Einheiten im Trainingsplan** — Mobility hat eigene Routine (PROJ-7); kann als Bonus-Block angedeutet werden, aber kein vollständiger Mobility-Tag in PROJ-4
- **Gewichts-Tracking** (kg-Progression, persönliche Bestleistungen) — gehört zu PROJ-5
- **Trainingslog / Session-Completion** — die Markierung "Training abgeschlossen" ist PROJ-5; PROJ-4 liest nur die resultierende Anzahl abgeschlossener Einheiten
- **KI-generierter Plan** — regelbasiert bleibt die Architektur; kein LLM für MVP
- **Fortgeschrittene Periodisierung** (Mikro-/Makrozyklen, Deload-Wochen) — Out of Scope für v1
- **Supersets, Circuits, AMRAP** — einfache Satz-Struktur in MVP; Variationen später
- **Push-/Pull-/Legs-Split als expliziter Tagestyp** — Plan nutzt Muskelgruppen-Fokus, kein Gym-Jargon als Label
- **Übungsvideos** — nicht Teil von PROJ-3; Out of Scope

## Acceptance Criteria

### Plan-Setup — Erste Nutzung

- [ ] Angenommen ein eingeloggter Nutzer besucht `/plan` zum ersten Mal (kein gespeicherter Plan vorhanden), wenn er die Seite aufruft, dann sieht er einen Einrichtungsschritt mit der Frage „Wie viele Tage pro Woche möchtest du trainieren?" (3 / 4 / 5 Tage als Auswahlkarten)
- [ ] Angenommen der Nutzer wählt seine Trainingstage pro Woche und bestätigt, dann wird sofort ein personalisierter Wochenplan generiert und angezeigt
- [ ] Angenommen der Nutzer hat die Trainingshäufigkeit einmal gewählt, wenn er die Seite erneut besucht, dann sieht er sofort seinen Plan (kein Setup mehr)

### Wochenübersicht

- [ ] Angenommen ein Nutzer hat einen aktiven Plan, wenn er `/plan` aufruft, dann sieht er eine Wochenübersicht mit allen 7 Tagen — Trainingstage (mit Fokus-Label) und Ruhetage klar unterschieden
- [ ] Angenommen der aktuelle Wochentag ist ein Trainingstag, dann ist dieser Tag visuell hervorgehoben (z.B. grüner Rahmen / Label „Heute")
- [ ] Angenommen der aktuelle Wochentag ist ein Ruhetag, dann zeigt der Plan „Ruhetag — Erhol dich gut" für heute
- [ ] Angenommen ein Nutzer hat 3 Trainingstage gewählt, dann sind die Trainingstage auf Montag, Mittwoch und Freitag verteilt
- [ ] Angenommen ein Nutzer hat 4 Trainingstage gewählt, dann sind die Trainingstage auf Montag, Dienstag, Donnerstag und Freitag verteilt
- [ ] Angenommen ein Nutzer hat 5 Trainingstage gewählt, dann sind die Trainingstage auf Montag bis Freitag verteilt

### Trainingseinheit — Detail

- [ ] Angenommen ein Nutzer öffnet einen Trainingstag, dann sieht er den Fokus des Trainings (z.B. „Oberkörper", „Unterkörper", „Ganzkörper", „Ausdauer") sowie eine geordnete Liste der Übungen
- [ ] Angenommen ein Nutzer hat Fitnesslevel „Einsteiger", dann hat jede Einheit 4 Übungen mit je 3 Sätzen
- [ ] Angenommen ein Nutzer hat Fitnesslevel „Fortgeschrittener", dann hat jede Einheit 5 Übungen mit je 3–4 Sätzen
- [ ] Angenommen ein Nutzer hat Fitnesslevel „Profi", dann hat jede Einheit 6 Übungen mit je 4 Sätzen
- [ ] Angenommen ein Nutzer hat Fitnessziel „Gewicht verlieren", dann empfiehlt jede Übung 15–20 Wiederholungen pro Satz
- [ ] Angenommen ein Nutzer hat Fitnessziel „Muskeln aufbauen", dann empfiehlt jede Übung 8–12 Wiederholungen pro Satz
- [ ] Angenommen ein Nutzer hat Fitnessziel „Fitness & Ausdauer" oder „Beweglichkeit steigern", dann empfiehlt jede Übung 12–15 Wiederholungen pro Satz
- [ ] Angenommen ein Nutzer hat Equipment „Ohne Equipment", dann enthält der Plan ausschließlich Bodyweight-Übungen
- [ ] Angenommen ein Nutzer hat Equipment „Basis-Equipment", dann enthält der Plan Bodyweight- und Basis-Übungen (keine Gym-Geräte)
- [ ] Angenommen ein Nutzer hat Equipment „Vollausrüstung", dann kann der Plan alle verfügbaren Übungen nutzen

### Trainingstag-Fokus (regelbasiert nach Ziel + Tage)

| Ziel | 3 Tage | 4 Tage | 5 Tage |
|------|--------|--------|--------|
| Gewicht verlieren | Ganzkörper × 3 | Ganzkörper × 2, Ausdauer × 2 | Oberkörper × 2, Unterkörper × 2, Ausdauer × 1 |
| Muskeln aufbauen | Ganzkörper × 3 | Oberkörper × 2, Unterkörper × 2 | Oberkörper × 2, Unterkörper × 2, Ganzkörper × 1 |
| Fitness & Ausdauer | Ganzkörper × 3 | Ganzkörper × 2, Ausdauer × 1, Core × 1 | Oberkörper × 1, Unterkörper × 1, Ganzkörper × 1, Ausdauer × 2 |
| Beweglichkeit | Ganzkörper × 3 | Ganzkörper × 2, Core × 2 | Ganzkörper × 3, Core × 2 |

*(genaue Tagezuordnung ist Architektur-Entscheidung)*

- [ ] Angenommen ein Nutzer hat Ziel „Muskeln aufbauen" und 4 Trainingstage, dann sieht er im Plan je 2 Tage mit Fokus „Oberkörper" und 2 Tage mit Fokus „Unterkörper"

### Adaptive Progression

- [ ] Angenommen ein Nutzer hat 8 Trainingseinheiten abgeschlossen (über PROJ-5 getrackt), dann erscheint auf der Plan-Seite ein Hinweis „Dein Plan wird angepasst — du hast Fortschritte gemacht!"
- [ ] Angenommen die Progression wurde ausgelöst und der Nutzer bestätigt sie, dann erhöht sich die Satzzahl aller Übungen um 1 (Einsteiger: 3→4, Fortgeschrittener: 3–4→4, Profi: 4→4+1 Runde)
- [ ] Angenommen der Nutzer sieht die Progressions-Benachrichtigung, wenn er auf „Nicht jetzt" klickt, dann bleibt der Plan unverändert und die Benachrichtigung erscheint beim nächsten Besuch erneut
- [ ] Angenommen ein Nutzer hat noch kein PROJ-5 (kein Session-Tracking), dann bleibt der Plan statisch (keine Progression ausgelöst)

### Plan-Verwaltung

- [ ] Angenommen ein Nutzer möchte seinen Plan zurücksetzen, wenn er auf „Plan neu erstellen" klickt, dann erscheint ein Bestätigungsdialog mit dem Hinweis, dass der bestehende Plan überschrieben wird
- [ ] Angenommen der Nutzer bestätigt die Neuerstellung, dann wird ein neuer Plan basierend auf den aktuellen Profilwerten generiert
- [ ] Angenommen ein Nutzer ändert sein Equipment oder Level im Profil, dann bleibt der bestehende Plan unverändert — es erscheint ein Hinweis „Dein Profil wurde aktualisiert. Möchtest du einen neuen Plan generieren?"
- [ ] Angenommen die Trainingshäufigkeit (3/4/5 Tage) wird in den Plan-Einstellungen geändert, dann wird automatisch ein neuer Plan generiert

### Leer- und Fehlerzustände

- [ ] Angenommen die Übungsbibliothek enthält keine Übungen passend zum Equipment des Nutzers, wenn der Plan generiert wird, dann wird eine Fehlermeldung angezeigt mit dem Hinweis, das Equipment in den Profileinstellungen zu aktualisieren
- [ ] Angenommen ein Netzwerkfehler tritt bei der Plangenerierung auf, dann bleibt die Setup-Ansicht sichtbar und eine Fehlermeldung wird angezeigt mit „Erneut versuchen"-Button

## Edge Cases

- **Profil-Änderung nach Plan-Erstellung:** Equipment oder Level wird im Profil geändert → Plan-Seite zeigt Hinweis „Profil geändert — neuen Plan erstellen?" (kein automatisches Überschreiben ohne Bestätigung)
- **Zu wenige Übungen in der Bibliothek:** Falls z.B. für Equipment „none" und Fokus „Oberkörper" weniger als 4 System-Übungen vorhanden, werden alle verfügbaren gezeigt (Plan-Generierung schlägt nicht fehl)
- **Wiederkehrender Wochenstart:** Am Montag jeder Woche startet die Wochenansicht neu; abgeschlossene Sessions bleiben im Tracking (PROJ-5) erhalten
- **Nutzer ändert Trainingstage-Zahl:** Wechsel von 3 auf 5 Tage → Dialog „Plan neu generieren?" + alter Plan wird ersetzt
- **Session-Tracking noch nicht aktiv (PROJ-5 noch nicht deployed):** Adaptive Progression wird nicht ausgelöst; Plan bleibt statisch aber funktionsfähig
- **5-Tage-Plan, Nutzer trainiert weniger:** Plan ist Empfehlung, keine Pflicht; Nutzer kann Tage überspringen
- **Erstmaliger Besuch am Mittwoch:** Plan zeigt Mittwoch als „Heute", zeigt Montag/Dienstag als vergangene Trainingstage (nicht absolviert) — keine Fehleranzeige

## Technical Requirements
- Plan-Generierung serverseitig (nicht im Browser) — verhindert Manipulation und ist wartungsfreundlicher
- `training_days_per_week` wird im Nutzerprofil gespeichert (Erweiterung von `profiles`-Tabelle aus PROJ-2)
- Generierter Plan wird in einer `workout_plans`-Tabelle persistiert (kein Neu-Generieren bei jedem Seitenaufruf)
- Übungsauswahl zieht ausschließlich aus `exercises` (is_system = true ODER eigene Custom-Übungen des Nutzers) mit `equipment`-Filter
- Keine personenbezogenen Daten im URL

## Open Questions
- [ ] Soll der Plan Woche für Woche die gleichen Übungen wiederholen, oder soll er innerhalb der Wochenstruktur rotieren (z.B. Woche A / Woche B)? (Empfehlung für MVP: gleiche Übungen, einfachere Logik)
- [ ] Was passiert nach der ersten Progression (Satz +1) — gibt es eine zweite Progression? Oder wird ab dann vorgeschlagen, das Fitnesslevel im Profil auf „Fortgeschrittener" anzuheben? (Empfehlung: nach zweiter Progression → Level-Up-Vorschlag)
- [ ] Sollen Custom-Übungen des Nutzers (aus PROJ-3) automatisch in den Plan eingebaut werden, oder nur System-Übungen? (Empfehlung: nur System-Übungen für regelbasierte Logik; Custom-Übungen optional später)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Trainingstage wählbar (3, 4 oder 5) — nicht festes 3-Tage-Schema | Nutzer soll Plan an Alltag anpassen; 3 feste Tage würden einige Nutzer ausschließen | 2026-06-23 |
| Setup auf Plan-Seite, nicht im Onboarding | Onboarding wird nicht verlängert; Trainingstage können jederzeit geändert werden ohne Onboarding neu zu durchlaufen | 2026-06-23 |
| Adaptive = Progression nach 8 abgeschlossenen Einheiten (+1 Satz) | Schwelle niedrig genug für echtes Feedback (~2–3 Wochen bei 3×/Woche); einfache Regel ohne KI | 2026-06-23 |
| Progression erfordert Nutzerbestätigung (kein automatischer Wechsel) | Nutzer soll das Gefühl haben, dass er Fortschritte gemacht hat — Confirmation ist Motivation | 2026-06-23 |
| Keine Plan-Bearbeitung durch den Nutzer in MVP | Regelbasierter Plan ist Kernversprechen; individuelle Anpassung erhöht Komplexität enorm | 2026-06-23 |
| Progression setzt PROJ-5 voraus; ohne PROJ-5 ist Plan statisch | Graceful Degradation — Plan funktioniert auch ohne Session-Tracking, adaptive Logik kommt on top | 2026-06-23 |
| Level-abhängige Einheitsstruktur: 4/5/6 Übungen × 3/3–4/4 Sätze | Klare, einfach zu verstehende Progression; keine überladenen Anfänger-Einheiten | 2026-06-23 |
| Ziel-abhängige Wiederholungsbereiche | Wissenschaftlich fundierte Grundregel: hohe Reps für Ausdauer/Fettverbrennung, niedrige für Hypertrophie | 2026-06-23 |
| Feste Tagezuordnung (Mo/Mi/Fr bei 3 Tagen) | Einfache UX — Nutzer muss nicht selbst Tage wählen; Kalender-Feel ohne Kalender-Komplexität | 2026-06-23 |
| Profil-Änderungen triggern keinen automatischen Plan-Reset | Verhindert unbeabsichtigten Datenverlust; Nutzer entscheidet bewusst | 2026-06-23 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Neue Routen

| Route | Zugriffsschutz | Zweck |
|-------|---------------|-------|
| `/plan` | Eingeloggt + Onboarding abgeschlossen | Wochenübersicht + Setup bei erstem Besuch |
| `/plan/day/[weekday]` | Eingeloggt + Onboarding abgeschlossen | Trainingstag-Detail mit Übungsliste |

Beide Routen werden automatisch durch die bestehende PROJ-2-Middleware geschützt (kein zusätzlicher Guard nötig).

---

### Datenbankstruktur

PROJ-4 fügt **3 neue Tabellen** hinzu und erweitert die `profiles`-Tabelle um eine Spalte:

#### Erweiterung: `profiles`-Tabelle
- Neue Spalte: `training_days_per_week` (Zahl 3, 4 oder 5 — zunächst leer, wird beim ersten Plan-Setup gesetzt)

#### Neue Tabelle: `workout_plans`
Speichert den aktiven Trainingsplan eines Nutzers. Ein Nutzer hat immer genau einen aktiven Plan.

| Feld | Typ | Bedeutung |
|------|-----|-----------|
| `id` | UUID | Eindeutige Plan-ID |
| `user_id` | UUID → auth.users | Welchem Nutzer gehört dieser Plan |
| `training_days_per_week` | Zahl (3/4/5) | Trainingstage pro Woche beim Erstellen |
| `sets_bonus` | Ganzzahl (Standard: 0) | Wie viele zusätzliche Sätze nach Progressionen hinzukommen |
| `progression_pending` | Boolean | `true` wenn die Progressionsschwelle erreicht, aber noch nicht bestätigt |
| `created_at` / `updated_at` | Zeitstempel | Erstellung und letzte Änderung |

#### Neue Tabelle: `plan_days`
Enthält die 7 Tage einer Woche — Trainingstage und Ruhetage.

| Feld | Typ | Bedeutung |
|------|-----|-----------|
| `id` | UUID | Eindeutige Tages-ID |
| `plan_id` | UUID → workout_plans | Zu welchem Plan gehört dieser Tag |
| `day_of_week` | Zahl (1=Mo … 7=So) | Wochentag |
| `is_rest_day` | Boolean | `true` = Ruhetag, `false` = Trainingstag |
| `focus` | Text | Trainingsfokus: `full_body`, `upper_body`, `lower_body`, `cardio`, `core` |
| `display_label` | Text | Angezeigte Bezeichnung: „Ganzkörper", „Oberkörper" etc. |

#### Neue Tabelle: `plan_exercises`
Enthält die konkreten Übungen pro Trainingstag.

| Feld | Typ | Bedeutung |
|------|-----|-----------|
| `id` | UUID | Eindeutige Positions-ID |
| `day_id` | UUID → plan_days | Zu welchem Tag gehört diese Übung |
| `exercise_id` | UUID → exercises | Welche Übung aus der Bibliothek |
| `position` | Zahl | Reihenfolge (1, 2, 3 …) |
| `base_sets` | Zahl | Basissätze bei Plan-Erstellung (3/3/4 je nach Level) |
| `reps_min` | Zahl | Untere Grenze der empfohlenen Wiederholungen |
| `reps_max` | Zahl | Obere Grenze der empfohlenen Wiederholungen |

Effektive Sätze beim Anzeigen: `base_sets + workout_plans.sets_bonus`

---

### Plan-Generierungslogik (Regelwerk)

Die Plan-Generierung läuft serverseitig — der Browser erhält nur das fertige Ergebnis, kein Regelwerk ist im Frontend sichtbar.

#### Schritt 1: Trainingstage auf Wochentage verteilen

| Anzahl | Trainingstage (fest) |
|--------|---------------------|
| 3 Tage | Mo, Mi, Fr |
| 4 Tage | Mo, Di, Do, Fr |
| 5 Tage | Mo, Di, Mi, Do, Fr |

Sa und So sind immer Ruhetage (MVP — konfigurierbar in späterer Version).

#### Schritt 2: Trainingsfokus je nach Ziel und Tageanzahl

| Ziel | 3 Tage | 4 Tage | 5 Tage |
|------|--------|--------|--------|
| Gewicht verlieren | Ganzkörper × 3 | Ganzkörper × 2, Ausdauer × 2 | Oberkörper × 2, Unterkörper × 2, Ausdauer × 1 |
| Muskeln aufbauen | Ganzkörper × 3 | Oberkörper × 2, Unterkörper × 2 | Oberkörper × 2, Unterkörper × 2, Ganzkörper × 1 |
| Fitness & Ausdauer | Ganzkörper × 3 | Ganzkörper × 2, Ausdauer × 1, Core × 1 | Oberkörper × 1, Unterkörper × 1, Ganzkörper × 1, Ausdauer × 2 |
| Beweglichkeit | Ganzkörper × 3 | Ganzkörper × 2, Core × 2 | Ganzkörper × 3, Core × 2 |

#### Schritt 3: Übungsauswahl pro Tag

Für jeden Trainingsfokus werden passende Übungen aus der Bibliothek herausgefiltert:

| Fokus | Muskelgruppen / Kategorie |
|-------|--------------------------|
| Ganzkörper | Alle Muskelgruppen gemischt |
| Oberkörper | `chest`, `back`, `shoulders`, `arms` |
| Unterkörper | `legs`, `glutes` |
| Ausdauer | Kategorie `cardio` |
| Core | `core` |

**Equipment-Filter:** Nur Übungen, die dem Nutzer-Equipment entsprechen (Hierarchie: `none` < `basic` < `full` — gleiche Logik wie in PROJ-3).

**Anzahl Übungen pro Einheit nach Level:**
- Einsteiger: 4 Übungen
- Fortgeschrittener: 5 Übungen
- Profi: 6 Übungen

#### Schritt 4: Sätze und Wiederholungen

| Level | Basissätze | Ziel: Gewicht verlieren | Ziel: Muskeln aufbauen | Ziel: Fitness / Beweglichkeit |
|-------|-----------|------------------------|------------------------|-------------------------------|
| Einsteiger | 3 | 15–20 Wdh | 8–12 Wdh | 12–15 Wdh |
| Fortgeschrittener | 3–4 | 15–20 Wdh | 8–12 Wdh | 12–15 Wdh |
| Profi | 4 | 15–20 Wdh | 8–12 Wdh | 12–15 Wdh |

#### Adaptive Progression (benötigt PROJ-5)
- Trigger: Anzahl abgeschlossener Einheiten ≥ 8 × (aktuelle Progressionsstufe + 1)
- Effekt: `sets_bonus` erhöht sich um 1; alle Übungen haben effektiv +1 Satz
- Bestätigung durch Nutzer notwendig (kein automatischer Wechsel)

---

### Komponentenstruktur

#### Plan-Seite (`/plan`)
```
PlanPage (Server Component — lädt Plan + Profil aus DB)
│
├── Kein Plan vorhanden:
│     PlanSetupCard (Client Component)
│     ├── Titel: "Wie viele Tage trainierst du pro Woche?"
│     ├── TrainingDaySelector
│     │   └── AuswahlKarte: 3 Tage / 4 Tage / 5 Tage
│     └── Button: "Plan erstellen" → generatePlan (Server Action)
│
└── Plan vorhanden:
      ├── ProgressionBanner (Client Component — nur wenn progression_pending=true)
      │   ├── Text: "Du hast Fortschritte gemacht — Plan wird angepasst!"
      │   ├── Button: "Bestätigen" → confirmProgression (Server Action)
      │   └── Button: "Nicht jetzt" → dismissProgression (Server Action)
      │
      ├── WeeklyPlanView
      │   └── PlanDayCard × 7
      │       ├── Ruhetag: "Ruhetag" Badge, kein Link
      │       └── Trainingstag: Wochentag, Fokus-Label, Link → /plan/day/[weekday]
      │           └── "Heute"-Hervorhebung (aktueller Wochentag)
      │
      └── PlanSettingsRow
          └── Button: "Plan neu erstellen" → ConfirmRegenerateDialog
                └── Bestätigung → regeneratePlan (Server Action)
```

#### Trainingstag-Detail (`/plan/day/[weekday]`)
```
WorkoutDayPage (Server Component — lädt Tages-Übungen aus DB)
├── DayHeader
│   ├── Fokus-Label (z.B. "Oberkörper — Dienstag")
│   └── Zurück-Link → /plan
├── ExerciseList
│   └── WorkoutExerciseCard × N
│       ├── Übungsname (Link → /exercises/[id])
│       ├── Sätze × Wiederholungen (z.B. "4 Sätze × 8–12 Wdh")
│       └── Kurzbeschreibung (1 Satz aus exercises.description)
└── StartWorkoutButton (Platzhalter — aktiv in PROJ-5)
    └── Text: "Training starten" (deaktiviert / grau bis PROJ-5)
```

#### Dashboard-Aktualisierung (`/`)
Der "Trainingsplan — kommt bald"-Platzhalter auf der Startseite wird durch einen echten Link zu `/plan` ersetzt.

---

### Server Actions

| Action | Aufruf durch | Effekt |
|--------|-------------|--------|
| `generatePlan(days)` | PlanSetupCard | Erstellt Wochen-Plan in DB + setzt `profiles.training_days_per_week` |
| `regeneratePlan()` | ConfirmRegenerateDialog | Löscht alten Plan + generiert neuen Plan |
| `confirmProgression()` | ProgressionBanner | Erhöht `sets_bonus` um 1, setzt `progression_pending = false` |
| `dismissProgression()` | ProgressionBanner | Setzt `progression_pending = false` (Banner erscheint erneut beim nächsten Besuch) |

---

### Datenfluss

**Erstmalige Plan-Erstellung:**
1. Nutzer öffnet `/plan` → Server Component erkennt: kein Plan in DB
2. `PlanSetupCard` wird gezeigt; Nutzer wählt 3/4/5 Tage
3. Klick "Plan erstellen" → `generatePlan` Server Action
4. Server liest Profil (goal, fitness_level, equipment), wendet Regelwerk an
5. Plan wird in `workout_plans`, `plan_days`, `plan_exercises` gespeichert
6. Seite revalidiert → `WeeklyPlanView` wird angezeigt

**Wochenübersicht anzeigen:**
1. Server Component liest `workout_plans` + `plan_days` für den Nutzer
2. Prüft (wenn PROJ-5 vorhanden): Anzahl abgeschlossener Einheiten ≥ Schwelle → setzt `progression_pending = true`
3. Rendert `WeeklyPlanView` + optional `ProgressionBanner`

**Trainingstag öffnen:**
1. Nutzer klickt auf einen Trainingstag → `/plan/day/[weekday]`
2. Server Component liest `plan_days` + `plan_exercises` + `exercises` (JOIN)
3. Effektive Sätze = `base_sets + sets_bonus` (aus `workout_plans`)
4. Übungen werden sortiert nach `position` angezeigt

---

### Datenbank-Zugriffssicherheit (RLS)

Alle drei neuen Tabellen bekommen Row Level Security:
- **workout_plans**: Nutzer kann nur den eigenen Plan lesen/schreiben (`user_id = auth.uid()`)
- **plan_days**: Zugriff über den zugehörigen Plan (Plan muss dem Nutzer gehören)
- **plan_exercises**: Zugriff über den zugehörigen Tag + Plan

---

### Bestehende Komponenten & Pakete

| Komponente / Paket | Verwendung in PROJ-4 |
|-------------------|---------------------|
| `shadcn/ui` Card | PlanDayCards, WorkoutExerciseCards, PlanSetupCard |
| `shadcn/ui` Badge | Ruhetag-Label, Fokus-Label |
| `shadcn/ui` Button | Plan erstellen, Bestätigen, Neu erstellen |
| `shadcn/ui` Dialog / Alert-Dialog | Bestätigungsdialog für Plan-Neuerstellung |
| `shadcn/ui` Sheet | Alternativ: Übungsliste als Slide-In (falls kein Subpage gewünscht) |
| `shadcn/ui` Progress | Optionale Fortschrittsanzeige zur Progressionsschwelle |
| `lucide-react` | Icons: Dumbbell, Calendar, ChevronRight |
| Supabase Server Client | Alle Datenbankabfragen in Server Components |

**Kein neues npm-Paket notwendig.**

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Separates `workout_plans` + `plan_days` + `plan_exercises` (3 Tabellen, relational) | Saubere Trennung von Plan-Metadaten, Wochenstruktur und Übungszuweisung; erlaubt PROJ-5 (Session-Tracking) direkt auf `plan_days.id` zu referenzieren | 2026-06-23 |
| `sets_bonus` in `workout_plans` statt direkt in `plan_exercises` | Progression erhöht EINEN Wert statt N×M Zeilen; dynamische Berechnung `base_sets + sets_bonus` beim Lesen spart komplexe DB-Updates | 2026-06-23 |
| Plan-Generierung serverseitig (Server Action) | Regelwerk bleibt serverseitig — kein Leaken von Algorithmus-Details ins Frontend; verhindert Manipulation durch den Nutzer | 2026-06-23 |
| Feste Wochentags-Zuordnung (Mo/Mi/Fr bei 3 Tagen) | Drastisch weniger UI-Komplexität; Nutzer wählen nicht gerne Tage aus Kalender; erweiterbar per `/refine` | 2026-06-23 |
| Separater `/plan/day/[weekday]`-Subpage statt Accordion/Modal | PROJ-5 braucht eine dedizierte Seite für „Training starten/abschließen" — Subpage macht diesen Umbau trivial | 2026-06-23 |
| `progression_pending` als explizites DB-Flag | Progression-Banner muss nach Seitenneuladen sichtbar bleiben bis Nutzer entscheidet; Flag garantiert Persistenz ohne Session-Logik | 2026-06-23 |
| Kein A/B-Wochenrotations-System in MVP | Regeleinfachheit vor Abwechslung; gleiche Übungen jede Woche bis zum Fortschritt; Rotation ist `/refine`-Kandidat | 2026-06-23 |

## Implementation Notes (Frontend)
**Date:** 2026-06-23

### Files Created
- `src/types/plan.ts` — WorkoutPlan, PlanDay, PlanExercise, PlanDayWithExercises types + FOCUS_LABELS, DAY_NAMES, DAY_ABBREVIATIONS maps
- `src/app/plan/actions.ts` — Server Action stubs: generatePlan, regeneratePlan, confirmProgression, dismissProgression (to be implemented by /backend)
- `src/app/plan/page.tsx` — Plan overview page: shows PlanSetupCard if no plan, WeeklyPlanView + ProgressionBanner if plan exists
- `src/app/plan/day/[weekday]/page.tsx` — Day detail page: shows ordered exercise list with effective sets (base_sets + sets_bonus)
- `src/components/plan/PlanSetupCard.tsx` — 3/4/5 day selector with radio-style cards + generate button
- `src/components/plan/WeeklyPlanView.tsx` — Renders 7 PlanDayCards in order, fills missing days as rest days, highlights today
- `src/components/plan/PlanDayCard.tsx` — Individual day card: training days link to day detail, rest days show muted moon icon; green border for "heute"
- `src/components/plan/ProgressionBanner.tsx` — Progression notification with "Anpassen" / "Nicht jetzt" buttons
- `src/components/plan/RegeneratePlanDialog.tsx` — AlertDialog confirmation for plan regeneration
- `src/components/plan/WorkoutExerciseCard.tsx` — Exercise display with sets × reps and link to exercise detail

### Files Updated
- `src/app/page.tsx` — Dashboard: Trainingsplan placeholder replaced with real link to /plan (Calendar icon, same style as Übungsbibliothek)

### Deviations from Spec
- Server Actions are stubs returning `{}` or `{ error: '...' }` — full plan generation logic (rule engine + DB writes) implemented by /backend skill
- Day detail page gracefully handles missing exercises with empty state message
- "Training starten" button is present but disabled with "kommt bald" hint (PROJ-5 placeholder)

## Implementation Notes (Backend)
_To be added by /backend_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
