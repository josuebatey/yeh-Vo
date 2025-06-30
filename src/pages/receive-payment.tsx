import { useState, useRef, useEffect, useCallback } from 'react'
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
  const mountedRef = useRef(true)

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
    return () => {
      mountedRef.current = false
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // Initialize QR code
  useEffect(() => {
    if (!wallet?.address || !qrCodeRef.current || qrCodeInstanceRef.current) return

    const initQRCode = async () => {
      try {
        const qrSize = isMobile ? 240 : 280

        const qrCode = new QRCodeStyling({
          width: qrSize,
          height: qrSize,
          type: 'svg' as const,
          data: `${window.location.origin}/send?action=send&to=${wallet.address}`,
          margin: 8,
          qrOptions: {
            mode: 'Byte' as const,
            errorCorrectionLevel: 'M' as const
          },
          imageOptions: {
            hideBackgroundDots: true,
            imageSize: 0.4,
            margin: 0,
            crossOrigin: 'anonymous' as const
          },
          dotsOptions: {
            color: '#7c3aed',
            type: 'rounded' as const
          },
          backgroundOptions: {
            color: '#ffffff',
          },
          cornersSquareOptions: {
            color: '#7c3aed',
            type: 'extra-rounded' as const
          },
          cornersDotOptions: {
            color: '#7c3aed',
            type: 'dot' as const
          }
        })

        qrCodeInstanceRef.current = qrCode
        
        if (qrCodeRef.current && mountedRef.current) {
          qrCode.append(qrCodeRef.current)
          setQrGenerated(true)
        }
      } catch (error) {
        console.error('Failed to initialize QR code:', error)
        if (mountedRef.current) {
          toast.error('Failed to generate QR code')
        }
      }
    }

    initQRCode()
  }, [wallet?.address, isMobile])

  // Update QR code data when amount or note changes
  const updateQRCode = useCallback(() => {
    if (!wallet?.address || !qrCodeInstanceRef.current || !mountedRef.current) return

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
      
      qrCodeInstanceRef.current.update({
        data: deepLinkUrl
      })
      
      if (mountedRef.current) {
        toast.success('QR code updated!')
      }
    } catch (error) {
      console.error('QR code update failed:', error)
      if (mountedRef.current) {
        toast.error('Failed to update QR code')
      }
    }
  }, [wallet?.address, amount, note])

  // Update QR code when dependencies change
  useEffect(() => {
    if (qrGenerated) {
      updateQRCode()
    }
  }, [updateQRCode, qrGenerated])

  const copyAddress = async () => {
    if (!wallet?.address) return
    
    try {
      await navigator.clipboard.writeText(wallet.address)
      toast.success('Address copied to clipboard!')
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
      
      await navigator.clipboard.writeText(deepLinkUrl)
      toast.success('Payment link copied to clipboard!')
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
      if (navigator.share && isMobile) {
        await navigator.share(shareData)
        toast.success('Payment request shared!')
      } else {
        await copyPaymentLink()
      }
    } catch (error) {
      console.error('Share failed:', error)
      try {
        await copyPaymentLink()
      } catch (clipboardError) {
        toast.error('Failed to share payment request')
      }
    }
  }

  const downloadQRCode = async () => {
    if (!qrCodeInstanceRef.current || !qrGenerated) {
      toast.error('QR code not ready for download')
      return
    }

    try {
      qrCodeInstanceRef.current.download({
        name: `voicepay-qr-${Date.now()}`,
        extension: 'png'
      })
      toast.success('QR code downloaded!')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header Section - Fixed */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <BackButton />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Receive Payment
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Share your QR code or payment link to receive payments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* QR Code Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <QrCode className="h-6 w-6 flex-shrink-0" />
                <span className="truncate">Smart QR Code</span>
                {qrGenerated && (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div 
                  ref={qrCodeRef}
                  className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center"
                  style={{ 
                    width: isMobile ? '256px' : '296px', 
                    height: isMobile ? '256px' : '296px' 
                  }}
                >
                  {!qrGenerated && (
                    <div className="text-center text-slate-600 dark:text-slate-400">
                      <QrCode className="h-12 w-12 mx-auto mb-3" />
                      <p className="text-sm">Generating QR code...</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Scan this QR code to automatically open VoicePay send page
                </p>
                
                <div className="flex items-center justify-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full mx-auto max-w-fit">
                  <Smartphone className="h-4 w-4 flex-shrink-0" />
                  <span>Works with any phone camera</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button onClick={copyPaymentLink} variant="outline" size="sm" className="h-10">
                    <Copy className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Copy Link</span>
                  </Button>
                  <Button onClick={sharePaymentRequest} size="sm" className="h-10">
                    <Share className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Share</span>
                  </Button>
                  <Button onClick={downloadQRCode} variant="outline" size="sm" className="h-10" disabled={!qrGenerated}>
                    <Download className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Download</span>
                  </Button>
                  <Button onClick={updateQRCode} variant="outline" size="sm" className="h-10">
                    <QrCode className="mr-2 h-4 w-4 flex-shrink-0" />
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
        >
          <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">Payment Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="amount" className="text-sm font-medium text-slate-700 dark:text-slate-300">Requested Amount (optional)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00 ALGO"
                    className="h-12 text-base border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                    inputMode="decimal"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Leave empty for any amount
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="note" className="text-sm font-medium text-slate-700 dark:text-slate-300">Note (optional)</Label>
                  <Input
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Payment for..."
                    maxLength={100}
                    className="h-12 text-base border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {note.length}/100 characters
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Preview Link:</h4>
                <p className="text-xs font-mono break-all text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-3 rounded-lg">
                  {`${window.location.origin}/send?action=send&to=${wallet?.address?.slice(0, 20) || '...'}...`}
                  {amount && `&amount=${amount}`}
                  {note && `&note=${encodeURIComponent(note.slice(0, 20))}...`}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button onClick={sharePaymentRequest} className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Share className="mr-2 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">Share Request</span>
                </Button>
                <Button onClick={openInNewTab} variant="outline" className="h-12 border-slate-300 dark:border-slate-600">
                  <ExternalLink className="mr-2 h-5 w-5 flex-shrink-0" />
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
        >
          <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">Wallet Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Your Address</Label>
                <div className="space-y-3">
                  <Input 
                    value={wallet?.address || 'Loading...'}
                    readOnly
                    className="font-mono text-sm h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Button size="sm" onClick={copyAddress} className="h-10">
                      <Copy className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">Copy</span>
                    </Button>
                    <Button size="sm" variant="outline" onClick={speakAddress} className="h-10 border-slate-300 dark:border-slate-600">
                      <Volume2 className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">Speak</span>
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Balance</Label>
                <Input 
                  value={`${wallet?.balance?.toFixed(4) || '0'} ALGO`}
                  readOnly
                  className="h-12 text-base font-semibold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
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
        >
          <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 md:grid-cols-3">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl flex items-center justify-center mx-auto">
                    <QrCode className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">Smart QR Code</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    QR code contains a deep link that automatically opens VoicePay send page with your address pre-filled
                  </p>
                </div>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl flex items-center justify-center mx-auto">
                    <Smartphone className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">Universal Scanning</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Anyone can scan with their phone camera - no special app needed. Works with iPhone Camera app and Android
                  </p>
                </div>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl flex items-center justify-center mx-auto">
                    <Share className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">Easy Sharing</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
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