# PROJ-6: Kalorienrechner mit Food-Tracking & Barcode Scanner

## Status: In Progress
**Created:** 2026-06-23
**Last Updated:** 2026-06-23

## Dependencies
- Requires: PROJ-1 (Supabase Infrastructure Setup) — Datenbankstruktur, RLS
- Requires: PROJ-2 (User Onboarding & Profil) — `profiles`-Tabelle wird um Körperdaten erweitert; `goal`-Feld für Kalorienziel-Berechnung

## User Stories

- Als Nutzer möchte ich mein tägliches Kalorienziel automatisch berechnen lassen (auf Basis von Gewicht, Größe, Alter, Geschlecht und Aktivitätslevel), damit ich einen realistischen Zielwert habe ohne selbst rechnen zu müssen.
- Als Nutzer möchte ich Lebensmittel per Texteingabe suchen und mit Portionsgröße in mein Tagesprotokoll eintragen, damit das Tracken meiner Ernährung schnell und einfach geht.
- Als Nutzer möchte ich verpackte Lebensmittel per Barcode-Scan einlesen, damit ich Produkte aus dem Supermarkt ohne Tipparbeit erfassen kann.
- Als Nutzer möchte ich meine Mahlzeiten in Kategorien (Frühstück, Mittagessen, Abendessen, Snacks) unterteilen, damit ich den Überblick über meine tägliche Ernährung behalte.
- Als Nutzer möchte ich meinen aktuellen Kalorien- und Makro-Stand für den Tag auf einen Blick sehen (kcal, Protein, Kohlenhydrate, Fett — Ziel vs. Ist), damit ich weiß, wie viel ich noch essen kann.
- Als Nutzer möchte ich meinen Kalorien-Fortschritt auf dem Dashboard sehen, damit ich täglich motiviert bleibe mein Ziel zu erreichen.

## Out of Scope

- **Ernährungsplan-Generator** — PRD Non-Goal; die App gibt kein tägliches Menü vor
- **Custom Food (eigenes Lebensmittel anlegen)** — zu komplex für MVP; nur Open Food Facts als Datenquelle
- **Rezept-Manager** (mehrere Zutaten als eine Mahlzeit erfassen) — eigenes Feature, P2
- **Wassertracking** — separates Feature, P2
- **Historien-Ansicht vergangener Tage** — nur das aktuelle Tagesdatum; ältere Daten in DB, UI zeigt nur heute; History-Seite ist P2
- **Gewichtsverlauf-Tracking** — Körpergewicht wird für TDEE-Berechnung gespeichert, aber kein zeitlicher Verlauf in MVP
- **Export (CSV, PDF)** — Out of Scope
- **Foto-basiertes Food Logging (KI)** — nicht in MVP-Tech-Stack
- **Integration mit Fitness-Trackern / Wearables** — PRD Non-Goal
- **Kalorienverbrauch durch Training** — PROJ-5-Sessions werden nicht automatisch auf das Kalorienziel angerechnet; rein ernährungsseitige Berechnung
- **Alkohol / Koffein als eigene Kategorie** — fließen als normale Lebensmittel ein, keine Sonder-Behandlung
- **Körpergewicht-Verlaufskurve / BMI-Chart** — Out of Scope

## Acceptance Criteria

### TDEE-Einrichtung (Kalorienziel)

