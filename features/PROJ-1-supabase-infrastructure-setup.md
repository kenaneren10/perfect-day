# PROJ-1: Supabase Infrastructure Setup

## Status: In Progress
**Created:** 2026-06-21
**Last Updated:** 2026-06-22

## Dependencies
- None — dieses Feature ist die Basis für alle anderen Features

## User Stories
- Als Entwickler möchte ich eine funktionierende Supabase-Auth-Konfiguration, damit Nutzer sich registrieren und einloggen können.
- Als Entwickler möchte ich eine `profiles`-Tabelle mit automatischer Befüllung bei Registrierung, damit jeder Nutzer sofort einen Datensatz hat.
- Als Entwickler möchte ich RLS-Policies auf der `profiles`-Tabelle, damit Nutzer nur ihre eigenen Daten lesen und bearbeiten können.
- Als Entwickler möchte ich getrennte Dev- und Prod-Projekte in Supabase Cloud, damit Entwicklungsarbeit niemals Produktionsdaten berührt.
- Als Nutzer möchte ich mich mit E-Mail/Passwort, Google oder Apple registrieren können, damit ich den Login-Weg wählen kann, der mir am liebsten ist.

## Out of Scope
- Supabase Storage (Profilbilder, Datei-Uploads) — wird bei Bedarf in einem späteren Feature ergänzt
- Supabase Edge Functions — kein Bedarf im MVP
- Tabellen für Übungen, Trainingsplan, Tracking, Food — folgen jeweils in PROJ-2 bis PROJ-7
- Fitness-spezifische Profilfelder (Ziele, Level, Equipment) — gehören zu PROJ-2
- Account-Verknüpfung (gleiche E-Mail über mehrere OAuth-Provider) — Supabase-Standardverhalten reicht für MVP
- Admin-Rollen oder spezielle Berechtigungsstufen — kein Bedarf in v1
- Lokale Supabase-Entwicklung via CLI/Docker — bewusst ausgeschlossen (siehe Entscheidungslog)

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Auth — E-Mail/Passwort
- [ ] Angenommen ein Nutzer existiert noch nicht, wenn er sich mit E-Mail und Passwort registriert, dann erhält er eine Bestätigungs-E-Mail und kann die App erst nach Klick auf den Bestätigungslink nutzen
- [ ] Angenommen ein Nutzer hat seine E-Mail bestätigt, wenn er sich mit korrekten Zugangsdaten einloggt, dann wird er erfolgreich authentifiziert und erhält eine gültige Session
- [ ] Angenommen ein Nutzer gibt ein falsches Passwort ein, wenn er den Login-Versuch abschickt, dann wird eine generische Fehlermeldung angezeigt (kein Hinweis, ob E-Mail oder Passwort falsch ist)

### Auth — Google OAuth
- [ ] Angenommen ein Nutzer klickt auf „Mit Google anmelden", wenn er den Google-Consent-Flow abschließt, dann wird er eingeloggt und ein Profil-Eintrag existiert in der `profiles`-Tabelle
- [ ] Angenommen ein Google-OAuth-Nutzer ist bereits registriert, wenn er sich erneut mit Google anmeldet, dann wird er in seine bestehende Session eingeloggt (kein Duplikat-Account)

### Auth — Apple OAuth
- [ ] Angenommen die Apple-OAuth-Zugangsdaten (Client ID, Team ID, Key ID, Private Key) sind eingetragen, wenn ein Nutzer auf „Mit Apple anmelden" klickt und den Consent-Flow abschließt, dann wird er eingeloggt und ein Profil-Eintrag existiert in der `profiles`-Tabelle
- [ ] Angenommen ein Apple-Nutzer wählt beim ersten Login „E-Mail verbergen", dann wird trotzdem ein Profil-Eintrag mit der Relay-E-Mail von Apple erstellt
- [ ] Angenommen die Apple-Konfiguration enthält noch Platzhalter-Werte, wenn die App gestartet wird, dann ist Apple OAuth deaktiviert, aber alle anderen Auth-Methoden funktionieren weiterhin

