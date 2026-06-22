# PROJ-3: Übungsbibliothek (Kraft & Cardio)

## Status: Planned
**Created:** 2026-06-22
**Last Updated:** 2026-06-22

## Dependencies
- Requires: PROJ-1 (Supabase Infrastructure Setup) — Datenbank, Auth, RLS-Policies
- Requires: PROJ-2 (User Onboarding & Profil) — Profil-Daten (equipment, fitness_level) für voreingestellte Filter

## User Stories
- Als Einsteiger möchte ich die Übungsbibliothek durchstöbern und nur Übungen sehen, die zu meinem Equipment und Level passen, damit ich sofort starten kann ohne mich durch ungeeignete Inhalte zu kämpfen.
- Als Nutzer möchte ich nach Übungen suchen und filtern (Kategorie, Muskelgruppe, Equipment, Schwierigkeit), damit ich schnell die richtige Übung finde.
- Als Nutzer möchte ich die Detailseite einer Übung öffnen und dort Beschreibung, Bild und Video-Link sehen, damit ich verstehe wie die Übung korrekt ausgeführt wird.
- Als Nutzer möchte ich Übungen als Favorit markieren, damit ich meine Lieblingsübungen schnell wiederfinden kann.
- Als Nutzer möchte ich eigene Übungen anlegen, damit ich Custom-Übungen in mein Training einbauen kann (z.B. Geräte im Heimstudio die nicht in der Standard-Bibliothek sind).
- Als Nutzer möchte ich meine eigenen Custom-Übungen bearbeiten und löschen können.
- Als Trainingsplan (PROJ-4) soll die Übungsbibliothek als strukturierte Datenbasis dienen, aus der Übungen nach Equipment und Level gefiltert und einem Plan zugewiesen werden können.

## Out of Scope
- Mobility-Übungen (Dehnen, Yoga) — gehören zu PROJ-7 (Mobility Routine); Kategorie "Mobility" wird in PROJ-3 nicht eingeführt
- Custom-Übungen öffentlich teilen oder als Community-Content einreichen — kein Social-Feed in v1 (PRD Non-Goals)
- Direkt aus der Bibliothek eine Training-Session starten oder loggen — das ist PROJ-4 (Trainingsplan) und PROJ-5 (Fortschritts-Tracking)
- Bild-Upload in die App (Supabase Storage) — Bild wird als externe URL gespeichert; Upload-Feature ist Post-MVP
- Video-Einbettung (iframe/embed) — nur Link-URL; Nutzer öffnet Video in neuem Tab (CSP-Vereinfachung für MVP)
- Barcode-Scanner für Geräte/Produkte — gehört zu PROJ-6
- Admin-Panel zum Verwalten der System-Übungen — Seed-Daten werden direkt in der Datenbank gepflegt
- Bulk-Import von Übungen durch Nutzer
- Wearable-Integration oder automatische Übungserkennung
- "Ähnliche Übungen"-Empfehlungen (Algorithmus) — Post-MVP

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Bibliotheks-Übersicht (`/exercises`)

- [ ] Angenommen ein eingeloggter Nutzer öffnet `/exercises`, dann werden die Filter-Chips mit den Profil-Standardwerten voreingestellt (Equipment aus Profil, Schwierigkeit aus Profil-Level)
- [ ] Angenommen ein nicht eingeloggter Nutzer versucht `/exercises` aufzurufen, dann wird er zur Login-Seite weitergeleitet
- [ ] Angenommen die Filter-Standardwerte sind gesetzt, wenn ein Nutzer auf einen anderen Filter-Chip klickt, dann aktualisiert sich die Übungsliste sofort ohne Seitenladung
- [ ] Angenommen ein Nutzer gibt einen Suchbegriff in die Suchleiste ein, dann werden Übungen in Echtzeit nach Name (case-insensitive) gefiltert — zusätzlich zu den aktiven Filter-Chips
- [ ] Angenommen ein Nutzer wählt den Kategorie-Filter "Kraft", dann werden nur Kraft-Übungen angezeigt; wählt er "Cardio", nur Cardio-Übungen; kein Filter zeigt alle Kategorien
- [ ] Angenommen ein Nutzer wählt eine Muskelgruppe (Brust, Rücken, Schultern, Arme, Core, Beine, Gesäß, Ganzkörper), dann werden nur Übungen angezeigt, die diese Muskelgruppe enthalten
- [ ] Angenommen ein Nutzer wählt ein Equipment-Level, dann werden nur Übungen angezeigt, die mit diesem Equipment oder weniger ausgeführt werden können
- [ ] Angenommen ein Nutzer hat Filter gesetzt und keine Übung entspricht diesen Filtern, dann wird ein leerer Zustand mit Text "Keine Übungen gefunden" und einem "Filter zurücksetzen"-Button angezeigt
- [ ] Angenommen ein Nutzer klickt auf "Filter zurücksetzen", dann werden alle Filter auf die Profil-Standardwerte zurückgesetzt
- [ ] Angenommen ein Nutzer hat eigene Übungen angelegt, dann erscheinen diese in der Bibliothek gemischt mit System-Übungen und sind durch ein "Eigene" Badge erkennbar
- [ ] Angenommen ein Nutzer klickt auf "+ Übung hinzufügen", dann öffnet sich das Formular zum Erstellen einer Custom-Übung

