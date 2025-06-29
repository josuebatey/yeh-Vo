import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreditCard, Loader2, CheckCircle, Building } from 'lucide-react'
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
  const [step, setStep] = useState<'bank' | 'account' | 'success'>('bank')
  const [selectedBank, setSelectedBank] = useState('')
  const [accountInfo, setAccountInfo] = useState({
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking'
  })
  const [isLoading, setIsLoading] = useState(false)

  const popularBanks = [
    { id: 'chase', name: 'Chase Bank', logo: '🏦' },
    { id: 'bofa', name: 'Bank of America', logo: '🏛️' },
    { id: 'wells', name: 'Wells Fargo', logo: '🏪' },
    { id: 'citi', name: 'Citibank', logo: '🏢' },
    { id: 'usbank', name: 'US Bank', logo: '🏦' },
    { id: 'pnc', name: 'PNC Bank', logo: '🏛️' },
    { id: 'other', name: 'Other Bank', logo: '🏦' },
  ]

  const handleBankSelection = (bankId: string) => {
    setSelectedBank(bankId)
    setStep('account')
  }

  const handleLinkAccount = async () => {
    if (!user || !accountInfo.accountNumber || !accountInfo.routingNumber) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      const bankData = {
        bank_name: popularBanks.find(b => b.id === selectedBank)?.name || 'Unknown Bank',
        account_type: accountInfo.accountType,
        account_number_last4: accountInfo.accountNumber.slice(-4),
        routing_number: accountInfo.routingNumber,
        verified: true, // In demo mode, auto-verify
        linked_at: new Date().toISOString()
      }

      await paymentService.linkBankAccount(user.id, bankData)
      setStep('success')
      toast.success('Bank account linked successfully!')
      
      setTimeout(() => {
        onLinked()
        onOpenChange(false)
        resetDialog()
      }, 2000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to link bank account')
    } finally {
      setIsLoading(false)
    }
  }

  const resetDialog = () => {
    setStep('bank')
    setSelectedBank('')
    setAccountInfo({
      accountNumber: '',
      routingNumber: '',
      accountType: 'checking'
    })
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
            <CreditCard className="h-5 w-5" />
            <span>Link Bank Account</span>
          </DialogTitle>
          <DialogDescription>
            {step === 'bank' && 'Select your bank to get started'}
            {step === 'account' && 'Enter your account details securely'}
            {step === 'success' && 'Your bank account has been linked successfully!'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === 'bank' && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  <strong>Demo Mode:</strong> This simulates Plaid/Yodlee integration. No real bank data is stored.
                </p>
              </div>
              
              <div className="grid gap-2">
                {popularBanks.map((bank) => (
                  <Button
                    key={bank.id}
                    variant="outline"
                    onClick={() => handleBankSelection(bank.id)}
                    className="justify-start h-12"
                  >
                    <span className="text-lg mr-3">{bank.logo}</span>
                    <span>{bank.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {step === 'account' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Building className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">
                  {popularBanks.find(b => b.id === selectedBank)?.name}
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account-type">Account Type</Label>
                  <Select 
                    value={accountInfo.accountType} 
                    onValueChange={(value) => setAccountInfo(prev => ({ ...prev, accountType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="routing">Routing Number</Label>
                  <Input
                    id="routing"
                    value={accountInfo.routingNumber}
                    onChange={(e) => setAccountInfo(prev => ({ ...prev, routingNumber: e.target.value }))}
                    placeholder="123456789"
                    maxLength={9}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account">Account Number</Label>
                  <Input
                    id="account"
                    value={accountInfo.accountNumber}
                    onChange={(e) => setAccountInfo(prev => ({ ...prev, accountNumber: e.target.value }))}
                    placeholder="1234567890"
                    type="password"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setStep('bank')} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleLinkAccount} 
                  disabled={isLoading || !accountInfo.accountNumber || !accountInfo.routingNumber}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Linking...
                    </>
                  ) : (
                    'Link Account'
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-green-600">Account Linked!</h3>
                <p className="text-sm text-muted-foreground">
                  Your bank account has been successfully linked and verified.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}