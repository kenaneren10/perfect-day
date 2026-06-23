# PROJ-5: Fortschritts-Tracking & Streaks

## Status: Architected
**Created:** 2026-06-23
**Last Updated:** 2026-06-23

## Dependencies
- Requires: PROJ-2 (User Onboarding & Profil) — eingeloggter Nutzer
- Requires: PROJ-4 (Adaptiver Trainingsplan) — `plan_days`, `plan_exercises`, `workout_plans` für Session-Start und Progression-Trigger
- Soft-Provides: Abgeschlossene Einheiten-Zähler → PROJ-4 Adaptions-Trigger (sets_bonus)

## User Stories

- Als Nutzer möchte ich eine Trainingseinheit starten und dabei jeden Satz mit Gewicht und Wiederholungen protokollieren, damit ich meinen tatsächlichen Fortschritt (nicht nur den Plan) festhalte.
- Als Nutzer möchte ich nach dem Training auf „Einheit abschließen" drücken und sofort sehen, ob mein Streak weiterläuft, damit ich ein sofortiges Erfolgserlebnis habe.
- Als Nutzer möchte ich auf der Startseite meinen aktuellen Streak und die Trainingsfrequenz dieser Woche sehen, damit ich täglich motiviert bleibe.
- Als Nutzer möchte ich meine Trainingshistorie der letzten Wochen auf einen Blick sehen (welche Tage ich trainiert habe), damit ich meine Konstanz beurteilen kann.
- Als Nutzer möchte ich, dass mein Trainingsplan automatisch schwieriger wird, wenn ich genug Einheiten abgeschlossen habe, ohne manuell eingreifen zu müssen.

## Out of Scope

- **Personal Records (PRs) / persönliche Bestleistungen** — kein automatisches Tracking von "neues Maximalgewicht" in MVP; separate Erweiterung
- **Workout-Notizen / Kommentare** — kein Freitextfeld pro Einheit oder Übung in MVP
- **Satz-Timer (Pausentimer zwischen Sätzen)** — nützlich, aber für MVP nicht notwendig
- **Exportfunktion (CSV, PDF)** — Out of Scope
- **Körpergewicht-Tracking** — eigener Feature-Bereich, nicht Teil von PROJ-5
- **Foto-Fortschritt (before/after)** — Out of Scope
- **Integration mit Health-Apps** (Apple Health, Google Fit, Garmin) — P2
- **Nachträgliches Bearbeiten vergangener Einheiten** — Sessions sind nach Abschluss unveränderlich in MVP; Korrektur nur über Löschen (Out of Scope)
- **Mehrere aktive Einheiten gleichzeitig** — immer nur eine aktive Session pro Nutzer
- **Streak-Freeze / Wiederherstellung** — kein "Freeze"-Mechanismus wie in Duolingo in MVP
- **Wochenvergleich / Leistungsdiagramme** — einfache Kalenderansicht reicht für MVP; Charts sind P1

## Acceptance Criteria

### Training starten

- [ ] Angenommen ein Nutzer öffnet `/plan/day/[weekday]`, wenn er auf „Training starten" klickt, dann wird eine aktive Session für diesen Tag eröffnet und der Button wechselt zu „Einheit abschließen"
- [ ] Angenommen eine aktive Session läuft, wenn der Nutzer eine Übung anzeigt, dann sieht er für jede geplante Satz-Zeile die Felder: Gewicht (kg, optional) und Wiederholungen — vorausgefüllt mit dem Plan-Sollwert
- [ ] Angenommen eine Cardio-Übung (Kategorie `cardio`) erscheint in einer aktiven Session, dann sieht der Nutzer statt Gewicht/Wdh ein Feld „Dauer (Minuten)"
- [ ] Angenommen der Nutzer gibt Gewicht und Wiederholungen für einen Satz ein und speichert, dann erscheint der Satz mit einem Haken als „erledigt"
- [ ] Angenommen der Nutzer hat noch keine aktive Session für heute, dann ist der „Training starten"-Button auf der Tag-Detail-Seite aktiv und klickbar

### Einheit abschließen

