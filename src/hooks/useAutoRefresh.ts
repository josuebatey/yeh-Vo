import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useWalletStore } from '@/stores/walletStore'
import { paymentService } from '@/services/paymentService'
import { notificationService } from '@/components/ui/notification-service'

interface AutoRefreshOptions {
  enabled?: boolean
  interval?: number
  onTransactionUpdate?: (transactions: any[]) => void
}

export function useAutoRefresh(options: AutoRefreshOptions = {}) {
  const { enabled = true, interval = 10000, onTransactionUpdate } = options
  const { user } = useAuthStore()
  const { refreshBalance } = useWalletStore()
  const lastTransactionCountRef = useRef<number>(0)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!enabled || !user) {
      return
    }

    const checkForUpdates = async () => {
      try {
        // Refresh wallet balance
        await refreshBalance()

        // Check for new transactions
        const transactions = await paymentService.getTransactionHistory(user.id, 10)
        
        // Check if we have new transactions
        if (transactions.length > lastTransactionCountRef.current) {
          const newTransactions = transactions.slice(0, transactions.length - lastTransactionCountRef.current)
          
          // Show notifications for new received transactions
          newTransactions.forEach(tx => {
            if (tx.type === 'receive' && tx.status === 'completed') {
              notificationService.showPaymentReceived(
                tx.amount,
                tx.currency,
                tx.from_address || 'Unknown'
              )
            }
          })

          if (onTransactionUpdate) {
            onTransactionUpdate(transactions)
          }
        }

        lastTransactionCountRef.current = transactions.length
      } catch (error) {
        console.error('Auto refresh failed:', error)
      }
    }

    // Initial check
    checkForUpdates()

    // Set up interval
    intervalRef.current = setInterval(checkForUpdates, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, user, interval, refreshBalance, onTransactionUpdate])

  const forceRefresh = async () => {
    if (!user) return

    try {
      await refreshBalance()
      const transactions = await paymentService.getTransactionHistory(user.id, 10)
      if (onTransactionUpdate) {
        onTransactionUpdate(transactions)
      }
      lastTransactionCountRef.current = transactions.length
    } catch (error) {
      console.error('Force refresh failed:', error)
    }
  }

  return { forceRefresh }
}