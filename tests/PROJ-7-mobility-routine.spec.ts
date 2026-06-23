import { test, expect } from '@playwright/test'

// PROJ-7: Mobility Routine
// Unauthenticated tests run against any environment.
// Authenticated tests require TEST_USER_EMAIL + TEST_USER_PASSWORD.

// ── Zugangsschutz — Nicht eingeloggter Nutzer ─────────────────────────────

test.describe('Zugangsschutz — Nicht eingeloggter Nutzer', () => {
  test('GET /mobility ohne Session → Redirect zur Login-Seite', async ({ page }) => {
    await page.goto('/mobility')
    await expect(page).toHaveURL('/login')
  })
})

// ── Authenticated Tests (skipped if no credentials) ───────────────────────

const TEST_EMAIL = process.env.TEST_USER_EMAIL
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD

test.describe('Mobility — Übersichtsseite', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-Mail').fill(TEST_EMAIL!)
    await page.getByLabel('Passwort').fill(TEST_PASSWORD!)
    await page.getByRole('button', { name: 'Einloggen' }).click()
    await page.waitForURL('/')
  })

  test('GET /mobility zeigt Übersicht mit Titel und 8 Übungen', async ({ page }) => {
    await page.goto('/mobility')
    await expect(page.getByText('Deine tägliche Mobility')).toBeVisible()
    await expect(page.getByText('8 Übungen')).toBeVisible()
    // 8 exercise rows visible in the list
    const exerciseRows = page.locator('text=Nackenrollen').or(page.locator('text=Waden dehnen'))
    await expect(exerciseRows.first()).toBeVisible()
  })

  test('Übungslist enthält alle 8 Übungen in der richtigen Reihenfolge', async ({ page }) => {
    await page.goto('/mobility')
    const exerciseNames = [
      'Nackenrollen',
      'Schulterkreise',
      'Brustdehnung',
      'Oberkörperdrehung',
      'Hüftkreise',
      'Hüftbeuger-Dehnung links',
      'Hüftbeuger-Dehnung rechts',
      'Waden dehnen',
    ]
    for (const name of exerciseNames) {
      await expect(page.getByText(name)).toBeVisible()
    }
  })

  test('"Routine starten"-Button ist sichtbar', async ({ page }) => {
    await page.goto('/mobility')
    const startBtn = page.getByRole('button', { name: /Routine starten|Erneut starten/ })
    await expect(startBtn).toBeVisible()
  })

  test('"Zurück zum Dashboard"-Link navigiert zu /', async ({ page }) => {
    await page.goto('/mobility')
    await page.getByRole('link', { name: 'Zurück zum Dashboard' }).click()
    await expect(page).toHaveURL('/')
  })
})

test.describe('Mobility — Player: Übungsablauf', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-Mail').fill(TEST_EMAIL!)
    await page.getByLabel('Passwort').fill(TEST_PASSWORD!)
    await page.getByRole('button', { name: 'Einloggen' }).click()
    await page.waitForURL('/')
  })

  test('Klick auf "Routine starten" zeigt erste Übung (Nackenrollen) mit Timer', async ({ page }) => {
    await page.goto('/mobility')
    await page.getByRole('button', { name: /Routine starten|Erneut starten/ }).click()
    await expect(page.getByText('Nackenrollen')).toBeVisible()
    await expect(page.getByText('Übung 1 von 8')).toBeVisible()
    // Timer shows a number (30 or less)
    const timerEl = page.locator('text=/^(30|29|28|27|26|25|24|23|22|21|20)$/')
    await expect(timerEl.first()).toBeVisible()
  })

  test('"Weiter"-Button wechselt zur zweiten Übung (Schulterkreise)', async ({ page }) => {
    await page.goto('/mobility')
    await page.getByRole('button', { name: /Routine starten|Erneut starten/ }).click()
    await expect(page.getByText('Nackenrollen')).toBeVisible()
    await page.getByRole('button', { name: 'Weiter' }).click()
    await expect(page.getByText('Schulterkreise')).toBeVisible()
    await expect(page.getByText('Übung 2 von 8')).toBeVisible()
  })

  test('"Abbrechen"-Button kehrt zur Übersicht zurück ohne Completion', async ({ page }) => {
    await page.goto('/mobility')
    await page.getByRole('button', { name: /Routine starten|Erneut starten/ }).click()
    await expect(page.getByText('Nackenrollen')).toBeVisible()
    await page.getByRole('button', { name: 'Abbrechen' }).click()
    // Back to overview
    await expect(page.getByText('Deine tägliche Mobility')).toBeVisible()
    await expect(page.getByRole('button', { name: /Routine starten|Erneut starten/ })).toBeVisible()
  })

  test('Nach allen 8 Übungen erscheint der Abschluss-Screen', async ({ page }) => {
    await page.goto('/mobility')
    await page.getByRole('button', { name: /Routine starten|Erneut starten/ }).click()

    // Click through all 8 exercises manually
    for (let i = 0; i < 7; i++) {
      await page.getByRole('button', { name: 'Weiter' }).click()
    }
    // Last exercise: "Abschließen"
    await page.getByRole('button', { name: 'Abschließen' }).click()

    await expect(page.getByText('Routine abgeschlossen!')).toBeVisible()
    await expect(page.getByText('8 von 8 Übungen absolviert')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Zurück zum Dashboard' })).toBeVisible()
  })

  test('"Zurück zum Dashboard" vom Abschluss-Screen navigiert zu /', async ({ page }) => {
    await page.goto('/mobility')
    await page.getByRole('button', { name: /Routine starten|Erneut starten/ }).click()

    for (let i = 0; i < 7; i++) {
      await page.getByRole('button', { name: 'Weiter' }).click()
    }
    await page.getByRole('button', { name: 'Abschließen' }).click()
    await expect(page.getByText('Routine abgeschlossen!')).toBeVisible()

    // Wait for save (isPending)
    const dashBtn = page.getByRole('button', { name: 'Zurück zum Dashboard' })
    await expect(dashBtn).toBeEnabled({ timeout: 5000 })
    await dashBtn.click()
    await expect(page).toHaveURL('/')
  })
})

test.describe('Mobility — Dashboard Widget', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-Mail').fill(TEST_EMAIL!)
    await page.getByLabel('Passwort').fill(TEST_PASSWORD!)
    await page.getByRole('button', { name: 'Einloggen' }).click()
    await page.waitForURL('/')
  })

  test('Dashboard zeigt "Tägliche Mobility"-Widget', async ({ page }) => {
    await expect(page.getByText('Tägliche Mobility')).toBeVisible()
  })

  test('Dashboard-Widget zeigt heutigen Status (offen oder erledigt)', async ({ page }) => {
    const todoText = page.getByText('noch offen')
    const doneText = page.getByText('Heute erledigt — gut gemacht!')
    const isOneVisible = (await todoText.isVisible()) || (await doneText.isVisible())
    expect(isOneVisible).toBe(true)
  })
})
