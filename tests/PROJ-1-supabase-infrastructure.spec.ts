import { test, expect } from '@playwright/test'

// PROJ-1: Supabase Infrastructure Setup
// Testet nur die Teile, die ohne Auth-UI verifizierbar sind.
// Auth-Flow-Tests (E-Mail, Google, Apple) folgen in PROJ-2 QA.

test.describe('Auth Callback Route', () => {
  test('Redirect ohne Code — landet auf /login', async ({ page }) => {
    // Angenommen jemand ruft /auth/callback ohne OAuth-Code auf
    // Dann leitet der Callback nach / weiter, PROJ-2-Middleware schickt unauthenticated
    // Nutzer weiter zu /login — kein Fehler
    const response = await page.goto('/auth/callback')
    await expect(page).toHaveURL('/login')
    expect(response?.status()).not.toBe(500)
  })

  test('Unbekannte Query-Parameter werden ignoriert', async ({ page }) => {
    // Angenommen /auth/callback wird mit unbekannten Parametern aufgerufen
    // Dann bleibt die App stabil und landet auf /login (via Middleware)
    await page.goto('/auth/callback?foo=bar&baz=123')
    await expect(page).toHaveURL('/login')
  })
})

test.describe('Middleware — Session Refresh', () => {
  test('Startseite ist erreichbar und gibt keinen 500 zurück', async ({ page }) => {
    // Angenommen die Middleware läuft auf allen Routen
    // Dann blockiert sie normale Seitenaufrufe nicht
    const response = await page.goto('/')
    expect(response?.status()).toBeLessThan(500)
  })

  test('Statische Assets werden nicht von der Middleware blockiert', async ({ page }) => {
    // Angenommen der Matcher schließt _next/static aus
    // Dann lädt die Seite inklusive JS/CSS ohne Fehler
    await page.goto('/')
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.waitForLoadState('networkidle')
    expect(errors).toHaveLength(0)
  })
})