- [ ] Angenommen eine aktive Session läuft, wenn der Nutzer auf „Einheit abschließen" klickt, dann wird die Session mit Timestamp gespeichert und er sieht eine kurze Zusammenfassung (Anzahl abgeschlossene Sätze, Dauer)
- [ ] Angenommen der Nutzer hat mindestens eine Übung protokolliert, wenn er „Einheit abschließen" klickt, dann gilt die Session als abgeschlossen — auch wenn nicht alle Sätze erledigt wurden
- [ ] Angenommen eine Session wird abgeschlossen, dann wird der Streak-Zähler sofort aktualisiert und auf der Abschluss-Seite angezeigt
- [ ] Angenommen die Session-Anzahl erreicht die Progressionsschwelle (8 × aktuelle Progressionsstufe), dann wird `progression_pending = true` in `workout_plans` gesetzt

### Streak-Logik

- [ ] Angenommen der Nutzer schließt einen Trainingstag ab, dann erhöht sich sein Streak um 1
- [ ] Angenommen heute ist ein geplanter Trainingstag und der Nutzer hat ihn NICHT abgeschlossen, dann bricht der Streak am nächsten Tag (zum Zeitpunkt Mitternacht)
- [ ] Angenommen heute ist ein Ruhetag laut Plan (Sa, So oder kein Trainingstag im Plan), dann bleibt der Streak unverändert — Ruhetage unterbrechen den Streak nicht
- [ ] Angenommen der Nutzer hat 0 Trainingseinheiten je abgeschlossen, dann zeigt der Streak-Zähler „0 🔥" (oder neutral: „Fang heute an!")
- [ ] Angenommen der Streak ist auf 0 gesunken (Trainingstag verpasst), dann startet er bei der nächsten abgeschlossenen Einheit wieder bei 1

### Dashboard & Fortschrittsanzeige

- [ ] Angenommen der Nutzer öffnet `/` (Dashboard), dann sieht er einen Fortschritts-Widget mit: aktuellem Streak (Anzahl + Flamme-Icon), abgeschlossenen Einheiten dieser Woche, Gesamtzahl abgeschlossener Einheiten
- [ ] Angenommen der Nutzer hat noch kein Training abgeschlossen, dann zeigt das Widget einen motivierenden Leer-Zustand (kein Streak, Einladung zum ersten Training)

### Trainingshistorie

- [ ] Angenommen der Nutzer navigiert zu `/history` (oder alternativ einem History-Tab), dann sieht er eine Kalenderansicht der letzten 4 Wochen mit farblich markierten Trainingstagen (abgeschlossen, verpasst, Ruhetag)
- [ ] Angenommen ein vergangener Trainingstag ist markiert, wenn der Nutzer darauf klickt, dann sieht er eine kompakte Zusammenfassung: welche Übungen wurden geloggt, Gesamtvolumen (kg × Wdh), Dauer

### Adaptive Progression (PROJ-4-Anbindung)

- [ ] Angenommen die abgeschlossenen Sessions erreichen die Schwelle (Stufe 1: 8 Sessions, Stufe 2: 16 Sessions, usw.), wenn die Session abgeschlossen wird, dann setzt das System `workout_plans.progression_pending = true`
- [ ] Angenommen `progression_pending = true` ist gesetzt, wenn der Nutzer `/plan` aufruft, dann zeigt PROJ-4 automatisch den ProgressionBanner an (bereits implementiert)

## Edge Cases

- **Session wird verlassen (Browser-Tab geschlossen):** Session bleibt als "in Bearbeitung" gespeichert — beim nächsten Öffnen des gleichen Trainingstags wird die laufende Session fortgesetzt, nicht neu gestartet.
- **Session-Start an einem Ruhetag:** Nutzer kann kein Training an einem Ruhetag starten (kein Plan-Day mit is_rest_day=false für diesen Tag) — Button ist nicht vorhanden.
- **Doppelter Session-Start:** Nur eine aktive Session pro Tag und Plan-Day erlaubt; zweiter Klick auf "Training starten" öffnet die laufende Session wieder.
- **Gewicht = 0 (Bodyweight-Übungen):** Das Gewichtsfeld ist optional; Eingabe „0" ist valide (= Bodyweight). Leerfeld = keine Angabe; wird als 0 gespeichert.
- **Session ohne gespeicherte Sätze:** Nutzer öffnet Session, speichert keinen einzigen Satz, klickt „Einheit abschließen" → Session wird trotzdem abgeschlossen (0 Sätze = gültig) — Streak zählt, aber Fortschritts-Widget zeigt 0 Volumen.
- **Streak-Grenzfall Mitternacht:** Wenn ein Trainingstag kurz vor und nach Mitternacht geloggt wird, zählen beide als separate Tage (kein Zusammenfassen). Timezone: UTC+1 (Europa/Berlin).
- **Progression-Stufe 1 bereits abgeschlossen, Stufe 2 noch nicht:** Schwelle = 8 × (aktueller sets_bonus + 1). Wenn sets_bonus = 1, dann Schwelle = 16 Sessions. Das verhindert endloses Auslösen.
- **Nutzer ohne Plan (PROJ-4 noch nicht genutzt):** Keine Trainingstage → kein "Training starten"-Button sichtbar → kein Session-Start möglich; Streak bleibt bei 0.

