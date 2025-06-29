import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Wallet, 
  Send, 
  TrendingUp, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useWalletStore } from '@/stores/walletStore'
import { useAuthStore } from '@/stores/authStore'
import { VoiceCommandButton } from '@/components/ui/voice-command-button'
import { voiceService } from '@/services/voiceService'
import { paymentService } from '@/services/paymentService'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { BackButton } from '@/components/ui/back-button'

export function Dashboard() {
  const { user } = useAuthStore()
  const { wallet, loadWallet, refreshBalance, fundWallet, isFunding } = useWalletStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalSent: 0,
    totalReceived: 0,
    monthlyTotal: 0,
    transactionCount: 0
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (user) {
      loadWallet(user.id)
      loadStats()
    }
  }, [user, loadWallet])

  const loadStats = async () => {
    if (!user) return

    try {
      const transactions = await paymentService.getTransactionHistory(user.id, 100)
      
      const sent = transactions
        .filter(tx => tx.type === 'send' && tx.status === 'completed')
        .reduce((sum, tx) => sum + tx.amount, 0)
      
      const received = transactions
        .filter(tx => tx.type === 'receive' && tx.status === 'completed')
        .reduce((sum, tx) => sum + tx.amount, 0)

      const thisMonth = new Date()
      thisMonth.setDate(1)
      
      const monthlyTransactions = transactions.filter(tx => 
        new Date(tx.created_at) >= thisMonth
      )
      
      const monthlyTotal = monthlyTransactions.reduce((sum, tx) => sum + tx.amount, 0)

      setStats({
        totalSent: sent,
        totalReceived: received,
        monthlyTotal,
        transactionCount: transactions.length
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleVoiceCommand = async (transcript: string) => {
    const command = voiceService.parseVoiceCommand(transcript)
    
    if (!command) {
      await voiceService.speak('Sorry, I didn\'t understand that command')
      return
    }

    switch (command.action) {
      case 'send':
        navigate('/send', { state: { command } })
        break
      case 'balance':
        await voiceService.speak(`Your current balance is ${wallet?.balance?.toFixed(4) || '0'} Algos`)
        break
      case 'history':
        navigate('/history')
        break
      case 'invest':
        navigate('/invest', { state: { command } })
        break
    }
  }

  const handleFundWallet = async () => {
    try {
      await fundWallet()
      toast.success('Wallet funding requested. Please wait for confirmation.')
      // Refresh stats after funding
      setTimeout(() => {
        handleRefreshBalance()
        loadStats()
      }, 3000)
    } catch (error: any) {
      console.error('Fund wallet error:', error)
      
      // Check if it's the simulation error
      if (error.message.includes('TestNet funding simulation complete')) {
        toast.info('Demo Mode: Please manually fund your TestNet wallet', {
          description: 'Visit https://dispenser.testnet.aws.algodev.network/ to get free TestNet ALGO',
          duration: 8000,
        })
      } else {
        toast.error(error.message || 'Failed to fund wallet')
      }
    }
  }

  const handleRefreshBalance = async () => {
    setIsRefreshing(true)
    try {
      await refreshBalance()
      await loadStats()
      toast.success('Balance refreshed!')
    } catch (error) {
      toast.error('Failed to refresh balance')
    } finally {
      setIsRefreshing(false)
    }
  }

  const openDispenser = () => {
    window.open('https://dispenser.testnet.aws.algodev.network/', '_blank')
  }

  const dashboardStats = [
    {
      title: 'Wallet Balance',
      value: `${wallet?.balance?.toFixed(4) || '0'} ALGO`,
      icon: Wallet,
      color: 'text-blue-600',
    },
    {
      title: 'This Month',
      value: `${stats.monthlyTotal.toFixed(2)} ALGO`,
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Sent',
      value: stats.totalSent.toFixed(2),
      icon: ArrowUpRight,
      color: 'text-red-600',
    },
    {
      title: 'Received',
      value: stats.totalReceived.toFixed(2),
      icon: ArrowDownRight,
      color: 'text-green-600',
    },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <BackButton />
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to VoicePay</p>
        </div>
        <VoiceCommandButton onCommand={handleVoiceCommand} />
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                onClick={() => navigate('/send')}
              >
                <Send className="mr-2 h-4 w-4" />
                Send Payment
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/receive')}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Receive Payment
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/invest')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Invest Funds
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Wallet Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Address: {wallet?.address ? `${wallet.address.slice(0, 8)}...${wallet.address.slice(-8)}` : 'Loading...'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Balance: {wallet?.balance?.toFixed(4) || '0'} ALGO
                </p>
                <p className="text-sm text-muted-foreground">
                  Transactions: {stats.transactionCount}
                </p>
              </div>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleRefreshBalance}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh Balance'}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleFundWallet}
                    disabled={isFunding}
                  >
                    {isFunding ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Funding...
                      </>
                    ) : (
                      <>
                        <Wallet className="mr-2 h-4 w-4" />
                        Auto Fund
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={openDispenser}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Manual Fund
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Get free TestNet ALGO for testing
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}