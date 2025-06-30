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

  const qrRef = useRef<HTMLDivElement | null>(null)
  const qrCodeRef = useRef<QRCodeStyling | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /mobile|android|iphone/.test(navigator.userAgent.toLowerCase()))
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const updateQRCode = useCallback(() => {
    if (!wallet?.address || !qrCodeRef.current) return

    const url = new URL(window.location.origin + '/send')
    url.searchParams.set('action', 'send')
    url.searchParams.set('to', wallet.address)
    if (amount && parseFloat(amount) > 0) url.searchParams.set('amount', amount)
    if (note.trim()) url.searchParams.set('note', note.trim())

    qrCodeRef.current.update({ data: url.toString() })
  }, [wallet?.address, amount, note])

  useEffect(() => {
    if (qrCodeRef.current) updateQRCode()
  }, [amount, note, updateQRCode])

  useEffect(() => {
    const qrSize = isMobile ? 240 : 280
    if (!wallet?.address || !qrRef.current) return

    qrRef.current.innerHTML = ''

    const qrCode = new QRCodeStyling({
      width: qrSize,
      height: qrSize,
      type: 'svg',
      data: 'https://example.com',
      margin: 8,
      qrOptions: {
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
        color: '#ffffff'
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

    qrCodeRef.current = qrCode
    qrCode.append(qrRef.current)
    setQrGenerated(true)
    updateQRCode()
  }, [wallet?.address, isMobile, updateQRCode])

  const downloadQRCode = () => {
    if (!qrCodeRef.current) return toast.error('QR code not ready')
    qrCodeRef.current.download({ name: `voicepay-qr-${Date.now()}`, extension: 'png' })
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <BackButton />
      <h1 className="text-2xl font-bold">Receive Payment</h1>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <QrCode className="w-5 h-5" /> Smart QR Code
            {qrGenerated && <CheckCircle className="text-green-500 w-4 h-4" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div
              ref={qrRef}
              className="bg-white p-3 border rounded-lg shadow"
              style={{ width: isMobile ? 240 : 280, height: isMobile ? 240 : 280 }}
            >
              {!qrGenerated && (
                <div className="text-center text-muted-foreground">
                  <QrCode className="h-12 w-12 mx-auto mb-2" />
                  <p>Generating QR...</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex gap-2 justify-center">
            <Button onClick={downloadQRCode} variant="outline" size="sm" disabled={!qrGenerated}>
              <Download className="w-4 h-4 mr-1" /> Download
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="amount">Amount (optional)</Label>
          <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="mb-3" />

          <Label htmlFor="note">Note (optional)</Label>
          <Input id="note" value={note} onChange={e => setNote(e.target.value)} placeholder="Payment for..." />
        </CardContent>
      </Card>
    </div>
  )
}
