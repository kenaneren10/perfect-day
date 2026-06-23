# PROJ-7: Mobility Routine

## Status: Planned
**Created:** 2026-06-23
**Last Updated:** 2026-06-23

## Dependencies
- Requires: PROJ-1 (Supabase Infrastructure Setup) — Datenbankstruktur, Auth, RLS
- Requires: PROJ-2 (User Onboarding & Profil) — eingeloggter Nutzer, Profilseite
- Optional: PROJ-4 (Adaptiver Trainingsplan) — Dashboard-Integration neben dem Trainingsplan-Widget

## User Stories

- Als Nutzer möchte ich täglich eine geführte Mobility-Routine mit 8 Übungen starten können, damit ich meine Beweglichkeit und Körperwahrnehmung systematisch verbessere — ohne selbst etwas planen zu müssen.
- Als Nutzer möchte ich durch jede Übung geführt werden (Name, Ausführungshinweis, Count-down-Timer), damit ich mich voll auf die Bewegung konzentriere statt auf die Uhr zu schauen.
- Als Nutzer möchte ich nach Abschluss der Routine eine Bestätigung sehen, damit ich weiß, dass der heutige Eintrag gespeichert wurde und motiviert bleibe.
- Als Nutzer möchte ich auf dem Dashboard sehen, ob ich die Mobility-Routine heute schon gemacht habe, damit ich täglich daran erinnert werde und meinen Fortschritt im Blick habe.
- Als Nutzer möchte ich die Routine jederzeit abbrechen können, ohne dass ein unvollständiger Eintrag gespeichert wird.

## Out of Scope

- **Eigene Routinen erstellen / bearbeiten** — Nutzer kann Übungen oder Timer nicht anpassen; Routine ist fest vorgegeben. Post-MVP.
- **Mehrere Routinen zur Auswahl** — nur eine einzige globale Routine in MVP; kein Routinen-Katalog. Entschieden zu Gunsten Einfachheit (Entry Point A).
- **Kurz-/Lang-Version der Routine** — keine 5-Minuten oder 20-Minuten-Option; eine Dauer für alle.
- **Mobility-Streak-Zähler** — kein separater Streak für Mobility (PROJ-5 deckt Workout-Streaks ab); nur tägliches Status-Widget (erledigt / offen). Post-MVP.
- **Push-Notifications / Erinnerungen** — keine Browser-Push-API in MVP; Routine-Einstieg nur über Dashboard oder direkten Link.
- **Reaktion auf Trainingstag** (z. B. "du hast heute Beine trainiert → Unterkörper-Dehnung") — zu komplex; Kopplung an PROJ-4/PROJ-5. Post-MVP.
- **Offline-Modus** — Routine ist online-only; Completion wird sofort gespeichert. Kein lokales Fallback.
- **Mobility-Übungen in der Übungsbibliothek (PROJ-3)** — PROJ-3 schließt Mobility-Kategorie explizit aus; Übungsinhalt dieser Routine wird als statische Seed-Daten gepflegt, nicht über die Bibliothek verwaltet.
- **Video-Anleitungen pro Übung** — nur Text-Beschreibung + Bild-Placeholder; Video-Links Post-MVP.
- **Zweifache Completion pro Tag** — idempotent: zweiter Abschluss am selben Tag speichert keinen neuen Eintrag.
- **Verlaufsansicht vergangener Tage** — kein Kalender oder Historien-Seite für Mobility in MVP.

## Acceptance Criteria

### Dashboard-Widget

- [ ] Angenommen der Nutzer ist eingeloggt und öffnet das Dashboard (`/`), dann sieht er ein „Tägliche Mobility"-Widget mit dem heutigen Status: entweder „Noch nicht gestartet" mit „Starten"-Button oder „Heute erledigt ✓" ohne Button
- [ ] Angenommen der Nutzer hat die Routine heute noch nicht abgeschlossen, wenn er auf „Starten" klickt, dann wird er zu `/mobility` weitergeleitet
- [ ] Angenommen der Nutzer hat die Routine heute abgeschlossen, dann zeigt das Widget „Heute erledigt ✓" und keinen „Starten"-Button mehr

### Routine-Player (`/mobility`)

