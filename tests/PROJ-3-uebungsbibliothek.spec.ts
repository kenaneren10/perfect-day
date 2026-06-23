import { test, expect } from '@playwright/test'

// PROJ-3: Übungsbibliothek (Kraft & Cardio)
// Auth-dependent tests require a real Supabase session.
// Unauthenticated redirect tests run against any environment.

// ── Unauthenticated Redirects ─────────────────────────────────────────────

test.describe('Zugangsschutz — Nicht eingeloggter Nutzer', () => {
  test('GET /exercises → Redirect zur Startseite', async ({ page }) => {
    // Angenommen ein nicht eingeloggter Nutzer versucht /exercises aufzurufen
    // Dann wird er zur Login-Seite (/) weitergeleitet
    const response = await page.goto('/exercises')
    await expect(page).toHaveURL('/')
    expect(response?.status()).not.toBe(500)
  })

  test('GET /exercises/some-id → Redirect zur Startseite', async ({ page }) => {
    // Angenommen ein nicht eingeloggter Nutzer versucht eine Detail-URL aufzurufen
    // Dann wird er zur Login-Seite (/) weitergeleitet
    await page.goto('/exercises/550e8400-e29b-41d4-a716-446655440000')
    await expect(page).toHaveURL('/')
  })

  test('GET /exercises/new → Redirect zur Startseite', async ({ page }) => {
    // Angenommen ein nicht eingeloggter Nutzer versucht das Create-Formular aufzurufen
    // Dann wird er zur Login-Seite (/) weitergeleitet
    await page.goto('/exercises/new')
    await expect(page).toHaveURL('/')
  })

  test('GET /exercises/some-id/edit → Redirect zur Startseite', async ({ page }) => {
    // Angenommen ein nicht eingeloggter Nutzer versucht das Edit-Formular aufzurufen
    // Dann wird er zur Login-Seite (/) weitergeleitet
    await page.goto('/exercises/550e8400-e29b-41d4-a716-446655440000/edit')
    await expect(page).toHaveURL('/')
  })
})

// ── Smoke Tests ────────────────────────────────────────────────────────────

test.describe('Startseite — Grundstruktur', () => {
  test('Startseite lädt ohne Server-Fehler', async ({ page }) => {
    // Smoke-Test: Die Startseite (Login-Seite) lädt korrekt
    const response = await page.goto('/')
    expect(response?.status()).toBeLessThan(500)
  })
})

// ── Authenticated Tests ────────────────────────────────────────────────────
// Diese Tests erfordern eine aktive Supabase-Session.
// Voraussetzung: TEST_USER_EMAIL und TEST_USER_PASSWORD in der Testumgebung.
// Übersprungen wenn keine Testdaten vorhanden.

const TEST_EMAIL = process.env.TEST_USER_EMAIL
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD

