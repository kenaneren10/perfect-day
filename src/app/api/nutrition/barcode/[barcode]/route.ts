import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ barcode: string }> },
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { barcode } = await params

  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)

    if (!response.ok) return NextResponse.json({ error: 'API nicht erreichbar' }, { status: 502 })

    const data = await response.json()
    if (!data.product || data.status === 0) {
      return NextResponse.json({ error: 'Produkt nicht gefunden' }, { status: 404 })
    }

    const p = data.product as Record<string, unknown>
    const n = p.nutriments as Record<string, number> | undefined
    const kcal = n?.['energy-kcal_100g'] ?? n?.['energy_100g']

    if (!kcal || kcal <= 0) {
      return NextResponse.json({ error: 'Keine Nährwertdaten verfügbar' }, { status: 422 })
    }

    return NextResponse.json({
      product: {
        id: barcode,
        name: (p.product_name_de as string) || (p.product_name as string) || 'Unbekanntes Produkt',
        brand: (p.brands as string) || undefined,
        kcal_100g: Math.round(kcal),
        protein_100g: Math.round(((n?.proteins_100g ?? 0) as number) * 10) / 10,
        carbs_100g: Math.round(((n?.carbohydrates_100g ?? 0) as number) * 10) / 10,
        fat_100g: Math.round(((n?.fat_100g ?? 0) as number) * 10) / 10,
      },
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Zeitüberschreitung' }, { status: 502 })
    }
    return NextResponse.json({ error: 'API nicht erreichbar' }, { status: 502 })
  }
}
