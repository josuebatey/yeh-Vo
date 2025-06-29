export const notificationService = {
  isSupported(): boolean {
    return 'Notification' in window
  },

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  },

  showNotification(title: string, options?: NotificationOptions): void {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return
    }

    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    })
  },

  showPaymentSent(amount: number, currency: string, recipient: string): void {
    this.showNotification('Payment Sent', {
      body: `Successfully sent ${amount} ${currency} to ${recipient.slice(0, 20)}...`,
      tag: 'payment-sent'
    })
  },

  showPaymentReceived(amount: number, currency: string, sender: string): void {
    this.showNotification('Payment Received', {
      body: `Received ${amount} ${currency} from ${sender.slice(0, 20)}...`,
      tag: 'payment-received'
    })
  },

  showBalanceUpdate(balance: number, currency: string): void {
    this.showNotification('Balance Updated', {
      body: `Your balance is now ${balance.toFixed(4)} ${currency}`,
      tag: 'balance-update'
    })
  },

  showInvestmentUpdate(message: string): void {
    this.showNotification('Investment Update', {
      body: message,
      tag: 'investment-update'
    })
  }
}