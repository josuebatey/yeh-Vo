import { toast } from 'sonner'

export const notificationService = {
  isSupported(): boolean {
    return 'Notification' in window
  },

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  },

  showPaymentSent(amount: number, currency: string, recipient: string): void {
    const message = `Payment sent: ${amount} ${currency} to ${recipient.slice(0, 20)}...`
    
    toast.success(message, {
      description: 'Your payment has been processed successfully',
      duration: 5000,
    })

    if (this.isSupported() && Notification.permission === 'granted') {
      new Notification('VoicePay - Payment Sent', {
        body: message,
        icon: '/favicon.ico',
        tag: 'payment-sent'
      })
    }
  },

  showPaymentReceived(amount: number, currency: string, sender: string): void {
    const message = `Payment received: ${amount} ${currency} from ${sender.slice(0, 20)}...`
    
    toast.success(message, {
      description: 'A new payment has been received',
      duration: 8000,
    })

    if (this.isSupported() && Notification.permission === 'granted') {
      new Notification('VoicePay - Payment Received', {
        body: message,
        icon: '/favicon.ico',
        tag: 'payment-received'
      })
    }
  },

  showBalanceUpdate(newBalance: number, currency: string): void {
    const message = `Balance updated: ${newBalance.toFixed(4)} ${currency}`
    
    toast.info(message, {
      description: 'Your wallet balance has been refreshed',
      duration: 3000,
    })
  },

  showInvestmentUpdate(message: string): void {
    toast.success(message, {
      description: 'Investment portfolio updated',
      duration: 5000,
    })

    if (this.isSupported() && Notification.permission === 'granted') {
      new Notification('VoicePay - Investment Update', {
        body: message,
        icon: '/favicon.ico',
        tag: 'investment-update'
      })
    }
  },

  showTransactionUpdate(type: 'sent' | 'received', amount: number, currency: string): void {
    const message = `Transaction ${type}: ${amount} ${currency}`
    
    toast.info(message, {
      description: `Your transaction has been ${type}`,
      duration: 4000,
    })
  },

  showError(message: string, description?: string): void {
    toast.error(message, {
      description: description || 'Please try again',
      duration: 6000,
    })
  },

  showSuccess(message: string, description?: string): void {
    toast.success(message, {
      description,
      duration: 4000,
    })
  },

  showInfo(message: string, description?: string): void {
    toast.info(message, {
      description,
      duration: 4000,
    })
  }
}