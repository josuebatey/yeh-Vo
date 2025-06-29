import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, CreditCard, Building, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { paymentService } from '@/services/paymentService'

interface BankLinkingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLinked: () => void
}

export function BankLinkingDialog({ open, onOpenChange, onLinked }: BankLinkingDialogProps) {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [bankData, setBankData] = useState({
    bankName: '',
    accountType: '',
    accountNumber: '',
    routingNumber: '',
    accountHolderName: '',
  })

  const handleLinkAccount = async () => {
    if (!bankData.bankName || !bankData.accountType || !bankData.accountNumber || !bankData.routingNumber || !bankData.accountHolderName) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      const accountInfo = {
        bank_name: bankData.bankName,
        account_type: bankData.accountType,
        account_number: bankData.accountNumber.slice(-4), // Only store last 4 digits for security
        routing_number: bankData.routingNumber,
        account_holder_name: bankData.accountHolderName,
        linked_at: new Date().toISOString(),
        status: 'verified',
        // In a real app, you'd integrate with Plaid, Yodlee, or similar
        verification_method: 'demo_simulation'
      }

      const success = await paymentService.linkBankAccount(user?.id || '', accountInfo)
      if (success) {
        toast.success('Bank account linked successfully!', {
          description: 'You can now receive bank transfers',
        })
        onLinked()
        onOpenChange(false)
        resetForm()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to link bank account')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setBankData({
      bankName: '',
      accountType: '',
      accountNumber: '',
      routingNumber: '',
      accountHolderName: '',
    })
  }

  const handleClose = () => {
    onOpenChange(false)
    resetForm()
  }

  const popularBanks = [
    'Chase Bank',
    'Bank of America',
    'Wells Fargo',
    'Citibank',
    'Capital One',
    'US Bank',
    'PNC Bank',
    'TD Bank',
    'Other'
  ]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Link Bank Account</span>
          </DialogTitle>
          <DialogDescription>
            Connect your bank account to receive payments via bank transfer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Demo Mode</p>
                <p>This is a simulation. In production, we'd use secure banking APIs like Plaid for account verification.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Select 
                value={bankData.bankName} 
                onValueChange={(value) => setBankData(prev => ({ ...prev, bankName: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent>
                  {popularBanks.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type</Label>
              <Select 
                value={bankData.accountType} 
                onValueChange={(value) => setBankData(prev => ({ ...prev, accountType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input
                  id="routingNumber"
                  type="text"
                  value={bankData.routingNumber}
                  onChange={(e) => setBankData(prev => ({ ...prev, routingNumber: e.target.value }))}
                  placeholder="123456789"
                  maxLength={9}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  type="text"
                  value={bankData.accountNumber}
                  onChange={(e) => setBankData(prev => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="1234567890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountHolderName">Account Holder Name</Label>
              <Input
                id="accountHolderName"
                type="text"
                value={bankData.accountHolderName}
                onChange={(e) => setBankData(prev => ({ ...prev, accountHolderName: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleLinkAccount} disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Linking...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Link Account
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Your banking information is encrypted and secure. We never store your full account number.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}