- [ ] Angenommen ein nicht eingeloggter Nutzer ruft `/mobility` direkt auf, dann wird er zur Login-Seite weitergeleitet
- [ ] Angenommen der Nutzer öffnet `/mobility`, dann sieht er eine Übersicht der Routine: Titel „Deine tägliche Mobility", Anzahl der Übungen (8), Gesamtdauer (ca. 8 Minuten) und einen „Routine starten"-Button
- [ ] Angenommen der Nutzer hat die Routine heute bereits abgeschlossen, dann zeigt `/mobility` den Abgeschlossen-Status mit der Option „Erneut starten" (kein zweites Completion-Eintrag)
- [ ] Angenommen der Nutzer klickt auf „Routine starten", dann öffnet sich der Übungs-Player mit der ersten Übung: Name, Ausführungshinweis (1–2 Sätze), Fortschrittsanzeige („Übung 1 von 8") und einem 30-Sekunden-Countdown-Timer
- [ ] Angenommen der Countdown-Timer läuft ab, dann wechselt die Ansicht automatisch (ohne Nutzeraktion) zur nächsten Übung
- [ ] Angenommen der Nutzer möchte nicht warten, wenn er auf „Weiter" klickt, dann wird sofort zur nächsten Übung gewechselt (Timer wird übersprungen)
- [ ] Angenommen es ist die letzte Übung und der Timer läuft ab (oder der Nutzer klickt „Weiter"), dann erscheint der Abschluss-Screen
- [ ] Angenommen der Abschluss-Screen erscheint, dann wird die Completion für das heutige Datum in der Datenbank gespeichert und das Dashboard-Widget aktualisiert sich beim nächsten Aufruf
- [ ] Angenommen der Nutzer klickt während der Routine auf „Abbrechen", dann kehrt er zur `/mobility`-Übersicht zurück und kein Completion-Eintrag wird gespeichert

### Routine-Inhalt (fest vorgegeben, 8 Übungen)

- [ ] Angenommen der Nutzer startet die Routine, dann durchläuft er genau diese 8 Übungen in dieser Reihenfolge, je 30 Sekunden:
  1. Nackenrollen — langsames Kreisen des Kopfes, Schultern locker lassen
  2. Schulterkreise — große Kreisbewegung beider Schultern nach hinten, dann nach vorne
  3. Brustdehnung — Hände hinter dem Rücken verschränken, Brust raus, Schulterblätter zusammenziehen
  4. Oberkörperdrehung — aufrecht sitzen/stehen, Oberkörper abwechselnd links und rechts drehen
  5. Hüftkreise — Hände auf den Hüften, große Kreisbewegung des Beckens
  6. Hüftbeuger-Dehnung links — Ausfallschritt, hinteres Knie am Boden, Becken vorwärts schieben
  7. Hüftbeuger-Dehnung rechts — gleiche Position auf der anderen Seite
  8. Wade dehnen — Ferse auf dem Boden, Zehen zur Wand, Bein gestreckt

### Abschluss-Screen

- [ ] Angenommen der Abschluss-Screen erscheint, dann sieht der Nutzer eine Erfolgsmeldung, die Anzahl der absolvierten Übungen und einen „Zurück zum Dashboard"-Button
- [ ] Angenommen der Nutzer klickt auf „Zurück zum Dashboard", dann wird er zu `/` weitergeleitet und das Mobility-Widget zeigt „Heute erledigt ✓"

## Edge Cases

- **Browser-Tab geschlossen während Timer läuft:** Kein Completion gespeichert. Beim erneuten Öffnen startet die Routine-Übersicht von vorne (kein Resume-State in MVP).
- **Zweifacher Abschluss am selben Tag:** Der zweite Aufruf der Completion-Action ist idempotent — `INSERT … ON CONFLICT DO NOTHING`; kein doppelter DB-Eintrag.
- **Routine heute bereits erledigt → Player erneut geöffnet:** `/mobility` erkennt den heutigen Completion-Status und zeigt „Heute erledigt" mit „Erneut starten"-Option; Klick startet den Player erneut, speichert aber keinen neuen Eintrag.
- **Netzwerkfehler beim Speichern der Completion:** Toast-Fehlermeldung; Nutzer kann „Erneut versuchen" oder manuell zur `/mobility`-Seite zurückkehren. Keine automatische Wiederholung.
- **Sehr schnelle Klicks auf „Weiter":** Doppelklick auf den letzten „Weiter"-Button darf kein Duplicate-Completion auslösen — serverseitig idempotent.
- **Offline:** Kein Offline-Fallback in MVP. Timer läuft weiter (rein client-seitig), aber Completion-Speicherung schlägt fehl mit Fehlermeldung.

## Technical Requirements

- Auth: `/mobility` erfordert eingeloggte Session (Redirect zu `/login`)
- Performance: Seitenlade-Zeit < 1s (statischer Inhalt, kein DB-Fetch beim Player)
- Timer: Rein client-seitig (`setInterval`), kein Server-Polling
- Completion: Server Action mit `ON CONFLICT DO NOTHING` (idempotent)
- Browser Support: Chrome, Firefox, Safari (kein nativer Barcode-Detector nötig)

## Open Questions

- [ ] Soll die Routine-Übersicht auf `/mobility` einen Hinweis zeigen, wie lange die Routine dauert (in Minuten)? → Empfehlung: Ja, als statische Info „ca. 8 Minuten" — kein offenes Design-Problem, wird in /frontend entschieden
- [ ] Soll das Dashboard-Widget auch den Wochenstatus zeigen (z. B. „5/7 Tage diese Woche")? → Aktuell Out of Scope; Post-MVP-Erweiterung

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Eine feste globale Routine (keine Auswahl) | MVP-Scope: Solo-Projekt; Routine ist für alle gleich; kein Konfigurations-Aufwand für Nutzer oder Content-Team | 2026-06-23 |
| 8 Übungen à 30 Sekunden (ca. 8 Min) | Kurz genug für täglich, lang genug für spürbaren Effekt; typische Empfehlung für tägliche Mobility | 2026-06-23 |
| Kein Mobility-Streak-Zähler in MVP | PROJ-5 deckt Workout-Streaks ab; separater Mobility-Streak erhöht Complexity ohne klaren MVP-Mehrwert | 2026-06-23 |
| Completion nur bei vollständigem Abschluss | Vermeidet Gaming (z. B. alle Übungen sofort skippen); Nutzer muss alle 8 Übungen durchklicken | 2026-06-23 |
| Kein Resume nach Browser-Close | Zu komplex (localStorage State-Serialisierung); MVP-Nutzer erwarten keinen nahtlosen Fortsetzer | 2026-06-23 |
| Mobility-Übungen nicht in PROJ-3 Bibliothek | PROJ-3 schließt Mobility explizit aus; Übungsinhalt ist statisch (kein Admin-UI nötig) | 2026-06-23 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| _Wird von /architecture ergänzt_ | — | — |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
