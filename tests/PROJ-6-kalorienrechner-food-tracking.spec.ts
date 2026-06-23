import { test, expect } from '@playwright/test'

// PROJ-6: Kalorienrechner & Food-Tracking
// Unauthenticated tests run against any environment.
// Authenticated tests require TEST_USER_EMAIL + TEST_USER_PASSWORD.

// ── Zugangsschutz — Nicht eingeloggter Nutzer ─────────────────────────────

test.describe('Zugangsschutz — Nicht eingeloggter Nutzer', () => {
  test('GET /nutrition → Redirect zur Login-Seite', async ({ page }) => {
    await page.goto('/nutrition')
    await expect(page).toHaveURL('/login')
  })

  test('GET /nutrition/setup → Redirect zur Login-Seite', async ({ page }) => {
    await page.goto('/nutrition/setup')
    await expect(page).toHaveURL('/login')
  })
})

// ── Authenticated Tests (skipped if no credentials) ───────────────────────

const TEST_EMAIL = process.env.TEST_USER_EMAIL
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD

test.describe('Nutrition — Setup-Seite', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-Mail').fill(TEST_EMAIL!)
    await page.getByLabel('Passwort').fill(TEST_PASSWORD!)
    await page.getByRole('button', { name: 'Einloggen' }).click()
    await page.waitForURL('/')
  })

  test('GET /nutrition/setup zeigt Formular mit allen Pflichtfeldern', async ({ page }) => {
    await page.goto('/nutrition/setup')
    await expect(page.getByText('Kalorienziel einrichten')).toBeVisible()
    await expect(page.getByText('Biologisches Geschlecht')).toBeVisible()
    await expect(page.getByText('Geburtsjahr')).toBeVisible()
    await expect(page.getByText('Körpergröße')).toBeVisible()
    await expect(page.getByText('Körpergewicht')).toBeVisible()
    await expect(page.getByText('Aktivitätslevel')).toBeVisible()
  })

  test('Live-Vorschau des Kalorienziels erscheint nach Ausfüllen der Felder', async ({ page }) => {
    await page.goto('/nutrition/setup')

    // Select sex
    await page.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Männlich' }).click()

    // Fill numeric fields
    await page.getByPlaceholder('z. B. 1990').fill('1990')
    await page.getByPlaceholder('z. B. 175').fill('175')
    await page.getByPlaceholder('z. B. 75').fill('80')

    // Select activity level
    await page.getByRole('combobox').nth(1).click()
    await page.getByRole('option', { name: /Mäßig aktiv/ }).click()

    // Live preview should now be visible
    await expect(page.getByText('Berechnetes Kalorienziel')).toBeVisible()
    await expect(page.locator('text=/\\d{3,4} kcal/')).toBeVisible()
  })

  test('Submit-Button ist deaktiviert wenn Pflichtfelder fehlen', async ({ page }) => {
    await page.goto('/nutrition/setup')
    const submitBtn = page.getByRole('button', { name: 'Kalorienziel speichern' })
    await expect(submitBtn).toBeDisabled()
  })
})