- [ ] Angenommen ein Nutzer hat noch keine Körperdaten eingetragen, wenn er `/nutrition` aufruft, dann sieht er einen auffälligen "Kalorienziel einrichten"-Banner mit Link zur Setup-Seite, statt eines leeren Fortschrittsbalkens
- [ ] Angenommen der Nutzer öffnet `/nutrition/setup`, dann sieht er ein Formular mit den Feldern: Biologisches Geschlecht, Geburtsjahr, Körpergröße (cm), Körpergewicht (kg), Aktivitätslevel (5 Stufen)
- [ ] Angenommen der Nutzer füllt alle Pflichtfelder aus und speichert, dann wird das Kalorienziel nach Mifflin-St Jeor × Aktivitätsmultiplikator berechnet und gespeichert; der Nutzer wird zu `/nutrition` weitergeleitet
- [ ] Angenommen der Nutzer hat als Fitnessziel "Abnehmen" (aus PROJ-2-Profil) gewählt, dann wird das berechnete TDEE automatisch um 500 kcal reduziert (= ca. 0,5 kg/Woche Defizit)
- [ ] Angenommen der Nutzer hat als Fitnessziel "Muskelaufbau" gewählt, dann wird das TDEE um 300 kcal erhöht
- [ ] Angenommen der Nutzer hat ein anderes Fitnessziel (Fitness verbessern, Kraft steigern), dann wird das TDEE unverändert als Ziel gesetzt
- [ ] Angenommen der Nutzer möchte sein Kalorienziel manuell überschreiben, dann kann er auf der Setup-Seite einen eigenen Wert eintragen, der den berechneten Wert ersetzt
- [ ] Angenommen der Nutzer ändert seine Körperdaten, wenn er `/nutrition/setup` erneut speichert, dann wird das Kalorienziel neu berechnet

### Lebensmittel suchen & eintragen

- [ ] Angenommen der Nutzer ist auf `/nutrition`, wenn er auf „+ Hinzufügen" bei einer Mahlzeiten-Kategorie klickt, dann öffnet sich ein Suchfeld (Texteingabe) für diese Kategorie
- [ ] Angenommen der Nutzer gibt mindestens 3 Zeichen ein, dann werden Suchergebnisse der Open Food Facts API angezeigt (Name, kcal/100g, Marke falls vorhanden) — maximal 10 Ergebnisse
- [ ] Angenommen der Nutzer wählt ein Lebensmittel aus den Suchergebnissen aus, dann erscheint ein Eingabefeld für die Portionsgröße in Gramm (vorausgefüllt mit 100g)
- [ ] Angenommen der Nutzer bestätigt die Portion, dann wird der Eintrag zur entsprechenden Mahlzeiten-Kategorie hinzugefügt; kcal, Protein, Kohlenhydrate und Fett werden proportional zur Portion berechnet
- [ ] Angenommen die Open Food Facts API ist nicht erreichbar, dann wird eine Fehlermeldung angezeigt und der Nutzer kann es erneut versuchen
- [ ] Angenommen ein gefundenes Produkt hat keine Nährwertdaten (kcal = null), dann wird es in den Suchergebnissen markiert ("Keine Nährwerte verfügbar") und kann nicht eingetragen werden

### Barcode-Scanner

- [ ] Angenommen der Nutzer ist auf `/nutrition`, wenn er auf das Kamera-Icon klickt, dann öffnet sich der Barcode-Scanner mit Kamera-Anfrage
- [ ] Angenommen der Nutzer scannt einen gültigen EAN/UPC-Barcode, dann wird das Produkt bei Open Food Facts nachgeschlagen; bei Erfolg erscheint das Produkt direkt zur Portionseingabe
- [ ] Angenommen der Barcode nicht in Open Food Facts gefunden wird, dann erscheint eine Meldung "Produkt nicht gefunden" und der Nutzer kann alternativ per Text suchen
- [ ] Angenommen der Nutzer verweigert die Kamera-Berechtigung oder die Kamera ist nicht verfügbar, dann wird stattdessen ein Textfeld zur manuellen Barcode-Eingabe angezeigt

### Tages-Tagebuch

