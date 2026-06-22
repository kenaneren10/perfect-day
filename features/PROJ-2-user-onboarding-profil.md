# PROJ-2: User Onboarding & Profil (Ziele, Level, Equipment)

## Status: Architected
**Created:** 2026-06-22
**Last Updated:** 2026-06-22

## Dependencies
- Requires: PROJ-1 (Supabase Infrastructure Setup) — Auth, profiles-Tabelle, RLS-Policies

## User Stories
- Als neuer Nutzer möchte ich nach der Registrierung durch einen kurzen Onboarding-Flow geführt werden, damit die App sofort auf mein Niveau und meine Ziele zugeschnitten ist.
- Als Nutzer möchte ich meinen Anzeigenamen festlegen, damit die App mich persönlich ansprechen kann.
- Als Nutzer möchte ich mein primäres Fitnessziel auswählen, damit der Trainingsplan auf dieses Ziel ausgerichtet ist.
- Als Nutzer möchte ich mein aktuelles Fitnesslevel angeben, damit die Schwierigkeit der Übungen meiner Erfahrung entspricht.
- Als Nutzer möchte ich mein verfügbares Equipment angeben, damit ich nur Übungen sehe, die ich auch durchführen kann.
- Als eingeloggter Nutzer möchte ich meine Profil-Angaben jederzeit auf der Profil-Seite anpassen können.
- Als Nutzer ohne bestätigte E-Mail möchte ich die Bestätigungs-E-Mail erneut anfordern können, wenn ich sie verpasst habe.

## Out of Scope
- Profilbild hochladen — erfordert Supabase Storage (Erweiterung nach MVP); `avatar_url` aus OAuth wird aber bereits angezeigt
- Körperdaten (Größe, Gewicht, BMI) — semantisch zum Kalorienrechner gehörig; PROJ-6 erweitert das Profil um diese Felder
- Mehrere Fitnessziele gleichzeitig — ein primäres Ziel reicht für regelbasierten Trainingsplan (PROJ-4)
- Account-Löschung — Out of Scope für v1 (PRD Non-Goals)
- E-Mail-Adresse ändern — zu komplex für MVP; OAuth-Nutzer haben ohnehin keine klassische E-Mail-Änderungsoption
- Passwort ändern — über Supabase-Standard-Reset-Flow; separates Feature wenn nötig
- Soziale Profil-Features (öffentliches Profil, folgen) — kein Social-Feed in v1 (PRD Non-Goals)
- OAuth-Provider verknüpfen/trennen — Supabase-Standardverhalten reicht für MVP
- „Passwort vergessen"-Flow — kann per Supabase Dashboard ausgelöst werden; UI-Implementation später

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Auth UI — Login & Registrierung

