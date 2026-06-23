# PROJ-3: Übungsbibliothek (Kraft & Cardio)

## Status: In Review
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
| muscle_groups als Text-Array (kein Junction-Table) | 8 feste, unveränderliche Werte — kein eigener Verwaltungsaufwand; Supabase `.contains()` filtert Arrays nativ; Junction-Table wäre Over-Engineering für MVP | 2026-06-22 |
| Soft Delete statt Hard Delete für Custom-Übungen | Verhindert Datenverlust wenn Übung in PROJ-4-Trainingsplänen referenziert ist; `deleted_at`-Timestamp ist der Standard-Ansatz für dieses Problem | 2026-06-22 |
| Client-seitige Supabase-Abfragen für Filter/Suche | Reaktive Echtzeit-Filter ohne Next.js-Server-Roundtrip; RLS schützt trotzdem alle Daten; Server Actions nur für Mutationen | 2026-06-22 |
| Server Component für erste Datenlast (Profil + initiale Liste) | Kein Flicker / leerer Zustand beim ersten Render; SEO-freundlich; Profil-Defaults können direkt als Props übergeben werden | 2026-06-22 |
| Server Actions für alle Mutationen (Favorit, Custom-CRUD) | Serverseitige Validierung + RLS-Doppelschutz; kein Boilerplate für separate API-Routen (Muster aus PROJ-2) | 2026-06-22 |
| Bild als externe URL (kein Supabase Storage) | Storage-Einrichtung nicht in PROJ-3-Scope; externe URLs reichen für die 30–50 System-Seed-Übungen; Upload-Feature als Post-MVP | 2026-06-22 |
| Video als externer Link (kein Embed) | Vermeidet CSP-Konfiguration für YouTube/Vimeo-iFrames; kein Third-Party-Tracking im App-Kontext | 2026-06-22 |
| Zugriffsschutz durch bestehende Middleware (PROJ-2) | Alle `/exercises`-Routen fallen automatisch unter den bestehenden Guard — keine neue Middleware-Logik nötig | 2026-06-22 |
| Kein neues Paket notwendig | Alle shadcn/ui-Komponenten, zod, react-hook-form und Supabase-Clients sind bereits installiert | 2026-06-22 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Seitenstruktur (Routen)

Alle Routen sind durch die bestehende Middleware (PROJ-2) geschützt: nur eingeloggte Nutzer mit abgeschlossenem Onboarding haben Zugriff.

| Route | Zweck |
|-------|-------|
| `/exercises` | Bibliotheks-Übersicht mit Suche, Filtern und Karten-Grid |
| `/exercises/[id]` | Detailansicht einer einzelnen Übung |
| `/exercises/new` | Formular: neue Custom-Übung anlegen |
| `/exercises/[id]/edit` | Formular: eigene Custom-Übung bearbeiten |

---

### Komponentenstruktur

#### Bibliotheks-Übersicht (`/exercises`)
```
ExercisesPage (Server Component)
— liest Nutzerprofil → setzt Equipment + Level als Filter-Defaults
— lädt initiale Übungsliste (bereits profil-gefiltert)
|
+-- ExerciseFilterBar (Client Component — hält Filterzustand)
|   +-- SearchInput (Textsuchleiste)
|   +-- CategoryChips (Alle / Kraft / Cardio)
|   +-- MuscleGroupSelect (8 Muskelgruppen als Dropdown)
|   +-- EquipmentChips (Alle / Ohne Equipment / Basis / Vollausstattung)
|   +-- DifficultyChips (Alle / Einsteiger / Fortgeschrittener / Profi)
|   +-- FavoritesToggle ("Nur Favoriten")
|   +-- ResetButton ("Filter zurücksetzen" → Profil-Defaults)
|
+-- ExerciseGrid (Client Component — zeigt Ergebnisse, reagiert auf Filter)
|   +-- ExerciseCard (× n, klickbar → /exercises/[id])
|   |   +-- Übungsbild (oder Platzhalter-Icon)
|   |   +-- Name (max. 2 Zeilen, dann abgeschnitten)
|   |   +-- Muskelgruppen-Badges
|   |   +-- Equipment- und Schwierigkeits-Chips
|   |   +-- "Eigene"-Badge (nur bei Custom-Übungen)
|   +-- EmptyState (wenn keine Übungen die Kriterien erfüllen)
|       +-- Text "Keine Übungen gefunden"
|       +-- Button "Filter zurücksetzen"
|
+-- AddExerciseButton ("+ Übung hinzufügen" → /exercises/new)
```