## Technical Requirements

- Alle Datenbankzugriffe via RLS — Nutzer darf nur eigene Sessions lesen/schreiben
- Session-Daten dürfen nicht verloren gehen, wenn der Browser-Tab zwischenzeitlich geschlossen wird (persistente Zwischenspeicherung in DB beim Satz-Speichern)
- Streak-Berechnung serverseitig (kein Client-seitiges Berechnen, um Manipulation zu vermeiden)
- `session_logs`-Tabelle referenziert `plan_days.id` für Verknüpfung mit PROJ-4-Plan

## Open Questions

- [x] Abschluss-Zusammenfassung als Modal oder Route? → **Entschieden: Inline-Block auf der Trainingsseite** (kein Modal, kein Extra-Route)
- [x] Wie viele Wochen zeigt die History? → **Entschieden: 4 Wochen** (ältere Daten in DB, UI begrenzt auf 4 Wochen)
- [x] Volumen als Metrik? → **Entschieden: Ja**, als sekundäre Kennzahl in SessionSummaryBlock

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Vollständiges Logging (Gewicht, Sätze, Wdh) statt einfachem Check-off | Nutzer-Anforderung; detaillierte Daten ermöglichen in späteren Versionen Leistungsdiagramme und PR-Tracking | 2026-06-23 |
| Streak = abgeschlossene Trainingstage (Ruhetage unterbrechen nicht) | Plan-basiert: Ruhetage sind keine Fehler — nur verpasste Trainingstage brechen den Streak | 2026-06-23 |
| Session bleibt offen bei Browser-Schließen (In-Progress-State in DB) | Nutzer soll Training nicht von vorne beginnen müssen; Daten-Verlust ist frustrierend | 2026-06-23 |
| Kein PR-Tracking in MVP | Zu komplex für erste Version; erfordert eigene Ansicht und Logik (separate Erweiterung) | 2026-06-23 |
| Abgeschlossene Sessions sind unveränderlich | Vermeidet komplexe Edit-Logik; Streak-Manipulation durch rückwirkende Änderung wird verhindert | 2026-06-23 |
| Progressionsschwelle = 8 × (sets_bonus + 1) | Verhindert endloses Auslösen nach erster Progression; zweite Stufe nach 16, dritte nach 24 Sessions | 2026-06-23 |
| Gewicht ist optional (Bodyweight = 0) | Nicht alle Übungen brauchen Gewicht; optionales Feld senkt Einstiegshürde | 2026-06-23 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Satz-Logging sofort in DB (kein "Speichern am Ende") | Verhindert Datenverlust bei Browser-Schließen; Upsert-Logik ermöglicht trotzdem Korrektur | 2026-06-23 |
| UNIQUE(user_id, plan_day_id) auf workout_sessions | Doppelte Sessions per DB-Constraint unmöglich — keine Prüfung im Applikationscode nötig | 2026-06-23 |
| Upsert statt Insert für session_sets | Nutzer kann Satz-Wert korrigieren, ohne Duplikat zu erzeugen; simpler als Delete+Insert | 2026-06-23 |
| Streak dynamisch berechnet (keine Streak-Tabelle) | Vermeidet Sync-Probleme zwischen Cache und echten Sessions; bei MVP-Skala (< 200 Sessions) performant | 2026-06-23 |
| Session-Zusammenfassung als Inline-Block (kein Modal) | Einfachste Implementierung; vermeidet Navigation-Probleme nach Server Action | 2026-06-23 |
| `/plan/day/[weekday]` erweitert statt neue `/session/[id]`-Route | Session ist immer an einen Plan-Tag gebunden; kein separater Einstiegspunkt nötig | 2026-06-23 |
| Gewicht und Reps nullable (nicht 0 als Default) | Unterschied zwischen "Bodyweight (0 kg)" und "keine Angabe (null)" ist semantisch wichtig für spätere PR-Berechnung | 2026-06-23 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Neue Routen

