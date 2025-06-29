import { toast } from 'sonner'

class NotificationService {
  private hasPermission = false

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      this.hasPermission = permission === 'granted'
      return this.hasPermission
    }

    return false
  }

  private showNotification(title: string, options: NotificationOptions = {}) {
    if (!this.hasPermission) {
      // Fallback to toast notification
      toast.info(title)
      return
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      })

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

      return notification
    } catch (error) {
      console.error('Failed to show notification:', error)
      toast.info(title)
    }
  }

  showPaymentSent(amount: number, currency: string, recipient: string) {
    const title = 'Payment Sent Successfully'
    const body = `${amount} ${currency} sent to ${recipient.slice(0, 20)}...`
    
    this.showNotification(title, {
      body,
      tag: 'payment-sent',
      requireInteraction: false
    })
  }

  showPaymentReceived(amount: number, currency: string, sender: string) {
    const title = 'Payment Received'
    const body = `Received ${amount} ${currency} from ${sender.slice(0, 20)}...`
    
    this.showNotification(title, {
      body,
      tag: 'payment-received',
      requireInteraction: true
    })
  }

  showInvestmentUpdate(amount: number, type: 'created' | 'withdrawn') {
    const title = type === 'created' ? 'Investment Created' : 'Investment Withdrawn'
    const body = `${amount} ALGO ${type === 'created' ? 'invested' : 'withdrawn'} successfully`
    
    this.showNotification(title, {
      body,
      tag: 'investment-update',
      requireInteraction: false
    })
  }

  showBalanceUpdate(newBalance: number) {
    const title = 'Balance Updated'
    const body = `Your new balance is ${newBalance.toFixed(4)} ALGO`
    
    this.showNotification(title, {
      body,
      tag: 'balance-update',
      requireInteraction: false
    })
  }
}

export const notificationService = new NotificationService()