#### Detailseite (`/exercises/[id]`)
```
ExerciseDetailPage (Server Component)
— lädt Übung aus DB + Favorit-Status des Nutzers
|
+-- Zurück-Link (→ /exercises)
+-- ExerciseHero
|   +-- Übungsbild (oder Platzhalter wenn keine image_url)
|   +-- Name
|   +-- Kategorie-Badge (Kraft / Cardio)
|   +-- Schwierigkeits-Badge
+-- MuscleGroupBadges (alle Muskelgruppen der Übung)
+-- EquipmentBadge
+-- Description (wenn vorhanden)
+-- VideoLink (wenn vorhanden — "Video ansehen ↗", öffnet neuen Tab)
+-- FavoriteButton (Client Component — Herz-Toggle, sofortige UI-Aktualisierung)
+-- OwnerActions (nur sichtbar wenn is_system = false und user_id = eigene ID)
    +-- EditButton (→ /exercises/[id]/edit)
    +-- DeleteButton (Client Component)
        +-- DeleteConfirmDialog (shadcn Alert Dialog)
```

#### Übung erstellen / bearbeiten (`/exercises/new` und `/exercises/[id]/edit`)
```
ExerciseFormPage (Server Component)
— bei Edit: lädt bestehende Übung, prüft Eigentümerschaft (→ Redirect wenn fremd)
|
+-- ExerciseForm (Client Component — react-hook-form + zod)
    +-- Input: Name (Pflichtfeld, max. 200 Zeichen)
    +-- RadioGroup: Kategorie (Kraft / Cardio) — Pflichtfeld
    +-- CheckboxGroup: Muskelgruppen (8 Optionen, min. 1 Pflicht)
    +-- Select: Equipment-Stufe (Pflichtfeld)
    +-- Select: Schwierigkeit (Pflichtfeld)
    +-- Textarea: Beschreibung (optional)
    +-- Input: Bild-URL (optional, URL-Format-Validierung)
    +-- Input: Video-URL (optional, URL-Format-Validierung)
    +-- Button: "Speichern"
    +-- Button: "Abbrechen" (→ /exercises)
```

---

### Datenmodell

#### Tabelle: `exercises`

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `id` | UUID | Eindeutige ID |
| `name` | Text (max. 200 Z.) | Übungsname |
| `category` | Enum | `strength` oder `cardio` |
| `muscle_groups` | Text-Array | 1–n Werte aus den 8 Muskelgruppen (siehe unten) |
| `equipment` | Enum | `none`, `basic` oder `full` |
| `difficulty` | Enum | `beginner`, `intermediate` oder `advanced` |
| `description` | Text | Optionale Beschreibung / Anleitung |
| `image_url` | Text | Optionaler externer Bild-Link |
| `video_url` | Text | Optionaler externer Video-Link |
| `is_system` | Boolean | `true` = Admin-Seed, `false` = Custom (Standard: false) |
| `user_id` | UUID | Null bei System-Übungen; Eigentümer bei Custom |
| `deleted_at` | Timestamp | Null = aktiv; ausgefüllt = soft-deleted |
| `created_at` | Timestamp | Automatisch gesetzt |
| `updated_at` | Timestamp | Automatisch bei Änderungen gesetzt |

**Muskelgruppen-Werte:** `chest`, `back`, `shoulders`, `arms`, `core`, `legs`, `glutes`, `full_body`

**Warum Text-Array statt eigener Tabelle?** 8 feste Werte, keine separate Verwaltung nötig — ein Array-Feld ist einfacher und direkt per Supabase-Filter abfragbar.

**Soft Delete:** Custom-Übungen werden nie physisch gelöscht — `deleted_at` wird gesetzt. So bleibt die Referenz in PROJ-4-Trainingsplänen erhalten.

#### Tabelle: `favorites`

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `id` | UUID | Eindeutige ID |
| `user_id` | UUID | Nutzer (FK auf auth.users) |
| `exercise_id` | UUID | Übung (FK auf exercises) |
| `created_at` | Timestamp | Automatisch gesetzt |

Unique-Constraint: `(user_id, exercise_id)` — jeder Nutzer kann jede Übung nur einmal favorisieren.