### Detailseite (`/exercises/[id]`)

- [ ] Angenommen ein Nutzer klickt auf eine Übungskarte in der Bibliothek, dann öffnet sich die Detailseite `/exercises/[id]`
- [ ] Angenommen die Übung hat ein Bild, wenn die Detailseite geladen wird, dann wird das Bild angezeigt; andernfalls wird ein Platzhalter-Bild angezeigt
- [ ] Angenommen die Übung hat eine Video-URL, wenn die Detailseite geladen wird, dann wird ein "Video ansehen"-Link angezeigt der in einem neuen Tab öffnet
- [ ] Angenommen die Übung hat keine Video-URL, dann ist kein Video-Link sichtbar
- [ ] Angenommen ein Nutzer klickt auf das Herz-Icon auf der Detailseite, wenn die Übung noch kein Favorit ist, dann wird sie als Favorit markiert (Icon gefüllt) und in der Datenbank gespeichert
- [ ] Angenommen ein Nutzer klickt auf das gefüllte Herz-Icon, dann wird der Favorit-Status entfernt (Icon ungefüllt)
- [ ] Angenommen die Übung ist eine eigene Custom-Übung des Nutzers, dann sieht er "Bearbeiten"- und "Löschen"-Buttons; bei System-Übungen sind diese Buttons nicht sichtbar
- [ ] Angenommen ein nicht autorisierter Nutzer ruft die Detailseite einer anderen Custom-Übung direkt per URL auf, dann wird er zur Bibliothek-Übersicht weitergeleitet (404 oder Redirect)

### Favoriten

- [ ] Angenommen ein Nutzer hat mindestens eine Übung favorisiert, dann gibt es in der Filter-Leiste einen "Nur Favoriten" Toggle
- [ ] Angenommen ein Nutzer aktiviert "Nur Favoriten", dann werden nur favorisierte Übungen angezeigt (kombiniert mit anderen aktiven Filtern)
- [ ] Angenommen ein Nutzer hat keine Favoriten und aktiviert "Nur Favoriten", dann sieht er einen leeren Zustand mit Hinweis "Noch keine Favoriten — klick auf ♡ bei einer Übung"

### Custom-Übung erstellen

- [ ] Angenommen ein Nutzer öffnet das Formular für eine neue Übung, dann sind Name, Kategorie, mindestens eine Muskelgruppe, Equipment-Stufe und Schwierigkeit Pflichtfelder
- [ ] Angenommen ein Nutzer lässt ein Pflichtfeld leer und klickt auf "Speichern", dann wird für jedes leere Pflichtfeld eine Fehlermeldung angezeigt
- [ ] Angenommen ein Nutzer füllt alle Pflichtfelder aus und klickt auf "Speichern", dann wird die Custom-Übung gespeichert, erscheint sofort in der Bibliothek mit "Eigene" Badge, und der Nutzer wird zur Detailseite weitergeleitet
- [ ] Angenommen ein Netzwerkfehler beim Speichern auftritt, dann bleibt der Nutzer auf dem Formular, eine Fehlermeldung wird angezeigt, und seine Eingaben bleiben erhalten

### Custom-Übung bearbeiten / löschen

- [ ] Angenommen ein Nutzer klickt auf "Bearbeiten" auf seiner eigenen Custom-Übung, dann öffnet sich das Bearbeitungsformular mit den vorausgefüllten Daten
- [ ] Angenommen ein Nutzer speichert Änderungen, dann werden sie sofort in der Datenbank aktualisiert und in der Detailseite angezeigt
- [ ] Angenommen ein Nutzer klickt auf "Löschen", dann erscheint ein Bestätigungsdialog ("Übung wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.")
- [ ] Angenommen ein Nutzer bestätigt das Löschen, dann wird die Übung entfernt und der Nutzer zur Bibliothek-Übersicht weitergeleitet

