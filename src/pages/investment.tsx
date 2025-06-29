import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, DollarSign, Calendar, Target, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { useWalletStore } from '@/stores/walletStore'
import { supabase } from '@/lib/supabase'

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
  const { wallet } = useWalletStore()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [investAmount, setInvestAmount] = useState('')
  const [selectedAPY, setSelectedAPY] = useState(8.5)

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
      await supabase
        .from('wallets')
        .update({ 
          balance: wallet.balance - amount,
          updated_at: new Date().toISOString()
        })
        .eq('algorand_address', wallet.address)

      toast.success(`Successfully invested ${amount} ALGO!`)
      setInvestAmount('')
      loadInvestments()
      
    } catch (error: any) {
      console.error('Investment failed:', error)
      toast.error(error.message || 'Investment failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWithdraw = async (investmentId: string, currentValue: number) => {
    if (!user || !wallet) return

    setIsLoading(true)
    try {
      // Mark investment as withdrawn
      const { error: updateError } = await supabase
        .from('investments')
        .update({ status: 'withdrawn' })
        .eq('id', investmentId)

      if (updateError) throw updateError

      // Update wallet balance (add withdrawal)
      await supabase
        .from('wallets')
        .update({ 
          balance: wallet.balance + currentValue,
          updated_at: new Date().toISOString()
        })
        .eq('algorand_address', wallet.address)

      toast.success(`Successfully withdrew ${currentValue.toFixed(4)} ALGO!`)
      loadInvestments()
      
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
    { apy: 5.5, name: 'Conservative', risk: 'Low Risk', description: 'Stable returns with minimal volatility' },
    { apy: 8.5, name: 'Balanced', risk: 'Medium Risk', description: 'Good balance of risk and returns' },
    { apy: 12.0, name: 'Growth', risk: 'High Risk', description: 'Higher potential returns with increased risk' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Investment Portfolio</h1>
        <p className="text-muted-foreground">Grow your wealth with automated investing</p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInvested.toFixed(4)} ALGO</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCurrentValue.toFixed(4)} ALGO</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gains</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalGains >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {totalGains >= 0 ? '+' : ''}{totalGains.toFixed(4)} ALGO
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* New Investment */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Start Investing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Investment Amount (ALGO)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  Available: {wallet?.balance?.toFixed(4) || '0'} ALGO
                </p>
              </div>

              <div className="space-y-4">
                <Label>Investment Strategy</Label>
                {investmentOptions.map((option) => (
                  <div
                    key={option.apy}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedAPY === option.apy
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground/50'
                    }`}
                    onClick={() => setSelectedAPY(option.apy)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{option.name}</div>
                        <div className="text-sm text-muted-foreground">{option.risk}</div>
                        <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-500">{option.apy}%</div>
                        <div className="text-xs text-muted-foreground">APY</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {investAmount && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Projected Returns</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Investment:</span>
                      <span>{investAmount} ALGO</span>
                    </div>
                    <div className="flex justify-between">
                      <span>APY:</span>
                      <span>{selectedAPY}%</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>1 Year Value:</span>
                      <span className="text-green-500">
                        {calculateProjectedReturn(parseFloat(investAmount) || 0, selectedAPY).toFixed(4)} ALGO
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleInvest}
                disabled={isLoading || !investAmount || parseFloat(investAmount) <= 0}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <TrendingUp className="mr-2 h-4 w-4" />
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
          <Card>
            <CardHeader>
              <CardTitle>Active Investments</CardTitle>
            </CardHeader>
            <CardContent>
              {investments.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No Active Investments</h3>
                  <p className="text-sm text-muted-foreground">Start your first investment to begin earning returns</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {investments.map((investment) => {
                    const currentValue = calculateCurrentValue(investment)
                    const gains = currentValue - investment.amount_invested
                    const gainsPercentage = (gains / investment.amount_invested) * 100
                    const daysSinceStart = Math.floor(
                      (Date.now() - new Date(investment.start_date).getTime()) / (1000 * 60 * 60 * 24)
                    )
                    const progress = Math.min((daysSinceStart / 365) * 100, 100)

                    return (
                      <div key={investment.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">{investment.amount_invested.toFixed(4)} ALGO</div>
                            <div className="text-sm text-muted-foreground">
                              {investment.apy_rate}% APY • {daysSinceStart} days
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{currentValue.toFixed(4)} ALGO</div>
                            <div className={`text-sm ${gains >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {gains >= 0 ? '+' : ''}{gains.toFixed(4)} ({gainsPercentage.toFixed(2)}%)
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{progress.toFixed(1)}% of year</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWithdraw(investment.id, currentValue)}
                          disabled={isLoading}
                          className="w-full"
                        >
                          Withdraw Investment
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}