- [ ] Angenommen ein Besucher ist nicht eingeloggt, wenn er eine geschützte Seite aufruft, dann wird er zur Login-Seite weitergeleitet
- [ ] Angenommen ein Besucher ist auf der Login-Seite, wenn er auf „Konto erstellen" klickt, dann sieht er ein Registrierungsformular (E-Mail + Passwort)
- [ ] Angenommen ein Nutzer gibt eine gültige E-Mail und ein Passwort (min. 6 Zeichen) ein, wenn er das Registrierungsformular abschickt, dann wird eine Bestätigungs-E-Mail gesendet und er sieht eine Hinweisseite mit Instruktionen
- [ ] Angenommen ein Nutzer gibt eine ungültige E-Mail oder ein zu kurzes Passwort ein, wenn er das Formular abschickt, dann wird für jedes fehlerhafte Feld eine Fehlermeldung direkt unter dem Feld angezeigt
- [ ] Angenommen ein Nutzer versucht sich mit einer bereits registrierten E-Mail zu registrieren, wenn er das Formular abschickt, dann wird eine generische Fehlermeldung angezeigt (kein Hinweis ob E-Mail oder Passwort das Problem ist)
- [ ] Angenommen ein Nutzer ist auf der E-Mail-Hinweisseite, wenn er auf „Bestätigungs-E-Mail erneut senden" klickt, dann wird die E-Mail erneut gesendet und eine kurze Bestätigungsmeldung angezeigt
- [ ] Angenommen ein Nutzer klickt auf den Bestätigungslink in seiner E-Mail, dann wird er eingeloggt und direkt zum Onboarding-Flow weitergeleitet
- [ ] Angenommen ein bereits registrierter Nutzer gibt korrekte Zugangsdaten ein, wenn er das Login-Formular abschickt, dann wird er eingeloggt und zum Dashboard (oder Onboarding, falls noch nicht abgeschlossen) weitergeleitet
- [ ] Angenommen ein Nutzer gibt ein falsches Passwort ein, wenn er das Login-Formular abschickt, dann wird eine generische Fehlermeldung angezeigt
- [ ] Angenommen ein Nutzer klickt auf „Mit Google anmelden", wenn er den Google-Consent-Flow abschließt, dann wird er eingeloggt und — bei erstem Login — zum Onboarding weitergeleitet
- [ ] Angenommen ein Nutzer klickt auf „Mit Apple anmelden" und Apple OAuth ist konfiguriert, wenn er den Apple-Consent-Flow abschließt, dann wird er eingeloggt und — bei erstem Login — zum Onboarding weitergeleitet
- [ ] Angenommen Apple OAuth enthält Platzhalter-Credentials, wenn die Login-Seite geladen wird, dann ist der Apple-Button nicht sichtbar (kein Crash, kein defekter Button)

### Onboarding-Flow — neue Nutzer

- [ ] Angenommen ein Nutzer hat das Onboarding noch nicht abgeschlossen (`onboarding_completed = false`), wenn er eine beliebige App-Seite aufruft, dann wird er zum Onboarding weitergeleitet
- [ ] Angenommen ein Nutzer hat das Onboarding bereits abgeschlossen, wenn er die Onboarding-URL direkt aufruft, dann wird er zum Dashboard weitergeleitet
- [ ] Angenommen ein Nutzer ist in Schritt 1 (Name), wenn sein OAuth-Provider einen Namen geliefert hat, dann ist das Namensfeld bereits mit dem OAuth-Namen vorausgefüllt
- [ ] Angenommen ein Nutzer ist in Schritt 1 (Name), wenn er das Feld leer lässt und auf „Weiter" klickt, dann wird eine Validierungsfehlermeldung angezeigt (Name ist Pflichtfeld)
- [ ] Angenommen ein Nutzer gibt einen Namen ein, wenn er auf „Weiter" klickt, dann gelangt er zu Schritt 2 (Fitnessziel)
- [ ] Angenommen ein Nutzer ist in Schritt 2 (Fitnessziel), wenn er eine Option auswählt (Gewicht verlieren / Muskeln aufbauen / Fitness & Ausdauer / Beweglichkeit steigern), dann gelangt er zu Schritt 3 (Fitnesslevel)
- [ ] Angenommen ein Nutzer ist in Schritt 3 (Fitnesslevel), wenn er ein Level auswählt (Einsteiger / Fortgeschrittener / Profi), dann gelangt er zu Schritt 4 (Equipment)
- [ ] Angenommen ein Nutzer ist in Schritt 4 (Equipment), wenn er eine Option auswählt (Ohne Equipment / Basis-Equipment / Vollausrüstung) und auf „Loslegen" klickt, dann werden alle Profil-Daten gespeichert, `onboarding_completed` auf `true` gesetzt und er wird zum Dashboard weitergeleitet
- [ ] Angenommen ein Netzwerkfehler tritt beim Abschließen des Onboardings auf, wenn der Nutzer auf „Loslegen" klickt, dann bleibt er auf Schritt 4 und sieht eine Fehlermeldung mit der Möglichkeit es erneut zu versuchen
- [ ] Angenommen ein Nutzer ist auf einem beliebigen Onboarding-Schritt, wenn er auf „Zurück" klickt, dann gelangt er zum vorherigen Schritt und seine bisherigen Eingaben bleiben erhalten

### Profil-Seite — bestehende Nutzer