- [ ] Angenommen der Nutzer öffnet `/nutrition`, dann sieht er vier Mahlzeiten-Sektionen (Frühstück, Mittagessen, Abendessen, Snacks), jeweils mit den eingetragenen Lebensmitteln und einem "+ Hinzufügen"-Button
- [ ] Angenommen Lebensmittel eingetragen sind, dann zeigt jede Mahlzeiten-Sektion die Summe ihrer kcal
- [ ] Angenommen der Nutzer klickt auf einen Tagebuch-Eintrag und bestätigt das Löschen, dann wird der Eintrag entfernt und alle Tagessummen aktualisieren sich sofort
- [ ] Angenommen das Kalorienziel gesetzt ist, dann zeigt die Seite oben einen Fortschrittsbalken: "X / Y kcal" mit Prozentanzeige
- [ ] Angenommen das Kalorienziel gesetzt ist, dann zeigt die Seite vier Makro-Balken (Protein, Kohlenhydrate, Fett) mit Ist- und Zielwert

### Makroziele (abgeleitet)

- [ ] Angenommen das Kalorienziel gesetzt ist, dann werden Makroziele automatisch abgeleitet: Protein = 2 g/kg Körpergewicht; Fett = 25% der kcal / 9; Kohlenhydrate = Rest
- [ ] Angenommen der Nutzer hat seine Makroziele noch nicht bestätigt, dann werden die berechneten Makroziele ohne weitere Eingabe direkt verwendet (keine separate Makroziel-Einrichtung nötig)

### Dashboard-Integration

- [ ] Angenommen der Nutzer hat das Kalorienziel eingerichtet, wenn er das Dashboard (`/`) öffnet, dann sieht er ein kompaktes Kalorien-Widget: Fortschrittsbalken "X / Y kcal heute" mit Klick-Link zu `/nutrition`
- [ ] Angenommen der Nutzer hat noch kein Kalorienziel eingerichtet, dann zeigt das Dashboard kein Kalorien-Widget (kein leeres Widget)

## Edge Cases

- **Open Food Facts API-Timeout:** Suchanfrage nach 5 Sekunden abbrechen; Fehlermeldung anzeigen; Retry-Button
- **Produkt ohne kcal-Angabe:** Eintrag nicht erlaubt — Nutzer wird informiert; Eintrag mit 0 kcal verfälscht die Statistik
- **Portionsgröße 0 oder negativ:** Validierungsfehler, Eingabe blockiert
- **Portionsgröße unrealistisch groß (> 5000g):** Warnung anzeigen, aber Eintrag erlauben (Extremfälle wie Wasserflaschen in ml)
- **Barcode ohne Kamera auf Desktop:** Barcode-Scanner zeigt direkt das Textfeld zur manuellen Eingabe; kein Fehler-Dialog
- **Doppelter Eintrag (gleiche Mahlzeit, gleiches Produkt):** Erlaubt — Nutzer kann dasselbe Produkt mehrfach loggen (z.B. zweiter Kaffee)
- **Nutzer ohne Fitnessziel in Profil:** TDEE wird ohne Anpassung als Kalorienziel gesetzt (Erhaltungskalorien)
- **Geburtsjahr ergibt Alter < 13 oder > 100:** Validierungsfehler bei der Eingabe
- **Gewicht < 30 kg oder > 300 kg:** Validierungsfehler bei der Eingabe
- **Größe < 100 cm oder > 250 cm:** Validierungsfehler bei der Eingabe

## Technical Requirements

- Open Food Facts API-Calls dürfen NICHT im Client-Browser stattfinden (CORS-Probleme); alle API-Calls laufen über eine Next.js API Route als Proxy
- Nutzer-Daten (Nahrungseinträge) sind RLS-geschützt: Nutzer sieht nur eigene Einträge
- Barcode-Scanner: Browser-native BarcodeDetector API (Chrome/Edge) mit Fallback auf manuelle Barcode-Eingabe; kein zusätzliches npm-Paket wenn vermeidbar
- Kalorien- und Makro-Berechnung findet auf dem Server statt (API Route oder Server Action) — kein Vertrauen in Client-Werte
- TDEE-Berechnung: Mifflin-St Jeor Formel (Männlich: 10×kg + 6,25×cm − 5×Alter + 5; Weiblich: −161 statt +5)

## Open Questions

