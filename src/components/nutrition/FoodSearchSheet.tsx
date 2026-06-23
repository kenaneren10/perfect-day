'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { Search, Camera, AlertCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { logFood } from '@/app/nutrition/actions'
import { BarcodeScanner } from './BarcodeScanner'
import { calcPortionNutrients } from '@/lib/nutrition/tdee'
import { toast } from 'sonner'
import type { FoodProduct, MealType } from '@/types/nutrition'

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Frühstück',
  lunch: 'Mittagessen',
  dinner: 'Abendessen',
  snacks: 'Snacks',
}

interface Props {
  mealType: MealType | null
  todayStr: string
  onClose: () => void
}

export function FoodSearchSheet({ mealType, todayStr, onClose }: Props) {
  const [step, setStep] = useState<'search' | 'barcode' | 'portion'>('search')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodProduct[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<FoodProduct | null>(null)
  const [servingG, setServingG] = useState('100')
  const [isPending, startTransition] = useTransition()
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setStep('search')
    setQuery('')
    setResults([])
    setSelectedProduct(null)
    setServingG('100')
    setSearchError(null)
  }, [mealType])

  useEffect(() => {
    if (query.length < 3) {
      setResults([])
      setSearchError(null)
      return
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true)
      setSearchError(null)
      try {
        const res = await fetch(`/api/nutrition/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        if (res.ok) {
          setResults(data.products ?? [])
          if ((data.products ?? []).length === 0) setSearchError('Keine Ergebnisse gefunden')
        } else {
          setSearchError(data.error ?? 'Suche fehlgeschlagen')
        }
      } catch {
        setSearchError('Verbindungsfehler — bitte erneut versuchen')
      } finally {
        setIsSearching(false)
      }
    }, 350)
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current)
    }
  }, [query])

  const serving = parseFloat(servingG) || 0
  const preview =
    selectedProduct && serving > 0
      ? calcPortionNutrients(
          {
            kcal: selectedProduct.kcal_100g,
            protein: selectedProduct.protein_100g,
            carbs: selectedProduct.carbs_100g,
            fat: selectedProduct.fat_100g,
          },
          serving,
        )
      : null

  const handleSelectProduct = (p: FoodProduct) => {
    setSelectedProduct(p)
    setServingG('100')
    setStep('portion')
  }

  const handleLog = () => {
    if (!selectedProduct || !mealType || serving <= 0) return
    startTransition(async () => {
      const result = await logFood({
        date: todayStr,
        meal_type: mealType,
        food_name: selectedProduct.name,
        food_off_id: selectedProduct.id || null,
        kcal_per_100g: selectedProduct.kcal_100g,
        protein_per_100g: selectedProduct.protein_100g,
        carbs_per_100g: selectedProduct.carbs_100g,
        fat_per_100g: selectedProduct.fat_100g,
        serving_g: serving,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${selectedProduct.name} eingetragen`)
        onClose()
      }
    })
  }

  return (
    <Sheet open={!!mealType} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="bg-zinc-900 border-zinc-800 rounded-t-2xl max-h-[90vh] overflow-y-auto"
      >
        <SheetHeader className="mb-4">
          <SheetTitle className="text-zinc-50">
            {mealType ? `Zu ${MEAL_LABELS[mealType]} hinzufügen` : 'Lebensmittel hinzufügen'}
          </SheetTitle>
        </SheetHeader>

        {step === 'barcode' && (
          <BarcodeScanner
            onProductFound={(p) => {
              setSelectedProduct(p)
              setServingG('100')
              setStep('portion')
            }}
            onNotFound={(msg) => {
              toast.error(msg)
              setStep('search')
            }}
            onError={(msg) => {
              toast.error(msg)
              setStep('search')
            }}
            onClose={() => setStep('search')}
          />
        )}

        {step === 'search' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Lebensmittel suchen…"
                  className="pl-9 bg-zinc-800 border-zinc-700 focus:border-green-500 text-zinc-50"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setStep('barcode')}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50 shrink-0"
                title="Barcode scannen"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            {query.length > 0 && query.length < 3 && (
              <p className="text-xs text-zinc-500 text-center">Mindestens 3 Zeichen eingeben…</p>
            )}

            {isSearching && (
              <div className="flex justify-center py-6">
                <div className="h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {searchError && !isSearching && (
              <div className="flex items-center gap-2 text-zinc-400 text-sm py-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {searchError}
              </div>
            )}

            {results.length > 0 && !isSearching && (
              <div className="space-y-0.5 max-h-72 overflow-y-auto">
                {results.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProduct(p)}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <p className="text-sm font-medium text-zinc-50 leading-tight">{p.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {p.brand ? `${p.brand} · ` : ''}
                      {p.kcal_100g} kcal/100g
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'portion' && selectedProduct && (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('search')}
              className="text-zinc-400 hover:text-zinc-50 -ml-2"
            >
              ← Zurück zur Suche
            </Button>

            <div className="bg-zinc-800 rounded-xl p-4">
              <p className="font-semibold text-zinc-50">{selectedProduct.name}</p>
              {selectedProduct.brand && <p className="text-xs text-zinc-500 mt-0.5">{selectedProduct.brand}</p>}
              <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                {[
                  { label: 'kcal', value: selectedProduct.kcal_100g },
                  { label: 'Protein', value: `${selectedProduct.protein_100g}g` },
                  { label: 'KH', value: `${selectedProduct.carbs_100g}g` },
                  { label: 'Fett', value: `${selectedProduct.fat_100g}g` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-zinc-500">{label}</p>
                    <p className="text-sm font-semibold text-zinc-300">{value}</p>
                  </div>
                ))}
                <p className="col-span-4 text-xs text-zinc-600 -mt-1">pro 100g</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-300 font-medium">Portionsgröße (g)</label>
              <Input
                type="number"
                value={servingG}
                onChange={(e) => setServingG(e.target.value)}
                min={1}
                max={9999}
                autoFocus
                className="bg-zinc-900 border-zinc-700 focus:border-green-500 text-zinc-50"
              />
            </div>

            {preview && serving > 0 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                <p className="text-xs text-zinc-400 mb-2">Für {serving}g:</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'kcal', value: Math.round(preview.kcal) },
                    { label: 'Protein', value: `${preview.protein_g}g` },
                    { label: 'KH', value: `${preview.carbs_g}g` },
                    { label: 'Fett', value: `${preview.fat_g}g` },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-zinc-500">{label}</p>
                      <p className="text-sm font-bold text-green-400">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {serving > 5000 && (
              <p className="text-xs text-yellow-500">Portionsgröße ist sehr groß — bitte prüfen</p>
            )}

            <Button
              onClick={handleLog}
              disabled={isPending || serving <= 0}
              className="w-full h-12 bg-green-500 hover:bg-green-400 text-black font-semibold"
            >
              {isPending
                ? 'Wird eingetragen…'
                : `Zu ${mealType ? MEAL_LABELS[mealType] : 'Mahlzeit'} hinzufügen`}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
