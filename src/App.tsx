import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from 'next-themes'
import { Layout } from '@/components/layout/layout'
import { AuthPage } from '@/pages/auth'
import { Dashboard } from '@/pages/dashboard'
import { SendPayment } from '@/pages/send-payment'
import { ReceivePayment } from '@/pages/receive-payment'
import { TransactionHistory } from '@/pages/history'
import { Investment } from '@/pages/investment'
import { WalletPage } from '@/pages/wallet'
import { VoiceCommands } from '@/pages/voice'
import { AIAssistant } from '@/pages/assistant'
import { Settings } from '@/pages/settings'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { notificationService } from '@/components/ui/notification-service'
import './lib/i18n' // Initialize i18n
import './App.css'

const queryClient = new QueryClient()

function AppRoutes() {
  const { user, refreshUser } = useAuthStore()

  useEffect(() => {
    // Request notification permission on app startup
    if (notificationService.isSupported()) {
      notificationService.requestPermission().then((granted) => {
        if (granted) {
          console.log('Notification permission granted')
        } else {
          console.log('Notification permission denied')
        }
      })
    }

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        refreshUser()
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        refreshUser()
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.setState({ user: null, profile: null })
      }
    })

    return () => subscription.unsubscribe()
  }, [refreshUser])

  if (!user) {
    return (
      <>
        <AuthPage className='border border-red-600'  />
        <span className="object-fill flex justify-end fixed top-10 left-14 z-index-9999">
          <img className="h-10 w-20 mt-2" src="../../public/bolt-bagde.svg" />
      </span>
      </>
    )
  }

  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/send" element={<SendPayment />} />
          <Route path="/receive" element={<ReceivePayment />} />
          <Route path="/history" element={<TransactionHistory />} />
          <Route path="/invest" element={<Investment />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/voice" element={<VoiceCommands />} />
          <Route path="/assistant" element={<AIAssistant />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <span className="object-fill flex justify-end fixed bottom-2 right-2 z-index-9999">
          <img className="h-10 w-20 mt-2" src="../../public/bolt-bagde.svg" />
      </span>
    </>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="system" 
        enableSystem
        disableTransitionOnChange
      >
        <Router>
          <AppRoutes />
          <Toaster richColors />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App