test.describe('Nutrition — Tages-Tagebuch', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-Mail').fill(TEST_EMAIL!)
    await page.getByLabel('Passwort').fill(TEST_PASSWORD!)
    await page.getByRole('button', { name: 'Einloggen' }).click()
    await page.waitForURL('/')
  })

  test('GET /nutrition zeigt Tagebuch oder Setup-Banner', async ({ page }) => {
    await page.goto('/nutrition')
    await expect(page.getByText('Ernährung heute')).toBeVisible()
    // Either setup banner or diary is shown — both are valid
    const hasBanner = await page.getByText('Kalorienziel einrichten').isVisible()
    const hasDiary = await page.getByText('Frühstück').isVisible()
    expect(hasBanner || hasDiary).toBe(true)
  })

  test('Tagebuch zeigt vier Mahlzeiten-Sektionen wenn Kalorienziel gesetzt', async ({ page }) => {
    await page.goto('/nutrition')
    const hasDiary = await page.getByText('Frühstück').isVisible()
    if (!hasDiary) {
      test.skip()
      return
    }
    await expect(page.getByText('Frühstück')).toBeVisible()
    await expect(page.getByText('Mittagessen')).toBeVisible()
    await expect(page.getByText('Abendessen')).toBeVisible()
    await expect(page.getByText('Snacks')).toBeVisible()
  })

  test('Kalorien-Fortschrittsbalken ist sichtbar wenn Kalorienziel gesetzt', async ({ page }) => {
    await page.goto('/nutrition')
    const hasDiary = await page.getByText('Frühstück').isVisible()
    if (!hasDiary) {
      test.skip()
      return
    }
    // Should show "X / Y kcal" format
    await expect(page.locator('text=/\\/ \\d{3,4} kcal/')).toBeVisible()
  })

  test('Makro-Felder (Protein, KH, Fett) sind sichtbar wenn Kalorienziel gesetzt', async ({ page }) => {
    await page.goto('/nutrition')
    const hasDiary = await page.getByText('Frühstück').isVisible()
    if (!hasDiary) {
      test.skip()
      return
    }
    await expect(page.getByText('Protein')).toBeVisible()
    await expect(page.getByText('Kohlenhydrate')).toBeVisible()
    await expect(page.getByText('Fett')).toBeVisible()
  })

  test('Jede Mahlzeiten-Sektion hat einen "Hinzufügen"-Button', async ({ page }) => {
    await page.goto('/nutrition')
    const hasDiary = await page.getByText('Frühstück').isVisible()
    if (!hasDiary) {
      test.skip()
      return
    }
    const addButtons = page.getByRole('button', { name: 'Hinzufügen' })
    await expect(addButtons).toHaveCount(4)
  })

  test('Klick auf "Hinzufügen" öffnet Lebensmittel-Suche Sheet', async ({ page }) => {
    await page.goto('/nutrition')
    const hasDiary = await page.getByText('Frühstück').isVisible()
    if (!hasDiary) {
      test.skip()
      return
    }
    await page.getByRole('button', { name: 'Hinzufügen' }).first().click()
    await expect(page.getByText('Zu Frühstück hinzufügen')).toBeVisible()
    await expect(page.getByPlaceholder('Lebensmittel suchen…')).toBeVisible()
  })

  test('Setup-Banner hat Link zu /nutrition/setup wenn Kalorienziel fehlt', async ({ page }) => {
    await page.goto('/nutrition')
    const hasBanner = await page.getByText('Kalorienziel einrichten').isVisible()
    if (!hasBanner) {
      test.skip()
      return
    }
    await expect(page.getByRole('link', { name: 'Jetzt einrichten' })).toBeVisible()
  })
})

test.describe('Dashboard — Kalorien-Widget', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-Mail').fill(TEST_EMAIL!)
    await page.getByLabel('Passwort').fill(TEST_PASSWORD!)
    await page.getByRole('button', { name: 'Einloggen' }).click()
    await page.waitForURL('/')
  })

  test('Dashboard lädt ohne Fehler', async ({ page }) => {
    await expect(page).toHaveURL('/')
    await expect(page.locator('main')).toBeVisible()
  })

  test('Kalorien-Widget ist sichtbar und verlinkt zu /nutrition wenn Ziel gesetzt', async ({ page }) => {
    const hasWidget = await page.getByText('Kalorien heute').isVisible()
    if (!hasWidget) {
      // No goal set — widget is correctly hidden
      test.skip()
      return
    }
    await expect(page.getByText('Kalorien heute')).toBeVisible()
    await expect(page.locator('a[href="/nutrition"]')).toBeVisible()
  })

  test('Kein leeres Kalorien-Widget wenn kein Ziel gesetzt', async ({ page }) => {
    // This test verifies that no empty/broken widget appears
    // The widget should either be present with data OR absent entirely
    const widgetCount = await page.getByText('Kalorien heute').count()
    if (widgetCount === 0) {
      // Correctly hidden — pass
      expect(widgetCount).toBe(0)
    } else {
      // Widget present — must show goal value (not zero / broken)
      await expect(page.locator('text=/\\/ \\d{3,4} kcal/')).toBeVisible()
    }
  })
})

test.describe('Nutrition — Einstellungen-Icon', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'TEST_USER_EMAIL / TEST_USER_PASSWORD nicht gesetzt')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-Mail').fill(TEST_EMAIL!)
    await page.getByLabel('Passwort').fill(TEST_PASSWORD!)
    await page.getByRole('button', { name: 'Einloggen' }).click()
    await page.waitForURL('/')
  })

  test('Einstellungen-Button auf /nutrition verlinkt zu /nutrition/setup', async ({ page }) => {
    await page.goto('/nutrition')
    const settingsLink = page.locator('a[href="/nutrition/setup"]')
    await expect(settingsLink).toBeVisible()
  })

  test('Zurück-Link auf /nutrition/setup verlinkt zu /nutrition', async ({ page }) => {
    await page.goto('/nutrition/setup')
    await expect(page.locator('a[href="/nutrition"]')).toBeVisible()
  })
})