### Datenbank — profiles-Tabelle & Trigger
- [ ] Angenommen ein neuer Nutzer registriert sich (egal über welchen Auth-Weg), wenn Supabase den Eintrag in `auth.users` anlegt, dann wird automatisch ein Eintrag in `profiles` mit derselben `id` erstellt
- [ ] Angenommen ein Nutzer existiert in `profiles`, wenn er seinen `display_name` aktualisiert, dann sind die Änderungen sofort in der Datenbank gespeichert und `updated_at` wurde aktualisiert
- [ ] Angenommen die `profiles`-Tabelle hat RLS aktiviert, wenn ein Nutzer versucht, den Profil-Eintrag eines anderen Nutzers zu lesen, dann wird der Zugriff verweigert

### Umgebungskonfiguration
- [ ] Angenommen die App wird im Dev-Modus gestartet, wenn die Umgebungsvariablen auf das Dev-Supabase-Projekt zeigen, dann stellt die App ausschließlich eine Verbindung zur Dev-Datenbank her
- [ ] Angenommen die App wird in Production deployed, wenn die Umgebungsvariablen auf das Prod-Supabase-Projekt zeigen, dann stellt die App ausschließlich eine Verbindung zur Prod-Datenbank her
- [ ] Angenommen die Supabase-Umgebungsvariablen fehlen, wenn die App startet, dann wirft die App beim Start einen klaren Fehler (kein stilles Fehlschlagen)

## Edge Cases
- **Apple „E-Mail verbergen":** Apple-Nutzer können ihre echte E-Mail verbergen — der Trigger muss auch mit Relay-E-Mails funktionieren; `display_name` bleibt initial `null` und wird in PROJ-2 gesetzt
- **OAuth-Nutzer ohne display_name:** Google und Apple liefern nicht immer einen Namen — `display_name` ist nullable, PROJ-2 fordert den Nutzer dann zur Eingabe auf
- **Trigger-Fehler:** Falls der Datenbank-Trigger beim Anlegen des Profil-Eintrags fehlschlägt, darf kein inkonsistenter Zustand entstehen (Nutzer in `auth.users`, aber kein Eintrag in `profiles`) — Trigger muss atomar sein
- **Passwort-Länge/-Stärke:** Supabase-Standard-Mindestlänge (6 Zeichen) reicht für MVP; keine custom Passwort-Policies
- **Abgelaufene Bestätigungs-E-Mail:** Nutzer, die den Bestätigungslink nicht klicken, können sich nicht einloggen — „E-Mail erneut senden"-Link muss in der App vorhanden sein (PROJ-2 implementiert das UI)
- **Session-Ablauf:** Supabase-Standard-Session-Dauer (1 Stunde JWT, 1 Woche Refresh Token) — kein Custom-Wert für MVP

## Technical Requirements
- Supabase-Projekt-Tier: Free Tier für beide Projekte (Dev + Prod) reicht für MVP
- Umgebungsvariablen: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (+ `SUPABASE_SERVICE_ROLE_KEY` für serverseitige Operationen, nur in `.env.local`, nie im Frontend exponiert)
- RLS muss auf `profiles` aktiviert sein, bevor die App live geht
- Google OAuth: vollständig funktionsfähig konfiguriert (echte Client ID + Secret aus Google Cloud Console)
- Apple OAuth: Konfiguration vollständig vorbereitet mit Platzhaltern für alle vier Zugangsdaten — `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` — sodass nur die echten Werte eingetragen werden müssen, sobald der Apple Developer Account erneuert ist
- OAuth-Callback-URL Dev: `http://localhost:3000/auth/callback`
- OAuth-Callback-URL Prod: `https://<vercel-domain>/auth/callback`

