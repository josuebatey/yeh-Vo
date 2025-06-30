import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  profile: any | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isLoading: false,

      signIn: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (error) throw error
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle()

          set({ user: data.user, profile, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      signUp: async (email: string, password: string, fullName: string) => {
        set({ isLoading: true })
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          })
          if (error) throw error

          // Create profile
          if (data.user) {
            await supabase.from('profiles').insert({
              id: data.user.id,
              email,
              full_name: fullName,
            })
          }

          set({ user: data.user, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, profile: null })
      },

      refreshUser: async () => {
        try {
          const { data: { user }, error } = await supabase.auth.getUser()
          
          if (error || !user) {
            // Session is invalid or doesn't exist, clear local state
            get().signOut()
            return
          }

          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()
          
          set({ user, profile })
        } catch (error) {
          // If there's any error refreshing the user, sign out
          get().signOut()
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, profile: state.profile }),
    }
  )
)