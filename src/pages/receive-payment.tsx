import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, QrCode, Volume2, Share, ExternalLink, Camera, CheckCircle } from 'lucide-react'
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
  const qrCodeRef = useRef<HTMLDivElement>(null)

  const generateQRCode = React.useCallback(() => {
    if (!wallet?.address || !qrCodeRef.current) return

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

    const qrCode = new QRCodeStyling({
      width: 300,
      height: 300,
      type: 'svg',
      data: deepLinkUrl, // Full deep link with domain
      margin: 10,
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

    // Clear previous QR code and generate new one
    qrCodeRef.current.innerHTML = ''
    qrCode.append(qrCodeRef.current)
    setQrGenerated(true)
    
    // Show success message
    toast.success('QR code generated with payment link!')
  }, [wallet?.address, amount, note])

  React.useEffect(() => {
    generateQRCode()
  }, [generateQRCode])

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
      // Try native sharing first (mobile)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        toast.success('Payment request shared!')
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText)
        toast.success('Payment request copied to clipboard!')
      }
    } catch (error) {
      // Final fallback - just copy the URL
      try {
        await navigator.clipboard.writeText(deepLinkUrl)
        toast.success('Payment link copied to clipboard!')
      } catch (clipboardError) {
        toast.error('Failed to share payment request')
      }
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
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <BackButton />
        <h1 className="text-2xl md:text-3xl font-bold">Receive Payment</h1>
        <p className="text-muted-foreground">Share your QR code or payment link to receive payments</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Smart QR Code
                {qrGenerated && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div 
                  ref={qrCodeRef}
                  className="bg-white p-4 rounded-lg shadow-sm border min-h-[300px] min-w-[300px] flex items-center justify-center"
                >
                  {!qrGenerated && (
                    <div className="text-center text-muted-foreground">
                      <QrCode className="h-12 w-12 mx-auto mb-2" />
                      <p>Generating QR code...</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Scan this QR code to automatically open VoicePay send page
                </p>
                
                <div className="flex items-center justify-center gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-full">
                  <Camera className="h-3 w-3" />
                  <span>Auto-opens send page with pre-filled details</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={copyPaymentLink} variant="outline" size="sm" className="flex-1">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </Button>
                  <Button onClick={generateQRCode} variant="outline" size="sm" className="flex-1">
                    <QrCode className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Payment Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Requested Amount (optional)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00 ALGO"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for any amount
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="note">Note (optional)</Label>
                <Input
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Payment for..."
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  {note.length}/100 characters
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <h4 className="font-medium mb-2">Preview Link:</h4>
                <p className="text-xs font-mono break-all text-muted-foreground">
                  {`${window.location.origin}/send?action=send&to=${wallet?.address || '...'}`}
                  {amount && `&amount=${amount}`}
                  {note && `&note=${encodeURIComponent(note)}`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button onClick={sharePaymentRequest} className="w-full">
                  <Share className="mr-2 h-4 w-4" />
                  Share Request
                </Button>
                <Button onClick={openInNewTab} variant="outline" className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Test Link
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wallet Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Your Address</Label>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Input 
                    value={wallet?.address || 'Loading...'}
                    readOnly
                    className="font-mono text-xs md:text-sm flex-1"
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={copyAddress}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={speakAddress}>
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Current Balance</Label>
                <Input 
                  value={`${wallet?.balance?.toFixed(4) || '0'} ALGO`}
                  readOnly
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
                <QrCode className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-semibold">Smart QR Code</h4>
              <p className="text-sm text-muted-foreground">
                QR code contains a deep link that automatically opens VoicePay send page with your address pre-filled
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <Camera className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold">Universal Scanning</h4>
              <p className="text-sm text-muted-foreground">
                Anyone can scan with their phone camera - no special app needed. Works with iPhone Camera app and Android
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto">
                <Share className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold">Easy Sharing</h4>
              <p className="text-sm text-muted-foreground">
                Share via any messaging app, email, or social media. Recipients get a direct link to send payment
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}