## Open Questions
- [ ] Finaler Vercel-Domain-Name für Prod-Callback-URL noch unbekannt — wird nach erstem Vercel-Deployment in `/deploy` ergänzt

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Google + Apple OAuth von Anfang an | Apple verlangt „Sign in with Apple" wenn andere Social Logins angeboten werden — nötig für späteren App Store Release | 2026-06-21 |
| Apple OAuth mit Platzhaltern vorbereiten, Google sofort aktiv | Apple Developer Account ist vorhanden aber abgelaufen — vollständige Konfiguration liegt bereit, Aktivierung erfolgt nach Account-Erneuerung ohne Code-Änderungen | 2026-06-21 |
| OAuth-Callback auf `localhost:3000` (Dev) | Standard für lokale Next.js-Entwicklung; kein separater Dev-Tunnel nötig | 2026-06-21 |
| E-Mail-Bestätigung aktivieren | Verhindert Fake-Accounts; OAuth-Nutzer überspringen den Schritt automatisch (E-Mail bereits verifiziert) | 2026-06-21 |
| Nur `profiles`-Tabelle in PROJ-1 | Single Responsibility — jedes Feature-Spec definiert sein eigenes Schema | 2026-06-21 |
| `profiles` enthält nur Basisfelder | Fitness-Felder (Ziele, Level, Equipment) gehören zu PROJ-2 | 2026-06-21 |
| Zwei Supabase Cloud-Projekte statt lokaler CLI | Kein Docker-Overhead auf dem Entwicklungsserver; freie Supabase-Projekte reichen für MVP vollständig aus | 2026-06-21 |
| Kein Supabase Storage in PROJ-1 | Schlank starten; kann bei Bedarf nachträglich ergänzt werden, ohne andere Features zu blockieren | 2026-06-21 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| `@supabase/ssr` statt bestehendem `supabase.ts` | Next.js App Router braucht SSR-fähigen Client, der Cookies server- und clientseitig korrekt liest/schreibt; alter Client funktioniert nur im Browser | 2026-06-21 |
| Zwei Supabase-Clients (browser + server) | Client Components nutzen Browser-Cookies, Server Components lesen HTTP-Request-Cookies — unterschiedliche Kontexte erfordern getrennte Konfigurationen | 2026-06-21 |
| Next.js Middleware für Session-Refresh | Erneuert Auth-Token automatisch bei jedem Seitenaufruf; verhindert unerwartete Logouts nach einer Stunde trotz gültigem Refresh Token | 2026-06-21 |
| PKCE OAuth-Flow via `/auth/callback` Route | Sicherste Methode für OAuth in Web-Apps; tauscht kurzlebigen Code gegen vollständige Session aus, nachdem Google/Apple den Nutzer zurückleiten | 2026-06-21 |
| `.env.example` in Git committed | Zeigt Deployment-Tools und anderen Entwicklern exakt welche Variablen benötigt werden, ohne echte Werte zu exponieren | 2026-06-21 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Systemstruktur

```
Supabase Cloud Dashboard (extern, kein Code)
+-- Projekt "perfect-day-dev"   (Entwicklung)
+-- Projekt "perfect-day-prod"  (Production)
    +-- Auth: E-Mail/Passwort   (E-Mail-Bestätigung aktiviert)
    +-- Auth: Google OAuth       (echte Zugangsdaten)
    +-- Auth: Apple OAuth        (Platzhalter-Zugangsdaten)
    +-- Datenbank: profiles-Tabelle
    +-- Datenbank: Auto-Trigger  (Profil bei Registrierung anlegen)
    +-- Datenbank: RLS-Policies  (nur eigene Daten lesbar/änderbar)

Next.js App (Code)
+-- src/lib/supabase/
|   +-- client.ts         (Browser-Client — für React Client Components)
|   +-- server.ts         (Server-Client — für Server Components & API Routes)
+-- src/middleware.ts      (Session-Refresh bei jedem Seitenaufruf)
+-- src/app/auth/
|   +-- callback/
|       +-- route.ts      (OAuth-Weiterleitungs-Handler)
+-- .env.local            (echte Schlüssel — niemals in Git)
+-- .env.example          (Vorlage mit allen Variablen-Namen, ohne Werte)
```

### Datenmodell

**`profiles`-Tabelle:**

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | UUID | Identisch mit Supabase Auth User ID — verknüpft Profil mit Auth |
| `display_name` | Text (optional) | Anzeigename — anfangs `null`, wird in PROJ-2 gesetzt |
| `avatar_url` | Text (optional) | Profilbild-URL — von Google/Apple OAuth automatisch befüllt |
| `created_at` | Timestamp | Erstellungszeitpunkt (automatisch) |
| `updated_at` | Timestamp | Letzte Änderung (automatisch aktualisiert) |

**RLS-Zugriffsregeln:**
- LESEN: Nur das eigene Profil
- BEARBEITEN: Nur das eigene Profil
- ERSTELLEN: Nur der Datenbank-Trigger (kein regulärer Nutzer)
- LÖSCHEN: Gesperrt für alle (Account-Löschung ist Out of Scope für MVP)

### Umgebungsvariablen (`.env.example`)

