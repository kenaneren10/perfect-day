'use client'

import { useState, useEffect, useRef } from 'react'
import { Camera, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { FoodProduct } from '@/types/nutrition'

// BarcodeDetector is a browser API not yet in TypeScript's lib.dom
interface BarcodeDetectorInstance {
  detect(
    image: HTMLVideoElement | HTMLCanvasElement | ImageBitmap,
  ): Promise<Array<{ rawValue: string; format: string }>>
}

declare const BarcodeDetector: {
  new (options?: { formats: string[] }): BarcodeDetectorInstance
  getSupportedFormats(): Promise<string[]>
}

interface Props {
  onProductFound: (product: FoodProduct) => void
  onNotFound: (message: string) => void
  onError: (message: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onProductFound, onNotFound, onError, onClose }: Props) {
  const [mode, setMode] = useState<'initializing' | 'camera' | 'manual'>('initializing')
  const [manualBarcode, setManualBarcode] = useState('')
  const [isLooking, setIsLooking] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<BarcodeDetectorInstance | null>(null)
  const scanningRef = useRef(false)

  useEffect(() => {
    const hasBarcodeDetector = 'BarcodeDetector' in window
    if (!hasBarcodeDetector) {
      setMode('manual')
      return
    }
    startCamera()
    return () => stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      detectorRef.current = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] })
      setMode('camera')
      scanningRef.current = true
      scan()
    } catch {
      setMode('manual')
      setCameraError('Kamera nicht verfügbar — Barcode bitte manuell eingeben')
    }
  }

  const stopCamera = () => {
    scanningRef.current = false
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }

  const scan = async () => {
    if (!scanningRef.current || !videoRef.current || !detectorRef.current) return
    try {
      const codes = await detectorRef.current.detect(videoRef.current)
      if (codes.length > 0) {
        scanningRef.current = false
        stopCamera()
        await lookupBarcode(codes[0].rawValue)
        return
      }
    } catch {
      /* detection error — keep scanning */
    }
    requestAnimationFrame(scan)
  }

  const lookupBarcode = async (barcode: string) => {
    setIsLooking(true)
    try {
      const res = await fetch(`/api/nutrition/barcode/${encodeURIComponent(barcode)}`)
      const data = await res.json()
      if (res.ok && data.product) {
        onProductFound(data.product)
      } else {
        onNotFound(data.error ?? 'Produkt nicht gefunden')
      }
    } catch {
      onError('Verbindungsfehler — bitte erneut versuchen')
    } finally {
      setIsLooking(false)
    }
  }

  return (
    <div className="space-y-4">
      {mode === 'initializing' && (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {mode === 'camera' && (
        <div className="relative rounded-xl overflow-hidden bg-black">
          <video ref={videoRef} className="w-full aspect-video object-cover" playsInline muted />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-32 border-2 border-green-400 rounded-lg opacity-70" />
          </div>
          <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/70">
            Barcode in den Rahmen halten
          </p>
        </div>
      )}

      {mode === 'manual' && (
        <div className="space-y-3">
          {cameraError && (
            <p className="text-xs text-zinc-400 flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
              {cameraError}
            </p>
          )}
          <div className="flex gap-2">
            <Input
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="Barcode eingeben (z. B. 4006381333931)"
              onKeyDown={(e) => e.key === 'Enter' && !isLooking && lookupBarcode(manualBarcode.trim())}
              className="bg-zinc-900 border-zinc-700 focus:border-green-500 text-zinc-50"
              disabled={isLooking}
              autoFocus
            />
            <Button
              onClick={() => lookupBarcode(manualBarcode.trim())}
              disabled={!manualBarcode.trim() || isLooking}
              className="bg-green-500 hover:bg-green-400 text-black font-semibold shrink-0"
            >
              {isLooking ? (
                <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <QrCode className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {isLooking && mode === 'camera' && (
        <p className="text-center text-sm text-zinc-400">Produkt wird gesucht…</p>
      )}

      <Button variant="ghost" size="sm" onClick={onClose} className="w-full text-zinc-500 hover:text-zinc-300">
        Abbrechen
      </Button>
    </div>
  )
}