---

### Datenzugriff & Datenfluss

**Erste Seitenladung (`/exercises`):**
1. Server Component liest Nutzerprofil (equipment + fitness_level aus `profiles`)
2. Server Component lädt initial gefilterte Übungsliste (Supabase Server Client)
3. Beide Daten werden als Props an Client Components übergeben → kein Flicker, kein leerer Zustand beim ersten Render

**Filter / Suche (ohne Seitenreload):**
ExerciseFilterBar verwaltet den Filterzustand lokal (React State). Jede Änderung löst eine neue Datenbankabfrage direkt über den Supabase Browser Client aus — ohne Umweg über Next.js Server Actions. Dies ermöglicht schnelle, reaktive Filter-Aktualisierungen.

**Mutationen (Favorit, Custom-Übung erstellen/ändern/löschen):**
Server Actions — laufen serverseitig, validieren Eigentümerschaft, schreiben in die Datenbank.

```
Favorit setzen/entfernen:
  FavoriteButton (Client) → Server Action → Supabase favorites-Tabelle
  → UI sofort optimistisch aktualisiert, Server Action bestätigt

Custom-Übung speichern:
  ExerciseForm (Client) → Server Action (Zod-Validierung) → Supabase exercises-Tabelle
  → Redirect → /exercises/[id] (neue Übung) oder /exercises (nach Löschen)
```

---

### Zugriffsschutz (RLS-Policies)

Zwei Sicherheitsebenen — Middleware + Datenbankregeln:

**`exercises`-Tabelle:**
- Lesen: System-Übungen (`is_system = true`) sind für alle eingeloggten Nutzer sichtbar; Custom-Übungen (`is_system = false`) nur für den Eigentümer — und nur wenn `deleted_at` leer ist
- Schreiben/Bearbeiten/Löschen: nur eigene Custom-Übungen (`user_id = eingeloggter Nutzer`)

**`favorites`-Tabelle:**
- Lesen, Einfügen, Löschen: nur eigene Favoriten (`user_id = eingeloggter Nutzer`)

---

### Bestehende Komponenten (alle bereits installiert)

| Komponente / Paket | Verwendung in PROJ-3 |
|-------------------|---------------------|
| `shadcn/ui` Badge | Muskelgruppen, Kategorie, Schwierigkeit, "Eigene"-Label |
| `shadcn/ui` Card | ExerciseCard in der Übersicht |
| `shadcn/ui` Input | Suchleiste, URL-Felder im Formular |
| `shadcn/ui` Select | Muskelgruppen-Dropdown, Equipment, Schwierigkeit |
| `shadcn/ui` Checkbox | Muskelgruppen-Auswahl im Erstellformular |
| `shadcn/ui` Textarea | Beschreibungsfeld im Formular |
| `shadcn/ui` Alert Dialog | Löschen-Bestätigungsdialog |
| `shadcn/ui` Sheet | Filter-Panel auf Mobile (optional) |
| `shadcn/ui` Skeleton | Lade-Platzhalter beim Datenabruf |
| `shadcn/ui` Sonner (Toast) | Bestätigung nach Speichern / Favorit |
| `shadcn/ui` Separator | Trennung von Filterbereichen |
| `zod` | Formularvalidierung (alle Felder, URL-Format) |
| `react-hook-form` | Formularsteuerung (Custom-Übung erstellen/bearbeiten) |
| `src/lib/supabase/client.ts` | Client-seitige Filter-Abfragen |
| `src/lib/supabase/server.ts` | Server Component: Profil + erste Datenlast |

**Kein neues Paket notwendig.**

## Implementation Notes (Frontend)
**Date:** 2026-06-22