- [ ] Angenommen ein eingeloggter Nutzer ruft die Profil-Seite auf, dann sieht er seinen Anzeigenamen, sein Fitnessziel, sein Fitnesslevel und sein Equipment
- [ ] Angenommen ein Nutzer hat ein `avatar_url` aus OAuth, wenn er die Profil-Seite aufruft, dann wird das Profilbild angezeigt
- [ ] Angenommen ein Nutzer ändert eine Profil-Angabe, wenn er auf „Speichern" klickt, dann werden die Änderungen sofort in der Datenbank gespeichert und eine Erfolgsmeldung angezeigt
- [ ] Angenommen ein nicht eingeloggter Nutzer versucht die Profil-Seite aufzurufen, dann wird er zur Login-Seite weitergeleitet
- [ ] Angenommen ein Nutzer klickt auf „Abmelden", dann wird seine Session beendet und er wird zur Login-Seite weitergeleitet

## Edge Cases
- **OAuth-Nutzer ohne Namen:** Wenn Google/Apple keinen Namen liefert, ist das Namensfeld in Schritt 1 leer — Nutzer muss einen Namen eingeben (Pflichtfeld)
- **Abgebrochenes Onboarding:** Browser wird mitten im Flow geschlossen → `onboarding_completed` bleibt `false` → nächster Login startet den Flow von Schritt 1 an (kein Schritt-Persistierung in MVP)
- **Session-Ablauf während Onboarding:** Läuft die Session ab (sehr unwahrscheinlich), wird der Nutzer zur Login-Seite weitergeleitet; nach erneutem Login landet er wieder im Onboarding
- **Gleichzeitige Profil-Änderung auf mehreren Geräten:** Letzter Speichervorgang gewinnt (Last-Write-Wins) — kein Konfliktmanagement für MVP
- **Apple OAuth deaktiviert (Platzhalter):** Apple-Button wird nicht gerendert — kein sichtbarer Fehler
- **E-Mail-Bestätigungslink abgelaufen:** Supabase sendet standardmäßig nach 24h ab; Nutzer kann über die Hinweisseite eine neue E-Mail anfordern

## Technical Requirements
- Authentifizierungscheck via Supabase Server Client in allen geschützten Routes (kein reiner Client-side Guard)
- Onboarding-Redirect-Logik auf Server-Seite (Middleware oder Server Component) — kein Flash des geschützten Inhalts
- Keine persönlichen Nutzerdaten in URL-Parametern
- `profiles`-Tabelle wird um Felder erweitert: `display_name` (bereits vorhanden), `goal`, `fitness_level`, `equipment`, `onboarding_completed`

