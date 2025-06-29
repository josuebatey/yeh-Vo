import { supabase } from '@/lib/supabase'
import { algorandService } from './algorandService'

export interface PaymentRequest {
  amount: number
  recipient: string
  channel: 'algorand' | 'mobile_money' | 'bank'
  currency?: string
  metadata?: Record<string, any>
}

export const paymentService = {
  async sendPayment(userId: string, request: PaymentRequest): Promise<string> {
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
          txId = await this.sendMobileMoneyPayment(request)
          break
        case 'bank':
          txId = await this.sendBankTransfer(request)
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
    // Get user's wallet
    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error

    // Decrypt mnemonic (in production, use proper decryption)
    const mnemonic = atob(wallet.encrypted_mnemonic)

    const txId = await algorandService.sendPayment(
      wallet.algorand_address,
      request.recipient,
      request.amount,
      mnemonic
    )

    return txId
  },

  async sendMobileMoneyPayment(request: PaymentRequest): Promise<string> {
    // Mock mobile money API call
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API delay
    
    // Mock success response
    return `mobile_money_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  async sendBankTransfer(request: PaymentRequest): Promise<string> {
    // Mock bank transfer API call
    await new Promise(resolve => setTimeout(resolve, 3000)) // Simulate API delay
    
    // Mock success response
    return `bank_transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
    const { data: limits, error } = await supabase
      .from('user_limits')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

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
}