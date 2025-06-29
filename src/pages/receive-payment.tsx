import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, QrCode, Volume2, Share } from 'lucide-react'
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
  const qrCodeRef = useRef<HTMLDivElement>(null)

  const generateQRCode = React.useCallback(() => {
    if (!wallet?.address || !qrCodeRef.current) return

    const qrCode = new QRCodeStyling({
      width: 250,
      height: 250,
      type: 'svg',
      data: wallet.address,
      image: undefined,
      dotsOptions: {
        color: '#7c3aed',
        type: 'rounded'
      },
      backgroundOptions: {
        color: 'transparent',
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

    qrCodeRef.current.innerHTML = ''
    qrCode.append(qrCodeRef.current)
  }, [wallet?.address])

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

    const shareData = {
      title: 'VoicePay Payment Request',
      text: `Send ${amount || 'payment'} to my VoicePay wallet${note ? `: ${note}` : ''}`,
      url: `voicepay://pay?address=${wallet.address}&amount=${amount}&note=${encodeURIComponent(note)}`,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(
          `Send payment to: ${wallet.address}\n${amount ? `Amount: ${amount} ALGO\n` : ''}${note ? `Note: ${note}` : ''}`
        )
        toast.success('Payment request copied to clipboard!')
      }
    } catch (error) {
      toast.error('Failed to share payment request')
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <BackButton />
        <h1 className="text-2xl md:text-3xl font-bold">Receive Payment</h1>
        <p className="text-muted-foreground">Share your address or QR code to receive payments</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div 
                  ref={qrCodeRef}
                  className="bg-white p-4 rounded-lg"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Scan this QR code to send payments to your wallet
              </p>
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
              <CardTitle>Wallet Address</CardTitle>
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
                <Label>Balance</Label>
                <Input 
                  value={`${wallet?.balance?.toFixed(4) || '0'} ALGO`}
                  readOnly
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Requested Amount (optional)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00 ALGO"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="note">Note (optional)</Label>
                <Input
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Payment for..."
                />
              </div>

              <Button onClick={sharePaymentRequest} className="w-full">
                <Share className="mr-2 h-4 w-4" />
                Share Payment Request
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How to Receive Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center space-y-2">
              <QrCode className="h-8 w-8 mx-auto text-purple-500" />
              <h4 className="font-semibold">QR Code</h4>
              <p className="text-sm text-muted-foreground">
                Show your QR code to the sender for instant address scanning
              </p>
            </div>
            <div className="text-center space-y-2">
              <Copy className="h-8 w-8 mx-auto text-blue-500" />
              <h4 className="font-semibold">Share Address</h4>
              <p className="text-sm text-muted-foreground">
                Copy and share your wallet address via any messaging app
              </p>
            </div>
            <div className="text-center space-y-2">
              <Volume2 className="h-8 w-8 mx-auto text-green-500" />
              <h4 className="font-semibold">Voice Reading</h4>
              <p className="text-sm text-muted-foreground">
                Have your address read aloud for easy manual entry
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}