## Open Questions
- [ ] Soll ein Avatar-Profilbild aus OAuth (`avatar_url`) auf der Profil-Seite angezeigt werden, auch wenn kein Upload möglich ist? (Empfehlung: ja — zeigt vorhandene Daten; Upload-Feature ist Out of Scope)
- [ ] Soll eine Profil-Änderung (z.B. Equipment) den Trainingsplan automatisch zurücksetzen? (betrifft PROJ-4 — offen bis PROJ-4 spezifiziert ist)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| 4-stufiger Onboarding-Flow (Name → Ziel → Level → Equipment) | Ein Thema pro Schritt verhindert Überwältigung; passt zur PRD-Zielgruppe (Einsteiger brauchen klare Orientierung) | 2026-06-22 |
| Genau ein Fitnessziel pro Nutzer | Klare Ausrichtung für regelbasierten Trainingsplan (PROJ-4); mehrere Ziele erfordern Gewichtung und Komplexität außerhalb des MVP-Scopes | 2026-06-22 |
| 4 Fitnessziele: Gewicht verlieren, Muskeln aufbauen, Fitness & Ausdauer, Beweglichkeit steigern | Deckt ~95% der Privatnutzer-Motivationen ab; erweiterbar über `/refine` | 2026-06-22 |
| 3 Fitness-Level: Einsteiger / Fortgeschrittener / Profi | Einfach genug für Selbsteinschätzung; ausreichend granular für regelbasierten Trainingsplan | 2026-06-22 |
| 3 Equipment-Stufen: Ohne Equipment / Basis / Vollausrüstung | Bodyweight-Training, Heimtraining mit Hanteln/Bändern, Gym — deckt alle realistischen Setups ab | 2026-06-22 |
| Körperdaten (Größe, Gewicht) nicht in PROJ-2 | Feature heißt explizit „Ziele, Level, Equipment"; Körperdaten gehören semantisch zum Kalorienrechner (PROJ-6) | 2026-06-22 |
| Onboarding-Daten nur bei Abschluss (Schritt 4) gespeichert | Vereinfacht Datenbanklogik; kein Schritt-für-Schritt-Persistierung für MVP | 2026-06-22 |
| Auth-UI (Login/Register) ist Teil von PROJ-2 | PROJ-1 lieferte nur die Infrastruktur; Login/Register-Screens sind der Einstiegspunkt zum Onboarding und gehören funktional zusammen | 2026-06-22 |
| `display_name` ist Pflichtfeld im Onboarding | Notwendig für personalisierte Ansprache im Dashboard und späteren Features | 2026-06-22 |
| „Zurück"-Button im Onboarding (MVP) | Klare UX-Anforderung; geringe Implementierungskosten mit In-Memory-State | 2026-06-22 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| `onboarding_completed` in Supabase Auth user_metadata (nicht nur in profiles) | User-Metadata ist im JWT eingebettet — Middleware kann den Status ohne extra Datenbankabfrage lesen; verhindert Latenz auf jeder Seite | 2026-06-22 |
| Zugriffsschutz ausschließlich in Middleware (`src/proxy.ts`) | Einzige zentrale Stelle für alle Redirect-Regeln; läuft serverseitig vor dem Rendering — kein Flash des falschen Inhalts möglich | 2026-06-22 |
| Onboarding als Single-Page Multi-Step (eine URL `/onboarding`, clientseitiger Step-State) | Nutzer können Schritt-für-Schritt navigieren ohne URL-Wechsel; einfacher als separate Routen pro Schritt | 2026-06-22 |
| Server Actions für Formular-Übermittlungen (kein separates API-Route-File) | Next.js 15 Server Actions erlauben serverseitige Verarbeitung direkt aus Komponenten; kein extra `src/app/api/`-Boilerplate für MVP | 2026-06-22 |
| `/auth/callback` bleibt unverändert, leitet immer auf `/` um | Saubere Trennung: Callback tauscht Code gegen Session; Middleware entscheidet danach, wohin der Nutzer gehört | 2026-06-22 |
| Kein neues Paket erforderlich | shadcn/ui, zod, react-hook-form und @hookform/resolvers sind bereits installiert; alle nötigen shadcn-Komponenten bereits in `src/components/ui/` vorhanden | 2026-06-22 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Seitenstruktur (Routen)

Neue Seiten, die PROJ-2 hinzufügt:

| Route | Zugriffsschutz | Zweck |
|-------|---------------|-------|
| `/login` | Öffentlich | Login (E-Mail/Passwort + Social Buttons) |
| `/register` | Öffentlich | Registrierung (E-Mail/Passwort) |
| `/auth/confirm-pending` | Öffentlich | Hinweisseite nach Registrierung (E-Mail bestätigen) |
| `/auth/callback` | Öffentlich | Bereits vorhanden — tauscht OAuth-Code gegen Session |
| `/onboarding` | Nur eingeloggt + Onboarding offen | 4-Schritt-Onboarding-Flow |
| `/profile` | Nur eingeloggt + Onboarding abgeschlossen | Profil ansehen und bearbeiten |
| `/` (Dashboard) | Nur eingeloggt + Onboarding abgeschlossen | Platzhalter — wird in PROJ-4/5 ausgebaut |

---

### Zugriffsschutz-System (Middleware)

Die bestehende Middleware (`src/proxy.ts`) wird um Redirect-Regeln erweitert. Bei **jedem** Seitenaufruf prüft sie:

