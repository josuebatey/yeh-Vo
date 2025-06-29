class NotificationService {
  private permission: NotificationPermission = 'default'

  constructor() {
    this.permission = Notification.permission
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (this.permission === 'granted') {
      return true
    }

    if (this.permission === 'denied') {
      console.warn('Notifications are blocked by the user')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      this.permission = permission
      return permission === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  private async showNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    const hasPermission = await this.requestPermission()
    
    if (!hasPermission) {
      console.warn('Cannot show notification: permission not granted')
      return
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'voicepay',
        requireInteraction: false,
        ...options
      })

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

      // Handle click events
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    } catch (error) {
      console.error('Error showing notification:', error)
    }
  }

  async showPaymentSent(amount: number, currency: string, recipient: string): Promise<void> {
    await this.showNotification('Payment Sent Successfully', {
      body: `${amount} ${currency} sent to ${recipient.slice(0, 20)}${recipient.length > 20 ? '...' : ''}`,
      icon: '/favicon.ico'
    })
  }

  async showPaymentReceived(amount: number, currency: string, sender: string): Promise<void> {
    await this.showNotification('Payment Received', {
      body: `You received ${amount} ${currency} from ${sender.slice(0, 20)}${sender.length > 20 ? '...' : ''}`,
      icon: '/favicon.ico'
    })
  }

  async showInvestmentUpdate(message: string): Promise<void> {
    await this.showNotification('Investment Update', {
      body: message,
      icon: '/favicon.ico'
    })
  }

  async showBalanceUpdate(newBalance: number, currency: string): Promise<void> {
    await this.showNotification('Balance Updated', {
      body: `Your new balance is ${newBalance.toFixed(4)} ${currency}`,
      icon: '/favicon.ico'
    })
  }

  async showGeneral(title: string, message: string): Promise<void> {
    await this.showNotification(title, {
      body: message,
      icon: '/favicon.ico'
    })
  }

  isSupported(): boolean {
    return 'Notification' in window
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission
  }
}

export const notificationService = new NotificationService()