## Edge Cases
- **Ungültige Bild-URL:** Wenn die externe Bild-URL nicht geladen werden kann (404, CORS), zeigt die App das Platzhalter-Bild — kein Broken-Image-Icon
- **Custom-Übung in Trainingsplan verwendet und dann gelöscht:** Die Übungsreferenz bleibt im Trainingsplan erhalten (soft delete: Übung als `deleted: true` markiert, nicht physisch gelöscht) — PROJ-4 muss damit umgehen
- **Gleichnamige Custom-Übung wie System-Übung:** Erlaubt — das "Eigene" Badge unterscheidet sie visuell; keine Namens-Unique-Constraint für Custom-Übungen
- **Profil-Equipment ändert sich (PROJ-2 Profil-Seite):** Beim nächsten Öffnen von `/exercises` werden die Filter-Chips neu auf die aktualisierten Profil-Werte gesetzt — kein Auto-Refresh einer offenen Bibliothek-Seite
- **Sehr langer Übungsname:** In der Übungskarte wird nach 2 Zeilen abgeschnitten (ellipsis), der volle Name ist auf der Detailseite sichtbar
- **Nutzer ohne abgeschlossenes Onboarding:** Profil-Standardwerte für Filter sind nicht verfügbar → alle Filter stehen auf "Alle" (kein Crash)
- **0 System-Übungen (Seed-Daten fehlen):** Leerer Zustand mit Hinweis "Die Bibliothek wird gerade aufgebaut" anstelle des normalen leeren Filter-Zustands
- **Video-URL ist kein gültiges URL-Format:** Validierungsfehlermeldung im Formular — nur gültige URLs werden akzeptiert

## Technical Requirements
- Alle Routen unter `/exercises` sind nur für eingeloggte Nutzer mit abgeschlossenem Onboarding zugänglich (Middleware aus PROJ-2)
- Custom-Übungen dürfen nur vom Eigentümer gelesen/bearbeitet/gelöscht werden (RLS-Policy auf user_id)
- Favoriten werden pro Nutzer in der Datenbank gespeichert (kein localStorage — Persistierung über Geräte hinweg)
- Filter- und Suchlogik läuft serverseitig (Datenbankabfrage mit Parametern), nicht clientseitig über ein In-Memory-Array — wichtig für Skalierbarkeit ab >50 Übungen
- Bilder werden als externe URL gespeichert — kein Supabase Storage Upload in PROJ-3

## Open Questions
- [ ] Soll die Übungsdetailseite zukünftig einen "Zum Trainingsplan hinzufügen"-Button haben? (betrifft PROJ-4 — offen bis PROJ-4 spezifiziert ist)
- [ ] Soll eine gelöschte Custom-Übung im Trainingsplan als "(Gelöscht)" angezeigt werden oder unsichtbar sein? (Abhängigkeit zu PROJ-4)
- [ ] Wie viele Muskelgruppen kann eine Übung haben (1–n)? Empfehlung: max. 3 um die UI übersichtlich zu halten — zu bestätigen

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Übungsbibliothek ist sowohl Browse-UI als auch Datenbasis für PROJ-4 | Doppelte Rolle spart eine separate Daten-Architektur; Nutzer können Übungen entdecken bevor sie in den Trainingsplan kommen | 2026-06-22 |
| System-Übungen (Admin-Seed) + Private Custom-Übungen | Kuratierte Qualität der System-Übungen + Flexibilität für Nutzer; kein Moderationsaufwand da Custom-Übungen privat sind | 2026-06-22 |
| Custom-Übungen privat (nicht teilbar) | Verhindert Moderation und Community-Infrastruktur (PRD Non-Goals: kein Social-Feed in v1) | 2026-06-22 |
| Custom-Übungen gemischt in Bibliothek mit "Eigene" Badge | Einheitliche UX — Nutzer arbeitet immer in einem Kontext, nicht in getrennten Listen | 2026-06-22 |
| Filter startet mit Profil-Standardwerten (Equipment + Level) | Personalisierung ohne manuelle Konfiguration — Kernversprechen der App (PRD Vision) | 2026-06-22 |
| Nur Favorisieren als Nutzer-Interaktion (kein Training starten/loggen) | Klare Feature-Grenze: PROJ-3 = Entdecken, PROJ-4 = Planen, PROJ-5 = Tracken | 2026-06-22 |
| Bild als externe URL, kein Upload | Supabase Storage-Setup nicht in PROJ-3-Scope; externe URLs reichen für initialen Seed-Datensatz | 2026-06-22 |
| Video als Link (neuer Tab), kein Embed | CSP-Vereinfachung und DSGVO-Vorteil (kein YouTube-Tracking im iFrame) für MVP | 2026-06-22 |
| 8 Muskelgruppen: Brust, Rücken, Schultern, Arme, Core, Beine, Gesäß, Ganzkörper | Deckt alle gängigen Krafttraining-Kategorien ab; "Ganzkörper" fängt Compound-Übungen auf | 2026-06-22 |
| 30–50 System-Übungen zum Launch | Genug für sinnvolle Trainingsplan-Generierung (PROJ-4); überschaubar für manuelle Qualitätssicherung | 2026-06-22 |
| Soft Delete für Custom-Übungen | Verhindert Datenverlust wenn Übung in PROJ-4-Trainingsplan verwendet wird | 2026-06-22 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| _To be added by /architecture_ | | |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
