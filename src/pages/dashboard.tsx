import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Wallet, 
  Send, 
  TrendingUp, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useWalletStore } from '@/stores/walletStore'
import { useAuthStore } from '@/stores/authStore'
import { VoiceCommandButton } from '@/components/ui/voice-command-button'
import { voiceService } from '@/services/voiceService'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export function Dashboard() {
  const { user } = useAuthStore()
  const { wallet, loadWallet, refreshBalance, fundWallet } = useWalletStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      loadWallet(user.id)
    }
  }, [user, loadWallet])

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
    } catch (error) {
      toast.error('Failed to fund wallet')
    }
  }

  const stats = [
    {
      title: 'Wallet Balance',
      value: `${wallet?.balance?.toFixed(4) || '0'} ALGO`,
      icon: Wallet,
      color: 'text-blue-600',
    },
    {
      title: 'This Month',
      value: '$0.00',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Sent',
      value: '0',
      icon: ArrowUpRight,
      color: 'text-red-600',
    },
    {
      title: 'Received',
      value: '0',
      icon: ArrowDownRight,
      color: 'text-green-600',
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to VoicePay</p>
        </div>
        <VoiceCommandButton onCommand={handleVoiceCommand} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
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
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
              </div>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={refreshBalance}
                >
                  Refresh Balance
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleFundWallet}
                >
                  Fund from Testnet
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}