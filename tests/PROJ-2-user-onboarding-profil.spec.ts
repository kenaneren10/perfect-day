import { test, expect } from '@playwright/test'

// PROJ-2: User Onboarding & Profil
// Authenticated tests require TEST_USER_EMAIL + TEST_USER_PASSWORD env vars
// and a user who has already completed onboarding.
// Unauthenticated + structural tests run against any environment.

// ── Auth UI: Unauthenticated Redirects ───────────────────────────────────

test.describe('Zugangsschutz — Nicht eingeloggter Nutzer', () => {
  test('GET /profile → Redirect zur Login-Seite', async ({ page }) => {
    await page.goto('/profile')
    await expect(page).toHaveURL('/login')
  })

  test('GET /onboarding → Redirect zur Login-Seite', async ({ page }) => {
    await page.goto('/onboarding')
    await expect(page).toHaveURL('/login')
  })

  test('GET / → Redirect zur Login-Seite', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/login')
  })
})

// ── Auth UI: Login-Seite ─────────────────────────────────────────────────

test.describe('Login-Seite (/login)', () => {
  test('Login-Seite ist öffentlich erreichbar', async ({ page }) => {
    const response = await page.goto('/login')
    expect(response?.status()).toBeLessThan(400)
    await expect(page).toHaveURL('/login')
  })

  test('Login-Seite zeigt App-Name "Perfect Day"', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Perfect Day')).toBeVisible()
  })

  test('Login-Seite enthält E-Mail- und Passwort-Felder', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel('E-Mail')).toBeVisible()
    await expect(page.getByLabel('Passwort')).toBeVisible()
  })

  test('Login-Seite hat "Einloggen"-Button', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('button', { name: 'Einloggen' })).toBeVisible()
  })

  test('Login-Seite hat "Mit Google anmelden"-Button', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('button', { name: /Mit Google anmelden/i })).toBeVisible()
  })

  test('Login-Seite hat Link zu Registrierung', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('link', { name: /Konto erstellen/i })).toBeVisible()
  })

  test('Login — leeres Formular → Validierungsfehler', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-Mail').fill('keine-email')
    await page.getByRole('button', { name: 'Einloggen' }).click()
    // react-hook-form + zod zeigt Fehlermeldung unter dem E-Mail-Feld
    await expect(page.getByText('Ungültige E-Mail-Adresse')).toBeVisible()
  })

  test('Login — Klick auf "Konto erstellen" → navigiert zu /register', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /Konto erstellen/i }).click()
    await expect(page).toHaveURL('/register')
  })
})

// ── Auth UI: Registrierungs-Seite ────────────────────────────────────────

test.describe('Registrierungs-Seite (/register)', () => {
  test('Registrierungs-Seite ist öffentlich erreichbar', async ({ page }) => {
    const response = await page.goto('/register')
    expect(response?.status()).toBeLessThan(400)
    await expect(page).toHaveURL('/register')
  })

  test('Registrierungs-Seite hat E-Mail- und Passwort-Felder', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByLabel('E-Mail')).toBeVisible()
    await expect(page.getByLabel('Passwort')).toBeVisible()
  })

  test('Registrierung — zu kurzes Passwort → Fehlermeldung', async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel('E-Mail').fill('test@example.com')
    await page.getByLabel('Passwort').fill('abc')
    await page.getByRole('button', { name: /Konto erstellen/i }).click()
    await expect(page.getByText(/mindestens 6 zeichen/i)).toBeVisible()
  })

  test('Registrierung — ungültige E-Mail → Fehlermeldung', async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel('E-Mail').fill('kein-email')
    await page.getByLabel('Passwort').fill('passwort123')
    await page.getByRole('button', { name: /Konto erstellen/i }).click()
    await expect(page.getByText('Ungültige E-Mail-Adresse')).toBeVisible()
  })

  test('Registrierung — "Bereits registriert?"-Link → navigiert zu /login', async ({ page }) => {
    await page.goto('/register')
    // Link-Text ist "Einloggen" (der umgebende Text ist "Bereits registriert?")
    await page.getByRole('link', { name: 'Einloggen' }).click()
    await expect(page).toHaveURL('/login')
  })
})

// ── E-Mail-Bestätigung ───────────────────────────────────────────────────

