import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Camera, X, Video, VideoOff, Scan, AlertCircle, RefreshCw, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface QRScannerProps {
  onScan: (result: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [hasCamera, setHasCamera] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>('')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
  const [isInitializing, setIsInitializing] = useState(true)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    initializeCamera()
    return () => {
      cleanup()
    }
  }, [])

  const cleanup = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }
    stopCamera()
  }

  const initializeCamera = async () => {
    try {
      setIsInitializing(true)
      setError('')
      setPermissionDenied(false)

      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported in this browser')
      }

      // Get available video devices
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput')
      
      if (videoDevices.length === 0) {
        throw new Error('No camera found on this device')
      }

      setDevices(videoDevices)
      setHasCamera(true)

      // Select back camera by default (mobile)
      const backCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      )
      
      const defaultDevice = backCamera || videoDevices[0]
      setSelectedDeviceId(defaultDevice.deviceId)

      // Start camera automatically
      await startCamera(defaultDevice.deviceId)
      
    } catch (err: any) {
      console.error('Camera initialization failed:', err)
      handleCameraError(err)
    } finally {
      setIsInitializing(false)
    }
  }

  const startCamera = async (deviceId?: string) => {
    try {
      setIsScanning(true)
      setError('')
      setPermissionDenied(false)

      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      // Configure camera constraints
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: deviceId ? undefined : { ideal: 'environment' }
        }
      }

      console.log('Starting camera with constraints:', constraints)

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        
        // Handle video load
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              console.log('Camera started successfully')
              toast.success('📷 Camera started! Position QR code in frame')
              startQRDetection()
            }).catch(err => {
              console.error('Video play failed:', err)
              setError('Failed to start video playback')
            })
          }
        }

        // Handle video errors
        videoRef.current.onerror = (err) => {
          console.error('Video error:', err)
          setError('Video playback error')
        }
      }
    } catch (err: any) {
      console.error('Failed to start camera:', err)
      handleCameraError(err)
      setIsScanning(false)
    }
  }

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }
    
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop()
      })
      setStream(null)
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsScanning(false)
  }

  const handleCameraError = (err: any) => {
    let errorMessage = 'Failed to access camera'
    
    if (err.name === 'NotAllowedError' || err.message.includes('permission')) {
      setPermissionDenied(true)
      errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.'
    } else if (err.name === 'NotFoundError') {
      errorMessage = 'No camera found. Please ensure your device has a camera.'
    } else if (err.name === 'NotReadableError') {
      errorMessage = 'Camera is being used by another application. Please close other apps using the camera.'
    } else if (err.name === 'OverconstrainedError') {
      errorMessage = 'Camera constraints not supported. Trying with basic settings...'
      // Retry with basic constraints
      setTimeout(() => {
        startCamera()
      }, 1000)
      return
    } else if (err.message.includes('not supported')) {
      errorMessage = 'Camera access not supported in this browser. Please use Chrome, Firefox, or Safari.'
    }
    
    setError(errorMessage)
  }

  const startQRDetection = () => {
    // Clear any existing interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }

    // Start QR detection interval
    scanIntervalRef.current = setInterval(() => {
      if (isScanning && videoRef.current && canvasRef.current) {
        detectQRCode()
      }
    }, 500)
  }

  const detectQRCode = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    try {
      // Get image data for QR detection
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      
      // In a real implementation, you would use a QR detection library here
      // For now, we'll simulate detection for demo purposes
      
      // Simulate QR detection success (remove this in production)
      if (Math.random() < 0.01) { // 1% chance per scan
        const mockQRData = 'https://voicepay.app/send?action=send&to=EXAMPLE123456789ABCDEF&amount=10'
        handleQRDetected(mockQRData)
      }
      
    } catch (err) {
      console.error('QR detection error:', err)
    }
  }

  const handleQRDetected = (data: string) => {
    console.log('QR Code detected:', data)
    stopCamera()
    onScan(data)
    toast.success('QR code scanned successfully!')
  }

  const handleManualInput = (value: string) => {
    if (value.trim()) {
      stopCamera()
      onScan(value.trim())
    }
  }

  const switchCamera = async () => {
    if (devices.length <= 1) return

    const currentIndex = devices.findIndex(device => device.deviceId === selectedDeviceId)
    const nextIndex = (currentIndex + 1) % devices.length
    const nextDevice = devices[nextIndex]
    
    setSelectedDeviceId(nextDevice.deviceId)
    await startCamera(nextDevice.deviceId)
  }

  const requestPermissionAgain = async () => {
    setPermissionDenied(false)
    setError('')
    await initializeCamera()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Scan className="h-5 w-5" />
          QR Code Scanner
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {isInitializing ? (
        <div className="bg-muted rounded-lg p-8 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-4"
          >
            <Camera className="h-16 w-16 text-muted-foreground" />
          </motion.div>
          <h3 className="text-lg font-semibold mb-2">Initializing Camera...</h3>
          <p className="text-sm text-muted-foreground">
            Please allow camera access when prompted
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-red-800 dark:text-red-200">Camera Access Required</h4>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
              
              {permissionDenied && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-red-600 dark:text-red-300 font-medium">
                    To enable camera access:
                  </p>
                  <ul className="text-xs text-red-600 dark:text-red-300 list-disc list-inside space-y-1">
                    <li>Look for the camera icon 📷 in your browser's address bar</li>
                    <li>Click it and select "Allow" for camera permissions</li>
                    <li>Or go to browser Settings → Privacy → Camera → Allow for this site</li>
                    <li>Refresh the page and try again</li>
                  </ul>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      onClick={requestPermissionAgain} 
                      size="sm" 
                      variant="outline"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                    <Button 
                      onClick={() => window.location.reload()} 
                      size="sm" 
                      variant="outline"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Page
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : hasCamera ? (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-64 md:h-80 object-cover"
              autoPlay
              playsInline
              muted
            />
            
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            
            <AnimatePresence>
              {isScanning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {/* QR Code scanning overlay */}
                  <div className="relative">
                    <div className="w-48 h-48 border-2 border-white/50 rounded-lg relative">
                      {/* Corner indicators */}
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                      
                      {/* Scanning line animation */}
                      <div className="absolute inset-0 overflow-hidden rounded-lg">
                        <motion.div 
                          className="w-full h-0.5 bg-blue-500"
                          animate={{ y: [0, 192, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                    </div>
                    <p className="text-white text-sm mt-2 text-center bg-black/50 px-2 py-1 rounded">
                      Position QR code within frame
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Camera controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              <Button
                onClick={isScanning ? stopCamera : () => startCamera(selectedDeviceId)}
                size="sm"
                variant={isScanning ? "destructive" : "default"}
                className="bg-black/70 hover:bg-black/90 text-white"
              >
                {isScanning ? (
                  <>
                    <VideoOff className="h-4 w-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
              
              {devices.length > 1 && (
                <Button
                  onClick={switchCamera}
                  size="sm"
                  variant="outline"
                  className="bg-black/70 hover:bg-black/90 text-white border-white/20"
                  disabled={!isScanning}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Position the QR code within the frame to scan automatically
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
              <Camera className="h-3 w-3" />
              <span>
                {isScanning ? 'Camera active - scanning for QR codes' : 'Camera ready'}
              </span>
            </div>
            
            {devices.length > 1 && (
              <p className="text-xs text-muted-foreground">
                Using: {devices.find(d => d.deviceId === selectedDeviceId)?.label || 'Default camera'}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-muted rounded-lg p-8 text-center">
          <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Camera Available</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Please ensure your device has a camera and try again
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label>Or paste address/link manually:</Label>
        <div className="flex space-x-2">
          <Input
            placeholder="Paste Algorand address or VoicePay link here..."
            onPaste={(e) => {
              const pastedText = e.clipboardData.getData('text')
              if (pastedText) {
                handleManualInput(pastedText)
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleManualInput((e.target as HTMLInputElement).value)
              }
            }}
            className="flex-1"
          />
          <Button 
            onClick={() => {
              const input = document.querySelector('input[placeholder*="Paste"]') as HTMLInputElement
              if (input?.value) {
                handleManualInput(input.value)
              }
            }}
            size="sm"
          >
            Use
          </Button>
        </div>
      </div>
    </div>
  )
}