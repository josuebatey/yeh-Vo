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
    const validation = await this.validateRecipient(request.recipient, request.channel)
    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    // Get sender's wallet address for from_address
    const { data: senderWallet, error: walletError } = await supabase
      .from('wallets')
      .select('algorand_address')
      .eq('user_id', userId)
      .limit(1)

    if (walletError) throw walletError
    if (!senderWallet || senderWallet.length === 0) {
      throw new Error('Sender wallet not found')
    }

    const senderAddress = senderWallet[0].algorand_address

    // Create transaction record
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'send',
        amount: request.amount,
        currency: request.currency || 'ALGO',
        channel: request.channel,
        to_address: request.recipient,
        from_address: senderAddress, // Use sender's wallet address
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
          txId = await this.sendMobileMoneyPayment(request, senderAddress)
          break
        case 'bank':
          txId = await this.sendBankTransfer(request, senderAddress)
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

  async sendMobileMoneyPayment(request: PaymentRequest, fromAddress: string): Promise<string> {
    // Find recipient by email or phone
    const { data: recipientProfile } = await supabase
      .from('profiles')
      .select('*')
      .or(`email.eq.${request.recipient},phone_number.eq.${request.recipient}`)
      .single()

    if (!recipientProfile) {
      throw new Error('Recipient not found. Please ensure they have a VoicePay account with verified phone number.')
    }

    if (!recipientProfile.phone_verified) {
      throw new Error('Recipient must have a verified phone number for mobile money transfers.')
    }

    if (request.amount < 0.1) {
      throw new Error('Minimum mobile money transfer amount is 0.1 ALGO')
    }

    if (request.amount > 1000) {
      throw new Error('Maximum mobile money transfer amount is 1000 ALGO')
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate occasional failures for realism
    if (Math.random() < 0.05) {
      throw new Error('Mobile money service temporarily unavailable. Please try again.')
    }

    // Create a receive transaction for the recipient
    await this.simulateReceivePayment(
      recipientProfile.id, 
      request.amount, 
      fromAddress, // Use sender's wallet address as from_address
      'mobile_money'
    )

    return `mobile_money_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  async sendBankTransfer(request: PaymentRequest, fromAddress: string): Promise<string> {
    // Find recipient by email
    const { data: recipientProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', request.recipient)
      .single()

    if (!recipientProfile) {
      throw new Error('Recipient not found. Please ensure they have a VoicePay account with linked bank account.')
    }

    if (!recipientProfile.bank_account_info) {
      throw new Error('Recipient must have a linked bank account for bank transfers.')
    }

    if (request.amount < 1) {
      throw new Error('Minimum bank transfer amount is 1 ALGO')
    }

    if (request.amount > 10000) {
      throw new Error('Maximum bank transfer amount is 10,000 ALGO')
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Simulate occasional failures for realism
    if (Math.random() < 0.03) {
      throw new Error('Bank transfer service temporarily unavailable. Please try again.')
    }

    // Create a receive transaction for the recipient
    await this.simulateReceivePayment(
      recipientProfile.id, 
      request.amount, 
      fromAddress, // Use sender's wallet address as from_address
      'bank'
    )

    return `bank_transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  async simulateReceivePayment(userId: string, amount: number, fromAddress: string, channel: 'algorand' | 'mobile_money' | 'bank' = 'algorand'): Promise<void> {
    try {
      // Get recipient's wallet address for to_address
      const { data: recipientWallet } = await supabase
        .from('wallets')
        .select('algorand_address')
        .eq('user_id', userId)
        .limit(1)

      const recipientAddress = recipientWallet && recipientWallet.length > 0 
        ? recipientWallet[0].algorand_address 
        : null

      // Create receive transaction record with proper addresses
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'receive',
          amount: amount,
          currency: 'ALGO',
          channel: channel,
          from_address: fromAddress, // Sender's wallet address
          to_address: recipientAddress, // Recipient's wallet address
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
        reason: `Daily limit exceeded. You can send ${(limits.daily_send_limit - limits.daily_sent_amount).toFixed(2)} ALGO more today.`
      }
    }

    return { canSend: true }
  },

  async updateDailySpent(userId: string, amount: number): Promise<void> {
    await supabase.rpc('increment_daily_spent', {
      p_user_id: userId,
      amount: amount,
    })
  },

  // Validation helpers
  async validateRecipient(recipient: string, channel: string): Promise<{ isValid: boolean; error?: string }> {
    switch (channel) {
      case 'algorand':
        if (!this.isValidAlgorandAddress(recipient)) {
          return {
            isValid: false,
            error: 'Invalid Algorand address. Must be 58 characters long and contain only uppercase letters and numbers 2-7.'
          }
        }
        return { isValid: true }

      case 'mobile_money':
        if (this.isValidEmail(recipient)) {
          // Check if user exists with this email
          const { data } = await supabase
            .from('profiles')
            .select('phone_verified')
            .eq('email', recipient)
            .single()
          
          if (!data) {
            return {
              isValid: false,
              error: 'Recipient not found. Please ensure they have a VoicePay account.'
            }
          }
          
          if (!data.phone_verified) {
            return {
              isValid: false,
              error: 'Recipient must have a verified phone number for mobile money transfers.'
            }
          }
          
          return { isValid: true }
        } else if (this.isValidPhoneNumber(recipient)) {
          // Check if user exists with this phone
          const { data } = await supabase
            .from('profiles')
            .select('phone_verified')
            .eq('phone_number', recipient)
            .single()
          
          if (!data) {
            return {
              isValid: false,
              error: 'Recipient not found. Please ensure they have a VoicePay account with this phone number.'
            }
          }
          
          return { isValid: true }
        } else {
          return {
            isValid: false,
            error: 'Invalid recipient. Please enter a valid email address or phone number.'
          }
        }

      case 'bank':
        if (!this.isValidEmail(recipient)) {
          return {
            isValid: false,
            error: 'Invalid recipient. Please enter a valid email address.'
          }
        }
        
        // Check if user exists with linked bank account
        const { data } = await supabase
          .from('profiles')
          .select('bank_account_info')
          .eq('email', recipient)
          .single()
        
        if (!data) {
          return {
            isValid: false,
            error: 'Recipient not found. Please ensure they have a VoicePay account.'
          }
        }
        
        if (!data.bank_account_info) {
          return {
            isValid: false,
            error: 'Recipient must have a linked bank account for bank transfers.'
          }
        }
        
        return { isValid: true }

      default:
        return {
          isValid: false,
          error: 'Unsupported payment channel'
        }
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

  // Phone verification simulation
  async sendVerificationCode(phoneNumber: string): Promise<{ success: boolean; code?: string }> {
    // In a real app, this would send SMS via Twilio, AWS SNS, etc.
    // For demo, we'll return a fixed code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log(`SMS sent to ${phoneNumber}: Your VoicePay verification code is ${code}`)
    
    return { success: true, code }
  },

  async verifyPhoneNumber(userId: string, phoneNumber: string, code: string): Promise<boolean> {
    // In a real app, this would verify the code
    // For demo, we'll accept any 6-digit code
    if (!/^\d{6}$/.test(code)) {
      throw new Error('Invalid verification code format')
    }

    const { error } = await supabase.rpc('verify_phone_number', {
      p_user_id: userId,
      p_phone_number: phoneNumber
    })

    if (error) throw error
    return true
  },

  // Bank account linking simulation
  async linkBankAccount(userId: string, accountInfo: any): Promise<boolean> {
    // In a real app, this would integrate with Plaid, Yodlee, etc.
    // For demo, we'll just store the info
    const { error } = await supabase.rpc('link_bank_account', {
      p_user_id: userId,
      p_account_info: accountInfo
    })

    if (error) throw error
    return true
  },
}