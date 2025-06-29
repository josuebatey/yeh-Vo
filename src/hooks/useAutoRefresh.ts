import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useWalletStore } from '@/stores/walletStore'
import { paymentService } from '@/services/paymentService'
import { notificationService } from '@/components/ui/notification-service'

interface AutoRefreshOptions {
  enabled?: boolean
  interval?: number
  onTransactionUpdate?: (transactions: any[]) => void
  onBalanceUpdate?: (balance: number) => void
}

export function useAutoRefresh(options: AutoRefreshOptions = {}) {
  const { enabled = true, interval = 10000, onTransactionUpdate, onBalanceUpdate } = options
  const { user } = useAuthStore()
  const { wallet, refreshBalance } = useWalletStore()
  const lastTransactionCountRef = useRef<number>(0)
  const lastBalanceRef = useRef<number>(0)
  const intervalRef = useRef<NodeJS.Timeout>()
  const isRefreshingRef = useRef<boolean>(false)

  const checkForUpdates = useCallback(async () => {
    if (!user || isRefreshingRef.current) {
      return
    }

    isRefreshingRef.current = true

    try {
      // Refresh wallet balance
      await refreshBalance()

      // Check for new transactions
      const transactions = await paymentService.getTransactionHistory(user.id, 20)
      
      // Check if we have new transactions
      if (transactions.length > lastTransactionCountRef.current) {
        const newTransactions = transactions.slice(0, transactions.length - lastTransactionCountRef.current)
        
        // Show notifications for new received transactions
        newTransactions.forEach(tx => {
          if (tx.type === 'receive' && tx.status === 'completed') {
            notificationService.showPaymentReceived(
              tx.amount,
              tx.currency,
              tx.from_address || 'Unknown sender'
            )
          }
        })

        if (onTransactionUpdate) {
          onTransactionUpdate(transactions)
        }
      }

      lastTransactionCountRef.current = transactions.length

      // Check for balance changes
      if (wallet && wallet.balance !== lastBalanceRef.current) {
        if (lastBalanceRef.current > 0) { // Don't notify on initial load
          notificationService.showBalanceUpdate(wallet.balance, 'ALGO')
        }
        lastBalanceRef.current = wallet.balance
        
        if (onBalanceUpdate) {
          onBalanceUpdate(wallet.balance)
        }
      }

    } catch (error) {
      console.error('Auto refresh failed:', error)
    } finally {
      isRefreshingRef.current = false
    }
  }, [user, wallet, refreshBalance, onTransactionUpdate, onBalanceUpdate])

  useEffect(() => {
    if (!enabled || !user) {
      return
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
  }, [enabled, user, interval, checkForUpdates])

  const forceRefresh = useCallback(async () => {
    if (!user) return

    try {
      await refreshBalance()
      const transactions = await paymentService.getTransactionHistory(user.id, 20)
      
      if (onTransactionUpdate) {
        onTransactionUpdate(transactions)
      }
      
      lastTransactionCountRef.current = transactions.length
      
      if (wallet) {
        lastBalanceRef.current = wallet.balance
      }
    } catch (error) {
      console.error('Force refresh failed:', error)
    }
  }, [user, wallet, refreshBalance, onTransactionUpdate])

  return { forceRefresh }
}