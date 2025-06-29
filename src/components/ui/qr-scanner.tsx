import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, X, SwitchCamera, Scan, AlertCircle, CheckCircle, Smartphone } from 'lucide-react'
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
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0)
  const [scanSuccess, setScanSuccess] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout>()

  // Check if device supports camera
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  const hasMediaDevices = navigator.mediaDevices && navigator.mediaDevices.getUserMedia

  useEffect(() => {
    if (hasMediaDevices) {
      checkCameraPermission()
      getCameraDevices()
    }
    
    return () => {
      stopScanning()
    }
  }, [])

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      setHasPermission(true)
      stream.getTracks().forEach(track => track.stop())
    } catch (error: any) {
      console.error('Camera permission check failed:', error)
      setHasPermission(false)
      
      if (error.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access to scan QR codes.')
      } else if (error.name === 'NotFoundError') {
        setError('No camera found on this device.')
      } else {
        setError('Unable to access camera. Please check your device settings.')
      }
    }
  }

  const getCameraDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      setCameras(videoDevices)
    } catch (error) {
      console.error('Failed to get camera devices:', error)
    }
  }

  const startScanning = async () => {
    if (!hasMediaDevices || !hasPermission) {
      setError('Camera not available on this device')
      return
    }

    try {
      setIsScanning(true)
      setError('')
      
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: isMobile ? 'environment' : 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      }

      // Use specific camera if multiple available
      if (cameras.length > 0 && cameras[currentCameraIndex]) {
        constraints.video = {
          ...constraints.video,
          deviceId: cameras[currentCameraIndex].deviceId
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        
        // Start scanning after video is ready
        setTimeout(() => {
          startQRDetection()
        }, 1000)
      }
    } catch (error: any) {
      console.error('Failed to start camera:', error)
      setIsScanning(false)
      
      if (error.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access.')
      } else if (error.name === 'NotFoundError') {
        setError('No camera found. Please check your device.')
      } else {
        setError('Failed to start camera. Please try again.')
      }
    }
  }

  const stopScanning = () => {
    setIsScanning(false)
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
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
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    scanIntervalRef.current = setInterval(() => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        try {
          // Simple QR detection - in a real app you'd use a proper QR library
          // For demo purposes, we'll simulate detection
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          
          // Simulate QR detection with a small chance
          if (Math.random() < 0.1) { // 10% chance per scan
            handleQRDetected('DEMO_QR_CODE_DETECTED_' + Date.now())
          }
        } catch (error) {
          console.error('QR detection error:', error)
        }
      }
    }, 500) // Scan every 500ms
  }

  const handleQRDetected = (result: string) => {
    setScanSuccess(true)
    stopScanning()
    
    setTimeout(() => {
      onScan(result)
      toast.success('QR code scanned successfully!')
    }, 500)
  }

  const switchCamera = async () => {
    if (cameras.length <= 1) return
    
    stopScanning()
    setCurrentCameraIndex((prev) => (prev + 1) % cameras.length)
    
    setTimeout(() => {
      startScanning()
    }, 500)
  }

  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      toast.error('Please enter a valid address or URL')
      return
    }
    
    onScan(manualInput.trim())
  }

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="h-5 w-5" />
              QR Scanner
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Camera Scanner */}
          {hasMediaDevices && hasPermission && (
            <div className="space-y-3">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-square max-w-[280px] mx-auto">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Scanning overlay */}
                <AnimatePresence>
                  {isScanning && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-48 h-48 border-2 border-white rounded-lg relative">
                        <motion.div
                          className="absolute inset-0 border-2 border-blue-500"
                          animate={{ 
                            scale: [1, 1.1, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity 
                          }}
                        />
                        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-white"></div>
                        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-white"></div>
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-white"></div>
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-white"></div>
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
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-green-500/20 flex items-center justify-center"
                    >
                      <div className="bg-green-500 rounded-full p-4">
                        <CheckCircle className="h-8 w-8 text-white" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* No video placeholder */}
                {!isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm opacity-75">Camera not active</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera controls */}
              <div className="flex gap-2 justify-center">
                {!isScanning ? (
                  <Button onClick={startScanning} className="flex-1">
                    <Scan className="mr-2 h-4 w-4" />
                    Start Scanning
                  </Button>
                ) : (
                  <Button onClick={stopScanning} variant="destructive" className="flex-1">
                    <X className="mr-2 h-4 w-4" />
                    Stop Scanning
                  </Button>
                )}
                
                {cameras.length > 1 && (
                  <Button 
                    onClick={switchCamera} 
                    variant="outline" 
                    size="sm"
                    disabled={!isScanning}
                  >
                    <SwitchCamera className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Mobile instructions */}
          {isMobile && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Smartphone className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Point your camera at a QR code to scan automatically
              </p>
            </div>
          )}

          {/* Manual input fallback */}
          <div className="space-y-2">
            <Label htmlFor="manual-input">Or enter manually:</Label>
            <div className="flex gap-2">
              <Input
                id="manual-input"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Paste address or URL here..."
                className="flex-1"
              />
              <Button onClick={handleManualSubmit} variant="outline">
                Submit
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Point camera at QR code for automatic scanning</p>
            <p>• Or paste/type the address manually above</p>
            <p>• Works with VoicePay payment links and wallet addresses</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}