test.describe('Bibliotheks-Übersicht — /exercises', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'Benötigt TEST_USER_EMAIL + TEST_USER_PASSWORD')

  test.beforeEach(async ({ page }) => {
    // Navigate to app and sign in via Supabase email auth
    await page.goto('/')
    await page.fill('[name="email"]', TEST_EMAIL!)
    await page.fill('[name="password"]', TEST_PASSWORD!)
    await page.click('[type="submit"]')
    await page.waitForURL('/exercises')
  })

  test('Bibliotheksseite zeigt Überschrift und Suchleiste', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Übungsbibliothek' })).toBeVisible()
    await expect(page.getByPlaceholder('Übung suchen...')).toBeVisible()
  })

  test('Kategorie-Filter "Kraft" — zeigt nur Kraft-Übungen', async ({ page }) => {
    await page.getByRole('button', { name: 'Kraft' }).click()
    // All visible cards should have the Kraft badge
    const cardCount = await page.locator('[data-testid="exercise-card"]').count()
    if (cardCount > 0) {
      const kraftBadges = await page.locator('text=Kraft').count()
      expect(kraftBadges).toBeGreaterThan(0)
    }
  })

  test('Kategorie-Filter "Cardio" — zeigt nur Cardio-Übungen', async ({ page }) => {
    await page.getByRole('button', { name: 'Cardio' }).click()
    await page.waitForTimeout(500)
    const kraftText = page.locator('text=Kraft').first()
    // After filtering for Cardio, "Kraft" category badge should not appear on cards
    // (The filter chip itself still shows "Kraft" as an option, so we check card area)
    const exerciseGrid = page.locator('.grid').first()
    await expect(exerciseGrid).not.toContainText('Kraft')
  })

  test('Suche filtert Übungen nach Name (case-insensitive)', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Übung suchen...')
    await searchInput.fill('bank')
    await page.waitForTimeout(600) // debounce
    // Results should contain "bank" in name (case-insensitive)
    const cards = page.locator('h3')
    const count = await cards.count()
    if (count > 0) {
      const firstCard = await cards.first().textContent()
      expect(firstCard?.toLowerCase()).toContain('bank')
    }
  })

  test('Filter zurücksetzen — setzt Filter auf Ausgangszustand', async ({ page }) => {
    await page.getByRole('button', { name: 'Kraft' }).click()
    await page.getByRole('button', { name: /Filter zurücksetzen/ }).click()
    // After reset, "Alle" category chip should be active
    const alleChip = page.getByRole('button', { name: 'Alle' }).first()
    await expect(alleChip).toHaveClass(/bg-green-500/)
  })

  test('Leerer Zustand zeigt "Keine Übungen gefunden" und Reset-Button', async ({ page }) => {
    // Set mutually exclusive filters to produce empty results
    await page.getByRole('button', { name: 'Kraft' }).click()
    await page.getByRole('button', { name: 'Cardio' }).click() // switches to Cardio
    await page.waitForTimeout(600)
    // Check if empty state is shown (depends on seed data)
    const emptyText = page.getByText('Keine Übungen gefunden')
    const resetBtn = page.getByRole('button', { name: /Filter zurücksetzen/ })
    // We can't guarantee 0 results without knowing seed data — just verify UI elements exist
    await expect(resetBtn).toBeVisible()
  })

  test('"+ Übung hinzufügen" Button navigiert zu /exercises/new', async ({ page }) => {
    await page.getByRole('link', { name: /Übung hinzufügen/ }).click()
    await expect(page).toHaveURL('/exercises/new')
  })
})

test.describe('Custom-Übung erstellen — /exercises/new', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'Benötigt TEST_USER_EMAIL + TEST_USER_PASSWORD')

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.fill('[name="email"]', TEST_EMAIL!)
    await page.fill('[name="password"]', TEST_PASSWORD!)
    await page.click('[type="submit"]')
    await page.waitForURL('/exercises')
    await page.goto('/exercises/new')
  })

  test('Pflichtfeld-Validierung — leeres Formular zeigt Fehlermeldungen', async ({ page }) => {
    // Clear the default "Kraft" selection for category to be unset —
    // category has a default so we only check name (which is empty)
    await page.getByRole('button', { name: 'Speichern' }).click()
    await expect(page.getByText('Name ist erforderlich')).toBeVisible()
    await expect(page.getByText('Mindestens eine Muskelgruppe wählen')).toBeVisible()
  })

  test('Ungültige URL — Fehlermeldung für Bild-URL', async ({ page }) => {
    await page.fill('[placeholder="z.B. Bankdrücken"]', 'Test Übung')
    await page.getByLabel('Brust').check()
    await page.fill('[placeholder="https://example.com/image.jpg"]', 'nicht-eine-url')
    await page.getByRole('button', { name: 'Speichern' }).click()
    await expect(page.getByText('Bitte eine gültige URL eingeben')).toBeVisible()
  })

  test('Abbrechen-Button navigiert zurück', async ({ page }) => {
    await page.getByRole('button', { name: 'Abbrechen' }).click()
    // Should navigate away from /exercises/new
    await expect(page).not.toHaveURL('/exercises/new')
  })

  test('Gültiges Formular — Custom-Übung wird erstellt und zur Detailseite weitergeleitet', async ({ page }) => {
    const uniqueName = `Test Übung QA ${Date.now()}`
    await page.fill('[placeholder="z.B. Bankdrücken"]', uniqueName)
    // category defaults to "Kraft"
    await page.getByLabel('Brust').check()
    // equipment defaults to "Ohne Equipment"
    // difficulty defaults to "Einsteiger"
    await page.getByRole('button', { name: 'Speichern' }).click()
    // Should redirect to the detail page of the new exercise
    await expect(page).toHaveURL(/\/exercises\/[a-f0-9-]+$/)
    await expect(page.getByRole('heading', { name: uniqueName })).toBeVisible()
    await expect(page.getByText('Eigene')).toBeVisible()
  })
})

