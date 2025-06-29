import { supabase } from '@/lib/supabase'
import { algorandService } from './algorandService'
import { notificationService } from '@/components/ui/notification-service'

export interface PaymentRequest {
  amount: number
  recipient: string
  channel: 'algorand' | 'mobile_money' | 'bank'
  currency?: string
  metadata?: Record<string, any>
}

export const paymentService = {
  async sendPayment(userId: string, request: PaymentRequest): Promise<string> {
    // Validate recipient based on channel
    if (!this.validateRecipient(request.recipient, request.channel)) {
      throw new Error(this.getValidationError(request.channel))
    }

    // Create transaction record
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'send',
        amount: request.amount,
        currency: request.currency || 'USD',
        channel: request.channel,
        to_address: request.recipient,
        status: 'pending',
        metadata: request.metadata,
      })
      .select()
      .single()

    if (error) throw error

    try {
      let txId: string

      switch (request.channel) {
        case 'algorand':
          txId = await this.sendAlgorandPayment(userId, request)
          break
        case 'mobile_money':
          txId = await this.sendMobileMoneyPayment(userId, request)
          break
        case 'bank':
          txId = await this.sendBankTransfer(userId, request)
          break
        default:
          throw new Error('Unsupported payment channel')
      }

      // Update transaction with success
      await supabase
        .from('transactions')
        .update({
          status: 'completed',
          algorand_tx_id: request.channel === 'algorand' ? txId : null,
          metadata: { ...request.metadata, external_tx_id: txId },
        })
        .eq('id', transaction.id)

      return txId
    } catch (error) {
      // Update transaction with failure
      await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('id', transaction.id)
      
      throw error
    }
  },

  async sendAlgorandPayment(userId: string, request: PaymentRequest): Promise<string> {
    // Get user's wallet - handle potential multiple rows by taking the first one
    const { data: wallets, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .limit(1)

    if (error) throw error
    if (!wallets || wallets.length === 0) {
      throw new Error('No wallet found for user')
    }

    const wallet = wallets[0]

    // Check sufficient balance
    const currentBalance = await algorandService.getBalance(wallet.algorand_address)
    if (currentBalance < request.amount) {
      throw new Error(`Insufficient balance. You have ${currentBalance.toFixed(4)} ALGO but need ${request.amount} ALGO`)
    }

    // Decrypt mnemonic (in production, use proper decryption)
    const mnemonic = atob(wallet.encrypted_mnemonic)

    const txId = await algorandService.sendPayment(
      wallet.algorand_address,
      request.recipient,
      request.amount,
      mnemonic
    )

    // Update wallet balance
    await supabase
      .from('wallets')
      .update({ 
        balance: currentBalance - request.amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    return txId
  },

  async sendMobileMoneyPayment(userId: string, request: PaymentRequest): Promise<string> {
    // Get user's profile to check if they have a registered mobile number
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // For demo purposes, simulate that the recipient must be a registered user
    const { data: recipientProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', request.recipient)
      .single()

    if (!recipientProfile) {
      throw new Error('Recipient not found. Mobile money transfers require the recipient to have a VoicePay account.')
    }

    if (request.amount < 0.1) {
      throw new Error('Minimum mobile money transfer amount is 0.1')
    }

    if (request.amount > 1000) {
      throw new Error('Maximum mobile money transfer amount is 1000')
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate occasional failures for realism
    if (Math.random() < 0.1) {
      throw new Error('Mobile money service temporarily unavailable')
    }

    // Create a receive transaction for the recipient
    await this.simulateReceivePayment(recipientProfile.id, request.amount, profile?.email || 'unknown', 'mobile_money')

    return `mobile_money_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  async sendBankTransfer(userId: string, request: PaymentRequest): Promise<string> {
    // Get user's profile to check if they have bank details
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // For demo purposes, simulate that the recipient must be a registered user
    const { data: recipientProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', request.recipient)
      .single()

    if (!recipientProfile) {
      throw new Error('Recipient not found. Bank transfers require the recipient to have a VoicePay account.')
    }

    if (request.amount < 1) {
      throw new Error('Minimum bank transfer amount is 1')
    }

    if (request.amount > 10000) {
      throw new Error('Maximum bank transfer amount is 10,000')
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Simulate occasional failures for realism
    if (Math.random() < 0.05) {
      throw new Error('Bank transfer service temporarily unavailable')
    }

    // Create a receive transaction for the recipient
    await this.simulateReceivePayment(recipientProfile.id, request.amount, profile?.email || 'unknown', 'bank')

    return `bank_transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  async simulateReceivePayment(userId: string, amount: number, fromAddress: string, channel: 'algorand' | 'mobile_money' | 'bank' = 'algorand'): Promise<void> {
    try {
      // Create receive transaction record
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'receive',
          amount: amount,
          currency: 'ALGO',
          channel: channel,
          from_address: fromAddress,
          status: 'completed',
          algorand_tx_id: `received_${channel}_${Date.now()}`,
        })

      if (error) {
        console.error('Error creating receive transaction:', error)
        return
      }

      // Update wallet balance - handle potential multiple wallets
      const { data: wallets } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .limit(1)

      if (wallets && wallets.length > 0) {
        const wallet = wallets[0]
        await supabase
          .from('wallets')
          .update({ 
            balance: wallet.balance + amount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        // Show notification for the recipient
        notificationService.showPaymentReceived(amount, 'ALGO', fromAddress)
      }
    } catch (error) {
      console.error('Error in simulateReceivePayment:', error)
    }
  },

  async getTransactionHistory(userId: string, limit = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  async checkDailyLimits(userId: string, amount: number): Promise<{ canSend: boolean; reason?: string }> {
    // Handle potential multiple rows by taking the first one
    const { data: limitsArray, error } = await supabase
      .from('user_limits')
      .select('*')
      .eq('user_id', userId)
      .limit(1)

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    const limits = limitsArray && limitsArray.length > 0 ? limitsArray[0] : null

    if (!limits) {
      // Create default limits for new user
      await supabase.from('user_limits').insert({
        user_id: userId,
        daily_send_limit: 10, // $10 for free users
        daily_sent_amount: 0,
        is_pro: false,
        last_reset_date: new Date().toISOString().split('T')[0],
      })
      return { canSend: amount <= 10 }
    }

    // Check if we need to reset daily limits
    const today = new Date().toISOString().split('T')[0]
    if (limits.last_reset_date !== today) {
      await supabase
        .from('user_limits')
        .update({
          daily_sent_amount: 0,
          last_reset_date: today,
        })
        .eq('user_id', userId)
      limits.daily_sent_amount = 0
    }

    const newTotal = limits.daily_sent_amount + amount
    if (newTotal > limits.daily_send_limit) {
      return {
        canSend: false,
        reason: `Daily limit exceeded. You can send $${(limits.daily_send_limit - limits.daily_sent_amount).toFixed(2)} more today.`
      }
    }

    return { canSend: true }
  },

  async updateDailySpent(userId: string, amount: number): Promise<void> {
    await supabase.rpc('increment_daily_spent', {
      user_id: userId,
      amount: amount,
    })
  },

  // Validation helpers
  validateRecipient(recipient: string, channel: string): boolean {
    switch (channel) {
      case 'algorand':
        return this.isValidAlgorandAddress(recipient)
      case 'mobile_money':
        return this.isValidEmail(recipient) // Using email as identifier for demo
      case 'bank':
        return this.isValidEmail(recipient) // Using email as identifier for demo
      default:
        return false
    }
  },

  getValidationError(channel: string): string {
    switch (channel) {
      case 'algorand':
        return 'Invalid Algorand address. Must be 58 characters long and contain only uppercase letters and numbers 2-7.'
      case 'mobile_money':
        return 'Invalid recipient. Please enter the email address of a registered VoicePay user.'
      case 'bank':
        return 'Invalid recipient. Please enter the email address of a registered VoicePay user.'
      default:
        return 'Invalid recipient format'
    }
  },

  isValidAlgorandAddress(address: string): boolean {
    return /^[A-Z2-7]{58}$/.test(address)
  },

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  },

  isValidPhoneNumber(phone: string): boolean {
    return /^\+?[\d\s\-\(\)]{10,15}$/.test(phone)
  },

  isValidAccountNumber(account: string): boolean {
    return /^\d{8,20}$/.test(account)
  },
}