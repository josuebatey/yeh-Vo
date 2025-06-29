import { useState, useRef, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Camera, CameraOff, RotateCcw, Scan, AlertCircle, CheckCircle, Smartphone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface QRScannerProps {
  onScan: (result: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>('')
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0)
  const [manualInput, setManualInput] = useState('')
  const [scanResult, setScanResult] = useState<string>('')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Check camera permission and get devices
  const checkCameraAccess = useCallback(async () => {
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop())
      
      setHasPermission(true)
      
      // Get available camera devices
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      setDevices(videoDevices)
      
      if (videoDevices.length === 0) {
        setError('No camera devices found')
      }
    } catch (err: any) {
      console.error('Camera access error:', err)
      setHasPermission(false)
      
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access and try again.')
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.')
      } else if (err.name === 'NotSupportedError') {
        setError('Camera not supported in this browser.')
      } else {
        setError('Failed to access camera. Please check your device settings.')
      }
    }
  }, [])

  // Start camera stream
  const startCamera = useCallback(async () => {
    if (!hasPermission || devices.length === 0) return

    try {
      setError('')
      setIsScanning(true)

      const device = devices[currentDeviceIndex]
      const constraints = {
        video: {
          deviceId: device?.deviceId,
          facingMode: device?.label.toLowerCase().includes('back') ? 'environment' : 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        
        // Start scanning when video is ready
        videoRef.current.onloadedmetadata = () => {
          startScanning()
        }
      }
    } catch (err: any) {
      console.error('Failed to start camera:', err)
      setError('Failed to start camera. Please try again.')
      setIsScanning(false)
    }
  }, [hasPermission, devices, currentDeviceIndex])

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    
    setIsScanning(false)
  }, [])

  // Switch between cameras
  const switchCamera = useCallback(() => {
    if (devices.length <= 1) return
    
    stopCamera()
    setCurrentDeviceIndex((prev) => (prev + 1) % devices.length)
  }, [devices.length, stopCamera])

  // Simulate QR code scanning (since we can't use external libraries)
  const startScanning = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    scanIntervalRef.current = setInterval(() => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // In a real implementation, you would use a QR code library here
        // For demo purposes, we'll simulate detection
        simulateQRDetection()
      }
    }, 500)
  }, [])

  // Simulate QR code detection
  const simulateQRDetection = useCallback(() => {
    // This is a simulation - in a real app you'd use a QR detection library
    // For demo purposes, we'll show how it would work
    console.log('Scanning for QR codes...')
    
    // Simulate finding a QR code after some time (for demo)
    if (Math.random() < 0.1) { // 10% chance per scan
      const demoQRData = 'ALGORAND_ADDRESS_DEMO_' + Math.random().toString(36).substr(2, 9)
      handleScanResult(demoQRData)
    }
  }, [])

  // Handle successful scan
  const handleScanResult = useCallback((result: string) => {
    setScanResult(result)
    stopCamera()
    
    // Delay to show the result, then call onScan
    setTimeout(() => {
      onScan(result)
    }, 1500)
  }, [onScan, stopCamera])

  // Handle manual input
  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      handleScanResult(manualInput.trim())
    }
  }

  // Initialize camera on mount
  useEffect(() => {
    checkCameraAccess()
    
    return () => {
      stopCamera()
    }
  }, [checkCameraAccess, stopCamera])

  // Start camera when permission is granted and devices are available
  useEffect(() => {
    if (hasPermission && devices.length > 0 && !isScanning) {
      startCamera()
    }
  }, [hasPermission, devices, currentDeviceIndex, isScanning, startCamera])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              QR Code Scanner
            </div>
            <Badge variant={isScanning ? "default" : "secondary"}>
              {isScanning ? "Scanning" : "Stopped"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera Permission Status */}
          <AnimatePresence mode="wait">
            {hasPermission === null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                <p className="text-muted-foreground">Checking camera access...</p>
              </motion.div>
            )}

            {hasPermission === false && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <div className="space-y-4">
                  <CameraOff className="h-12 w-12 mx-auto text-red-500" />
                  <div>
                    <h3 className="font-semibold text-red-500 mb-2">Camera Access Required</h3>
                    <p className="text-sm text-muted-foreground mb-4">{error}</p>
                    <Button onClick={checkCameraAccess} variant="outline">
                      <Camera className="mr-2 h-4 w-4" />
                      Try Again
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {hasPermission === true && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Camera View */}
                <div className="relative">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
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
                    
                    {/* Scanning Overlay */}
                    {isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-48 h-48 border-2 border-white rounded-lg relative">
                          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                          
                          {/* Scanning Line */}
                          <motion.div
                            className="absolute left-0 right-0 h-0.5 bg-blue-500"
                            animate={{ y: [0, 192, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Success Result */}
                    {scanResult && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 bg-green-500/90 flex items-center justify-center"
                      >
                        <div className="text-center text-white">
                          <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold mb-2">QR Code Detected!</h3>
                          <p className="text-sm opacity-90 font-mono break-all px-4">
                            {scanResult}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Camera Controls */}
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      onClick={isScanning ? stopCamera : startCamera}
                      variant={isScanning ? "destructive" : "default"}
                    >
                      {isScanning ? (
                        <>
                          <CameraOff className="mr-2 h-4 w-4" />
                          Stop Camera
                        </>
                      ) : (
                        <>
                          <Camera className="mr-2 h-4 w-4" />
                          Start Camera
                        </>
                      )}
                    </Button>

                    {devices.length > 1 && (
                      <Button onClick={switchCamera} variant="outline">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Switch Camera
                      </Button>
                    )}
                  </div>

                  {/* Device Info */}
                  {devices.length > 0 && (
                    <div className="text-center text-sm text-muted-foreground">
                      Camera: {devices[currentDeviceIndex]?.label || `Camera ${currentDeviceIndex + 1}`}
                      {devices.length > 1 && ` (${currentDeviceIndex + 1} of ${devices.length})`}
                    </div>
                  )}
                </div>

                {/* Error Display */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Manual Input Fallback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Manual Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manual-input">
              Paste or type address/QR data
            </Label>
            <Input
              id="manual-input"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Paste Algorand address or QR code data here..."
              className="font-mono text-sm"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleManualSubmit}
              disabled={!manualInput.trim()}
              className="flex-1"
            >
              Use This Address
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p className="mb-2">💡 <strong>Tips for better scanning:</strong></p>
            <ul className="space-y-1 ml-4">
              <li>• Ensure good lighting</li>
              <li>• Hold camera steady</li>
              <li>• Keep QR code within the frame</li>
              <li>• Try switching cameras if available</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}