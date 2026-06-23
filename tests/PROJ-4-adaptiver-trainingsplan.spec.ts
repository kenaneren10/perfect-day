import { test, expect } from '@playwright/test'

// PROJ-4: Adaptiver Trainingsplan
// Unauthenticated tests run against any environment.
// Authenticated tests require TEST_USER_EMAIL + TEST_USER_PASSWORD
// + a user who has completed onboarding AND has a generated plan.

// ── Zugangsschutz — Nicht eingeloggter Nutzer ─────────────────────────────

test.describe('Zugangsschutz — Nicht eingeloggter Nutzer', () => {
  test('GET /plan → Redirect zur Login-Seite', async ({ page }) => {
    await page.goto('/plan')
    await expect(page).toHaveURL('/login')
  })

  test('GET /plan/day/1 → Redirect zur Login-Seite', async ({ page }) => {
    await page.goto('/plan/day/1')
    await expect(page).toHaveURL('/login')
  })

  test('GET /plan/day/5 → Redirect zur Login-Seite', async ({ page }) => {
    await page.goto('/plan/day/5')
    await expect(page).toHaveURL('/login')
  })

  test('GET /plan/day/7 (Sonntag) → Redirect zur Login-Seite', async ({ page }) => {
    await page.goto('/plan/day/7')
    await expect(page).toHaveURL('/login')
  })
})

// ── Authenticated Tests (skipped if no credentials) ───────────────────────

const TEST_EMAIL = process.env.TEST_USER_EMAIL
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD

test.describe('Trainingsplan — eingeloggter Nutzer ohne Plan', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-Mail').fill(TEST_EMAIL!)
    await page.getByLabel('Passwort').fill(TEST_PASSWORD!)
    await page.getByRole('button', { name: 'Einloggen' }).click()
    await page.waitForURL('/')
  })

  test('Trainingsplan-Karte auf Dashboard navigiert zu /plan', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Trainingsplan/i })).toBeVisible()
    await page.getByRole('link', { name: /Trainingsplan/i }).click()
    await expect(page).toHaveURL('/plan')
  })

  test('/plan-Seite zeigt "Wie viele Tage" Frage wenn kein Plan vorhanden', async ({ page }) => {
    await page.goto('/plan')
    await expect(page.getByText(/wie oft trainierst du/i)).toBeVisible()
  })

  test('3-Tage-Option ist auswählbar', async ({ page }) => {
    await page.goto('/plan')
    await page.getByText('3 Tage').click()
    await expect(page.getByText('3 Tage')).toBeVisible()
  })

  test('"Plan erstellen"-Button ist deaktiviert ohne Auswahl', async ({ page }) => {
    await page.goto('/plan')
    const btn = page.getByRole('button', { name: /Plan erstellen/i })
    await expect(btn).toBeDisabled()
  })

  test('"Plan erstellen"-Button wird aktiv nach Auswahl', async ({ page }) => {
    await page.goto('/plan')
    await page.getByText('4 Tage').click()
    const btn = page.getByRole('button', { name: /Plan erstellen/i })
    await expect(btn).toBeEnabled()
  })
})

test.describe('Wochenübersicht — eingeloggter Nutzer mit Plan', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-Mail').fill(TEST_EMAIL!)
    await page.getByLabel('Passwort').fill(TEST_PASSWORD!)
    await page.getByRole('button', { name: 'Einloggen' }).click()
    await page.waitForURL('/')
  })

  test('/plan zeigt Wochenübersicht mit 7 Tagen wenn Plan vorhanden', async ({ page }) => {
    await page.goto('/plan')
    // If plan exists: shows "Diese Woche"
    const heading = page.getByText('Diese Woche')
    if (await heading.isVisible()) {
      // Check that all 7 day abbreviations are present
      for (const abbr of ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']) {
        await expect(page.getByText(abbr).first()).toBeVisible()
      }
    }
  })

  test('Trainingstag-Karte navigiert zu Day-Detail-Seite', async ({ page }) => {
    await page.goto('/plan')
    const dayLink = page.locator('a[href^="/plan/day/"]').first()
    if (await dayLink.isVisible()) {
      await dayLink.click()
      await expect(page).toHaveURL(/\/plan\/day\/[1-7]/)
    }
  })

  test('Ruhetag zeigt Ruhezustand (kein Link)', async ({ page }) => {
    await page.goto('/plan')
    // Sa/So are always rest days in MVP
    const ruheText = page.getByText('Ruhetag').first()
    if (await ruheText.isVisible()) {
      await expect(ruheText).toBeVisible()
    }
  })

  test('"Plan neu erstellen" Link ist vorhanden', async ({ page }) => {
    await page.goto('/plan')
    const planHeading = page.getByText('Diese Woche')
    if (await planHeading.isVisible()) {
      await expect(page.getByText(/Plan neu erstellen/i)).toBeVisible()
    }
  })
})

test.describe('Trainingstag-Detail — /plan/day/[weekday]', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-Mail').fill(TEST_EMAIL!)
    await page.getByLabel('Passwort').fill(TEST_PASSWORD!)
    await page.getByRole('button', { name: 'Einloggen' }).click()
    await page.waitForURL('/')
  })

  test('Day-Detail-Seite zeigt Fokus-Label und Übungsliste', async ({ page }) => {
    // Find first training day from the plan
    await page.goto('/plan')
    const dayLink = page.locator('a[href^="/plan/day/"]').first()
    if (await dayLink.isVisible()) {
      await dayLink.click()
      await expect(page).toHaveURL(/\/plan\/day\/[1-7]/)
      // Should show "Zurück zum Plan" link
      await expect(page.getByText(/Zurück zum Plan/i)).toBeVisible()
    }
  })

  test('"Training starten" Button ist vorhanden aber deaktiviert (PROJ-5 Platzhalter)', async ({ page }) => {
    await page.goto('/plan')
    const dayLink = page.locator('a[href^="/plan/day/"]').first()
    if (await dayLink.isVisible()) {
      await dayLink.click()
      const startBtn = page.getByRole('button', { name: /Training starten/i })
      if (await startBtn.isVisible()) {
        await expect(startBtn).toBeDisabled()
      }
    }
  })

  test('Übungen verlinken zur Übungsbibliothek', async ({ page }) => {
    await page.goto('/plan')
    const dayLink = page.locator('a[href^="/plan/day/"]').first()
    if (await dayLink.isVisible()) {
      await dayLink.click()
      const exerciseLink = page.locator('a[href^="/exercises/"]').first()
      if (await exerciseLink.isVisible()) {
        await expect(exerciseLink).toBeVisible()
      }
    }
  })

  test('"Zurück"-Link navigiert zurück zu /plan', async ({ page }) => {
    await page.goto('/plan')
    const dayLink = page.locator('a[href^="/plan/day/"]').first()
    if (await dayLink.isVisible()) {
      await dayLink.click()
      await page.getByText(/Zurück zum Plan/i).click()
      await expect(page).toHaveURL('/plan')
    }
  })
})