test.describe('E-Mail-Bestätigungs-Hinweisseite (/auth/confirm-pending)', () => {
  test('Confirm-pending-Seite ist erreichbar', async ({ page }) => {
    const response = await page.goto('/auth/confirm-pending')
    expect(response?.status()).toBeLessThan(400)
  })

  test('Zeigt "E-Mail bestätigen" Titel', async ({ page }) => {
    await page.goto('/auth/confirm-pending')
    await expect(page.getByText('E-Mail bestätigen')).toBeVisible()
  })

  test('Zeigt "Bestätigungs-E-Mail erneut senden"-Button', async ({ page }) => {
    await page.goto('/auth/confirm-pending')
    await expect(
      page.getByRole('button', { name: /Bestätigungs-E-Mail erneut senden/i })
    ).toBeVisible()
  })

  test('Zeigt "Zurück zum Login"-Link', async ({ page }) => {
    await page.goto('/auth/confirm-pending')
    await expect(page.getByRole('link', { name: /Zurück zum Login/i })).toBeVisible()
  })

  test('Resend-Button ist deaktiviert wenn keine E-Mail vorhanden', async ({ page }) => {
    await page.goto('/auth/confirm-pending')
    // Ohne sessionStorage-E-Mail wird ein Input-Feld angezeigt; Button ist disabled
    const btn = page.getByRole('button', { name: /Bestätigungs-E-Mail erneut senden/i })
    await expect(btn).toBeDisabled()
  })

  test('Resend: E-Mail-Eingabe aktiviert den Button', async ({ page }) => {
    await page.goto('/auth/confirm-pending')
    const input = page.getByPlaceholder('deine@email.de')
    if (await input.isVisible()) {
      await input.fill('test@example.com')
      const btn = page.getByRole('button', { name: /Bestätigungs-E-Mail erneut senden/i })
      await expect(btn).toBeEnabled()
    }
  })
})

// ── Onboarding-Flow (statische Struktur) ─────────────────────────────────

test.describe('Onboarding — Zugangsschutz und Struktur', () => {
  test('GET /onboarding ohne Session → Redirect zu /login', async ({ page }) => {
    await page.goto('/onboarding')
    await expect(page).toHaveURL('/login')
  })
})

// ── Profil-Seite — Zugangsschutz ─────────────────────────────────────────

test.describe('Profil-Seite — Zugangsschutz', () => {
  test('GET /profile ohne Session → Redirect zu /login', async ({ page }) => {
    await page.goto('/profile')
    await expect(page).toHaveURL('/login')
  })
})

// ── Authenticated Tests (skipped if no credentials) ───────────────────────

const TEST_EMAIL = process.env.TEST_USER_EMAIL
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD

test.describe('Profil-Seite — eingeloggter Nutzer', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt')

  test.beforeEach(async ({ page }) => {
    // Log in via UI
    await page.goto('/login')
    await page.getByLabel('E-Mail').fill(TEST_EMAIL!)
    await page.getByLabel('Passwort').fill(TEST_PASSWORD!)
    await page.getByRole('button', { name: 'Einloggen' }).click()
    await page.waitForURL('/')
  })

  test('Profil-Seite zeigt Anzeigename und Profil-Daten', async ({ page }) => {
    await page.goto('/profile')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByLabel('Anzeigename')).toBeVisible()
  })

  test('Profil-Seite zeigt Fitnessziel-Optionen', async ({ page }) => {
    await page.goto('/profile')
    await expect(page.getByText('Fitnessziel')).toBeVisible()
  })

  test('Profil-Seite zeigt Fitnesslevel-Optionen', async ({ page }) => {
    await page.goto('/profile')
    await expect(page.getByText('Fitnesslevel')).toBeVisible()
  })

  test('Profil-Seite zeigt Equipment-Optionen', async ({ page }) => {
    await page.goto('/profile')
    await expect(page.getByText('Equipment')).toBeVisible()
  })

  test('"Abmelden"-Button ist vorhanden', async ({ page }) => {
    await page.goto('/profile')
    await expect(page.getByRole('button', { name: /Abmelden/i })).toBeVisible()
  })

  test('Abmelden → Redirect zu /login', async ({ page }) => {
    await page.goto('/profile')
    await page.getByRole('button', { name: /Abmelden/i }).click()
    await expect(page).toHaveURL('/login')
  })

  test('Onboarding-URL nach abgeschlossenem Onboarding → Redirect zu /', async ({ page }) => {
    await page.goto('/onboarding')
    await expect(page).toHaveURL('/')
  })
})
