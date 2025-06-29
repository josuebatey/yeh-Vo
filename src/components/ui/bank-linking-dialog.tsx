import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreditCard, Loader2 } from 'lucide-react'
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
  const [bankInfo, setBankInfo] = useState({
    bankName: '',
    accountType: '',
    accountNumber: '',
    routingNumber: '',
    accountHolderName: ''
  })

  const handleLinkAccount = async () => {
    if (!bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.routingNumber) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      await paymentService.linkBankAccount(user?.id || '', bankInfo)
      toast.success('Bank account linked successfully!')
      onLinked()
      onOpenChange(false)
      setBankInfo({
        bankName: '',
        accountType: '',
        accountNumber: '',
        routingNumber: '',
        accountHolderName: ''
      })
    } catch (error: any) {
      toast.error(error.message || 'Failed to link bank account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setBankInfo({
      bankName: '',
      accountType: '',
      accountNumber: '',
      routingNumber: '',
      accountHolderName: ''
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Link Bank Account</span>
          </DialogTitle>
          <DialogDescription>
            Connect your bank account for bank transfer payments
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bank-name">Bank Name</Label>
            <Select value={bankInfo.bankName} onValueChange={(value) => setBankInfo(prev => ({ ...prev, bankName: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select your bank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chase">Chase Bank</SelectItem>
                <SelectItem value="bofa">Bank of America</SelectItem>
                <SelectItem value="wells">Wells Fargo</SelectItem>
                <SelectItem value="citi">Citibank</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-type">Account Type</Label>
            <Select value={bankInfo.accountType} onValueChange={(value) => setBankInfo(prev => ({ ...prev, accountType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Checking</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-number">Account Number</Label>
            <Input
              id="account-number"
              type="text"
              value={bankInfo.accountNumber}
              onChange={(e) => setBankInfo(prev => ({ ...prev, accountNumber: e.target.value }))}
              placeholder="1234567890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="routing-number">Routing Number</Label>
            <Input
              id="routing-number"
              type="text"
              value={bankInfo.routingNumber}
              onChange={(e) => setBankInfo(prev => ({ ...prev, routingNumber: e.target.value }))}
              placeholder="123456789"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-holder">Account Holder Name</Label>
            <Input
              id="account-holder"
              type="text"
              value={bankInfo.accountHolderName}
              onChange={(e) => setBankInfo(prev => ({ ...prev, accountHolderName: e.target.value }))}
              placeholder="John Doe"
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-sm text-muted-foreground">
              <strong>Note:</strong> This is a demo. In production, bank linking would use secure services like Plaid or Yodlee for account verification.
            </div>
          </div>

          <Button onClick={handleLinkAccount} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Linking Account...
              </>
            ) : (
              'Link Bank Account'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}