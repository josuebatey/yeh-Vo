import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TrendingUp, DollarSign, Target, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { useWalletStore } from '@/stores/walletStore'
import { supabase } from '@/lib/supabase'
import { BackButton } from '@/components/ui/back-button'
import { notificationService } from '@/components/ui/notification-service'

interface Investment {
  id: string
  amount_invested: number
  apy_rate: number
  start_date: string
  current_value: number
  status: 'active' | 'withdrawn'
  created_at: string
}

export function Investment() {
  const { user } = useAuthStore()
  const { wallet, refreshBalance } = useWalletStore()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [investAmount, setInvestAmount] = useState('')
  const [selectedAPY, setSelectedAPY] = useState(8.5)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null)

  useEffect(() => {
    if (user) {
      loadInvestments()
    }
  }, [user])

  const loadInvestments = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvestments(data || [])
    } catch (error) {
      console.error('Failed to load investments:', error)
    }
  }

  const calculateProjectedReturn = (amount: number, apy: number, days: number = 365) => {
    return amount * (1 + (apy / 100)) ** (days / 365)
  }

  const calculateCurrentValue = (investment: Investment) => {
    const daysSinceStart = Math.floor(
      (Date.now() - new Date(investment.start_date).getTime()) / (1000 * 60 * 60 * 24)
    )
    return calculateProjectedReturn(investment.amount_invested, investment.apy_rate, daysSinceStart)
  }

  const handleInvest = async () => {
    if (!user || !wallet) return

    const amount = parseFloat(investAmount)
    if (amount <= 0 || amount > wallet.balance) {
      toast.error('Invalid investment amount')
      return
    }

    setIsLoading(true)
    try {
      const projectedReturn = calculateProjectedReturn(amount, selectedAPY)
      
      const { error } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          amount_invested: amount,
          apy_rate: selectedAPY,
          start_date: new Date().toISOString(),
          projected_return: projectedReturn,
          current_value: amount,
          status: 'active',
        })

      if (error) throw error

      // Update wallet balance (simulate deduction)
      const { data: wallets } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)

      if (wallets && wallets.length > 0) {
        await supabase
          .from('wallets')
          .update({ 
            balance: wallets[0].balance - amount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
      }

      // Show notification
      notificationService.showInvestmentUpdate(
        `Investment of ${amount} ALGO started with ${selectedAPY}% APY`
      )

      toast.success(`Successfully invested ${amount} ALGO!`)
      setInvestAmount('')
      loadInvestments()
      
      // Refresh wallet balance to reflect the investment deduction
      await refreshBalance()
      
    } catch (error: any) {
      console.error('Investment failed:', error)
      toast.error(error.message || 'Investment failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWithdrawClick = (investment: Investment) => {
    setSelectedInvestment(investment)
    setShowWithdrawDialog(true)
  }

  const handleWithdraw = async () => {
    if (!user || !wallet || !selectedInvestment) return

    const currentValue = calculateCurrentValue(selectedInvestment)
    
    setIsLoading(true)
    try {
      // Mark investment as withdrawn
      const { error: updateError } = await supabase
        .from('investments')
        .update({ status: 'withdrawn' })
        .eq('id', selectedInvestment.id)

      if (updateError) throw updateError

      // Update wallet balance (add withdrawal)
      const { data: wallets } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)

      if (wallets && wallets.length > 0) {
        await supabase
          .from('wallets')
          .update({ 
            balance: wallets[0].balance + currentValue,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
      }

      // Show notification
      notificationService.showInvestmentUpdate(
        `Investment withdrawn: ${currentValue.toFixed(4)} ALGO added to wallet`
      )

      toast.success(`Successfully withdrew ${currentValue.toFixed(4)} ALGO!`)
      setShowWithdrawDialog(false)
      setSelectedInvestment(null)
      loadInvestments()
      
      // Refresh wallet balance to reflect the withdrawal
      await refreshBalance()
      
    } catch (error: any) {
      console.error('Withdrawal failed:', error)
      toast.error(error.message || 'Withdrawal failed')
    } finally {
      setIsLoading(false)
    }
  }

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount_invested, 0)
  const totalCurrentValue = investments.reduce((sum, inv) => sum + calculateCurrentValue(inv), 0)
  const totalGains = totalCurrentValue - totalInvested

  const investmentOptions = [
    { 
      apy: 5.5, 
      name: 'Conservative', 
      risk: 'Low Risk', 
      description: 'Stable returns with minimal volatility',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    { 
      apy: 8.5, 
      name: 'Balanced', 
      risk: 'Medium Risk', 
      description: 'Good balance of risk and returns',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    { 
      apy: 12.0, 
      name: 'Growth', 
      risk: 'High Risk', 
      description: 'Higher potential returns with increased risk',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header Section */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <BackButton />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-emerald-600 dark:from-white dark:to-emerald-400 bg-clip-text text-transparent">
                Investment Portfolio
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Grow your wealth with automated investing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Portfolio Overview */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Invested</CardTitle>
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {totalInvested.toFixed(4)} ALGO
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Principal amount invested
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Current Value</CardTitle>
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                  {totalCurrentValue.toFixed(4)} ALGO
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  Current portfolio value
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className={`bg-gradient-to-br shadow-lg ${
              totalGains >= 0 
                ? 'from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800' 
                : 'from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800'
            }`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className={`text-sm font-medium ${
                  totalGains >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                }`}>
                  Total Gains
                </CardTitle>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  totalGains >= 0 ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {totalGains >= 0 ? (
                    <ArrowUpRight className="h-5 w-5 text-white" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-white" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl md:text-3xl font-bold ${
                  totalGains >= 0 
                    ? 'text-green-900 dark:text-green-100' 
                    : 'text-red-900 dark:text-red-100'
                }`}>
                  {totalGains >= 0 ? '+' : ''}{totalGains.toFixed(4)} ALGO
                </div>
                <p className={`text-xs mt-1 ${
                  totalGains >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {totalGains >= 0 ? 'Profit earned' : 'Current loss'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* New Investment */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Start Investing</CardTitle>
                <p className="text-slate-600 dark:text-slate-400">
                  Choose your investment strategy and start growing your wealth
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="amount" className="text-sm font-medium">Investment Amount (ALGO)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    placeholder="0.00"
                    className="h-12 text-base border-slate-200 dark:border-slate-700"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Available: {wallet?.balance?.toFixed(4) || '0'} ALGO
                  </p>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-medium">Investment Strategy</Label>
                  <div className="space-y-3">
                    {investmentOptions.map((option) => (
                      <div
                        key={option.apy}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedAPY === option.apy
                            ? `${option.borderColor} ${option.bgColor} shadow-md`
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                        onClick={() => setSelectedAPY(option.apy)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${option.color}`} />
                              <div>
                                <div className="font-semibold text-slate-800 dark:text-slate-200">{option.name}</div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">{option.risk}</div>
                              </div>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 ml-6">
                              {option.description}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className={`text-xl font-bold bg-gradient-to-r ${option.color} bg-clip-text text-transparent`}>
                              {option.apy}%
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">APY</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {investAmount && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600"
                  >
                    <h4 className="font-semibold mb-3 text-slate-800 dark:text-slate-200">Projected Returns</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Investment:</span>
                        <span className="font-medium">{investAmount} ALGO</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">APY:</span>
                        <span className="font-medium">{selectedAPY}%</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-2 border-t border-slate-300 dark:border-slate-600">
                        <span className="text-slate-700 dark:text-slate-300">1 Year Value:</span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {calculateProjectedReturn(parseFloat(investAmount) || 0, selectedAPY).toFixed(4)} ALGO
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <Button 
                  onClick={handleInvest}
                  disabled={isLoading || !investAmount || parseFloat(investAmount) <= 0}
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <TrendingUp className="mr-2 h-5 w-5" />
                  )}
                  Start Investment
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Investments */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Active Investments</CardTitle>
                <p className="text-slate-600 dark:text-slate-400">
                  Monitor and manage your current investments
                </p>
              </CardHeader>
              <CardContent>
                {investments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">No Active Investments</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Start your first investment to begin earning returns
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {investments.map((investment, index) => {
                      const currentValue = calculateCurrentValue(investment)
                      const gains = currentValue - investment.amount_invested
                      const gainsPercentage = (gains / investment.amount_invested) * 100
                      const daysSinceStart = Math.floor(
                        (Date.now() - new Date(investment.start_date).getTime()) / (1000 * 60 * 60 * 24)
                      )
                      const progress = Math.min((daysSinceStart / 365) * 100, 100)

                      return (
                        <motion.div 
                          key={investment.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-6 border border-slate-200 dark:border-slate-700 rounded-xl bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                            <div>
                              <div className="font-semibold text-lg text-slate-800 dark:text-slate-200">
                                {investment.amount_invested.toFixed(4)} ALGO
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                {investment.apy_rate}% APY • {daysSinceStart} days active
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-lg text-slate-800 dark:text-slate-200">
                                {currentValue.toFixed(4)} ALGO
                              </div>
                              <div className={`text-sm font-medium ${
                                gains >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                              }`}>
                                {gains >= 0 ? '+' : ''}{gains.toFixed(4)} ({gainsPercentage.toFixed(2)}%)
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                              <span>Progress</span>
                              <span>{progress.toFixed(1)}% of year</span>
                            </div>
                            <Progress 
                              value={progress} 
                              className="h-2 bg-slate-200 dark:bg-slate-700"
                            />
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWithdrawClick(investment)}
                            disabled={isLoading}
                            className="w-full mt-4 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            Withdraw Investment
                          </Button>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Withdrawal Confirmation Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="sm:max-w-md bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Confirm Withdrawal</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to withdraw this investment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedInvestment && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Original Investment:</span>
                    <span className="font-semibold">{selectedInvestment.amount_invested.toFixed(4)} ALGO</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Current Value:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {calculateCurrentValue(selectedInvestment).toFixed(4)} ALGO
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-300 dark:border-slate-600">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Gains:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      +{(calculateCurrentValue(selectedInvestment) - selectedInvestment.amount_invested).toFixed(4)} ALGO
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowWithdrawDialog(false)}
                  className="flex-1 border-slate-300 dark:border-slate-600"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleWithdraw}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Withdrawing...
                    </>
                  ) : (
                    'Confirm Withdrawal'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}