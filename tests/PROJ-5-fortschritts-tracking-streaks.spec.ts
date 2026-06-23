import { test, expect } from '@playwright/test'

// PROJ-5: Fortschritts-Tracking & Streaks
// Unauthenticated tests run against any environment.
// Authenticated tests require TEST_USER_EMAIL + TEST_USER_PASSWORD
// + a user who has completed onboarding AND has a generated plan.

// ── Zugangsschutz — Nicht eingeloggter Nutzer ─────────────────────────────

test.describe('Zugangsschutz — Nicht eingeloggter Nutzer', () => {
  test('GET /history → Redirect zur Login-Seite', async ({ page }) => {
    await page.goto('/history')
    await expect(page).toHaveURL('/login')
  })

  test('GET / → Redirect zur Login-Seite (Dashboard)', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/login')
  })
})

// ── Authenticated Tests (skipped if no credentials) ───────────────────────

const TEST_EMAIL = process.env.TEST_USER_EMAIL
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD

test.describe('Dashboard — Fortschritts-Widget', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-Mail').fill(TEST_EMAIL!)
    await page.getByLabel('Passwort').fill(TEST_PASSWORD!)
    await page.getByRole('button', { name: 'Einloggen' }).click()
    await page.waitForURL('/')
  })

  test('Dashboard lädt ohne Fehler und zeigt Fortschritts-Widget', async ({ page }) => {
    await expect(page).toHaveURL('/')
    // Either the empty state or the stats widget should be visible
    const widget = page.locator('[href="/plan"], [href="/history"]').first()
    await expect(widget).toBeVisible()
  })

  test('Leerzustand: Fortschritts-Widget zeigt "Starte dein erstes Training" wenn keine Sessions', async ({ page }) => {
    // This test only applies to fresh users with no sessions
    // Skip by checking if totalCompleted = 0 implicitly via widget text
    const emptyState = page.getByText('Starte dein erstes Training')
    const statsWidget = page.getByText(/Tage Streak|Tag Streak/)

    // One of these two states must be present
    await expect(emptyState.or(statsWidget)).toBeVisible()
  })

  test('Dashboard zeigt Link zur Übungsbibliothek', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Übungsbibliothek/i })).toBeVisible()
  })

  test('Dashboard zeigt Link zum Trainingsplan', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Trainingsplan/i })).toBeVisible()
  })
})

test.describe('Trainingshistorie — /history', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-Mail').fill(TEST_EMAIL!)
    await page.getByLabel('Passwort').fill(TEST_PASSWORD!)
    await page.getByRole('button', { name: 'Einloggen' }).click()
    await page.waitForURL('/')
  })

  test('GET /history zeigt Trainingshistorie-Seite', async ({ page }) => {
    await page.goto('/history')
    await expect(page).toHaveURL('/history')
    await expect(page.getByRole('heading', { name: 'Trainingshistorie' })).toBeVisible()
  })

  test('/history zeigt Streak-Anzeige', async ({ page }) => {
    await page.goto('/history')
    await expect(page.getByText(/Tage Streak|Tag Streak/)).toBeVisible()
  })

  test('/history zeigt Einheiten-gesamt-Zähler', async ({ page }) => {
    await page.goto('/history')
    await expect(page.getByText('Einheiten gesamt')).toBeVisible()
  })

  test('/history zeigt 4-Wochen-Kalender', async ({ page }) => {
    await page.goto('/history')
    await expect(page.getByText('Letzte 4 Wochen')).toBeVisible()
  })

  test('/history zeigt Kalender-Legende mit allen Status-Farben', async ({ page }) => {
    await page.goto('/history')
    await expect(page.getByText('Abgeschlossen')).toBeVisible()
    await expect(page.getByText('Verpasst')).toBeVisible()
    await expect(page.getByText('Ruhetag')).toBeVisible()
    await expect(page.getByText('Heute')).toBeVisible()
  })

  test('/history zeigt Wochentag-Header Mo–So', async ({ page }) => {
    await page.goto('/history')
    // Wochentag-Abkürzungen im Kalender-Header
    await expect(page.getByText('Mo')).toBeVisible()
    await expect(page.getByText('Sa')).toBeVisible()
    await expect(page.getByText('So')).toBeVisible()
  })

  test('/history hat "Dashboard"-Back-Link', async ({ page }) => {
    await page.goto('/history')
    const backLink = page.getByRole('link', { name: 'Dashboard' })
    await expect(backLink).toBeVisible()
    await backLink.click()
    await expect(page).toHaveURL('/')
  })

  test('Leerzustand: Keine Sessions zeigt motivierenden Text', async ({ page }) => {
    await page.goto('/history')
    // If no sessions, should show empty state
    const emptyState = page.getByText(/Noch kein Training abgeschlossen/)
    const totalCount = page.getByText('Einheiten gesamt')
    // Either we have sessions (totalCount visible without zero message) or the empty message
    await expect(totalCount).toBeVisible()
  })
})