- [ ] Soll es eine Datumswahl im Tagebuch geben (z.B. um vergangene Tage einzusehen)? → Aktuell: nur heute (P2)
- [ ] Sollen Makroziele vom Nutzer manuell angepasst werden können (z.B. Low-Carb)? → Aktuell: automatisch aus TDEE abgeleitet (P2)
- [x] Open Food Facts API: Ist die offizielle API ausreichend für deutsche Lebensmittel, oder soll die `de.openfoodfacts.org`-Instanz genutzt werden? → **Entschieden: `world.openfoodfacts.org` mit `lc=de`** — bessere Gesamtabdeckung

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Kalorien + Makros tracken (nicht nur kcal) | Makros (vor allem Protein) sind für Fitness-Nutzer zentral; Open Food Facts liefert diese Daten kostenlos mit — kein Mehraufwand beim Datenabruf | 2026-06-23 |
| Mahlzeiten-Kategorien (4 feste) statt Flachliste | Standard-Erwartung der Nutzer (MyFitnessPal-Pattern); bessere Übersicht; Implementierung ist marginal aufwändiger | 2026-06-23 |
| Kalorienziel aus TDEE (Mifflin-St Jeor), kein LLM | Regelbasiert wie der restliche MVP; wissenschaftlich anerkannte Formel; kein KI-Aufwand | 2026-06-23 |
| Kalorienziel automatisch ans Fitnessziel anpassen (±kcal) | Vermeidet manuelle Konfiguration für den Nutzer; nutzt bereits vorhandenes `goal`-Feld aus PROJ-2 | 2026-06-23 |
| Makroziele automatisch ableiten (kein eigener Setup-Step) | Extra Konfigurationsschritt erhöht Onboarding-Reibung; Standard-Makros (2g Protein/kg, 25% Fett, Rest Carbs) passen für Fitness-MVP | 2026-06-23 |
| Open Food Facts als einzige Food-Datenbank (kein eigener Aufbau) | PRD-Vorgabe; kostenlos; keine laufenden Kosten | 2026-06-23 |
| API-Proxy in Next.js (kein direkter Browser-Call zu OFF) | Open Food Facts hat kein CORS für direkte Browser-Anfragen; Proxy nötig | 2026-06-23 |
| History nur heute (P2) | Solo-Projekt, MVP-Scope; Hauptwert liegt im täglichen Tracking, nicht in der Analyse vergangener Daten | 2026-06-23 |
| Custom Food Out of Scope für MVP | Erhöht Datenbankaufwand deutlich; Open Food Facts deckt den Großteil verpackter Produkte ab | 2026-06-23 |
| Kalorienverbrauch durch Training NICHT anrechnen | Zu komplex (PROJ-5-Integration, Schätzung MET-Werte pro Übung); potenzielle P2-Erweiterung | 2026-06-23 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Open Food Facts über Next.js API Route (Proxy), kein direkter Browser-Call | Open Food Facts erlaubt keine CORS-Anfragen aus dem Browser; Proxy ist die einzige valide Option | 2026-06-23 |
| Kein npm-Paket für Barcode-Scanner | Browser-native BarcodeDetector API (Chrome/Edge) reicht; kein Bundle-Overhead; Fallback auf manuelle Eingabe für Firefox/Safari | 2026-06-23 |
| `calorie_goal` als berechneter Wert in `profiles` gespeichert | Vermeidet TDEE-Neuberechnung bei jedem Seitenaufruf; einfache Leseoperation statt Rechnung | 2026-06-23 |
| `logFood` empfängt per-100g-Nährwerte vom Client, Proportional-Berechnung auf Server | Client kann Nährwerte nicht fälschen; nur eigene Daten betroffen; server-seitige Berechnung verhindert manipulierte Summen | 2026-06-23 |
| `date`-Feld als DATE (nicht TIMESTAMPTZ) in food_diary_entries | Tagebuch ist datum-basiert; vereinfacht Tagesabfragen; kein Mitternacht-UTC-Problem | 2026-06-23 |
| `world.openfoodfacts.org` mit `lc=de` Parameter | Weltweite Datenbank + deutsche Sprach-Präferenz; besserer Abdeckungsgrad als `de.openfoodfacts.org` | 2026-06-23 |
| TDEE-Logik als pure Utility-Funktionen (src/lib/nutrition/) | Ermöglicht Vitest-Unit-Tests ohne DB-Mocks; gleiche Funktionen für Live-Preview im Client nutzbar | 2026-06-23 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Neue Routen