### Files Created
- `src/types/exercise.ts` — Shared types: `Exercise`, `ExerciseFilters`, label maps
- `src/app/exercises/actions.ts` — Server Actions: `toggleFavorite`, `createExercise`, `updateExercise`, `deleteExercise`
- `src/components/exercises/ExerciseImage.tsx` — Client image with error fallback (uses `<img>` instead of `next/image` for unknown external URLs)
- `src/components/exercises/ExerciseCard.tsx` — Grid card with badges, truncated title, "Eigene" badge
- `src/components/exercises/ExerciseLibrary.tsx` — Client component managing filter state + Supabase queries; skips initial fetch (uses server-provided data)
- `src/components/exercises/FavoriteButton.tsx` — Optimistic heart toggle with Server Action
- `src/components/exercises/DeleteButton.tsx` — AlertDialog confirm + Server Action soft-delete
- `src/components/exercises/ExerciseForm.tsx` — react-hook-form + zod; handles create/edit
- `src/app/exercises/page.tsx` — Server Component; loads profile defaults + initial filtered list
- `src/app/exercises/[id]/page.tsx` — Server Component; detail page with owner-only edit/delete
- `src/app/exercises/new/page.tsx` — Create form page
- `src/app/exercises/[id]/edit/page.tsx` — Edit form page (verifies ownership before rendering)

### Deviations from Spec
- **Middleware**: PROJ-3 spec relies on PROJ-2 middleware which doesn't exist yet. Auth guard integrated into existing `src/proxy.ts` (Next.js 16 uses `proxy.ts` instead of `middleware.ts`).
- **Zod v4 URL validation**: Used `z.refine()` with regex instead of `z.string().url()` + `z.preprocess()` to avoid react-hook-form type incompatibility.
- **Exercise images**: Using `<img>` tag with `onError` handler instead of `next/image`, since exercise image URLs are user-provided external URLs from unknown domains.
- **Layout updated**: Added Inter font, dark class, Toaster to `src/app/layout.tsx`.

## Implementation Notes (Backend)
**Date:** 2026-06-22

### Database Objects Created
- **Enum types:** `exercise_category` (`strength`/`cardio`), `exercise_equipment` (`none`/`basic`/`full`), `exercise_difficulty` (`beginner`/`intermediate`/`advanced`)
- **Table `exercises`:** All fields per spec, soft-delete via `deleted_at`, `updated_at` auto-trigger
- **Table `favorites`:** `(user_id, exercise_id)` unique constraint, CASCADE on user delete
- **RLS `exercises`:** SELECT (system + own custom, deleted_at IS NULL), INSERT (own custom only), UPDATE (own custom only)
- **RLS `favorites`:** SELECT/INSERT/DELETE own rows only
- **Indexes:** 6 partial indexes on exercises (WHERE deleted_at IS NULL), 2 on favorites

### SQL Files (run in Supabase SQL Editor)
1. `supabase/migrations/20260622000000_proj3_exercises.sql` — Schema, RLS, indexes
2. `supabase/seed/proj3_exercises_seed.sql` — 40 system exercises (run as superuser to bypass RLS)

### No API Routes
All data access goes through Server Actions (mutations) and direct Supabase client calls (filtering). No new `/api/` routes needed per tech design.

### Tests
- `src/app/exercises/actions.test.ts` — 16 unit tests (4 actions × auth/happy path/error cases)
- All 16 pass: `npm test`

## QA Test Results

**Date:** 2026-06-23
**QA Engineer:** Claude (automated static analysis + E2E scaffolding)

### Summary
- **Acceptance Criteria Tested:** 31 total
- **Passed:** 28
- **Failed:** 3 (1 High, 2 Low)
- **Unit Tests:** 16 existing (all pass) — Server Actions fully covered
- **E2E Tests:** Written in `tests/PROJ-3-uebungsbibliothek.spec.ts` — 4 unauthenticated redirect tests pass; authenticated tests skipped (require `TEST_USER_EMAIL`/`TEST_USER_PASSWORD`)
- **Build:** Clean (`npm run build` passes, 0 TypeScript errors)
- **Production-Ready:** **NO** — 1 High bug must be fixed

---

### Acceptance Criteria Results

#### Bibliotheks-Übersicht (`/exercises`)
| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Filter-Chips mit Profil-Standardwerten voreingestellt | ✅ PASS | Server Component reads profile → ExerciseLibrary props |
| 2 | Nicht eingeloggter Nutzer → Redirect zu `/` | ✅ PASS | Proxy + page-level guard both redirect; E2E verified |
| 3 | Filter-Chip klicken → Liste aktualisiert ohne Seitenladung | ✅ PASS | React state + Supabase client query |
| 4 | Suchbegriff → Echtzeit-Filterung nach Name (case-insensitive) | ✅ PASS | `.ilike('name', ...)` |
| 5 | Kategorie-Filter "Kraft" / "Cardio" | ✅ PASS | `.eq('category', ...)` |
| 6 | Muskelgruppen-Filter | ✅ PASS | `.contains('muscle_groups', [...])` |
| 7 | Equipment-Filter "oder weniger" | ❌ FAIL | **BUG-1 (HIGH)** — uses strict `.eq()` not range |
| 8 | Leerer Zustand "Keine Übungen gefunden" + Reset-Button | ✅ PASS | EmptyState component present |
| 9 | "Filter zurücksetzen" → Profil-Standardwerte | ✅ PASS | `setFilters(defaultFilters)` |
| 10 | Eigene Übungen erscheinen mit "Eigene"-Badge | ✅ PASS | ExerciseCard renders badge when `!is_system` |
| 11 | "+ Übung hinzufügen" → Formular öffnet sich | ✅ PASS | Link to `/exercises/new` |

