import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, RefreshCw, ExternalLink, Eye, EyeOff, Wallet as WalletIcon, Send, QrCode, History } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useWalletStore } from '@/stores/walletStore'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { BackButton } from '@/components/ui/back-button'
import { useNavigate } from 'react-router-dom'
import { algorandService } from '@/services/algorandService'

export function WalletPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { wallet, refreshBalance, fundWallet } = useWalletStore()
  const [showMnemonic, setShowMnemonic] = useState(false)
  const [mnemonic, setMnemonic] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isFunding, setIsFunding] = useState(false)

  const copyAddress = async () => {
    if (!wallet?.address) return
    
    try {
      await navigator.clipboard.writeText(wallet.address)
      toast.success('Address copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy address')
    }
  }

  const copyMnemonic = async () => {
    if (!mnemonic) return
    
    try {
      await navigator.clipboard.writeText(mnemonic)
      toast.success('Recovery phrase copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy recovery phrase')
    }
  }

  const handleRefreshBalance = async () => {
    setIsRefreshing(true)
    try {
      await refreshBalance()
      toast.success('Balance refreshed!')
    } catch (error) {
      toast.error('Failed to refresh balance')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleFundWallet = async () => {
    setIsFunding(true)
    try {
      await fundWallet()
      toast.success('Funding request sent! Wait a few moments and refresh.')
    } catch (error) {
      toast.error('Failed to fund wallet')
    } finally {
      setIsFunding(false)
    }
  }

  const loadMnemonic = async () => {
    if (!user || mnemonic) return

    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('encrypted_mnemonic')
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      // In production, use proper decryption
      const decryptedMnemonic = atob(data.encrypted_mnemonic)
      setMnemonic(decryptedMnemonic)
    } catch (error) {
      console.error('Failed to load mnemonic:', error)
      toast.error('Failed to load recovery phrase')
    }
  }

  const openInExplorer = () => {
    if (!wallet?.address) return
    window.open(`https://testnet.algoexplorer.io/address/${wallet.address}`, '_blank')
  }

  const handleShowMnemonic = () => {
    if (!showMnemonic) {
      loadMnemonic()
    }
    setShowMnemonic(!showMnemonic)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header Section - Fixed */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <BackButton />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Wallet Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage your Algorand wallet and view transaction details
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Wallet Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-xl font-semibold">
                <WalletIcon className="h-6 w-6" />
                <span>Your Algorand Wallet</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {wallet?.balance?.toFixed(4) || '0.0000'} ALGO
                </div>
                <div className="text-xl text-slate-600 dark:text-slate-400 mb-3">
                  ${algorandService.convertAlgoToUSD(wallet?.balance || 0)} USD
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  TestNet
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button onClick={handleRefreshBalance} disabled={isRefreshing} variant="outline" size="sm" className="h-10 border-slate-300 dark:border-slate-600">
                  <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button onClick={handleFundWallet} disabled={isFunding} size="sm" className="h-10">
                  {isFunding ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <WalletIcon className="mr-2 h-4 w-4" />
                  )}
                  Fund from TestNet
                </Button>
                <Button onClick={openInExplorer} variant="outline" size="sm" className="h-10 border-slate-300 dark:border-slate-600">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Explorer
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Address Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Wallet Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Public Address</div>
                  <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl font-mono text-sm break-all border border-slate-200 dark:border-slate-600">
                    {wallet?.address || 'Loading...'}
                  </div>
                  <Button onClick={copyAddress} variant="outline" size="sm" className="w-full h-10 border-slate-300 dark:border-slate-600">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Address
                  </Button>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Network Information</div>
                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex justify-between">
                        <span>Network:</span>
                        <span className="font-medium">Algorand TestNet</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Protocol:</span>
                        <span className="font-medium">Algorand</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Address Type:</span>
                        <span className="font-medium">Standard</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Security & Recovery */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Security & Recovery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Recovery Phrase</div>
                    <Button
                      onClick={handleShowMnemonic}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      {showMnemonic ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {showMnemonic ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <div className="text-sm text-red-500 font-medium mb-3">
                          ⚠️ Keep this phrase secure and private!
                        </div>
                        <div className="font-mono text-sm break-all bg-white dark:bg-slate-800 p-3 rounded-lg border border-red-500/20">
                          {mnemonic || 'Loading...'}
                        </div>
                      </div>
                      <Button onClick={copyMnemonic} variant="outline" size="sm" className="w-full h-10 border-slate-300 dark:border-slate-600">
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Recovery Phrase
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                      Click the eye icon to reveal your recovery phrase
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Security Tips</div>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <li>• Never share your recovery phrase</li>
                      <li>• Store it in a secure location</li>
                      <li>• This is a TestNet wallet for demo purposes</li>
                      <li>• Don't use real funds on TestNet</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Wallet Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <Button 
                  variant="outline" 
                  className="h-24 flex-col space-y-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                  onClick={() => navigate('/send')}
                >
                  <Send className="h-6 w-6" />
                  <span className="text-sm">Send Payment</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col space-y-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                  onClick={() => navigate('/receive')}
                >
                  <QrCode className="h-6 w-6" />
                  <span className="text-sm">Receive Payment</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col space-y-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                  onClick={() => navigate('/history')}
                >
                  <History className="h-6 w-6" />
                  <span className="text-sm">Transaction History</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col space-y-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                  onClick={openInExplorer}
                >
                  <ExternalLink className="h-6 w-6" />
                  <span className="text-sm">Block Explorer</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}