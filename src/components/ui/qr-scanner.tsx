import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { X, Flashlight, FlashlightOff, Scan } from 'lucide-react'
import { toast } from 'sonner'

interface QRScannerProps {
  onScan: (result: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [hasCamera, setHasCamera] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [flashlightOn, setFlashlightOn] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    checkCameraSupport()
    return () => {
      stopScanning()
    }
  }, [])

  const checkCameraSupport = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const hasVideoInput = devices.some(device => device.kind === 'videoinput')
      setHasCamera(hasVideoInput)
      
      if (hasVideoInput) {
        startScanning()
      }
    } catch (error) {
      console.error('Camera check failed:', error)
      setHasCamera(false)
    }
  }

  const startScanning = async () => {
    try {
      setIsScanning(true)
      
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        
        // Start QR code detection
        startQRDetection()
      }
    } catch (error) {
      console.error('Camera access failed:', error)
      toast.error('Camera access denied. Please allow camera permissions.')
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    setIsScanning(false)
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const startQRDetection = () => {
    // Simple QR detection simulation
    // In a real implementation, you'd use a library like jsQR
    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        // Simulate QR detection
        // This is where you'd implement actual QR code scanning
        console.log('Scanning for QR codes...')
      }
    }, 500)
  }

  const toggleFlashlight = async () => {
    if (!streamRef.current) return

    try {
      const track = streamRef.current.getVideoTracks()[0]
      const capabilities = track.getCapabilities()
      
      if ('torch' in capabilities) {
        await track.applyConstraints({
          advanced: [{ torch: !flashlightOn } as any]
        })
        setFlashlightOn(!flashlightOn)
      } else {
        toast.info('Flashlight not supported on this device')
      }
    } catch (error) {
      console.error('Flashlight toggle failed:', error)
      toast.error('Failed to toggle flashlight')
    }
  }

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim())
      setManualInput('')
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
      toast.error('Failed to paste from clipboard')
    }
  }

  return (
    <div className="space-y-4">
      {hasCamera && isScanning ? (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-black rounded-lg object-cover"
                playsInline
                muted
              />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 border-2 border-dashed border-primary rounded-lg flex items-center justify-center">
                <div className="bg-black/50 text-white px-3 py-1 rounded text-sm">
                  Position QR code in frame
                </div>
              </div>
              
              {/* Controls */}
              <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                <Button
                  onClick={toggleFlashlight}
                  variant="secondary"
                  size="sm"
                  className="bg-black/50 hover:bg-black/70"
                >
                  {flashlightOn ? (
                    <FlashlightOff className="h-4 w-4" />
                  ) : (
                    <Flashlight className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  onClick={stopScanning}
                  variant="secondary"
                  size="sm"
                  className="bg-black/50 hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <Scan className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">QR Scanner</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {hasCamera 
                ? 'Camera access required for QR scanning'
                : 'Camera not available. Use manual input below.'
              }
            </p>
            
            {hasCamera && !isScanning && (
              <Button onClick={startScanning} className="mb-4">
                Start Camera Scanner
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Manual Input */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-3">Manual Input</h4>
          <div className="space-y-3">
            <Input
              placeholder="Paste or type address/payment link here..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
            />
            <div className="flex gap-2">
              <Button onClick={handleManualSubmit} disabled={!manualInput.trim()} className="flex-1">
                Use This Address
              </Button>
              <Button onClick={handlePaste} variant="outline">
                Paste
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" onClick={onClose} className="w-full">
        Cancel Scanner
      </Button>
    </div>
  )
}