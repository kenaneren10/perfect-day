# PROJ-5: Fortschritts-Tracking & Streaks

## Status: Planned
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

- [ ] Soll die Abschluss-Zusammenfassung direkt als Modal/Overlay oder als separate `/session/[id]/complete`-Route erscheinen? (Empfehlung: Overlay, um den Kontext des Trainingstags zu erhalten)
- [ ] Wie viele Wochen soll die History-Ansicht zeigen? (Empfehlung: 4 Wochen / 1 Monat; ältere Daten in DB vorhanden, aber UI zeigt nur 4 Wochen)
- [ ] Soll Volumen (kg × Wdh summed over all exercises) als Metrik sichtbar sein? (Empfehlung: Ja, als sekundäre Kennzahl in der Abschluss-Zusammenfassung)

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

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## Implementation Notes (Frontend)
_To be added by /frontend_

## Implementation Notes (Backend)
_To be added by /backend_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
