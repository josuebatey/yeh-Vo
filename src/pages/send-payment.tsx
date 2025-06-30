import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Send, QrCode, Loader2, CheckCircle, AlertCircle, Info, Camera, Scan } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
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
    const urlParams = new URLSearchParams(window.location.search)
    const action = urlParams.get('action')
    const to = urlParams.get('to')
    const amount = urlParams.get('amount')
    const note = urlParams.get('note')

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
  }, [location.state])

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
      // Check if it's a yehVo deep link
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
        return 'Transfer to another yehVo user via mobile money'
      case 'bank': 
        return 'Transfer to another yehVo user via bank transfer'
      default: 
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header Section with Improved Spacing */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BackButton />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Send Payment
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Send money via voice, QR code, or manual entry
                </p>
              </div>
            </div>
            <VoiceCommandButton onCommand={handleVoiceCommand} />
          </div>
        </div>
      </div>

      {/* Main Content with Better Spacing */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {txStatus === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/20 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                    <div className="text-center sm:text-left flex-1">
                      <h3 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">
                        Payment Sent Successfully!
                      </h3>
                      <p className="text-emerald-700 dark:text-emerald-300 mb-4">
                        Your payment has been processed and is on its way.
                      </p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-100 dark:bg-emerald-900/30 px-3 py-2 rounded-lg break-all">
                        Transaction ID: {txId}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <Button 
                          onClick={() => setTxStatus('idle')}
                          variant="outline"
                          className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                        >
                          Send Another Payment
                        </Button>
                        <Button 
                          onClick={() => navigate('/history')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          View Transaction History
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                      </div>
                    </div>
                    <div className="text-center sm:text-left flex-1">
                      <h3 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">
                        Payment Failed
                      </h3>
                      <p className="text-red-700 dark:text-red-300 mb-4">
                        {errorMessage}
                      </p>
                      <Button 
                        onClick={() => setTxStatus('idle')}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : txStatus === 'pending' ? (
            <motion.div
              key="pending"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
                      </div>
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-2">
                        Processing Payment...
                      </h3>
                      <p className="text-blue-700 dark:text-blue-300">
                        Please wait while we process your transaction securely.
                      </p>
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
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl font-semibold">Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Tabs defaultValue="manual" className="space-y-8">
                    <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <TabsTrigger 
                        value="manual" 
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700"
                      >
                        Manual Entry
                      </TabsTrigger>
                      <TabsTrigger 
                        value="qr"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700"
                      >
                        QR Scanner
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual" className="space-y-6">
                      <form onSubmit={(e) => { e.preventDefault(); handleConfirmPayment(); }} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="amount" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Amount
                            </Label>
                            <Input
                              id="amount"
                              type="number"
                              step="0.01"
                              value={formData.amount}
                              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                              placeholder="0.00"
                              required
                              className="h-12 text-base border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="currency" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Currency
                            </Label>
                            <Select 
                              value={formData.currency} 
                              onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                            >
                              <SelectTrigger className="h-12 border-slate-200 dark:border-slate-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ALGO">ALGO</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="channel" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Payment Channel
                          </Label>
                          <Select 
                            value={formData.channel} 
                            onValueChange={(value: any) => setFormData(prev => ({ ...prev, channel: value, recipient: '' }))}
                          >
                            <SelectTrigger className="h-12 border-slate-200 dark:border-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="algorand">Algorand Blockchain</SelectItem>
                              <SelectItem value="mobile_money">Mobile Money</SelectItem>
                              <SelectItem value="bank">Bank Transfer</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex items-start space-x-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                            <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                            <span>{getChannelInfo(formData.channel)}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="recipient" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Recipient
                          </Label>
                          <Input
                            id="recipient"
                            value={formData.recipient}
                            onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
                            placeholder={getRecipientPlaceholder(formData.channel)}
                            required
                            className="h-12 text-base border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                          />
                        </div>

                        <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-slate-200 dark:border-slate-600">
                          <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Payment Summary</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600 dark:text-slate-400">Amount:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {formData.amount || '0'} {formData.currency}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600 dark:text-slate-400">To:</span>
                              <span className="font-mono text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded max-w-[200px] truncate">
                                {formData.recipient || 'Not specified'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600 dark:text-slate-400">Via:</span>
                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                {getChannelDisplay(formData.channel)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-300 dark:border-slate-600">
                              <span className="text-slate-600 dark:text-slate-400">Available Balance:</span>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                {wallet?.balance?.toFixed(4) || '0'} ALGO
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200" 
                          disabled={isLoading || !formData.amount || !formData.recipient}
                        >
                          <Send className="mr-2 h-5 w-5" />
                          Review Payment
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="qr" className="space-y-6">
                      <div className="min-h-[400px] flex flex-col">
                        {!showQrScanner ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-12">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
                              <QrCode className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="space-y-3">
                              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                                Scan QR Code
                              </h3>
                              <p className="text-slate-600 dark:text-slate-400 max-w-md">
                                Scan a yehVo QR code to automatically fill payment details and send money instantly.
                              </p>
                            </div>
                            <div className="space-y-4">
                              <Button 
                                onClick={() => setShowQrScanner(true)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                              >
                                <Camera className="mr-2 h-5 w-5" />
                                Start Camera Scanner
                              </Button>
                              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                                <Scan className="h-4 w-4" />
                                <span>Works with any QR code containing payment information</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                Camera Scanner
                              </h3>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowQrScanner(false)}
                                className="border-slate-300 dark:border-slate-600"
                              >
                                Cancel
                              </Button>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
                              <QRScanner 
                                onScan={handleQrScan}
                                onClose={() => setShowQrScanner(false)}
                              />
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Position the QR code within the camera frame to scan
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md mx-4 max-w-[calc(100vw-2rem)] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold">Confirm Payment</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Please review your payment details before confirming the transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Amount:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formData.amount} {formData.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700 dark:text-slate-300">To:</span>
                  <span className="font-mono text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded max-w-[200px] truncate">
                    {formData.recipient}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Channel:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {getChannelDisplay(formData.channel)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 border-slate-300 dark:border-slate-600"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendPayment}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
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