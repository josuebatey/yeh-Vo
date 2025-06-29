import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, X, RotateCcw, Zap, CheckCircle, AlertCircle, Smartphone, Monitor } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import jsQR from 'jsqr'

interface QRScannerProps {
  onScan: (result: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number>()
  
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string>('')
  const [manualInput, setManualInput] = useState('')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [scanSuccess, setScanSuccess] = useState(false)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')

  // Get available camera devices
  const getDevices = useCallback(async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = deviceList.filter(device => device.kind === 'videoinput')
      setDevices(videoDevices)
      
      // Prefer back camera if available
      const backCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      )
      
      if (backCamera) {
        setSelectedDeviceId(backCamera.deviceId)
        setFacingMode('environment')
      } else if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId)
        setFacingMode('user')
      }
    } catch (error) {
      console.error('Error getting devices:', error)
    }
  }, [])

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setError('')
      setIsScanning(true)

      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        }
      }

      // Use specific device if selected
      if (selectedDeviceId) {
        constraints.video = {
          ...constraints.video,
          deviceId: { exact: selectedDeviceId }
        }
        delete (constraints.video as any).facingMode
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute('playsinline', 'true') // iOS Safari compatibility
        videoRef.current.play()
        
        videoRef.current.onloadedmetadata = () => {
          setHasPermission(true)
          startScanning()
        }
      }
    } catch (error: any) {
      console.error('Camera access error:', error)
      setHasPermission(false)
      setIsScanning(false)
      
      let errorMessage = 'Camera access failed'
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access and try again.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found. Please ensure your device has a camera.'
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is being used by another application.'
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera constraints not supported. Trying with basic settings...'
        // Retry with basic constraints
        setTimeout(() => {
          setFacingMode('user')
          setSelectedDeviceId('')
        }, 1000)
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }, [facingMode, selectedDeviceId])

  // QR code detection function
  const detectQRCode = useCallback((imageData: ImageData) => {
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      })
      
      if (code && code.data) {
        return code.data
      }
      return null
    } catch (error) {
      console.error('QR detection error:', error)
      return null
    }
  }, [])

  // Scanning loop
  const startScanning = useCallback(() => {
    const scan = () => {
      if (!videoRef.current || !canvasRef.current || !isScanning) {
        return
      }

      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationRef.current = requestAnimationFrame(scan)
        return
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Get image data for QR detection
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      
      // Detect QR code
      const qrResult = detectQRCode(imageData)
      
      if (qrResult) {
        setScanSuccess(true)
        setIsScanning(false)
        
        // Stop camera
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
        
        // Success feedback
        toast.success('QR code detected successfully!')
        
        // Call onScan with result
        setTimeout(() => {
          onScan(qrResult)
        }, 500)
        
        return
      }

      // Continue scanning
      animationRef.current = requestAnimationFrame(scan)
    }

    animationRef.current = requestAnimationFrame(scan)
  }, [isScanning, detectQRCode, onScan])

  // Switch camera
  const switchCamera = useCallback(() => {
    if (devices.length > 1) {
      const currentIndex = devices.findIndex(device => device.deviceId === selectedDeviceId)
      const nextIndex = (currentIndex + 1) % devices.length
      setSelectedDeviceId(devices[nextIndex].deviceId)
      
      // Update facing mode based on device label
      const nextDevice = devices[nextIndex]
      if (nextDevice.label.toLowerCase().includes('front') || 
          nextDevice.label.toLowerCase().includes('user')) {
        setFacingMode('user')
      } else {
        setFacingMode('environment')
      }
    } else {
      // Fallback: toggle facing mode
      setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
      setSelectedDeviceId('')
    }
  }, [devices, selectedDeviceId])

  // Handle manual input
  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim())
    }
  }

  // Initialize
  useEffect(() => {
    getDevices()
  }, [getDevices])

  // Start camera when component mounts or settings change
  useEffect(() => {
    if (hasPermission !== false) {
      startCamera()
    }

    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [startCamera])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              <span>QR Scanner</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Camera View */}
          <div className="relative">
            <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                autoPlay
              />
              
              {/* Hidden canvas for QR detection */}
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              
              {/* Scanning overlay */}
              <AnimatePresence>
                {isScanning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {/* Scanning frame */}
                    <div className="relative w-48 h-48 border-2 border-white rounded-lg">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                      
                      {/* Scanning line animation */}
                      <motion.div
                        className="absolute left-0 right-0 h-0.5 bg-blue-500 shadow-lg"
                        animate={{
                          top: ['0%', '100%', '0%']
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear'
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Success overlay */}
              <AnimatePresence>
                {scanSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 bg-green-500/20 flex items-center justify-center"
                  >
                    <div className="bg-green-500 text-white p-4 rounded-full">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Error overlay */}
              {error && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
                  <div className="text-center text-white">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Status indicator */}
            <div className="absolute top-2 left-2">
              <Badge variant={isScanning ? "default" : "secondary"} className="text-xs">
                {isScanning ? (
                  <>
                    <Zap className="h-3 w-3 mr-1" />
                    Scanning...
                  </>
                ) : scanSuccess ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Success!
                  </>
                ) : (
                  <>
                    <Camera className="h-3 w-3 mr-1" />
                    Ready
                  </>
                )}
              </Badge>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <Button
              onClick={switchCamera}
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={!isScanning}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {facingMode === 'user' ? (
                <>
                  <Smartphone className="h-4 w-4 mr-1" />
                  Front
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4 mr-1" />
                  Back
                </>
              )}
            </Button>
            
            <Button
              onClick={startCamera}
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={isScanning}
            >
              <Camera className="h-4 w-4 mr-2" />
              Restart
            </Button>
          </div>

          {/* Manual input fallback */}
          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="manual-input" className="text-sm font-medium">
              Manual Input (if camera fails)
            </Label>
            <div className="flex gap-2">
              <Input
                id="manual-input"
                placeholder="Paste QR code content or address..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
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

          {/* Instructions */}
          <div className="text-center space-y-2 pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              Position the QR code within the scanning frame
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>✓ Auto-detection</span>
              <span>✓ Real-time scanning</span>
              <span>✓ Multiple cameras</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}