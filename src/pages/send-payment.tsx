import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Send, QrCode, Loader2, CheckCircle, AlertCircle, Info, Camera, X, Video, VideoOff, Scan } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { useWalletStore } from '@/stores/walletStore'
import { paymentService } from '@/services/paymentService'
import { VoiceCommandButton } from '@/components/ui/voice-command-button'
import { voiceService } from '@/services/voiceService'
import { BackButton } from '@/components/ui/back-button'
import { notificationService } from '@/components/ui/notification-service'

// Enhanced QR Scanner component with proper camera access
function QRScanner({ onScan, onClose }: { onScan: (result: string) => void, onClose: () => void }) {
  const [hasCamera, setHasCamera] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>('')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    checkCameraAccess()
    return () => {
      stopCamera()
    }
  }, [])

  const checkCameraAccess = async () => {
    try {
      // Check if camera is available
      const devices = await navigator.mediaDevices.enumerateDevices()
      const hasVideoInput = devices.some(device => device.kind === 'videoinput')
      
      if (!hasVideoInput) {
        setError('No camera found on this device.')
        return
      }

      setHasCamera(true)
      await startCamera()
    } catch (err: any) {
      console.error('Camera access error:', err)
      setPermissionDenied(true)
      setError('Camera access denied. Please allow camera permissions in your browser settings.')
    }
  }

  const startCamera = async () => {
    try {
      setIsScanning(true)
      setError('')
      setPermissionDenied(false)

      // Request camera access with back camera preference for mobile
      const constraints = {
        video: { 
          facingMode: { ideal: 'environment' }, // Prefer back camera
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              console.log('Camera started successfully')
              toast.success('Camera started! Position QR code in frame')
              
              // Start QR detection simulation
              setTimeout(() => {
                if (isScanning) {
                  scanForQR()
                }
              }, 1000)
            }).catch(err => {
              console.error('Video play failed:', err)
              setError('Failed to start video playback')
            })
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to start camera:', err)
      
      if (err.name === 'NotAllowedError') {
        setPermissionDenied(true)
        setError('Camera access denied. Please allow camera permissions and refresh the page.')
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please ensure your device has a camera.')
      } else if (err.name === 'NotReadableError') {
        setError('Camera is being used by another application.')
      } else if (err.name === 'OverconstrainedError') {
        setError('Camera constraints not supported. Trying with basic settings...')
        // Retry with basic constraints
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({ video: true })
          setStream(basicStream)
          if (videoRef.current) {
            videoRef.current.srcObject = basicStream
            await videoRef.current.play()
          }
        } catch (basicErr) {
          setError('Failed to access camera with basic settings.')
        }
      } else {
        setError('Failed to access camera. Please try again.')
      }
      
      setIsScanning(false)
    }
  }

  const stopCamera = () => {
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

  const scanForQR = () => {
    // In a real implementation, you would use a QR code detection library here
    // For demo purposes, we'll simulate QR detection
    if (isScanning && videoRef.current && canvasRef.current) {
      // Continue scanning every 500ms
      setTimeout(() => {
        if (isScanning) {
          scanForQR()
        }
      }, 500)
    }
  }

  const handleManualInput = (value: string) => {
    if (value.trim()) {
      stopCamera()
      onScan(value.trim())
    }
  }

  const requestPermissionAgain = async () => {
    setPermissionDenied(false)
    setError('')
    await checkCameraAccess()
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

      {error ? (
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
              className="w-full h-64 object-cover"
              autoPlay
              playsInline
              muted
              style={{ transform: 'scaleX(-1)' }} // Mirror for better UX
            />
            
            <canvas
              ref={canvasRef}
              className="hidden"
              width="640"
              height="480"
            />
            
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
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
                      <div 
                        className="w-full h-0.5 bg-blue-500 animate-pulse absolute"
                        style={{
                          animation: 'scan 2s linear infinite',
                        }} 
                      />
                    </div>
                  </div>
                  <p className="text-white text-sm mt-2 text-center bg-black/50 px-2 py-1 rounded">
                    Position QR code within frame
                  </p>
                </div>
              </div>
            )}
            
            {/* Camera controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              <Button
                onClick={isScanning ? stopCamera : startCamera}
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
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Position the QR code within the frame to scan automatically
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
              <Camera className="h-3 w-3" />
              <span>Camera active - scanning for QR codes</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-muted rounded-lg p-8 text-center">
          <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Checking Camera...</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Please allow camera access when prompted
          </p>
          <div className="animate-pulse flex justify-center">
            <div className="h-2 w-32 bg-muted-foreground/20 rounded"></div>
          </div>
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

      {/* Add CSS for scanning animation */}
      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(192px); }
        }
      `}</style>
    </div>
  )
}

export function SendPayment() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const { wallet, refreshBalance } = useWalletStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [showQrScanner, setShowQrScanner] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [txId, setTxId] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [formData, setFormData] = useState({
    amount: '',
    recipient: '',
    channel: 'algorand' as 'algorand' | 'mobile_money' | 'bank',
    currency: 'ALGO',
  })

  // Handle deep link parameters and voice commands
  useEffect(() => {
    // Check for deep link parameters first
    const action = searchParams.get('action')
    const to = searchParams.get('to')
    const amount = searchParams.get('amount')
    const note = searchParams.get('note')

    if (action === 'send' && to) {
      setFormData(prev => ({
        ...prev,
        recipient: to,
        amount: amount || '',
      }))
      
      // Show success message for deep link
      toast.success('Payment details loaded from QR code!')
      
      // If there's a note, show it in a toast
      if (note) {
        toast.info(`Note: ${note}`)
      }
    }

    // Handle voice command from navigation
    const command = location.state?.command
    if (command && command.action === 'send') {
      setFormData(prev => ({
        ...prev,
        amount: command.amount?.toString() || '',
        recipient: command.recipient || '',
        channel: command.channel || 'algorand',
      }))
    }
  }, [searchParams, location.state])

  const handleVoiceCommand = async (transcript: string) => {
    const command = voiceService.parseVoiceCommand(transcript)
    if (command && command.action === 'send') {
      setFormData(prev => ({
        ...prev,
        amount: command.amount?.toString() || prev.amount,
        recipient: command.recipient || prev.recipient,
        channel: command.channel || prev.channel,
      }))
      await voiceService.speak(`Set amount to ${command.amount} and recipient to ${command.recipient}`)
    }
  }

  const handleQrScan = (result: string) => {
    setShowQrScanner(false)
    
    try {
      // Check if it's a VoicePay deep link
      const url = new URL(result)
      if (url.pathname === '/send') {
        const to = url.searchParams.get('to')
        const amount = url.searchParams.get('amount')
        const note = url.searchParams.get('note')
        
        if (to) {
          setFormData(prev => ({
            ...prev,
            recipient: to,
            amount: amount || prev.amount,
          }))
          toast.success('Payment details loaded from QR code!')
          
          if (note) {
            toast.info(`Note: ${note}`)
          }
          return
        }
      }
    } catch {
      // Not a URL, treat as address
    }
    
    // Treat as direct address
    setFormData(prev => ({ ...prev, recipient: result }))
    toast.success('Address scanned successfully!')
  }

  const handleConfirmPayment = () => {
    setShowConfirmDialog(true)
  }

  const handleSendPayment = async () => {
    if (!user) return

    setShowConfirmDialog(false)
    setIsLoading(true)
    setTxStatus('pending')
    setErrorMessage('')

    try {
      // Check daily limits
      const limitCheck = await paymentService.checkDailyLimits(user.id, parseFloat(formData.amount))
      if (!limitCheck.canSend) {
        setErrorMessage(limitCheck.reason || 'Daily limit exceeded')
        setTxStatus('error')
        toast.error(limitCheck.reason)
        return
      }

      const txId = await paymentService.sendPayment(user.id, {
        amount: parseFloat(formData.amount),
        recipient: formData.recipient,
        channel: formData.channel,
        currency: formData.currency,
      })

      await paymentService.updateDailySpent(user.id, parseFloat(formData.amount))
      
      setTxId(txId)
      setTxStatus('success')
      
      // Show notification
      notificationService.showPaymentSent(
        parseFloat(formData.amount), 
        formData.currency, 
        formData.recipient
      )
      
      await voiceService.speak(`Payment of ${formData.amount} ${formData.currency} sent successfully!`)
      toast.success('Payment sent successfully!')

      // Refresh wallet balance
      await refreshBalance()

      // Reset form
      setFormData({
        amount: '',
        recipient: '',
        channel: 'algorand',
        currency: 'ALGO',
      })

    } catch (error: any) {
      console.error('Payment failed:', error)
      setTxStatus('error')
      setErrorMessage(error.message || 'Payment failed')
      toast.error(error.message || 'Payment failed')
      await voiceService.speak('Payment failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getChannelDisplay = (channel: string) => {
    switch (channel) {
      case 'algorand': return 'Algorand Blockchain'
      case 'mobile_money': return 'Mobile Money'
      case 'bank': return 'Bank Transfer'
      default: return channel
    }
  }

  const getRecipientPlaceholder = (channel: string) => {
    switch (channel) {
      case 'algorand': return 'Algorand address (58 characters)'
      case 'mobile_money': return 'Recipient email address'
      case 'bank': return 'Recipient email address'
      default: return 'Recipient identifier'
    }
  }

  const getChannelInfo = (channel: string) => {
    switch (channel) {
      case 'algorand': 
        return 'Direct blockchain transfer using Algorand network'
      case 'mobile_money': 
        return 'Transfer to another VoicePay user via mobile money'
      case 'bank': 
        return 'Transfer to another VoicePay user via bank transfer'
      default: 
        return ''
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <BackButton />
          <h1 className="text-2xl md:text-3xl font-bold">Send Payment</h1>
          <p className="text-muted-foreground">Send money via voice, QR code, or manual entry</p>
        </div>
        <VoiceCommandButton onCommand={handleVoiceCommand} />
      </div>

      <AnimatePresence mode="wait">
        {txStatus === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <CheckCircle className="h-12 w-12 text-green-500 flex-shrink-0" />
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-semibold text-green-500">Payment Sent!</h3>
                    <p className="text-muted-foreground break-all">Transaction ID: {txId}</p>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
                      <Button 
                        onClick={() => setTxStatus('idle')}
                        variant="outline"
                        size="sm"
                      >
                        Send Another
                      </Button>
                      <Button 
                        onClick={() => navigate('/history')}
                        variant="default"
                        size="sm"
                      >
                        View History
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : txStatus === 'error' ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card className="border-red-500/20 bg-red-500/5">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <AlertCircle className="h-12 w-12 text-red-500 flex-shrink-0" />
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-semibold text-red-500">Payment Failed</h3>
                    <p className="text-muted-foreground break-words">{errorMessage}</p>
                    <Button 
                      onClick={() => setTxStatus('idle')}
                      variant="outline"
                      className="mt-4"
                      size="sm"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="manual" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                    <TabsTrigger value="qr">QR Scanner</TabsTrigger>
                  </TabsList>

                  <TabsContent value="manual">
                    <form onSubmit={(e) => { e.preventDefault(); handleConfirmPayment(); }} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                            placeholder="0.00"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="currency">Currency</Label>
                          <Select 
                            value={formData.currency} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALGO">ALGO</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="channel">Payment Channel</Label>
                        <Select 
                          value={formData.channel} 
                          onValueChange={(value: any) => setFormData(prev => ({ ...prev, channel: value, recipient: '' }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="algorand">Algorand Blockchain</SelectItem>
                            <SelectItem value="mobile_money">Mobile Money</SelectItem>
                            <SelectItem value="bank">Bank Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{getChannelInfo(formData.channel)}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="recipient">Recipient</Label>
                        <Input
                          id="recipient"
                          value={formData.recipient}
                          onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
                          placeholder={getRecipientPlaceholder(formData.channel)}
                          required
                          className="break-all"
                        />
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Payment Summary</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Amount:</span>
                            <span>{formData.amount} {formData.currency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>To:</span>
                            <span className="truncate ml-2 max-w-[150px]">{formData.recipient || 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Via:</span>
                            <span>{getChannelDisplay(formData.channel)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Balance:</span>
                            <span>{wallet?.balance?.toFixed(4) || '0'} ALGO</span>
                          </div>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isLoading || !formData.amount || !formData.recipient}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Review Payment
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="qr">
                    <div className="space-y-6">
                      {!showQrScanner ? (
                        <div className="text-center">
                          <QrCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">Scan QR Code</h3>
                          <p className="text-muted-foreground mb-4">
                            Scan a VoicePay QR code to automatically fill payment details
                          </p>
                          <Button onClick={() => setShowQrScanner(true)}>
                            <Camera className="mr-2 h-4 w-4" />
                            Start Camera Scanner
                          </Button>
                        </div>
                      ) : (
                        <QRScanner 
                          onScan={handleQrScan}
                          onClose={() => setShowQrScanner(false)}
                        />
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Please review your payment details before confirming.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span>{formData.amount} {formData.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">To:</span>
                  <span className="truncate ml-2 max-w-[200px]">{formData.recipient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Channel:</span>
                  <span>{getChannelDisplay(formData.channel)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendPayment}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Confirm & Send
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}