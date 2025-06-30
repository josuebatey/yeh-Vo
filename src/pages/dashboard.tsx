import { useEffect, useState } from 'react'
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
  ExternalLink,
  Activity
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useWalletStore } from '@/stores/walletStore'
import { useAuthStore } from '@/stores/authStore'
import { VoiceCommandButton } from '@/components/ui/voice-command-button'
import { voiceService } from '@/services/voiceService'
import { paymentService } from '@/services/paymentService'
import { algorandService } from '@/services/algorandService'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { format } from 'date-fns'
import { BackButton } from '@/components/ui/back-button'

export function Dashboard() {
  const { user, profile } = useAuthStore()
  const { wallet, loadWallet, refreshBalance, fundWallet, isFunding } = useWalletStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalSent: 0,
    totalReceived: 0,
    monthlyTotal: 0,
    transactionCount: 0
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())

  // Auto refresh every 10 seconds with transaction monitoring
  const { forceRefresh } = useAutoRefresh({
    enabled: true,
    interval: 10000,
    onTransactionUpdate: (transactions) => {
      console.log('Dashboard: New transactions detected', transactions.length)
      setRecentTransactions(transactions.slice(0, 5))
      loadStats(transactions)
      setLastUpdateTime(new Date())
    },
    onBalanceUpdate: (balance) => {
      console.log('Dashboard: Balance updated', balance)
      setLastUpdateTime(new Date())
    }
  })

  useEffect(() => {
    // Only load wallet when both user and profile are available
    // This ensures the profile exists in the database before creating wallet
    if (user && profile) {
      loadWallet(user.id)
      loadStats()
    }
  }, [user, profile, loadWallet])

  const loadStats = async (transactions?: any[]) => {
    if (!user) return

    try {
      const txData = transactions || await paymentService.getTransactionHistory(user.id, 100)
      setRecentTransactions(txData.slice(0, 5))
      
      const completedTxs = txData.filter(tx => tx.status === 'completed')
      
      const sent = completedTxs
        .filter(tx => tx.type === 'send')
        .reduce((sum, tx) => sum + tx.amount, 0)
      
      const received = completedTxs
        .filter(tx => tx.type === 'receive')
        .reduce((sum, tx) => sum + tx.amount, 0)

      const thisMonth = new Date()
      thisMonth.setDate(1)
      
      const monthlyTransactions = completedTxs.filter(tx => 
        new Date(tx.created_at) >= thisMonth
      )
      
      const monthlyTotal = monthlyTransactions.reduce((sum, tx) => sum + tx.amount, 0)

      setStats({
        totalSent: sent,
        totalReceived: received,
        monthlyTotal,
        transactionCount: completedTxs.length
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
      
      // Show error with manual funding option
      toast.error('Automatic funding failed', {
        description: 'Click "Manual Fund" to use the TestNet dispenser directly',
        duration: 8000,
      })
    }
  }

  const handleRefreshBalance = async () => {
    setIsRefreshing(true)
    try {
      await refreshBalance()
      await loadStats()
      await forceRefresh()
      setLastUpdateTime(new Date())
      toast.success('Balance refreshed!')
    } catch (error) {
      toast.error('Failed to refresh balance')
    } finally {
      setIsRefreshing(false)
    }
  }

  const openDispenser = () => {
    window.open(algorandService.getDispenserUrl(), '_blank')
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
      title: 'Total Sent',
      value: `${stats.totalSent.toFixed(2)} ALGO`,
      icon: ArrowUpRight,
      color: 'text-red-600',
    },
    {
      title: 'Total Received',
      value: `${stats.totalReceived.toFixed(2)} ALGO`,
      icon: ArrowDownRight,
      color: 'text-green-600',
    },
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header Section - Fixed */}
      <div className="flex-shrink-0 p-4 md:p-6 border-b bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back to yehVo</p>
            </div>
          </div>
          <VoiceCommandButton onCommand={handleVoiceCommand} />
        </div>
      </div>

      {/* Content Section - Scrollable */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Grid */}
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

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Quick Actions */}
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

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Activity</CardTitle>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Activity className="h-3 w-3" />
                    <span>Live</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentTransactions.length > 0 ? (
                    <div className="space-y-2">
                      {recentTransactions.slice(0, 3).map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div className="flex items-center space-x-2">
                            {tx.type === 'send' ? (
                              <ArrowUpRight className="h-4 w-4 text-red-500" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-green-500" />
                            )}
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {tx.type === 'send' ? 'Sent' : 'Received'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(tx.created_at), 'MMM dd, HH:mm')}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {tx.type === 'send' ? '-' : '+'}
                              {tx.amount.toFixed(2)} {tx.currency}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {tx.channel}
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/history')}
                        className="w-full"
                      >
                        View All Transactions
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No recent transactions</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/send')}
                        className="mt-2"
                      >
                        Make Your First Payment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Wallet Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Wallet Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Address:</span>
                    <p className="font-mono text-xs break-all">
                      {wallet?.address ? `${wallet.address.slice(0, 8)}...${wallet.address.slice(-8)}` : 'Loading...'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Balance:</span>
                    <p className="font-semibold">{wallet?.balance?.toFixed(4) || '0'} ALGO</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Transactions:</span>
                    <p className="font-semibold">{stats.transactionCount}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Update:</span>
                    <p className="font-semibold text-green-500">{format(lastUpdateTime, 'HH:mm:ss')}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleRefreshBalance}
                    disabled={isRefreshing}
                    className="flex-1"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleFundWallet}
                    disabled={isFunding}
                    className="flex-1"
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
                    onClick={openDispenser}
                    className="flex-1"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Manual Fund
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Get free TestNet ALGO for testing • Auto-refresh every 10 seconds • Live transaction monitoring
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}