import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = request.nextUrl.searchParams.get('q')
  if (!q || q.length < 3) return NextResponse.json({ products: [] })

  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&action=process&json=1&page_size=10&lc=de&fields=code,product_name,product_name_de,brands,nutriments`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)

    if (!response.ok) return NextResponse.json({ error: 'API nicht erreichbar' }, { status: 502 })

    const data = await response.json()
    const products = ((data.products ?? []) as Record<string, unknown>[])
      .map((p) => {
        const n = p.nutriments as Record<string, number> | undefined
        const kcal = n?.['energy-kcal_100g'] ?? n?.['energy_100g']
        if (!kcal || kcal <= 0) return null
        return {
          id: (p.code as string) ?? '',
          name: (p.product_name_de as string) || (p.product_name as string) || 'Unbekanntes Produkt',
          brand: (p.brands as string) || undefined,
          kcal_100g: Math.round(kcal),
          protein_100g: Math.round(((n?.proteins_100g ?? 0) as number) * 10) / 10,
          carbs_100g: Math.round(((n?.carbohydrates_100g ?? 0) as number) * 10) / 10,
          fat_100g: Math.round(((n?.fat_100g ?? 0) as number) * 10) / 10,
        }
      })
      .filter(Boolean)

    return NextResponse.json({ products })
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Zeitüberschreitung — bitte erneut versuchen' }, { status: 502 })
    }
    return NextResponse.json({ error: 'API nicht erreichbar' }, { status: 502 })
  }
}
