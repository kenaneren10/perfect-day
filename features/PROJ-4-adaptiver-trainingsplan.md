# PROJ-4: Adaptiver Trainingsplan (regelbasiert)

## Status: Planned
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
_To be added by /architecture_

## Implementation Notes (Frontend)
_To be added by /frontend_

## Implementation Notes (Backend)
_To be added by /backend_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
