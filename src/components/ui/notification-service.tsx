import { toast } from 'sonner'

class NotificationService {
  private permission: NotificationPermission = 'default'

  constructor() {
    this.permission = Notification.permission
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

  isSupported(): boolean {
    return 'Notification' in window
  }

  showPaymentSent(amount: number, currency: string, recipient: string): void {
    const message = `Sent ${amount} ${currency} to ${recipient.slice(0, 20)}...`
    
    toast.success(message, {
      description: 'Payment completed successfully',
      duration: 5000,
    })

    if (this.permission === 'granted') {
      new Notification('VoicePay - Payment Sent', {
        body: message,
        icon: '/favicon.ico',
        tag: 'payment-sent',
      })
    }
  }

  showPaymentReceived(amount: number, currency: string, fromAddress: string): void {
    const message = `Received ${amount} ${currency} from ${fromAddress.slice(0, 20)}...`
    
    toast.success(message, {
      description: 'Payment received successfully',
      duration: 8000,
    })

    if (this.permission === 'granted') {
      new Notification('VoicePay - Payment Received', {
        body: message,
        icon: '/favicon.ico',
        tag: 'payment-received',
      })
    }
  }

  showBalanceUpdate(newBalance: number, currency: string): void {
    const message = `Balance updated: ${newBalance.toFixed(4)} ${currency}`
    
    toast.info(message, {
      description: 'Your wallet balance has been refreshed',
      duration: 4000,
    })
  }

  showInvestmentUpdate(message: string): void {
    toast.success(message, {
      description: 'Investment portfolio updated',
      duration: 6000,
    })

    if (this.permission === 'granted') {
      new Notification('VoicePay - Investment Update', {
        body: message,
        icon: '/favicon.ico',
        tag: 'investment-update',
      })
    }
  }

  showTransactionUpdate(type: 'completed' | 'failed', amount: number, currency: string): void {
    const message = `Transaction ${type}: ${amount} ${currency}`
    const isSuccess = type === 'completed'
    
    if (isSuccess) {
      toast.success(message, {
        description: 'Transaction processed successfully',
        duration: 5000,
      })
    } else {
      toast.error(message, {
        description: 'Transaction failed to process',
        duration: 6000,
      })
    }

    if (this.permission === 'granted') {
      new Notification(`VoicePay - Transaction ${type}`, {
        body: message,
        icon: '/favicon.ico',
        tag: 'transaction-update',
      })
    }
  }

  showDailyLimitWarning(remaining: number, currency: string): void {
    const message = `Daily limit warning: ${remaining.toFixed(2)} ${currency} remaining`
    
    toast.warning(message, {
      description: 'Consider upgrading to Pro for unlimited transfers',
      duration: 8000,
    })
  }

  showSystemNotification(title: string, message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
    const toastFn = type === 'error' ? toast.error : type === 'warning' ? toast.warning : toast.info
    
    toastFn(title, {
      description: message,
      duration: 6000,
    })

    if (this.permission === 'granted') {
      new Notification(`VoicePay - ${title}`, {
        body: message,
        icon: '/favicon.ico',
        tag: 'system-notification',
      })
    }
  }
}

export const notificationService = new NotificationService()