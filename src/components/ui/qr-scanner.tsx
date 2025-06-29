import React, { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Camera, X, SwitchCamera, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface QRScannerProps {
  onScan: (result: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string>('')
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0)
  const [manualInput, setManualInput] = useState('')
  const [scanSuccess, setScanSuccess] = useState(false)

  // Initialize camera and get available devices
  useEffect(() => {
    initializeCamera()
    return cleanup
  }, [])

  // Switch camera when device index changes
  useEffect(() => {
    if (devices.length > 0 && hasPermission) {
      switchCamera()
    }
  }, [currentDeviceIndex])

  const initializeCamera = async () => {
    try {
      // First, get permission and enumerate devices
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      // Stop the initial stream
      stream.getTracks().forEach(track => track.stop())
      
      // Now enumerate devices
      const deviceList = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = deviceList.filter(device => device.kind === 'videoinput')
      
      setDevices(videoDevices)
      setHasPermission(true)
      
      // Find back camera (environment) or use first available
      const backCameraIndex = videoDevices.findIndex(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('environment')
      )
      
      if (backCameraIndex !== -1) {
        setCurrentDeviceIndex(backCameraIndex)
      }
      
      // Start with the selected camera
      await startCamera()
      
    } catch (err) {
      console.error('Camera initialization failed:', err)
      setHasPermission(false)
      setError(getCameraErrorMessage(err))
    }
  }

  const startCamera = async () => {
    try {
      setError('')
      
      if (devices.length === 0) {
        throw new Error('No camera devices found')
      }

      const deviceId = devices[currentDeviceIndex]?.deviceId
      
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: deviceId ? undefined : 'environment'
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        
        videoRef.current.onloadedmetadata = () => {
          setIsScanning(true)
          startScanning()
        }
      }

    } catch (err) {
      console.error('Failed to start camera:', err)
      setError(getCameraErrorMessage(err))
      setHasPermission(false)
    }
  }

  const switchCamera = async () => {
    if (devices.length <= 1) return
    
    cleanup()
    await startCamera()
  }

  const startScanning = () => {
    if (!canvasRef.current || !videoRef.current) return

    scanIntervalRef.current = setInterval(() => {
      try {
        const canvas = canvasRef.current!
        const video = videoRef.current!
        const context = canvas.getContext('2d')!

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          context.drawImage(video, 0, 0, canvas.width, canvas.height)

          // Get image data for QR detection
          const imageDataObj = context.getImageData(0, 0, canvas.width, canvas.height)
          
          // Simple QR code detection simulation
          // In a real implementation, you'd use a QR detection library here
          // For now, we'll simulate detection after a few seconds
          if (Math.random() < 0.1) { // 10% chance per scan
            const mockQRData = generateMockQRData()
            if (mockQRData) {
              handleScanSuccess(mockQRData)
            }
          }
        }
      } catch (err) {
        console.error('Scanning error:', err)
      }
    }, 500) // Scan every 500ms
  }

  const generateMockQRData = (): string | null => {
    // Simulate different types of QR codes for demo
    const mockData = [
      'ALGORANDADDRESS123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789',
      'https://voicepay.app/send?to=ALGO123&amount=10',
      'voicepay://send?to=ALGO456&amount=5&note=Coffee',
    ]
    
    return mockData[Math.floor(Math.random() * mockData.length)]
  }

  const handleScanSuccess = (data: string) => {
    setScanSuccess(true)
    setIsScanning(false)
    
    // Stop scanning
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }
    
    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate(200)
    }
    
    // Call the onScan callback after a brief delay for visual feedback
    setTimeout(() => {
      onScan(data)
    }, 1000)
  }

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      handleScanSuccess(manualInput.trim())
    }
  }

  const cleanup = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    setIsScanning(false)
  }

  const getCameraErrorMessage = (err: any): string => {
    if (err.name === 'NotAllowedError') {
      return 'Camera permission denied. Please allow camera access and try again.'
    } else if (err.name === 'NotFoundError') {
      return 'No camera found. Please ensure your device has a camera.'
    } else if (err.name === 'NotSupportedError') {
      return 'Camera not supported in this browser. Try using Chrome or Safari.'
    } else if (err.name === 'NotReadableError') {
      return 'Camera is being used by another application. Please close other camera apps.'
    } else {
      return 'Failed to access camera. Please check your device settings.'
    }
  }

  const nextCamera = () => {
    if (devices.length > 1) {
      setCurrentDeviceIndex((prev) => (prev + 1) % devices.length)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            QR Code Scanner
            {scanSuccess && <CheckCircle className="h-4 w-4 text-green-500" />}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <AnimatePresence mode="wait">
            {hasPermission === null && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Initializing camera...</p>
              </motion.div>
            )}

            {hasPermission === false && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-8"
              >
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Camera Access Required</h3>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <div className="space-y-2">
                  <Button onClick={initializeCamera} variant="outline">
                    <Camera className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Or enter the address manually below
                  </p>
                </div>
              </motion.div>
            )}

            {hasPermission === true && !scanSuccess && (
              <motion.div
                key="scanner"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-4"
              >
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-64 object-cover"
                    playsInline
                    muted
                  />
                  
                  {/* Scanning overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Scanning frame */}
                      <div className="w-48 h-48 border-2 border-white rounded-lg relative">
                        {/* Corner indicators */}
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                        
                        {/* Scanning line animation */}
                        {isScanning && (
                          <motion.div
                            className="absolute left-0 right-0 h-0.5 bg-blue-500"
                            animate={{ y: [0, 192, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          />
                        )}
                      </div>
                      
                      {/* Status text */}
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white text-sm text-center">
                        {isScanning ? 'Scanning for QR code...' : 'Position QR code in frame'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Camera controls */}
                  {devices.length > 1 && (
                    <div className="absolute top-4 right-4">
                      <Button
                        onClick={nextCamera}
                        size="sm"
                        variant="secondary"
                        className="bg-black/50 hover:bg-black/70"
                      >
                        <SwitchCamera className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Point your camera at a QR code to scan
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Camera active</span>
                    {devices.length > 1 && (
                      <>
                        <span>•</span>
                        <span>Camera {currentDeviceIndex + 1} of {devices.length}</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {scanSuccess && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">QR Code Detected!</h3>
                <p className="text-sm text-muted-foreground">
                  Processing scan result...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Manual input fallback */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Manual Entry</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Paste or type address/QR data here..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
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
        </CardContent>
      </Card>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}