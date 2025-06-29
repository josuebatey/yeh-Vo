import { toast } from 'sonner'

export class NotificationService {
  private static instance: NotificationService
  private permission: NotificationPermission = 'default'

  private constructor() {
    this.requestPermission()
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  async requestPermission(): Promise<void> {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission()
    }
  }

  showNotification(title: string, options?: NotificationOptions): void {
    if (this.permission === 'granted' && 'Notification' in window) {
      new Notification(title, {
        icon: '/vite.svg',
        badge: '/vite.svg',
        ...options
      })
    }
    
    // Also show toast notification
    toast.success(title)
  }

  showPaymentReceived(amount: number, currency: string, from?: string): void {
    this.showNotification(
      'Payment Received!',
      {
        body: `You received ${amount} ${currency}${from ? ` from ${from}` : ''}`,
        tag: 'payment-received'
      }
    )
  }

  showPaymentSent(amount: number, currency: string, to?: string): void {
    this.showNotification(
      'Payment Sent!',
      {
        body: `You sent ${amount} ${currency}${to ? ` to ${to}` : ''}`,
        tag: 'payment-sent'
      }
    )
  }
}

export const notificationService = NotificationService.getInstance()