| Route | Zugriffsschutz | Zweck |
|-------|---------------|-------|
| `/plan/day/[weekday]` | Eingeloggt + Onboarding (bestehend) | Erweitert: Session starten, Sätze loggen, Einheit abschließen |
| `/history` | Eingeloggt + Onboarding | Neu: 4-Wochen-Kalender der Trainingshistorie |
| `/` (Dashboard) | Eingeloggt + Onboarding (bestehend) | Erweitert: Fortschritts-Widget mit Streak + Wochenfortschritt |

Beide neuen Seiten werden automatisch durch die bestehende PROJ-2-Middleware geschützt — kein zusätzlicher Guard nötig.

---

### Datenbankstruktur

**Tabelle 1: `workout_sessions`** — eine Zeile pro Trainingseinheit

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | UUID | Primärschlüssel |
| user_id | UUID → auth.users | Eigentümer der Session |
| plan_day_id | UUID → plan_days | Verknüpfung mit PROJ-4-Plantag |
| status | TEXT | `'in_progress'` oder `'completed'` |
| started_at | TIMESTAMPTZ | Wann "Training starten" geklickt wurde |
| completed_at | TIMESTAMPTZ | Wann abgeschlossen (null wenn in_progress) |

Constraints:
- `UNIQUE(user_id, plan_day_id)` — maximal eine Session pro Tag und Nutzer
- RLS: Nutzer sieht nur eigene Sessions

**Tabelle 2: `session_sets`** — eine Zeile pro geloggtem Satz

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | UUID | Primärschlüssel |
| session_id | UUID → workout_sessions (CASCADE) | Zugehörige Session |
| plan_exercise_id | UUID → plan_exercises | Welche geplante Übung |
| set_number | INTEGER | Satznummer (1, 2, 3…) |
| weight_kg | DECIMAL | Gewicht in kg (null = Bodyweight) |
| reps | INTEGER | Wiederholungen (null bei Cardio) |
| duration_minutes | DECIMAL | Dauer in Minuten (nur Cardio, sonst null) |
| logged_at | TIMESTAMPTZ | Wann der Satz gespeichert wurde |

Constraints:
- `UNIQUE(session_id, plan_exercise_id, set_number)` — kein Satz-Duplikat; Upsert ermöglicht Korrektur
- RLS: Nutzer sieht nur Sätze eigener Sessions (via JOIN auf workout_sessions.user_id)

---

### Komponentenstruktur

#### Trainingstag-Detail — `/plan/day/[weekday]` (erweitert)

```
WorkoutDayPage (Server Component — lädt Plandaten + aktuelle Session aus DB)
│
├── DayHeader (bestehend — Fokus-Label + Zurück-Link)
│
├── [Kein Plan / Ruhetag] — Redirect zu /plan (bestehend)
│
├── [Trainingstag — keine aktive Session]:
│   ├── WorkoutExerciseCard × N (read-only, bestehend)
│   └── StartWorkoutButton (Client) → startSession Server Action
│
├── [Trainingstag — Session "in_progress"]:
│   ├── SessionTimerBar (Client — zeigt verstrichene Zeit HH:MM)
│   └── ActiveExerciseList (Client Component)
│       └── ExerciseSetLogger × N (eine Karte pro Übung)
│           ├── Übungsname + geplante Vorgabe (z.B. "3 Sätze × 8–12 Wdh")
│           ├── SetRow × (base_sets + sets_bonus)
│           │   ├── Kraft-Übung: [Gewicht kg] [Wdh] [✓ Speichern]
│           │   └── Cardio-Übung: [Dauer (Min)] [✓ Speichern]
│           └── Bereits gespeicherte Sätze: grün hervorgehoben
│   └── CompleteWorkoutButton (Client) → completeSession Server Action
│
└── [Session "completed"]:
    └── SessionSummaryBlock (inline, kein Modal)
        ├── ✅ Einheit abgeschlossen!
        ├── 🔥 Aktueller Streak: X Tage
        ├── Abgeschlossene Sätze: X / Y geplante
        ├── Gesamtvolumen: X kg
        ├── Dauer: MM:SS
        └── Weiter-Links: [→ Zurück zum Plan] [→ History]
```