| Route | Zugriffsschutz | Zweck |
|-------|---------------|-------|
| `/nutrition` | Eingeloggt + Onboarding abgeschlossen | Tages-Tagebuch + Kalorien-/Makro-Fortschritt |
| `/nutrition/setup` | Eingeloggt + Onboarding abgeschlossen | TDEE-Einrichtung (Körperdaten + Aktivitätslevel) |
| `/api/nutrition/search` | Eingeloggt | Next.js API Route: Proxy zu Open Food Facts Textsuche |
| `/api/nutrition/barcode/[barcode]` | Eingeloggt | Next.js API Route: Proxy zu Open Food Facts Barcode-Lookup |

Alle Routen werden durch die bestehende PROJ-2-Middleware automatisch geschützt — kein zusätzlicher Auth-Guard nötig.

---

### Datenbankstruktur

#### Erweiterung: `profiles`-Tabelle
PROJ-6 erweitert die bestehende `profiles`-Tabelle (aus PROJ-2) um folgende Spalten:

| Neue Spalte | Typ | Bedeutung |
|-------------|-----|-----------|
| `height_cm` | Ganzzahl, null erlaubt | Körpergröße in cm |
| `weight_kg` | Dezimalzahl, null erlaubt | Körpergewicht in kg |
| `birth_year` | Ganzzahl, null erlaubt | Geburtsjahr (für Altersberechnung) |
| `biological_sex` | Text (`'male'`/`'female'`), null erlaubt | Für Mifflin-St Jeor Formel |
| `activity_level` | Text (5 Werte), null erlaubt | Aktivitätsmultiplikator für TDEE |
| `calorie_goal` | Ganzzahl, null erlaubt | Gespeichertes Tagesziel in kcal (null = noch nicht eingerichtet) |

Aktivitätslevel-Werte: `sedentary` · `lightly_active` · `moderately_active` · `very_active` · `extra_active`

#### Neue Tabelle: `food_diary_entries`
Eine Zeile pro geloggtem Lebensmittel.

| Feld | Typ | Bedeutung |
|------|-----|-----------|
| `id` | UUID | Primärschlüssel |
| `user_id` | UUID → auth.users | Eigentümer des Eintrags |
| `date` | Datum (YYYY-MM-DD) | Tagebuch-Tag (nicht Uhrzeit) |
| `meal_type` | Text | `breakfast` / `lunch` / `dinner` / `snacks` |
| `food_name` | Text | Produktname (aus Open Food Facts oder manuell) |
| `food_off_id` | Text, null erlaubt | Open Food Facts Barcode/ID; null bei Einträgen ohne OFF-Referenz |
| `serving_g` | Dezimalzahl | Portionsgröße in Gramm |
| `kcal` | Dezimalzahl | Berechnete Kalorien für diese Portion |
| `protein_g` | Dezimalzahl | Berechnetes Protein in g |
| `carbs_g` | Dezimalzahl | Berechnete Kohlenhydrate in g |
| `fat_g` | Dezimalzahl | Berechnetes Fett in g |
| `logged_at` | Zeitstempel | Wann eingetragen |

**RLS:** Nutzer liest und schreibt nur eigene Einträge (`user_id = auth.uid()`).
**Index:** Auf `(user_id, date)` — tägliche Abfragen sind der häufigste Zugriffstyp.

---

### Komponentenstruktur

#### Tages-Tagebuch — `/nutrition`