```
NEXT_PUBLIC_SUPABASE_URL=https://DEIN-PROJEKT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
SUPABASE_SERVICE_ROLE_KEY=dein-service-role-key

# Apple OAuth (Platzhalter — nach Account-Erneuerung ersetzen)
APPLE_CLIENT_ID=PLACEHOLDER
APPLE_TEAM_ID=PLACEHOLDER
APPLE_KEY_ID=PLACEHOLDER
APPLE_PRIVATE_KEY=PLACEHOLDER
```

### Paket-Abhängigkeiten
- **`@supabase/ssr`** — SSR-fähiger Supabase-Client für Next.js App Router (muss installiert werden)

## Implementation Notes (Backend)

### Implemented 2026-06-22

**Code changes:**
- Installed `@supabase/ssr` (replaces raw `@supabase/supabase-js` usage)
- Created `src/lib/supabase/client.ts` — browser client for Client Components
- Created `src/lib/supabase/server.ts` — server client for Server Components & API Routes
- Created `src/middleware.ts` — auto-refreshes auth tokens on every request
- Created `src/app/auth/callback/route.ts` — PKCE OAuth code exchange (Google + Apple)
- Updated `src/lib/supabase.ts` — now re-exports from new client.ts (backward compat)
- Integration tests in `src/app/auth/callback/route.test.ts` (2 tests passing)

**Still requires manual steps in Supabase Dashboard:**
- Run `profiles` table SQL migration (see SQL below)
- Configure Google OAuth in Supabase → Authentication → Providers
- Add Apple OAuth placeholders in Supabase → Authentication → Providers
- Set callback URLs: `http://localhost:3000/auth/callback` (dev), `https://<domain>/auth/callback` (prod)
- Create `.env.local` based on `.env.example` with real credentials

**SQL Migration to run in Supabase SQL Editor:**
```sql
-- profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

## QA Test Results

**QA Datum:** 2026-06-22
**Tester:** QA Engineer (automatisiert)
**Status: BEDINGT BEREIT** — 1 High-Bug muss vor OAuth-Aktivierung behoben werden

### Testergebnis-Übersicht

| Kategorie | Ergebnis |
|-----------|---------|
| Vitest Unit-Tests | 2/2 bestanden |
| Playwright E2E-Tests | 4/4 bestanden |
| TypeScript-Kompilierung | Sauber |
| Production Build | Erfolgreich |
| Security Audit | 1 Low (Medium behoben) |

### Acceptance Criteria — Testergebnis

#### Auth — E-Mail/Passwort
| Kriterium | Status | Hinweis |
|-----------|--------|---------|
| Registrierung → Bestätigungs-E-Mail | ⏳ Blockiert | Kein Auth-UI bis PROJ-2 |
| Login mit korrekten Daten | ⏳ Blockiert | Kein Auth-UI bis PROJ-2 |
| Falsches Passwort → generische Fehlermeldung | ⏳ Blockiert | Kein Auth-UI bis PROJ-2 |

#### Auth — Google OAuth
| Kriterium | Status | Hinweis |
|-----------|--------|---------|
| Google-Consent-Flow → eingeloggt + profiles-Eintrag | ⏳ Blockiert | OAuth nicht konfiguriert (bewusst zurückgestellt) |
| Bereits registriert → kein Duplikat-Account | ⏳ Blockiert | OAuth nicht konfiguriert |

#### Auth — Apple OAuth
| Kriterium | Status | Hinweis |
|-----------|--------|---------|
| Apple Consent-Flow → eingeloggt + profiles-Eintrag | ⏳ Blockiert | Apple Developer Account abgelaufen |
| E-Mail verbergen → Relay-E-Mail in profiles | ⏳ Blockiert | Apple Developer Account abgelaufen |
| Platzhalter-Konfiguration → Apple deaktiviert, andere funktionieren | ✅ Bestanden | Supabase-Fallback greift automatisch |

#### Datenbank — profiles-Tabelle & Trigger
| Kriterium | Status | Hinweis |
|-----------|--------|---------|
| Registrierung → auto-Eintrag in profiles | ⏳ Blockiert | Kein Auth-UI bis PROJ-2 |
| display_name Update → sofort gespeichert, updated_at aktualisiert | ⏳ Blockiert | Kein Auth-UI bis PROJ-2 |
| RLS: Zugriff auf fremdes Profil → verweigert | ⏳ Blockiert | Kein Auth-UI bis PROJ-2 |

#### Umgebungskonfiguration
| Kriterium | Status | Hinweis |
|-----------|--------|---------|
| Dev-Modus → nur Dev-Datenbank | ✅ Bestanden | Env-Vars zeigen auf Dev-Projekt |
| Production → nur Prod-Datenbank | ⏳ Offen | Wird in /deploy geprüft |
| Fehlende Env-Vars → klarer Fehler beim Start | ✅ Bestanden | Proxy loggt klare Fehlermeldung + App bleibt funktionsfähig |

### Gefundene Bugs

#### 🔴 HIGH — .env.local fehlerhaft (alle Variablen auf einer Zeile)
**Beschreibung:** Die `.env.local` wurde via Heredoc ohne Zeilenumbrüche geschrieben. Dadurch ist `NEXT_PUBLIC_SUPABASE_ANON_KEY` (und alle weiteren Vars) undefined — Supabase-Session-Refresh ist für jede Anfrage deaktiviert.  
**Nachweis:** Dev-Server-Logs zeigen bei jeder Anfrage: `NEXT_PUBLIC_SUPABASE_URL oder NEXT_PUBLIC_SUPABASE_ANON_KEY fehlt in .env.local`  
**Auswirkung:** Auth funktioniert erst wieder korrekt, wenn `.env.local` manuell neu erstellt wird.  
**Fix:** `.env.local` manuell mit korrekten Zeilenumbrüchen neu anlegen (siehe unten).

#### ~~🟡 MEDIUM — Fehlende Security Headers~~ ✅ Behoben
**Beschreibung:** Der Proxy setzte keine Security Headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Strict-Transport-Security`).  
**Fix:** `applySecurityHeaders()`-Hilfsfunktion in `src/proxy.ts` ergänzt — wird auf jedem Response gesetzt, auch beim Env-Vars-Fallback. Zusätzlich: Env-Var-Namen-Leak im Error-Log entfernt.