#### Trainingshistorie — `/history` (neu)

```
HistoryPage (Server Component — lädt 4 Wochen Sessions aus DB)
│
├── PageHeader: "Trainingshistorie"
│
├── StreakSummaryRow
│   ├── 🔥 Aktueller Streak: X Tage
│   └── Einheiten gesamt: X
│
└── TrainingCalendar (Client Component — 4 × 7 Grid)
    ├── Wochentag-Header: Mo Di Mi Do Fr Sa So
    └── WeekRow × 4
        └── DayCell × 7
            ├── ✅ Grün — Trainingstag abgeschlossen
            ├── ❌ Rot/Gedimmt — Trainingstag verpasst
            ├── 💤 Grau — Ruhetag (kein Plan-Tag)
            └── ○ Neutral — Heute / Zukunft
        + DayDetailPopover (on click auf grünen Tag)
            └── Übungsname × N + geloggtes Volumen + Dauer
```

#### Dashboard — `/` (erweitert)

```
HomePage (Server Component — lädt Streak + Wochenfortschritt)
│
├── [NEU] ProgressStatsWidget
│   ├── 🔥 Streak: X Tage
│   ├── Diese Woche: X / Y Trainings
│   └── Einheiten gesamt: X
│
└── [bestehend] Quick-Links: Trainingsplan, Übungsbibliothek
```

---

### Server Actions

| Action | Aufruf durch | Effekt |
|--------|-------------|--------|
| `startSession(planDayId)` | StartWorkoutButton | Erstellt `workout_sessions` mit status='in_progress' |
| `logSet(sessionId, planExerciseId, setNumber, data)` | SetRow [✓ Speichern] | Upsert in `session_sets` |
| `completeSession(sessionId)` | CompleteWorkoutButton | Setzt status='completed' + Progression-Check |

**Progression-Check in `completeSession`:**
1. Zählt alle `completed` Sessions des Nutzers
2. Liest `sets_bonus` aus `workout_plans`
3. Schwelle = `8 × (sets_bonus + 1)` — falls überschritten: `progression_pending = true`

---

### Streak-Berechnung (serverseitig)

Keine separate Streak-Tabelle — Streak wird bei jedem Dashboard-/History-Aufruf dynamisch berechnet:

1. Lade alle `plan_days` des Nutzers (welche Wochentage sind Trainingstage?)
2. Lade alle `workout_sessions` mit status='completed' (sortiert nach Datum)
3. Gehe rückwärts vom gestrigen Tag:
   - Trainingstag + Session abgeschlossen → Streak +1, weiter
   - Trainingstag + Session fehlt → Streak endet hier
   - Ruhetag / kein Plan-Tag → überspringen, Streak bleibt
4. Prüfe heute: Wenn Trainingstag und bereits completed → zählt mit

Für MVP mit < 200 Sessions pro Nutzer ist diese Berechnung in Millisekunden — keine Performance-Probleme.

---

### Datenbank-Zugriffssicherheit (RLS)

- **workout_sessions**: `user_id = auth.uid()` — Nutzer liest/schreibt nur eigene Sessions
- **session_sets**: Zugriff über JOIN: `session_id IN (SELECT id FROM workout_sessions WHERE user_id = auth.uid())`

---

### Bestehende Komponenten & Pakete

| Komponente / Paket | Verwendung in PROJ-5 |
|-------------------|---------------------|
| `shadcn/ui` Card | ExerciseSetLogger, SessionSummaryBlock |
| `shadcn/ui` Input | Gewicht-Eingabe, Wdh-Eingabe, Dauer-Eingabe |
| `shadcn/ui` Button | Satz speichern, Training starten, Einheit abschließen |
| `shadcn/ui` Popover | DayDetailPopover in History-Kalender |
| `shadcn/ui` Badge | Session-Status, Streak-Anzeige |
| `shadcn/ui` Separator | Trennung Übungen in SetLogger |
| `lucide-react` | Icons: Flame (Streak), CheckCircle, Clock, Dumbbell |
| Supabase Server Client | Alle Datenbankabfragen und Server Actions |
| Sonner (Toast) | Feedback nach Satz-Speichern und Session-Abschluss |

**Kein neues npm-Paket notwendig.**

## Implementation Notes (Frontend)
_To be added by /frontend_

## Implementation Notes (Backend)
_To be added by /backend_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
