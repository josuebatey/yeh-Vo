import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, X, RotateCcw, Type, Scan, AlertCircle, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface QRScannerProps {
  onScan: (result: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>('')
  const [manualInput, setManualInput] = useState('')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [scanResult, setScanResult] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout>()

  // Check if camera is supported
  const isCameraSupported = useCallback(() => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  }, [])

  // Start camera stream
  const startCamera = useCallback(async () => {
    if (!isCameraSupported()) {
      setError('Camera not supported on this device')
      return
    }

    try {
      setError('')
      setIsScanning(true)

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.playsInline = true
        videoRef.current.muted = true
        
        await videoRef.current.play()
        
        // Start scanning after video is ready
        setTimeout(() => {
          startScanning()
        }, 1000)
      }
    } catch (err: any) {
      console.error('Camera access failed:', err)
      let errorMessage = 'Failed to access camera'
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access and try again.'
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.'
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Camera not supported on this device.'
      }
      
      setError(errorMessage)
      setIsScanning(false)
    }
  }, [facingMode, isCameraSupported])

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }
    
    setIsScanning(false)
  }, [])

  // Start QR code scanning
  const startScanning = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    scanIntervalRef.current = setInterval(() => {
      if (video.readyState === video.HAVE_ENOUGH_DATA && !isProcessing) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        try {
          // Get image data for QR detection
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          
          // Simple QR code detection simulation
          // In a real implementation, you would use a QR code library here
          detectQRCode(imageData)
        } catch (error) {
          console.error('QR detection error:', error)
        }
      }
    }, 500) // Scan every 500ms
  }, [isProcessing])

  // Simulate QR code detection
  const detectQRCode = useCallback((imageData: ImageData) => {
    // This is a simplified simulation
    // In a real app, you would use a library like jsQR or qr-scanner
    
    // For demo purposes, we'll simulate finding a QR code occasionally
    if (Math.random() < 0.1) { // 10% chance to simulate detection
      const mockQRData = 'ALGORAND_ADDRESS_SIMULATION_' + Date.now()
      handleQRDetected(mockQRData)
    }
  }, [])

  // Handle QR code detection
  const handleQRDetected = useCallback((data: string) => {
    if (isProcessing || scanResult) return
    
    setIsProcessing(true)
    setScanResult(data)
    
    // Stop scanning
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }
    
    // Auto-confirm after 2 seconds or let user confirm
    setTimeout(() => {
      if (scanResult === data) {
        onScan(data)
      }
    }, 2000)
  }, [isProcessing, scanResult, onScan])

  // Switch camera (front/back)
  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }, [])

  // Handle manual input
  const handleManualSubmit = useCallback(() => {
    if (manualInput.trim()) {
      onScan(manualInput.trim())
    }
  }, [manualInput, onScan])

  // Confirm scanned result
  const confirmScan = useCallback(() => {
    if (scanResult) {
      onScan(scanResult)
    }
  }, [scanResult, onScan])

  // Reset scan
  const resetScan = useCallback(() => {
    setScanResult('')
    setIsProcessing(false)
    startScanning()
  }, [startScanning])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              QR Code Scanner
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Camera View */}
            {isCameraSupported() && (
              <div className="space-y-4">
                <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />
                  
                  {/* Scanning overlay */}
                  {isScanning && !scanResult && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-white/50 rounded-lg relative">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-lg" />
                        
                        {/* Scanning line animation */}
                        <motion.div
                          className="absolute left-0 right-0 h-0.5 bg-primary"
                          animate={{ y: [0, 192, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Success overlay */}
                  {scanResult && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <div className="bg-white/90 dark:bg-black/90 rounded-lg p-4 text-center">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-medium">QR Code Detected!</p>
                        <p className="text-xs text-muted-foreground mt-1 break-all">
                          {scanResult.slice(0, 30)}...
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Camera Controls */}
                <div className="flex gap-2">
                  {!isScanning ? (
                    <Button onClick={startCamera} className="flex-1">
                      <Camera className="mr-2 h-4 w-4" />
                      Start Camera
                    </Button>
                  ) : (
                    <>
                      <Button onClick={stopCamera} variant="outline" className="flex-1">
                        Stop Camera
                      </Button>
                      <Button onClick={switchCamera} variant="outline" size="sm">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Scan Result Actions */}
                <AnimatePresence>
                  {scanResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex gap-2"
                    >
                      <Button onClick={confirmScan} className="flex-1">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Use This Code
                      </Button>
                      <Button onClick={resetScan} variant="outline">
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Manual Input Fallback */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Type className="h-4 w-4" />
                <span>Or enter manually:</span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="manual-input">Paste Address or QR Data</Label>
                <Input
                  id="manual-input"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Paste Algorand address or QR code data..."
                  className="font-mono text-sm"
                />
              </div>
              
              <Button 
                onClick={handleManualSubmit} 
                disabled={!manualInput.trim()}
                variant="outline"
                className="w-full"
              >
                Use Manual Input
              </Button>
            </div>

            {/* Instructions */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Point camera at QR code to scan automatically</p>
              <p>• Make sure QR code is well-lit and in focus</p>
              <p>• Use manual input if camera scanning fails</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}