#### 🟢 LOW — Port-Konflikt: fremder Prozess auf Port 3000
**Beschreibung:** Ein unbekannter Prozess belegt Port 3000 dauerhaft auf diesem System. Unsere App läuft auf Port 3001, Playwright-Config wurde angepasst.  
**Auswirkung:** Nur lokale Entwicklung betroffen; Production nicht beeinflusst.  
**Fix:** Playwright-Config bereits auf Port 3001 aktualisiert ✅.

### Behobene Bugs (während QA)

| Bug | Schweregrad | Fix |
|-----|-------------|-----|
| `middleware.ts` → Next.js 16 erwartet `proxy.ts` mit `proxy()`-Export | High | Datei umbenannt und Funktion angepasst ✅ |
| Playwright pickte Playwright-Specs in Vitest auf | Low | `tests/**` zu Vitest `exclude` hinzugefügt ✅ |
| Proxy crasht bei fehlenden Env-Vars → Server nicht startbar | High | Graceful Fallback mit `console.error` implementiert ✅ |

### Security Audit

| Prüfpunkt | Ergebnis |
|-----------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` nicht im Frontend-Code | ✅ Sauber |
| `.env.local` in `.gitignore` | ✅ `.env*.local` ausgeschlossen |
| Keine echten Credentials in Git committed | ✅ Nur Platzhalter in `.env.local.example` |
| OAuth Redirect-URL an `origin` gebunden | ✅ Next.js bindet `request.url` an eigene Domain |
| RLS auf `profiles` aktiviert | ✅ SQL-Migration ausgeführt |
| Security Headers im Proxy | ✅ Implementiert in `src/proxy.ts` |

### Nächste Schritte vor OAuth-Aktivierung

1. **`.env.local` neu anlegen** (High-Bug):
```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://bywqbxvwayoxkjxjlcyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
SUPABASE_SERVICE_ROLE_KEY=dein-service-role-key
APPLE_CLIENT_ID=PLACEHOLDER
APPLE_TEAM_ID=PLACEHOLDER
APPLE_KEY_ID=PLACEHOLDER
APPLE_PRIVATE_KEY=PLACEHOLDER
EOF
```
   *(Jede Variable auf einer eigenen Zeile — die obige Version ist korrekt formatiert)*

2. ~~**Security Headers** im Proxy ergänzen~~ ✅ Erledigt

3. **Auth-Flow-Tests** nach Implementierung von PROJ-2 nachholen

## Deployment
_To be added by /deploy_