```
Anfrage kommt rein
  │
  ├─ Route ist öffentlich (/login, /register, /auth/*)
  │     └─ Durchlassen (keine Prüfung)
  │
  ├─ Nutzer ist NICHT eingeloggt
  │     └─ → Weiterleitung zu /login
  │
  ├─ Nutzer ist eingeloggt, onboarding_completed = false
  │     └─ → Weiterleitung zu /onboarding
  │         (außer: Nutzer ist bereits auf /onboarding → Durchlassen)
  │
  └─ Nutzer ist eingeloggt, onboarding_completed = true
        ├─ Ruft /onboarding auf → Weiterleitung zu /
        └─ Alles andere → Durchlassen
```

**Woher kommt `onboarding_completed`?** Es wird im Supabase Auth user_metadata gespeichert (im JWT eingebettet). Die Middleware liest es direkt aus der Session — **kein extra Datenbankaufruf** pro Request.

---

### Datenmodell — Erweiterung der `profiles`-Tabelle

Die bestehende Tabelle aus PROJ-1 bekommt 4 neue Spalten:

| Neues Feld | Wertebereich | Bedeutung |
|-----------|-------------|----------|
| `goal` | `weight_loss` \| `muscle_gain` \| `fitness` \| `flexibility` | Primäres Fitnessziel des Nutzers |
| `fitness_level` | `beginner` \| `intermediate` \| `advanced` | Selbsteingeschätztes Erfahrungslevel |
| `equipment` | `none` \| `basic` \| `full` | Verfügbares Equipment |
| `onboarding_completed` | `true` \| `false` (Standard: `false`) | Ob der Onboarding-Flow abgeschlossen wurde |

**Bestehende Felder** bleiben unverändert: `id`, `display_name`, `avatar_url`, `created_at`, `updated_at`.

**Doppelte Speicherung von `onboarding_completed`:** Sowohl in `profiles` (als Quelle der Wahrheit) als auch in Supabase `user_metadata` (für schnellen Middleware-Zugriff ohne DB-Call). Beim Abschluss des Onboardings werden beide gleichzeitig gesetzt.

**RLS:** Die bestehenden Policies aus PROJ-1 decken alle neuen Felder ab (Nutzer kann nur eigenes Profil lesen/schreiben) — keine neuen Policies nötig.

---

### Komponentenstruktur

#### Login-Seite (`/login`)
```
LoginPage (Server Component — leitet eingeloggte Nutzer weiter)
└── LoginForm (Client Component)
    ├── Input: E-Mail
    ├── Input: Passwort
    ├── Button: "Einloggen"
    ├── Separator: "oder"
    ├── Button: "Mit Google anmelden"
    ├── Button: "Mit Apple anmelden" (nur wenn Apple OAuth konfiguriert)
    └── Link → /register ("Noch kein Konto?")
```

#### Registrierungs-Seite (`/register`)
```
RegisterPage (Server Component — leitet eingeloggte Nutzer weiter)
└── RegisterForm (Client Component)
    ├── Input: E-Mail
    ├── Input: Passwort (min. 6 Zeichen)
    ├── Button: "Konto erstellen"
    └── Link → /login ("Bereits registriert?")
```

#### E-Mail-Bestätigungs-Hinweisseite (`/auth/confirm-pending`)
```
ConfirmPendingPage (Server Component)
├── Icon + Titel: "E-Mail bestätigen"
├── Text: Instruktionen (Link in E-Mail klicken)
├── ResendButton (Client Component)
│   └── Button: "Bestätigungs-E-Mail erneut senden"
└── Link → /login ("Zurück zum Login")
```

