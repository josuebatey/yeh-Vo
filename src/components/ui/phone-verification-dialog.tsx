import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Phone, MessageSquare } from 'lucide-react'
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
      toast.error('Please enter a valid phone number')
      return
    }

    setIsLoading(true)
    try {
      const result = await paymentService.sendVerificationCode(phoneNumber)
      if (result.success) {
        setSentCode(result.code || '123456') // For demo, show the code
        setStep('code')
        toast.success(`Verification code sent to ${phoneNumber}`, {
          description: `Demo code: ${result.code || '123456'}`,
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

    setIsLoading(true)
    try {
      const success = await paymentService.verifyPhoneNumber(user?.id || '', phoneNumber, verificationCode)
      if (success) {
        toast.success('Phone number verified successfully!')
        onVerified()
        onOpenChange(false)
        resetForm()
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid verification code')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setStep('phone')
    setPhoneNumber('')
    setVerificationCode('')
    setSentCode('')
  }

  const handleClose = () => {
    onOpenChange(false)
    resetForm()
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
                  placeholder="+1 (555) 123-4567"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Include country code (e.g., +1 for US)
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSendCode} disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send Code
                    </>
                  )}
                </Button>
              </div>
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
                  disabled={isLoading}
                  className="text-center text-lg tracking-widest"
                />
                <p className="text-xs text-muted-foreground">
                  Code sent to {phoneNumber}
                </p>
                {sentCode && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Demo Mode:</strong> Use code <code className="bg-blue-100 px-1 rounded">{sentCode}</code>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('phone')} 
                  className="flex-1"
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button onClick={handleVerifyCode} disabled={isLoading} className="flex-1">
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

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSendCode}
                disabled={isLoading}
                className="w-full"
              >
                Resend Code
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}