#### Detailseite (`/exercises/[id]`)
| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 12 | Übungskarte → Detailseite `/exercises/[id]` | ✅ PASS | ExerciseCard wrapped in Link |
| 13 | Bild angezeigt / Platzhalter bei kein Bild | ✅ PASS | ExerciseImage with `onError` fallback |
| 14 | Video-URL → "Video ansehen"-Link (neuer Tab) | ✅ PASS | `target="_blank" rel="noopener noreferrer"` |
| 15 | Keine Video-URL → kein Link | ✅ PASS | Conditional render |
| 16 | Herz-Icon → Favorit markieren (Icon gefüllt + DB) | ✅ PASS | FavoriteButton with optimistic update + Server Action |
| 17 | Gefülltes Herz-Icon → Favorit entfernen | ✅ PASS | toggleFavorite(exerciseId, true) → delete |
| 18 | Eigene Übung → "Bearbeiten" + "Löschen" Buttons sichtbar | ✅ PASS | `isOwner` flag |
| 19 | System-Übung → keine Owner-Buttons | ✅ PASS | `!exercise.is_system` check |
| 20 | Fremde Custom-Übung per URL → Redirect zur Bibliothek | ✅ PASS | `redirect('/exercises')` when `user_id !== user.id` |

#### Favoriten
| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 21 | Mindestens 1 Favorit → "Nur Favoriten" Toggle erscheint | ✅ PASS | `hasFavorites` condition |
| 22 | "Nur Favoriten" aktivieren → nur Favoriten anzeigen | ✅ PASS | `.in('id', favoriteIds)` |
| 23 | Keine Favoriten + "Nur Favoriten" → Leerer Zustand mit Hinweis | ✅ PASS | Separate empty-state für `favoritesOnly` |

#### Custom-Übung erstellen
| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 24 | Pflichtfelder vorhanden (Name, Kategorie, Muskelgruppe, Equipment, Schwierigkeit) | ✅ PASS | All required in form + Zod schema |
| 25 | Leeres Pflichtfeld → Fehlermeldung pro Feld | ✅ PASS | react-hook-form + Zod validation |
| 26 | Alle Pflichtfelder → Speichern + Badge + Redirect zu Detailseite | ✅ PASS | createExercise Server Action |
| 27 | Netzwerkfehler → Nutzer bleibt auf Formular, Eingaben erhalten | ✅ PASS | catch block + toast.error, `setIsPending(false)` |

#### Custom-Übung bearbeiten / löschen
| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 28 | "Bearbeiten" → Formular mit vorausgefüllten Daten | ✅ PASS | EditPage loads exercise, passes as prop to ExerciseForm |
| 29 | Änderungen speichern → sofort aktualisiert | ✅ PASS | updateExercise + revalidatePath |
| 30 | "Löschen" → Bestätigungsdialog erscheint | ✅ PASS | AlertDialog in DeleteButton |
| 31 | Löschen bestätigen → Redirect zur Bibliothek | ✅ PASS | soft-delete + redirect('/exercises') |

---

### Bugs Found

#### BUG-1 — Equipment-Filter ignoriert "oder weniger"-Semantik (HIGH)
**Files:** `src/app/exercises/page.tsx:31-35`, `src/components/exercises/ExerciseLibrary.tsx:108-110`
**Spec:** "Angenommen ein Nutzer wählt ein Equipment-Level, dann werden nur Übungen angezeigt, die mit diesem Equipment **oder weniger** ausgeführt werden können"
**Actual:** Strict `.eq('equipment', filters.equipment)` — only exact matches. A user filtering "Basis" doesn't see "Ohne Equipment" exercises.
**Expected:** Equipment hierarchy (`none < basic < full`). Filter `basic` → show `none` + `basic`. Filter `full` → show all.
**Severity:** HIGH — core filter logic is incorrect; affects every user who has equipment set in their profile
**Fix:** Replace `eq('equipment', ...)` with an `in('equipment', allowedValues)` where `allowedValues` is derived from the equipment hierarchy.

