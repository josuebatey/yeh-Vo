import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, QrCode, Volume2, Share, ExternalLink, CheckCircle, Smartphone, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useWalletStore } from '@/stores/walletStore'
import { voiceService } from '@/services/voiceService'
import { BackButton } from '@/components/ui/back-button'
import QRCodeStyling from 'qr-code-styling'

export function ReceivePayment() {
  const { wallet } = useWalletStore()
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [qrGenerated, setQrGenerated] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const qrCodeRef = useRef<HTMLDivElement>(null)
  const qrCodeInstanceRef = useRef<QRCodeStyling | null>(null)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      const isSmallScreen = window.innerWidth <= 768
      setIsMobile(isMobileDevice || isSmallScreen)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const generateQRCode = React.useCallback(() => {
    if (!wallet?.address || !qrCodeRef.current) return

    try {
      // Clean up previous QR code instance
      if (qrCodeInstanceRef.current) {
        // Safely clear the container
        const container = qrCodeRef.current
        if (container) {
          // Remove all child nodes safely
          while (container.firstChild) {
            container.removeChild(container.firstChild)
          }
        }
        qrCodeInstanceRef.current = null
      }

      // Get current domain - works for both localhost and production
      const protocol = window.location.protocol
      const host = window.location.host
      const baseUrl = `${protocol}//${host}`
      
      // Create comprehensive deep link URL
      const params = new URLSearchParams()
      params.set('action', 'send')
      params.set('to', wallet.address)
      if (amount && parseFloat(amount) > 0) {
        params.set('amount', amount)
      }
      if (note.trim()) {
        params.set('note', note.trim())
      }
      
      // Create the full deep link URL
      const deepLinkUrl = `${baseUrl}/send?${params.toString()}`
      
      console.log('Generated QR Code URL:', deepLinkUrl) // Debug log

      // Adjust QR code size for mobile
      const qrSize = isMobile ? 240 : 280

      const qrCode = new QRCodeStyling({
        width: qrSize,
        height: qrSize,
        type: 'svg',
        data: deepLinkUrl, // Full deep link with domain
        margin: 8,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte',
          errorCorrectionLevel: 'M'
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.4,
          margin: 0,
          crossOrigin: 'anonymous'
        },
        dotsOptions: {
          color: '#7c3aed',
          type: 'rounded'
        },
        backgroundOptions: {
          color: '#ffffff',
        },
        cornersSquareOptions: {
          color: '#7c3aed',
          type: 'extra-rounded'
        },
        cornersDotOptions: {
          color: '#7c3aed',
          type: 'dot'
        }
      })

      // Store the QR code instance for cleanup
      qrCodeInstanceRef.current = qrCode

      // Generate QR code safely
      if (qrCodeRef.current) {
        qrCode.append(qrCodeRef.current)
        setQrGenerated(true)
        
        // Show success message
        toast.success('QR code generated with payment link!')
      }
    } catch (error) {
      console.error('QR code generation failed:', error)
      toast.error('Failed to generate QR code')
    }
  }, [wallet?.address, amount, note, isMobile])

  // Generate QR code when dependencies change
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateQRCode()
    }, 100) // Small delay to ensure DOM is ready

    return () => clearTimeout(timeoutId)
  }, [generateQRCode])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (qrCodeInstanceRef.current && qrCodeRef.current) {
        try {
          // Safely clear the container
          const container = qrCodeRef.current
          while (container.firstChild) {
            container.removeChild(container.firstChild)
          }
        } catch (error) {
          console.warn('QR code cleanup warning:', error)
        }
        qrCodeInstanceRef.current = null
      }
    }
  }, [])

  const copyAddress = async () => {
    if (!wallet?.address) return
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(wallet.address)
        toast.success('Address copied to clipboard!')
      } else {
        // Fallback for older mobile browsers
        const textArea = document.createElement('textarea')
        textArea.value = wallet.address
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        try {
          document.execCommand('copy')
          toast.success('Address copied to clipboard!')
        } catch (err) {
          toast.error('Failed to copy address')
        } finally {
          // Ensure cleanup
          if (document.body.contains(textArea)) {
            document.body.removeChild(textArea)
          }
        }
      }
    } catch (error) {
      toast.error('Failed to copy address')
    }
  }

  const copyPaymentLink = async () => {
    if (!wallet?.address) return
    
    try {
      const protocol = window.location.protocol
      const host = window.location.host
      const baseUrl = `${protocol}//${host}`
      
      const params = new URLSearchParams()
      params.set('action', 'send')
      params.set('to', wallet.address)
      if (amount && parseFloat(amount) > 0) {
        params.set('amount', amount)
      }
      if (note.trim()) {
        params.set('note', note.trim())
      }
      
      const deepLinkUrl = `${baseUrl}/send?${params.toString()}`
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(deepLinkUrl)
        toast.success('Payment link copied to clipboard!')
      } else {
        // Fallback for older mobile browsers
        const textArea = document.createElement('textarea')
        textArea.value = deepLinkUrl
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        try {
          document.execCommand('copy')
          toast.success('Payment link copied to clipboard!')
        } catch (err) {
          toast.error('Failed to copy payment link')
        } finally {
          // Ensure cleanup
          if (document.body.contains(textArea)) {
            document.body.removeChild(textArea)
          }
        }
      }
    } catch (error) {
      toast.error('Failed to copy payment link')
    }
  }

  const speakAddress = async () => {
    if (!wallet?.address) return
    
    try {
      await voiceService.speak(`Your wallet address is: ${wallet.address}`)
    } catch (error) {
      toast.error('Failed to speak address')
    }
  }

  const sharePaymentRequest = async () => {
    if (!wallet?.address) return

    const protocol = window.location.protocol
    const host = window.location.host
    const baseUrl = `${protocol}//${host}`
    
    const params = new URLSearchParams()
    params.set('action', 'send')
    params.set('to', wallet.address)
    if (amount && parseFloat(amount) > 0) {
      params.set('amount', amount)
    }
    if (note.trim()) {
      params.set('note', note.trim())
    }
    
    const deepLinkUrl = `${baseUrl}/send?${params.toString()}`
    
    const shareText = `💰 Send ${amount ? `${amount} ALGO ` : 'payment '}to my VoicePay wallet${note ? `\n📝 ${note}` : ''}\n\n🔗 ${deepLinkUrl}\n\n📱 Scan QR code or click link to pay instantly!`

    const shareData = {
      title: 'VoicePay Payment Request',
      text: shareText,
      url: deepLinkUrl,
    }

    try {
      // Try native sharing first (mobile)
      if (navigator.share && isMobile) {
        // Check if we can share this data
        if (navigator.canShare && !navigator.canShare(shareData)) {
          // Fallback to just URL if full data not supported
          await navigator.share({ url: deepLinkUrl, title: 'VoicePay Payment Request' })
        } else {
          await navigator.share(shareData)
        }
        toast.success('Payment request shared!')
      } else {
        // Fallback to clipboard
        await copyPaymentLink()
      }
    } catch (error) {
      console.error('Share failed:', error)
      // Final fallback - just copy the URL
      try {
        await copyPaymentLink()
      } catch (clipboardError) {
        toast.error('Failed to share payment request')
      }
    }
  }

  const downloadQRCode = async () => {
    if (!qrCodeRef.current) return

    try {
      const svgElement = qrCodeRef.current.querySelector('svg')
      if (!svgElement) return

      // Convert SVG to canvas for mobile compatibility
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)
      
      img.onload = () => {
        canvas.width = img.width || 280
        canvas.height = img.height || 280
        ctx?.drawImage(img, 0, 0)
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (!blob) return
          
          const downloadUrl = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = downloadUrl
          a.download = `voicepay-qr-${Date.now()}.png`
          document.body.appendChild(a)
          a.click()
          
          // Cleanup
          if (document.body.contains(a)) {
            document.body.removeChild(a)
          }
          URL.revokeObjectURL(downloadUrl)
          toast.success('QR code downloaded!')
        }, 'image/png')
        
        URL.revokeObjectURL(url)
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        toast.error('Failed to process QR code for download')
      }
      
      img.src = url
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Failed to download QR code')
    }
  }

  const openInNewTab = () => {
    const protocol = window.location.protocol
    const host = window.location.host
    const baseUrl = `${protocol}//${host}`
    
    const params = new URLSearchParams()
    params.set('action', 'send')
    params.set('to', wallet?.address || '')
    if (amount && parseFloat(amount) > 0) {
      params.set('amount', amount)
    }
    if (note.trim()) {
      params.set('note', note.trim())
    }
    
    const deepLinkUrl = `${baseUrl}/send?${params.toString()}`
    window.open(deepLinkUrl, '_blank')
  }

  return (
    <div className="p-4 md:p-6 w-full max-w-6xl mx-auto space-y-4 md:space-y-6 overflow-hidden">
      <div className="w-full">
        <BackButton />
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Receive Payment</h1>
        <p className="text-sm md:text-base text-muted-foreground">Share your QR code or payment link to receive payments</p>
      </div>

      {/* Mobile-first layout */}
      <div className="space-y-4 md:space-y-6 w-full">
        {/* QR Code Section - Full width on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <Card className="w-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <QrCode className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Smart QR Code</span>
                {qrGenerated && (
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 w-full">
              <div className="flex justify-center w-full">
                <div 
                  ref={qrCodeRef}
                  className="bg-white p-3 rounded-lg shadow-sm border flex items-center justify-center flex-shrink-0"
                  style={{ 
                    width: isMobile ? '240px' : '280px', 
                    height: isMobile ? '240px' : '280px' 
                  }}
                >
                  {!qrGenerated && (
                    <div className="text-center text-muted-foreground">
                      <QrCode className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm">Generating QR code...</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-center space-y-3 w-full">
                <p className="text-xs md:text-sm text-muted-foreground px-2">
                  Scan this QR code to automatically open VoicePay send page
                </p>
                
                <div className="flex items-center justify-center gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-full mx-auto max-w-fit">
                  <Smartphone className="h-3 w-3 flex-shrink-0" />
                  <span className="text-center">Works with any phone camera</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full">
                  <Button onClick={copyPaymentLink} variant="outline" size="sm" className="w-full text-xs">
                    <Copy className="mr-1 h-3 w-3 flex-shrink-0" />
                    <span className="truncate">Copy Link</span>
                  </Button>
                  <Button onClick={sharePaymentRequest} size="sm" className="w-full text-xs">
                    <Share className="mr-1 h-3 w-3 flex-shrink-0" />
                    <span className="truncate">Share</span>
                  </Button>
                  <Button onClick={downloadQRCode} variant="outline" size="sm" className="w-full text-xs">
                    <Download className="mr-1 h-3 w-3 flex-shrink-0" />
                    <span className="truncate">Download</span>
                  </Button>
                  <Button onClick={generateQRCode} variant="outline" size="sm" className="w-full text-xs">
                    <QrCode className="mr-1 h-3 w-3 flex-shrink-0" />
                    <span className="truncate">Refresh</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Details Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full"
        >
          <Card className="w-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-base md:text-lg">Payment Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 w-full">
                  <Label htmlFor="amount" className="text-sm">Requested Amount (optional)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00 ALGO"
                    className="w-full h-12 text-base"
                    inputMode="decimal"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for any amount
                  </p>
                </div>
                
                <div className="space-y-2 w-full">
                  <Label htmlFor="note" className="text-sm">Note (optional)</Label>
                  <Input
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Payment for..."
                    maxLength={100}
                    className="w-full h-12 text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    {note.length}/100 characters
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 w-full overflow-hidden">
                <h4 className="font-medium mb-2 text-sm">Preview Link:</h4>
                <p className="text-xs font-mono break-all text-muted-foreground overflow-wrap-anywhere">
                  {`${window.location.origin}/send?action=send&to=${wallet?.address?.slice(0, 20) || '...'}...`}
                  {amount && `&amount=${amount}`}
                  {note && `&note=${encodeURIComponent(note.slice(0, 20))}...`}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                <Button onClick={sharePaymentRequest} className="w-full h-12">
                  <Share className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Share Request</span>
                </Button>
                <Button onClick={openInNewTab} variant="outline" className="w-full h-12">
                  <ExternalLink className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Test Link</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Wallet Details Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full"
        >
          <Card className="w-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-base md:text-lg">Wallet Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 w-full">
              <div className="space-y-2 w-full">
                <Label className="text-sm">Your Address</Label>
                <div className="flex flex-col gap-2 w-full">
                  <Input 
                    value={wallet?.address || 'Loading...'}
                    readOnly
                    className="font-mono text-xs md:text-sm w-full h-12"
                  />
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Button size="sm" onClick={copyAddress} className="flex-1 h-10">
                      <Copy className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">Copy</span>
                    </Button>
                    <Button size="sm" variant="outline" onClick={speakAddress} className="flex-1 h-10">
                      <Volume2 className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">Speak</span>
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 w-full">
                <Label className="text-sm">Current Balance</Label>
                <Input 
                  value={`${wallet?.balance?.toFixed(4) || '0'} ALGO`}
                  readOnly
                  className="w-full h-12 text-base font-semibold"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full"
        >
          <Card className="w-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-base md:text-lg">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="w-full">
              <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3 w-full">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
                    <QrCode className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-sm md:text-base">Smart QR Code</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    QR code contains a deep link that automatically opens VoicePay send page with your address pre-filled
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                    <Smartphone className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-semibold text-sm md:text-base">Universal Scanning</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Anyone can scan with their phone camera - no special app needed. Works with iPhone Camera app and Android
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto">
                    <Share className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-sm md:text-base">Easy Sharing</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Share via any messaging app, email, or social media. Recipients get a direct link to send payment
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}