import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Upload, X, Scan, AlertCircle, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import jsQR from 'jsqr'

interface QRScannerProps {
  onScan: (result: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string>('')
  const [manualInput, setManualInput] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  const startCamera = async () => {
    try {
      setError('')
      setIsScanning(true)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      streamRef.current = stream
      setHasPermission(true)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        
        // Start scanning when video is ready
        videoRef.current.onloadedmetadata = () => {
          scanQRCode()
        }
      }
    } catch (err: any) {
      console.error('Camera access error:', err)
      setHasPermission(false)
      setIsScanning(false)
      
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access and try again.')
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please use file upload or manual input.')
      } else {
        setError('Failed to access camera. Please try file upload or manual input.')
      }
    }
  }

  const stopScanning = () => {
    setIsScanning(false)
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) {
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanQRCode)
      return
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data for QR scanning
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

    try {
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      })

      if (qrCode && qrCode.data) {
        console.log('QR Code detected:', qrCode.data)
        stopScanning()
        onScan(qrCode.data)
        toast.success('QR code scanned successfully!')
        return
      }
    } catch (error) {
      console.error('QR scanning error:', error)
    }

    // Continue scanning
    animationFrameRef.current = requestAnimationFrame(scanQRCode)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const canvas = canvasRef.current
      const context = canvas?.getContext('2d')
      
      if (!canvas || !context) {
        throw new Error('Canvas not available')
      }

      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        context.drawImage(img, 0, 0)

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        
        try {
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height)
          
          if (qrCode && qrCode.data) {
            onScan(qrCode.data)
            toast.success('QR code found in image!')
          } else {
            toast.error('No QR code found in image. Please try a clearer image.')
          }
        } catch (error) {
          console.error('QR code scanning error:', error)
          toast.error('Failed to scan QR code from image.')
        }
      }

      img.onerror = () => {
        toast.error('Failed to load image. Please try a different file.')
      }

      img.src = URL.createObjectURL(file)
    } catch (error) {
      console.error('File upload error:', error)
      toast.error('Failed to process image file.')
    }

    // Reset file input
    event.target.value = ''
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualInput.trim()) {
      onScan(manualInput.trim())
      toast.success('Address entered manually!')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              QR Code Scanner
            </span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera Scanner */}
          <div className="space-y-4">
            <div className="relative">
              {isScanning ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full h-64 bg-black rounded-lg object-cover"
                    playsInline
                    muted
                  />
                  <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary"></div>
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary"></div>
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary"></div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary"></div>
                  </div>
                  <motion.div
                    className="absolute inset-x-0 top-1/2 h-0.5 bg-primary opacity-75"
                    animate={{ y: [-50, 50, -50] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              ) : (
                <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Camera preview will appear here</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}

            <div className="flex gap-2">
              {!isScanning ? (
                <Button onClick={startCamera} className="flex-1">
                  <Camera className="mr-2 h-4 w-4" />
                  Start Camera
                </Button>
              ) : (
                <Button onClick={stopScanning} variant="outline" className="flex-1">
                  <X className="mr-2 h-4 w-4" />
                  Stop Camera
                </Button>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="qr-upload">Upload QR Code Image</Label>
            <div className="flex items-center gap-2">
              <Input
                id="qr-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="flex-1"
              />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Select an image file containing a QR code
            </p>
          </div>

          {/* Manual Input */}
          <div className="space-y-2">
            <Label htmlFor="manual-input">Manual Entry</Label>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <Input
                id="manual-input"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Paste or type address here..."
                className="flex-1"
              />
              <Button type="submit" disabled={!manualInput.trim()}>
                <CheckCircle className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground">
              Manually enter the address if scanning doesn't work
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Hidden canvas for QR processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}