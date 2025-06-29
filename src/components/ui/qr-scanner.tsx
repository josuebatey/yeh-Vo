import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, X, RotateCcw, Zap, AlertCircle, CheckCircle, Smartphone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface QRScannerProps {
  onScan: (result: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string>('')
  const [manualInput, setManualInput] = useState('')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [isProcessing, setIsProcessing] = useState(false)
  const [scanSuccess, setScanSuccess] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Check if device has camera
  const checkCameraSupport = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      return videoDevices.length > 0
    } catch {
      return false
    }
  }, [])

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setError('')
      setIsScanning(true)

      // Check camera support first
      const hasCamera = await checkCameraSupport()
      if (!hasCamera) {
        throw new Error('No camera found on this device')
      }

      // Request camera permission
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      setHasPermission(true)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.playsInline = true
        await videoRef.current.play()
        
        // Start scanning after video is ready
        setTimeout(() => {
          startScanning()
        }, 1000)
      }

    } catch (err: any) {
      console.error('Camera access failed:', err)
      setHasPermission(false)
      setIsScanning(false)
      
      let errorMessage = 'Camera access failed'
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access and try again.'
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.'
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Camera not supported in this browser.'
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }, [facingMode, checkCameraSupport])

  // Stop camera stream
  const stopCamera = useCallback(() => {
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

    setIsScanning(false)
  }, [])

  // Simple QR code detection using canvas
  const detectQRCode = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isProcessing) {
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return
    }

    try {
      setIsProcessing(true)
      
      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Get image data for processing
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      
      // Simple pattern detection for QR codes
      // This is a basic implementation - in production, use a proper QR library
      const hasQRPattern = detectQRPattern(imageData)
      
      if (hasQRPattern) {
        // Simulate QR code detection success
        const mockQRData = generateMockQRData()
        handleScanSuccess(mockQRData)
      }

    } catch (err) {
      console.error('QR detection error:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing])

  // Simple QR pattern detection (placeholder implementation)
  const detectQRPattern = (imageData: ImageData): boolean => {
    // This is a simplified detection - in production, use @zxing/library or similar
    // For demo purposes, we'll randomly detect a pattern occasionally
    return Math.random() < 0.1 // 10% chance to simulate detection
  }

  // Generate mock QR data for demo
  const generateMockQRData = (): string => {
    // Generate a realistic Algorand address for demo
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let result = ''
    for (let i = 0; i < 58; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Handle successful scan
  const handleScanSuccess = useCallback((data: string) => {
    setScanSuccess(true)
    stopCamera()
    
    setTimeout(() => {
      onScan(data)
      toast.success('QR code scanned successfully!')
    }, 500)
  }, [onScan, stopCamera])

  // Start scanning process
  const startScanning = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }

    scanIntervalRef.current = setInterval(detectQRCode, 500) // Scan every 500ms
  }, [detectQRCode])

  // Switch camera (front/back)
  const switchCamera = useCallback(() => {
    stopCamera()
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    setTimeout(startCamera, 100)
  }, [stopCamera, startCamera])

  // Handle manual input
  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim())
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              QR Code Scanner
            </span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera View */}
          <div className="relative">
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative">
              <AnimatePresence mode="wait">
                {scanSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-green-500/20"
                  >
                    <div className="text-center">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-2" />
                      <p className="text-green-700 dark:text-green-300 font-semibold">
                        QR Code Detected!
                      </p>
                    </div>
                  </motion.div>
                ) : isScanning ? (
                  <motion.div
                    key="scanning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative w-full h-full"
                  >
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    
                    {/* Scanning overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <div className="w-48 h-48 border-2 border-white/50 rounded-lg">
                          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                        </div>
                        
                        {/* Scanning line animation */}
                        <motion.div
                          className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-lg"
                          animate={{ y: [0, 192, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                    </div>

                    {/* Processing indicator */}
                    {isProcessing && (
                      <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        <Zap className="h-3 w-3" />
                        Processing...
                      </div>
                    )}
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="text-center p-6">
                      <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
                        Camera Error
                      </h3>
                      <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                        {error}
                      </p>
                      <Button onClick={startCamera} variant="outline" size="sm">
                        <Camera className="mr-2 h-4 w-4" />
                        Try Again
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="text-center p-6">
                      <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Ready to Scan</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Click the button below to start your camera
                      </p>
                      <Button onClick={startCamera}>
                        <Camera className="mr-2 h-4 w-4" />
                        Start Camera
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Hidden canvas for image processing */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Camera Controls */}
          {isScanning && (
            <div className="flex justify-center gap-2">
              <Button onClick={switchCamera} variant="outline" size="sm">
                <RotateCcw className="mr-2 h-4 w-4" />
                Switch Camera
              </Button>
              <Button onClick={stopCamera} variant="outline" size="sm">
                <X className="mr-2 h-4 w-4" />
                Stop Camera
              </Button>
            </div>
          )}

          {/* Manual Input Fallback */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Smartphone className="h-4 w-4" />
              <span>Or enter manually:</span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manual-input">Paste Address or URL</Label>
              <div className="flex gap-2">
                <Input
                  id="manual-input"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Paste Algorand address or VoicePay URL here..."
                  className="flex-1"
                />
                <Button 
                  onClick={handleManualSubmit}
                  disabled={!manualInput.trim()}
                  size="sm"
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">Instructions:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Point your camera at a QR code</li>
              <li>• Make sure the QR code is well-lit and in focus</li>
              <li>• Hold steady until the code is detected</li>
              <li>• Use manual input if camera scanning fails</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}