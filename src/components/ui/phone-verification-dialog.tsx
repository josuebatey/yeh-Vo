import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Phone, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { paymentService } from '@/services/paymentService'

interface PhoneVerificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerified: () => void
}

export function PhoneVerificationDialog({ open, onOpenChange, onVerified }: PhoneVerificationDialogProps) {
  const { user } = useAuthStore()
  const [step, setStep] = useState<'phone' | 'code' | 'success'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [demoCode, setDemoCode] = useState('')

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter a valid phone number')
      return
    }

    setIsLoading(true)
    try {
      const result = await paymentService.sendVerificationCode(phoneNumber)
      if (result.success) {
        setDemoCode(result.code || '123456')
        setStep('code')
        toast.success(`Demo: Verification code is ${result.code}`)
      }
    } catch (error) {
      toast.error('Failed to send verification code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!user || verificationCode.length !== 6) {
      toast.error('Please enter the 6-digit verification code')
      return
    }

    setIsLoading(true)
    try {
      await paymentService.verifyPhoneNumber(user.id, phoneNumber, verificationCode)
      setStep('success')
      toast.success('Phone number verified successfully!')
      
      setTimeout(() => {
        onVerified()
        onOpenChange(false)
        resetDialog()
      }, 2000)
    } catch (error: any) {
      toast.error(error.message || 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const resetDialog = () => {
    setStep('phone')
    setPhoneNumber('')
    setVerificationCode('')
    setDemoCode('')
  }

  const handleClose = () => {
    onOpenChange(false)
    resetDialog()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <span>Verify Phone Number</span>
          </DialogTitle>
          <DialogDescription>
            {step === 'phone' && 'Enter your phone number to receive a verification code'}
            {step === 'code' && 'Enter the 6-digit code sent to your phone'}
            {step === 'success' && 'Your phone number has been verified successfully!'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === 'phone' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <Button onClick={handleSendCode} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </div>
          )}

          {step === 'code' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Code sent to {phoneNumber}
                </p>
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg mb-4">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    <strong>Demo Mode:</strong> Use code <code className="font-mono">{demoCode}</code>
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Verification Code</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={verificationCode}
                    onChange={setVerificationCode}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setStep('phone')} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleVerifyCode} 
                  disabled={isLoading || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-green-600">Verified!</h3>
                <p className="text-sm text-muted-foreground">
                  Your phone number has been successfully verified.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}