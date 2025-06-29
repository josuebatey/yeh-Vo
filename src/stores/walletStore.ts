import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateAccount, secretKeyToMnemonic } from 'algosdk'
import { supabase } from '@/lib/supabase'
import { algorandService } from '@/services/algorandService'
import { notificationService } from '@/components/ui/notification-service'

interface Wallet {
  address: string
  balance: number
}

interface WalletState {
  wallet: Wallet | null
  isLoading: boolean
  isFunding: boolean
  createWallet: (userId: string) => Promise<void>
  loadWallet: (userId: string) => Promise<void>
  refreshBalance: () => Promise<void>
  fundWallet: () => Promise<void>
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallet: null,
      isLoading: false,
      isFunding: false,

      createWallet: async (userId: string) => {
        set({ isLoading: true })
        try {
          // First check if a wallet already exists for this user
          const { data: existingWallet, error: checkError } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', userId)
            .limit(1)

          if (checkError) {
            throw checkError
          }

          // If wallet already exists, use it instead of creating a new one
          if (existingWallet && existingWallet.length > 0) {
            const wallet = existingWallet[0]
            const balance = await algorandService.getBalance(wallet.algorand_address)
            
            set({ 
              wallet: { 
                address: wallet.algorand_address, 
                balance: balance 
              },
              isLoading: false 
            })
            return
          }

          // Create new wallet only if none exists
          const account = generateAccount()
          const mnemonic = secretKeyToMnemonic(account.sk)
          
          // In production, encrypt the mnemonic properly
          const encryptedMnemonic = btoa(mnemonic) // Simple base64, use proper encryption in production

          await supabase.from('wallets').insert({
            user_id: userId,
            algorand_address: account.addr,
            encrypted_mnemonic: encryptedMnemonic,
            balance: 0,
          })

          set({ 
            wallet: { address: account.addr, balance: 0 },
            isLoading: false 
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      loadWallet: async (userId: string) => {
        set({ isLoading: true })
        try {
          const { data, error } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', userId)
            .limit(1)

          if (error) {
            throw error
          }

          // If no wallet found, create one
          if (!data || data.length === 0) {
            await get().createWallet(userId)
            return
          }

          // Use the first wallet found
          const walletData = data[0]
          const balance = await algorandService.getBalance(walletData.algorand_address)
          
          set({ 
            wallet: { 
              address: walletData.algorand_address, 
              balance: balance 
            },
            isLoading: false 
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      refreshBalance: async () => {
        const { wallet } = get()
        if (!wallet) return

        try {
          const balance = await algorandService.getBalance(wallet.address)
          const oldBalance = wallet.balance
          
          set({ wallet: { ...wallet, balance } })
          
          // Update in database
          await supabase
            .from('wallets')
            .update({ balance, updated_at: new Date().toISOString() })
            .eq('algorand_address', wallet.address)

          // Show notification if balance changed significantly
          if (Math.abs(balance - oldBalance) > 0.001) {
            notificationService.showBalanceUpdate(balance, 'ALGO')
          }
        } catch (error) {
          console.error('Failed to refresh balance:', error)
        }
      },

      fundWallet: async () => {
        const { wallet } = get()
        if (!wallet) return

        set({ isFunding: true })
        try {
          await algorandService.fundFromDispenser(wallet.address)
          
          // Wait a bit for transaction to process, then refresh multiple times
          setTimeout(() => {
            get().refreshBalance()
          }, 3000)
          setTimeout(() => {
            get().refreshBalance()
          }, 6000)
          setTimeout(() => {
            get().refreshBalance()
          }, 10000)
          setTimeout(() => {
            get().refreshBalance()
          }, 15000)
        } catch (error) {
          throw error
        } finally {
          set({ isFunding: false })
        }
      },
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({ wallet: state.wallet }),
    }
  )
)