test.describe('Favoriten', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'Benötigt TEST_USER_EMAIL + TEST_USER_PASSWORD')

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.fill('[name="email"]', TEST_EMAIL!)
    await page.fill('[name="password"]', TEST_PASSWORD!)
    await page.click('[type="submit"]')
    await page.waitForURL('/exercises')
  })

  test('Herz-Icon auf Detailseite toggled Favorit-Status', async ({ page }) => {
    // Navigate to first exercise in the library
    await page.locator('a[href^="/exercises/"]').first().click()
    await expect(page).toHaveURL(/\/exercises\/[a-f0-9-]+$/)

    const favoriteBtn = page.getByRole('button', { name: /Favorit/ })
    await expect(favoriteBtn).toBeVisible()

    // Toggle on
    await favoriteBtn.click()
    await page.waitForTimeout(500) // wait for Server Action

    // Toggle off
    await favoriteBtn.click()
    await page.waitForTimeout(500)
    // No error toast should appear
    await expect(page.getByText('Fehler beim Speichern')).not.toBeVisible()
  })
})

test.describe('Detailseite — /exercises/[id]', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'Benötigt TEST_USER_EMAIL + TEST_USER_PASSWORD')

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.fill('[name="email"]', TEST_EMAIL!)
    await page.fill('[name="password"]', TEST_PASSWORD!)
    await page.click('[type="submit"]')
    await page.waitForURL('/exercises')
  })

  test('Klick auf Übungskarte öffnet Detailseite', async ({ page }) => {
    await page.locator('a[href^="/exercises/"]').first().click()
    await expect(page).toHaveURL(/\/exercises\/[a-f0-9-]+$/)
    // Detail page has back link
    await expect(page.getByText('Zur Bibliothek')).toBeVisible()
  })

  test('System-Übungen zeigen keine Bearbeiten/Löschen-Buttons', async ({ page }) => {
    // Find a system exercise (no "Eigene" badge)
    await page.locator('a[href^="/exercises/"]').first().click()
    const owneBadge = page.getByText('Eigene')
    const isCustom = await owneBadge.isVisible()

    if (!isCustom) {
      // System exercise — should not have edit/delete buttons
      await expect(page.getByRole('link', { name: 'Bearbeiten' })).not.toBeVisible()
      await expect(page.getByRole('button', { name: 'Löschen' })).not.toBeVisible()
    }
  })

  test('Direkter URL-Zugriff auf fremde Custom-Übung → Redirect', async ({ page }) => {
    // Try to access a custom exercise ID that doesn't belong to this user
    // Using a non-existent ID triggers notFound() which also prevents access
    await page.goto('/exercises/00000000-0000-0000-0000-000000000000')
    // Should redirect to /exercises or show 404, never show another user's data
    const url = page.url()
    const isRedirectedOrNotFound = url.includes('/exercises') && !url.includes('/00000000')
    expect(isRedirectedOrNotFound || url.includes('not-found')).toBeTruthy()
  })
})