#### BUG-2 — "Abbrechen" navigiert zur vorherigen History statt zu /exercises (LOW)
**File:** `src/components/exercises/ExerciseForm.tsx:303`
**Spec:** "Button: 'Abbrechen' (→ /exercises)"
**Actual:** `router.back()` — navigates to previous history entry, which may not be `/exercises`
**Expected:** `router.push('/exercises')` for consistent navigation
**Severity:** LOW — UX issue with a simple workaround (use browser back button)

#### BUG-3 — Kein separater Leer-Zustand für fehlende Seed-Daten (LOW)
**File:** `src/components/exercises/ExerciseLibrary.tsx:283-296`
**Spec (Edge Case):** "0 System-Übungen (Seed-Daten fehlen): Leerer Zustand mit Hinweis 'Die Bibliothek wird gerade aufgebaut'"
**Actual:** Both "no filter matches" and "no exercises exist at all" show the same "Keine Übungen gefunden" state
**Severity:** LOW — edge case only relevant if seed data isn't applied

---

### Security Audit

| Check | Status | Notes |
|-------|--------|-------|
| Auth bypass on `/exercises` routes | ✅ SAFE | Proxy + page-level guards both enforce auth |
| Authorization: user can access own data only | ✅ SAFE | RLS policies + server-side checks in all page components |
| RLS on `exercises` (system + own custom) | ✅ SAFE | `.or('is_system.eq.true,user_id.eq.XYZ')` filter + DB policy |
| RLS on `favorites` | ✅ SAFE | Server Action checks auth; DB policy enforces `user_id` |
| XSS via exercise description/name | ✅ SAFE | React JSX auto-escapes; no dangerouslySetInnerHTML |
| SQL injection via search input | ✅ SAFE | Parameterized Supabase `.ilike()` — no string interpolation in query |
| Server Actions check auth | ✅ SAFE | All 4 actions call `supabase.auth.getUser()` before any DB write |
| IDOR: accessing another user's custom exercise by URL | ✅ SAFE | Server Component redirects if `user_id !== user.id` |
| Video URL injection (javascript: scheme) | ⚠️ LOW RISK | Form validates `https?://` pattern, but direct DB inserts (seed data) are not re-validated on render; unlikely in practice |
| Security headers | ✅ SAFE | X-Frame-Options, X-Content-Type-Options, HSTS set in proxy |

---

### Responsive / Cross-Browser (Static Analysis)
- Grid uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` — responsive ✅
- Filter bar uses `flex-wrap gap-2` — wraps on mobile ✅
- Form max-width `max-w-2xl` — constrained on large screens ✅
- No fixed pixel widths that would break on mobile ✅
- Cross-browser: no browser-specific CSS, all Tailwind utilities — ✅

---

### Edge Cases Tested (Static Analysis)

| Edge Case | Status | Notes |
|-----------|--------|-------|
| Ungültige Bild-URL (CORS/404) | ✅ HANDLED | ExerciseImage `onError` → Platzhalter-Icon |
| Soft Delete: Exercise in Trainingsplan | ✅ HANDLED | `deleted_at` timestamp; nicht physisch gelöscht |
| Gleichnamige Custom-Übung wie System-Übung | ✅ HANDLED | Kein Unique-Constraint auf Name; "Eigene" Badge unterscheidet |
| Sehr langer Übungsname | ✅ HANDLED | `line-clamp-2` in ExerciseCard (Tailwind) |
| Nutzer ohne Onboarding | ✅ HANDLED | `?? 'all' as const` Fallback in profileDefaults |
| 0 System-Übungen (Seed fehlt) | ⚠️ PARTIAL | Zeigt "Keine Übungen gefunden" statt "Die Bibliothek wird gerade aufgebaut" (BUG-3) |
| Video-URL ungültiges Format | ✅ HANDLED | Zod regex validation in form + Server Action |

## Deployment
_To be added by /deploy_
