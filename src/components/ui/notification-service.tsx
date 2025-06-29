// Notification service for browser notifications and in-app alerts
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

  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return
    }

    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      })
    } catch (error) {
      console.error('Failed to show notification:', error)
    }
  },

  async showPaymentSent(amount: number, currency: string, recipient: string): Promise<void> {
    await this.showNotification('Payment Sent', {
      body: `Successfully sent ${amount} ${currency} to ${recipient.slice(0, 20)}...`,
      icon: '/favicon.ico',
    })
  },

  async showPaymentReceived(amount: number, currency: string, sender: string): Promise<void> {
    await this.showNotification('Payment Received', {
      body: `Received ${amount} ${currency} from ${sender.slice(0, 20)}...`,
      icon: '/favicon.ico',
    })
  },

  async showBalanceUpdate(balance: number, currency: string): Promise<void> {
    await this.showNotification('Balance Updated', {
      body: `Your balance is now ${balance.toFixed(4)} ${currency}`,
      icon: '/favicon.ico',
    })
  },

  async showInvestmentUpdate(message: string): Promise<void> {
    await this.showNotification('Investment Update', {
      body: message,
      icon: '/favicon.ico',
    })
  },
}