```
NutritionPage (Server Component — lädt Profile + heutige Einträge aus DB)
│
├── [calorie_goal = null] SetupBanner
│   └── "Kalorienziel einrichten" → Link zu /nutrition/setup
│
├── [calorie_goal gesetzt] DailyProgressSection
│   ├── CalorieProgressBar  →  „X / Y kcal  (Z %)"
│   └── MacroProgressRow
│       ├── MacroBar  Protein   X / Y g
│       ├── MacroBar  Kohlenhydrate  X / Y g
│       └── MacroBar  Fett       X / Y g
│
├── MealSection × 4  (Frühstück / Mittagessen / Abendessen / Snacks)
│   ├── MealHeader  (Label + kcal-Summe der Mahlzeit)
│   ├── FoodEntryRow × N
│   │   ├── Produktname · Portion · kcal
│   │   └── DeleteButton  → AlertDialog  → deleteFood() Server Action
│   └── AddFoodTrigger (Button)  → öffnet FoodSearchSheet für diese Mahlzeit
│
└── FoodSearchSheet (Client Component — shadcn Sheet, slide-in von unten)
    ├── BarcodeButton  → BarcodeScanner
    ├── SearchInput  (3+ Zeichen → GET /api/nutrition/search)
    ├── SearchResultsList
    │   └── SearchResultItem × N  (Name · Marke · kcal/100g)
    │       └── Klick  → PortionStep
    └── PortionStep
        ├── Produktname + Nährwerte pro 100g (Übersicht)
        ├── ServingInput  (Gramm, Standard: 100 g)
        ├── Live-Preview: berechnete kcal + Makros für eingegebene Portion
        └── LogButton  → logFood() Server Action  → revalidatePath('/nutrition')
```

#### TDEE-Setup — `/nutrition/setup`

```
NutritionSetupPage (Server Component — lädt aktuelle Profildaten)
│
└── NutritionSetupForm (Client Component)
    ├── BiologicalSexSelect       Männlich / Weiblich
    ├── BirthYearInput            Jahreszahl (z. B. 1990)
    ├── HeightInput               cm (100–250)
    ├── WeightInput               kg (30–300)
    ├── ActivityLevelSelect       5 Stufen (Sitzend → Sehr aktiv)
    ├── LivePreview               „Berechnetes Kalorienziel: X kcal" (Client-seitig aktualisiert)
    ├── ManualOverrideInput       Optional: eigenes Ziel überschreiben
    └── SaveButton  → saveNutritionSetup() Server Action  → redirect /nutrition
```

#### Barcode-Scanner (Client Component, in FoodSearchSheet eingebettet)

```
BarcodeScanner
├── [BarcodeDetector API verfügbar]
│   ├── Kamera-Permission-Anfrage
│   ├── Video-Vorschau (live stream)
│   └── Erkennungs-Loop  → Treffer: GET /api/nutrition/barcode/[code]  → PortionStep
└── [BarcodeDetector nicht verfügbar  ODER  Kamera verweigert]
    └── ManualBarcodeInput  (Textfeld + „Suchen"-Button  → GET /api/nutrition/barcode/[code])
```

#### Dashboard `/` (erweitert)

```
DashboardPage (Server Component)
│
├── [NEU]  CalorieWidget  (nur wenn calorie_goal gesetzt und workout_sessions table exists)
│   ├── CalorieProgressBar  (kompakt: X / Y kcal heute)
│   └── Link  → /nutrition
│
├── [bestehend] ProgressStatsWidget (PROJ-5)
└── [bestehend] Quick-Links
```

---

### Server Actions

| Action | Aufruf durch | Effekt |
|--------|-------------|--------|
| `saveNutritionSetup(data)` | NutritionSetupForm | Berechnet TDEE + Zielanpassung, speichert 6 Felder in `profiles` |
| `logFood(entry)` | FoodSearchSheet LogButton | Validiert, berechnet Makros proportional, inserted in `food_diary_entries` |
| `deleteFood(entryId)` | FoodEntryRow DeleteButton | Löscht eigenen Eintrag (User-Ownership-Check + RLS) |