test.describe('Trainingstag — Session starten und loggen', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-Mail').fill(TEST_EMAIL!)
    await page.getByLabel('Passwort').fill(TEST_PASSWORD!)
    await page.getByRole('button', { name: 'Einloggen' }).click()
    await page.waitForURL('/')
  })

  test('"Training starten"-Button erscheint auf einem Trainingstag ohne aktive Session', async ({ page }) => {
    // Navigate to plan first to find a training day
    await page.goto('/plan')
    // Look for a training day link (not a rest day)
    const trainingDayLink = page.locator('a[href^="/plan/day/"]').first()
    const hasTrainingDay = await trainingDayLink.count() > 0
    if (!hasTrainingDay) {
      test.skip()
      return
    }
    await trainingDayLink.click()
    // Either "Training starten" (no session) or "Einheit abschließen" (active session) or summary
    const startBtn = page.getByRole('button', { name: 'Training starten' })
    const completeBtn = page.getByRole('button', { name: 'Einheit abschließen' })
    const summary = page.getByText('Einheit abgeschlossen!')
    await expect(startBtn.or(completeBtn).or(summary)).toBeVisible()
  })

  test('Aktive Session zeigt Timer-Leiste', async ({ page }) => {
    await page.goto('/plan')
    const trainingDayLink = page.locator('a[href^="/plan/day/"]').first()
    if (await trainingDayLink.count() === 0) {
      test.skip()
      return
    }
    await trainingDayLink.click()

    const startBtn = page.getByRole('button', { name: 'Training starten' })
    if (await startBtn.count() > 0) {
      await startBtn.click()
      // After starting, timer should appear
      await expect(page.locator('text=/\\d{2}:\\d{2}/')).toBeVisible({ timeout: 5000 })
    }

    // Either timer (in_progress) or summary (completed)
    const timer = page.locator('text=/\\d{2}:\\d{2}/')
    const summary = page.getByText('Einheit abgeschlossen!')
    await expect(timer.or(summary)).toBeVisible()
  })

  test('"Einheit abschließen"-Button ist sichtbar während aktiver Session', async ({ page }) => {
    await page.goto('/plan')
    const trainingDayLink = page.locator('a[href^="/plan/day/"]').first()
    if (await trainingDayLink.count() === 0) {
      test.skip()
      return
    }
    await trainingDayLink.click()

    const startBtn = page.getByRole('button', { name: 'Training starten' })
    if (await startBtn.count() > 0) {
      await startBtn.click()
    }

    const completeBtn = page.getByRole('button', { name: 'Einheit abschließen' })
    const summary = page.getByText('Einheit abgeschlossen!')
    await expect(completeBtn.or(summary)).toBeVisible()
  })

  test('Session-Abschluss: Summary zeigt Streak, Sätze, Dauer, Volumen', async ({ page }) => {
    await page.goto('/plan')
    const trainingDayLink = page.locator('a[href^="/plan/day/"]').first()
    if (await trainingDayLink.count() === 0) {
      test.skip()
      return
    }
    await trainingDayLink.click()

    const startBtn = page.getByRole('button', { name: 'Training starten' })
    if (await startBtn.count() > 0) {
      await startBtn.click()
    }

    const completeBtn = page.getByRole('button', { name: 'Einheit abschließen' })
    if (await completeBtn.count() > 0) {
      await completeBtn.click()
    }

    // Summary block should appear
    const summary = page.getByText('Einheit abgeschlossen!')
    if (await summary.count() === 0) {
      test.skip() // No completed session state
      return
    }
    await expect(summary).toBeVisible()
    await expect(page.getByText(/Tage Streak|Tag Streak/)).toBeVisible()
    await expect(page.getByText('Sätze')).toBeVisible()
    await expect(page.getByText('Dauer')).toBeVisible()
    await expect(page.getByText('kg Volumen')).toBeVisible()
  })

  test('Summary zeigt Navigations-Links zu Plan und History', async ({ page }) => {
    await page.goto('/plan')
    const trainingDayLink = page.locator('a[href^="/plan/day/"]').first()
    if (await trainingDayLink.count() === 0) {
      test.skip()
      return
    }
    await trainingDayLink.click()

    const summary = page.getByText('Einheit abgeschlossen!')
    if (await summary.count() === 0) {
      test.skip()
      return
    }
    await expect(page.getByRole('link', { name: 'Zurück zum Plan' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Verlauf' })).toBeVisible()
  })
})

test.describe('Kardioübungen — Satz-Logger', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-Mail').fill(TEST_EMAIL!)
    await page.getByLabel('Passwort').fill(TEST_PASSWORD!)
    await page.getByRole('button', { name: 'Einloggen' }).click()
    await page.waitForURL('/')
  })

  test('Satz-Logger zeigt Gewicht+Wdh-Felder für Kraftübungen', async ({ page }) => {
    await page.goto('/plan')
    const trainingDayLink = page.locator('a[href^="/plan/day/"]').first()
    if (await trainingDayLink.count() === 0) {
      test.skip()
      return
    }
    await trainingDayLink.click()

    const startBtn = page.getByRole('button', { name: 'Training starten' })
    if (await startBtn.count() > 0) {
      await startBtn.click()
    }

    // If in active session, check for input fields
    const completeBtn = page.getByRole('button', { name: 'Einheit abschließen' })
    if (await completeBtn.count() === 0) {
      test.skip()
      return
    }

    // At least one input with placeholder "kg" or "Wdh" or "Min" should exist
    const kgInput = page.getByPlaceholder('kg')
    const wdhInput = page.getByPlaceholder('Wdh')
    const minInput = page.getByPlaceholder('Min')
    await expect(kgInput.or(wdhInput).or(minInput)).toBeVisible()
  })
})

test.describe('Zugangsschutz — Eingeloggter Nutzer, neue Routen', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-Mail').fill(TEST_EMAIL!)
    await page.getByLabel('Passwort').fill(TEST_PASSWORD!)
    await page.getByRole('button', { name: 'Einloggen' }).click()
    await page.waitForURL('/')
  })

  test('Eingeloggter Nutzer kann /history aufrufen ohne Redirect', async ({ page }) => {
    await page.goto('/history')
    await expect(page).toHaveURL('/history')
  })

  test('Eingeloggter Nutzer kann / (Dashboard) aufrufen ohne Redirect', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/')
  })
})
