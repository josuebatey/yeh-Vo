import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Phone, CheckCircle } from 'lucide-react'
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
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sentCode, setSentCode] = useState('')

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number')
      return
    }

    setIsLoading(true)
    try {
      const result = await paymentService.sendVerificationCode(phoneNumber)
      if (result.success) {
        setSentCode(result.code || '123456') // For demo, show the code
        setStep('code')
        toast.success(`Verification code sent to ${phoneNumber}`)
        toast.info(`Demo code: ${result.code || '123456'}`, {
          description: 'In production, this would be sent via SMS',
          duration: 10000,
        })
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code')
      return
    }

    if (verificationCode !== sentCode) {
      toast.error('Invalid verification code')
      return
    }

    setIsLoading(true)
    try {
      await paymentService.verifyPhoneNumber(user?.id || '', phoneNumber, verificationCode)
      toast.success('Phone number verified successfully!')
      onVerified()
      onOpenChange(false)
      resetDialog()
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify phone number')
    } finally {
      setIsLoading(false)
    }
  }

  const resetDialog = () => {
    setStep('phone')
    setPhoneNumber('')
    setVerificationCode('')
    setSentCode('')
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
            {step === 'phone' 
              ? 'Enter your phone number to receive a verification code'
              : 'Enter the 6-digit code sent to your phone'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'phone' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1234567890"
                />
              </div>
              <Button 
                onClick={handleSendCode}
                disabled={isLoading || !phoneNumber.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                />
                <p className="text-sm text-muted-foreground">
                  Code sent to {phoneNumber}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setStep('phone')}
                  className="flex-1"
                >
                  Change Number
                </Button>
                <Button 
                  onClick={handleVerifyCode}
                  disabled={isLoading || !verificationCode.trim()}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Verify
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}