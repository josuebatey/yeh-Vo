import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, CreditCard, Check } from 'lucide-react'
import { toast } from 'sonner'
import { paymentService } from '@/services/paymentService'
import { useAuthStore } from '@/stores/authStore'

interface BankLinkingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLinked: () => void
}

export function BankLinkingDialog({ open, onOpenChange, onLinked }: BankLinkingDialogProps) {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    bankName: '',
    accountType: '',
    accountNumber: '',
    routingNumber: '',
    accountHolderName: ''
  })

  const handleLinkAccount = async () => {
    if (!user) return

    if (!formData.bankName || !formData.accountType || !formData.accountNumber || !formData.routingNumber || !formData.accountHolderName) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      await paymentService.linkBankAccount(user.id, {
        bank_name: formData.bankName,
        account_type: formData.accountType,
        account_number: formData.accountNumber,
        routing_number: formData.routingNumber,
        account_holder_name: formData.accountHolderName,
        linked_at: new Date().toISOString()
      })
      
      toast.success('Bank account linked successfully!')
      onLinked()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      toast.error(error.message || 'Failed to link bank account')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      bankName: '',
      accountType: '',
      accountNumber: '',
      routingNumber: '',
      accountHolderName: ''
    })
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
            Connect your bank account for seamless transfers (Demo Mode)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Select 
              value={formData.bankName} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, bankName: value }))}
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
              value={formData.accountType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, accountType: value }))}
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
            <Label htmlFor="accountHolderName">Account Holder Name</Label>
            <Input
              id="accountHolderName"
              value={formData.accountHolderName}
              onChange={(e) => setFormData(prev => ({ ...prev, accountHolderName: e.target.value }))}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              value={formData.accountNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
              placeholder="1234567890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="routingNumber">Routing Number</Label>
            <Input
              id="routingNumber"
              value={formData.routingNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, routingNumber: e.target.value }))}
              placeholder="021000021"
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              🔒 This is a demo environment. No real bank information is processed or stored.
            </p>
          </div>

          <Button 
            onClick={handleLinkAccount}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Linking Account...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Link Bank Account
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}