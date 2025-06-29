export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          algorand_address: string
          encrypted_mnemonic: string
          balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          algorand_address: string
          encrypted_mnemonic: string
          balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          balance?: number
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'send' | 'receive'
          amount: number
          currency: string
          channel: 'algorand' | 'mobile_money' | 'bank'
          to_address: string | null
          from_address: string | null
          algorand_tx_id: string | null
          status: 'pending' | 'completed' | 'failed'
          metadata: Record<string, any> | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'send' | 'receive'
          amount: number
          currency: string
          channel: 'algorand' | 'mobile_money' | 'bank'
          to_address?: string | null
          from_address?: string | null
          algorand_tx_id?: string | null
          status?: 'pending' | 'completed' | 'failed'
          metadata?: Record<string, any> | null
          created_at?: string
        }
        Update: {
          status?: 'pending' | 'completed' | 'failed'
          algorand_tx_id?: string | null
          metadata?: Record<string, any> | null
        }
      }
      investments: {
        Row: {
          id: string
          user_id: string
          amount_invested: number
          apy_rate: number
          start_date: string
          projected_return: number
          current_value: number
          status: 'active' | 'withdrawn'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount_invested: number
          apy_rate?: number
          start_date?: string
          projected_return?: number
          current_value?: number
          status?: 'active' | 'withdrawn'
          created_at?: string
          updated_at?: string
        }
        Update: {
          current_value?: number
          status?: 'active' | 'withdrawn'
          updated_at?: string
        }
      }
      user_limits: {
        Row: {
          id: string
          user_id: string
          daily_send_limit: number
          daily_sent_amount: number
          is_pro: boolean
          last_reset_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          daily_send_limit?: number
          daily_sent_amount?: number
          is_pro?: boolean
          last_reset_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          daily_sent_amount?: number
          is_pro?: boolean
          last_reset_date?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}