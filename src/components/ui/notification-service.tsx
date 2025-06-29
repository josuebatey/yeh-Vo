import { toast } from 'sonner'

class NotificationService {
  private permission: NotificationPermission = 'default'

  constructor() {
    if (this.isSupported()) {
      this.permission = Notification.permission
    }
  }

  isSupported(): boolean {
    return 'Notification' in window
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      return false
    }

    if (this.permission === 'granted') {
      return true
    }

    const permission = await Notification.requestPermission()
    this.permission = permission
    return permission === 'granted'
  }

  private showBrowserNotification(title: string, options?: NotificationOptions) {
    if (this.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      })
    }
  }

  showPaymentSent(amount: number, currency: string, recipient: string) {
    const message = `Sent ${amount} ${currency} to ${recipient.slice(0, 20)}...`
    toast.success(message)
    
    this.showBrowserNotification('Payment Sent', {
      body: message,
      tag: 'payment-sent',
    })
  }

  showPaymentReceived(amount: number, currency: string, sender: string) {
    const message = `Received ${amount} ${currency} from ${sender.slice(0, 20)}...`
    toast.success(message)
    
    this.showBrowserNotification('Payment Received', {
      body: message,
      tag: 'payment-received',
    })
  }

  showBalanceUpdate(balance: number, currency: string) {
    const message = `Balance updated: ${balance.toFixed(4)} ${currency}`
    toast.info(message)
    
    this.showBrowserNotification('Balance Updated', {
      body: message,
      tag: 'balance-update',
    })
  }

  showInvestmentUpdate(message: string) {
    toast.success(message)
    
    this.showBrowserNotification('Investment Update', {
      body: message,
      tag: 'investment-update',
    })
  }

  showTransactionUpdate(message: string) {
    toast.info(message)
    
    this.showBrowserNotification('Transaction Update', {
      body: message,
      tag: 'transaction-update',
    })
  }
}

export const notificationService = new NotificationService()