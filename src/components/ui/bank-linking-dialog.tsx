import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreditCard, Loader2, Shield } from 'lucide-react'
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
    accountHolderName: '',
  })

  const handleLinkAccount = async () => {
    if (!bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.routingNumber) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      await paymentService.linkBankAccount(user?.id || '', {
        ...bankInfo,
        linkedAt: new Date().toISOString(),
        verified: true, // For demo purposes
      })
      
      toast.success('Bank account linked successfully!')
      onLinked()
      onOpenChange(false)
      
      // Reset form
      setBankInfo({
        bankName: '',
        accountType: '',
        accountNumber: '',
        routingNumber: '',
        accountHolderName: '',
      })
    } catch (error: any) {
      toast.error(error.message || 'Failed to link bank account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Link Bank Account</span>
          </DialogTitle>
          <DialogDescription>
            Connect your bank account for seamless transfers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg flex items-start space-x-2">
            <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium">Secure & Encrypted</p>
              <p>Your banking information is protected with bank-level security.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name *</Label>
            <Select 
              value={bankInfo.bankName} 
              onValueChange={(value) => setBankInfo(prev => ({ ...prev, bankName: value }))}
            >
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
            <Label htmlFor="accountType">Account Type</Label>
            <Select 
              value={bankInfo.accountType} 
              onValueChange={(value) => setBankInfo(prev => ({ ...prev, accountType: value }))}
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

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number *</Label>
            <Input
              id="accountNumber"
              type="text"
              value={bankInfo.accountNumber}
              onChange={(e) => setBankInfo(prev => ({ ...prev, accountNumber: e.target.value }))}
              placeholder="1234567890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="routingNumber">Routing Number *</Label>
            <Input
              id="routingNumber"
              type="text"
              value={bankInfo.routingNumber}
              onChange={(e) => setBankInfo(prev => ({ ...prev, routingNumber: e.target.value }))}
              placeholder="123456789"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountHolderName">Account Holder Name</Label>
            <Input
              id="accountHolderName"
              type="text"
              value={bankInfo.accountHolderName}
              onChange={(e) => setBankInfo(prev => ({ ...prev, accountHolderName: e.target.value }))}
              placeholder="John Doe"
            />
          </div>

          <Button 
            onClick={handleLinkAccount}
            disabled={isLoading || !bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.routingNumber}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Linking Account...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Link Bank Account
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            This is a demo. No real banking information is processed.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}