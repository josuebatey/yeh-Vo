import React, { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Camera, X, Flashlight, FlashlightOff } from 'lucide-react'
import { toast } from 'sonner'

interface QRScannerProps {
  onScan: (result: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [hasFlashlight, setHasFlashlight] = useState(false)
  const [flashlightOn, setFlashlightOn] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      setError(null)
      
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsScanning(true)
        
        // Check if device has flashlight
        const track = stream.getVideoTracks()[0]
        const capabilities = track.getCapabilities()
        setHasFlashlight('torch' in capabilities)
      }
    } catch (error) {
      console.error('Camera access failed:', error)
      setError('Camera access denied. Please allow camera permission and try again.')
      toast.error('Camera access denied. You can paste the address manually below.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const toggleFlashlight = async () => {
    if (!streamRef.current) return

    try {
      const track = streamRef.current.getVideoTracks()[0]
      await track.applyConstraints({
        advanced: [{ torch: !flashlightOn }]
      })
      setFlashlightOn(!flashlightOn)
    } catch (error) {
      console.error('Flashlight toggle failed:', error)
      toast.error('Failed to toggle flashlight')
    }
  }

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim())
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setManualInput(text)
        onScan(text)
      }
    } catch (error) {
      toast.error('Failed to read clipboard')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">QR Code Scanner</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      ) : (
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-64 object-cover"
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-white rounded-lg">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
              </div>
            </div>
          )}

          {hasFlashlight && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
              onClick={toggleFlashlight}
            >
              {flashlightOn ? (
                <FlashlightOff className="h-4 w-4" />
              ) : (
                <Flashlight className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      )}

      <div className="space-y-3">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Position the QR code within the frame above
          </p>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Manual Entry</h4>
          <div className="flex gap-2">
            <Input
              placeholder="Paste or enter address here..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handlePaste} variant="outline" size="sm">
              Paste
            </Button>
          </div>
          <Button 
            onClick={handleManualSubmit} 
            className="w-full mt-2"
            disabled={!manualInput.trim()}
          >
            Use Address
          </Button>
        </div>

        <Button variant="outline" onClick={onClose} className="w-full">
          Cancel Scanner
        </Button>
      </div>
    </div>
  )
}

export { QRScanner }