#### Onboarding-Flow (`/onboarding`)
```
OnboardingPage (Server Component — prüft Auth + liest display_name aus OAuth)
└── OnboardingFlow (Client Component — verwaltet aktuellen Schritt + alle Eingaben im Speicher)
    ├── Fortschrittsanzeige (Schritt X von 4)
    │
    ├── Schritt 1: Name
    │   ├── Input: Anzeigename (vorausgefüllt mit OAuth-Name wenn vorhanden)
    │   └── Button: "Weiter"
    │
    ├── Schritt 2: Fitnessziel
    │   ├── AuswahlKarte: "Gewicht verlieren" (Icon + Kurzbeschreibung)
    │   ├── AuswahlKarte: "Muskeln aufbauen"
    │   ├── AuswahlKarte: "Fitness & Ausdauer"
    │   ├── AuswahlKarte: "Beweglichkeit steigern"
    │   └── Button: "Zurück"
    │
    ├── Schritt 3: Fitnesslevel
    │   ├── AuswahlKarte: "Einsteiger" (0–6 Monate Erfahrung)
    │   ├── AuswahlKarte: "Fortgeschrittener" (6–24 Monate)
    │   ├── AuswahlKarte: "Profi" (24+ Monate)
    │   └── Button: "Zurück"
    │
    └── Schritt 4: Equipment
        ├── AuswahlKarte: "Ohne Equipment" (Bodyweight)
        ├── AuswahlKarte: "Basis-Equipment" (Kurzhanteln, Bänder)
        ├── AuswahlKarte: "Vollausrüstung" (Fitnessstudio)
        ├── Button: "Zurück"
        └── Button: "Loslegen" (speichert alle Daten, leitet zu / weiter)
```

#### Profil-Seite (`/profile`)
```
ProfilePage (Server Component — lädt aktuelles Profil aus DB)
├── ProfilKopf
│   ├── Avatar (aus avatar_url oder Initialen-Fallback)
│   └── Anzeigename
└── ProfileForm (Client Component — bearbeitbare Version des Onboarding-Inhalts)
    ├── Input: Anzeigename
    ├── AuswahlGruppe: Fitnessziel (gleiche Karten wie Onboarding Schritt 2)
    ├── AuswahlGruppe: Fitnesslevel (gleiche Karten wie Schritt 3)
    ├── AuswahlGruppe: Equipment (gleiche Karten wie Schritt 4)
    ├── Button: "Speichern" + Erfolgsmeldung (sonner toast)
    └── Button: "Abmelden"
```

---

### Datenfluss

**Neue Registrierung (E-Mail/Passwort):**
1. Nutzer füllt `/register` aus → Supabase sendet Bestätigungs-E-Mail
2. Nutzer landet auf `/auth/confirm-pending`
3. Nutzer klickt Link in E-Mail → `/auth/callback` tauscht Code gegen Session
4. Callback leitet auf `/` um → Middleware erkennt `onboarding_completed = false` → leitet auf `/onboarding` um

**OAuth-Login (Google/Apple):**
1. Nutzer klickt Social Button auf `/login` → Supabase startet OAuth-Flow
2. Provider leitet auf `/auth/callback` → Session wird gesetzt
3. Callback leitet auf `/` um → Middleware entscheidet (Onboarding oder Dashboard)

**Onboarding abschließen:**
1. Nutzer füllt alle 4 Schritte aus, klickt „Loslegen"
2. Server Action schreibt alle Felder in `profiles` + setzt `onboarding_completed = true` in `user_metadata`
3. Weiterleitung auf `/` (Dashboard-Platzhalter)

**Profil bearbeiten:**
1. Server Action aktualisiert geänderte Felder in `profiles`
2. Toast-Benachrichtigung: „Gespeichert"

---

### Bestehende Komponenten & Pakete (alle bereits vorhanden)

| Komponente / Paket | Verwendung in PROJ-2 |
|-------------------|---------------------|
| `shadcn/ui` Button | Alle Buttons |
| `shadcn/ui` Input | Name-Eingabe, E-Mail, Passwort |
| `shadcn/ui` Card | Auswahlkarten im Onboarding |
| `shadcn/ui` Avatar | Profilbild auf der Profil-Seite |
| `shadcn/ui` Separator | Trennlinie zwischen E-Mail-Login und Social Buttons |
| `shadcn/ui` Sonner (Toast) | Erfolgsmeldung nach Profil-Speichern |
| `zod` | Formular-Validierung (E-Mail, Passwort, Name) |
| `react-hook-form` | Formularsteuerung (Login, Register, Profil) |
| `src/lib/supabase/client.ts` | Client-seitige Auth-Calls (Social Login) |
| `src/lib/supabase/server.ts` | Server-seitige Profil-Reads in Server Components |

**Kein neues Paket notwendig.**

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