**`saveNutritionSetup` — TDEE-Logik:**
1. Mifflin-St Jeor BMR berechnen (geschlechtsabhängig)
2. Mit Aktivitätsmultiplikator multiplizieren → TDEE
3. Fitnessziel aus `profiles.goal` auslesen:
   - `weight_loss` → TDEE − 500 kcal
   - `muscle_gain` → TDEE + 300 kcal
   - `fitness` / `flexibility` / null → TDEE unverändert
4. Falls `calorie_goal_override` eingegeben → dieser Wert ersetzt die Berechnung
5. Ergebnis in `profiles.calorie_goal` speichern

**`logFood` — Makro-Berechnung:**
- Client übermittelt: Produktname, OFF-ID (optional), Nährwerte per 100g, Portionsgröße in g
- Server berechnet: `kcal = kcal_per_100g × serving_g / 100` (analog für Makros)
- Server speichert die absoluten Werte — kein Vertrauen in client-seitig berechnete Summen

---

### API Routes (Open Food Facts Proxy)

#### `GET /api/nutrition/search?q={query}`
- Leitet weiter an: `https://world.openfoodfacts.org/cgi/search.pl?search_terms={q}&action=process&json=1&page_size=10&lc=de`
- Filtert Response: nur Produkte mit vollständigen Nährwerten (kcal > 0)
- Gibt zurück: `{ products: [{ id, name, brand, kcal_100g, protein_100g, carbs_100g, fat_100g }] }`
- Auth: Session aus Supabase-Cookie prüfen (kein anonymer Zugriff)
- Timeout: 5 Sekunden; bei Fehler → HTTP 502 mit `{ error: "API nicht erreichbar" }`

#### `GET /api/nutrition/barcode/[barcode]`
- Leitet weiter an: `https://world.openfoodfacts.org/api/v2/product/{barcode}.json`
- Gibt bei Erfolg das gleiche Produkt-Format zurück
- Bei `status: 0` (nicht gefunden) → HTTP 404

---

### Pure Utility-Funktionen

Untergebracht in `src/lib/nutrition/`:

| Funktion | Input | Output |
|----------|-------|--------|
| `calculateTDEE(weight_kg, height_cm, birth_year, sex, activity_level)` | Körperdaten | `{ bmr, tdee }` |
| `applyGoalAdjustment(tdee, goal)` | TDEE + Fitnessziel | Angepasstes Kalorienziel |
| `deriveMacroTargets(calorie_goal, weight_kg)` | Kalorienziel + Gewicht | `{ protein_g, fat_g, carbs_g }` |
| `calcPortionNutrients(per100g, serving_g)` | Nährwerte/100g + Gramm | Absolute Nährwerte für Portion |

Diese Funktionen sind rein (kein DB-Zugriff) und werden mit Vitest unit-getestet.

---

### Bestehende Komponenten & Pakete

| Komponente / Tool | Verwendung |
|------------------|-----------|
| `shadcn/ui` Sheet | FoodSearchSheet (slide-in Suche) |
| `shadcn/ui` Progress | CalorieProgressBar, MacroBar |
| `shadcn/ui` AlertDialog | Löschen-Bestätigung |
| `shadcn/ui` Input | Suchfeld, Portion, manuelle Barcode-Eingabe |
| `shadcn/ui` Select | Geschlecht, Aktivitätslevel |
| `shadcn/ui` Button, Badge, Separator | Standard-UI-Elemente |
| `lucide-react` | Icons: Camera, Search, Trash2, Flame, Target |
| Supabase Server Client | Alle DB-Abfragen + Server Actions |
| Sonner (Toast) | Feedback nach Eintragen / Löschen |
| Browser BarcodeDetector API | Barcode-Scan (kein npm-Paket) |

**Kein neues npm-Paket notwendig.**

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
