import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Send, QrCode, Loader2, CheckCircle, AlertCircle, Info, Camera } from 'lucide-react'
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
import { QRScanner } from '@/components/ui/qr-scanner'

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