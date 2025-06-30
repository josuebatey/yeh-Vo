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
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Wallet Management</h1>
          <p className="text-muted-foreground">Manage your Algorand wallet and view transaction details</p>
        </div>
      </div>

      {/* Wallet Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <WalletIcon className="h-6 w-6" />
              <span>Your Algorand Wallet</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {wallet?.balance?.toFixed(4) || '0.0000'} ALGO
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                TestNet
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-2">
              <Button onClick={handleRefreshBalance} disabled={isRefreshing} variant="outline" size="sm">
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleFundWallet} disabled={isFunding} size="sm">
                {isFunding ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <WalletIcon className="mr-2 h-4 w-4" />
                )}
                Fund from TestNet
              </Button>
              <Button onClick={openInExplorer} variant="outline" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Explorer
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Address Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Wallet Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Public Address</div>
                <div className="p-3 bg-muted rounded-lg font-mono text-xs md:text-sm break-all">
                  {wallet?.address || 'Loading...'}
                </div>
                <Button onClick={copyAddress} variant="outline" size="sm" className="w-full">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Address
                </Button>
              </div>

              <div className="pt-4 border-t">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Network Information</div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Network:</span>
                      <span>Algorand TestNet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Protocol:</span>
                      <span>Algorand</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Address Type:</span>
                      <span>Standard</span>
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
          <Card>
            <CardHeader>
              <CardTitle>Security & Recovery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Recovery Phrase</div>
                  <Button
                    onClick={handleShowMnemonic}
                    variant="ghost"
                    size="sm"
                  >
                    {showMnemonic ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {showMnemonic ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="text-sm text-red-500 font-medium mb-2">
                        ⚠️ Keep this phrase secure and private!
                      </div>
                      <div className="font-mono text-xs md:text-sm break-all">
                        {mnemonic || 'Loading...'}
                      </div>
                    </div>
                    <Button onClick={copyMnemonic} variant="outline" size="sm" className="w-full">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Recovery Phrase
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                    Click the eye icon to reveal your recovery phrase
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Security Tips</div>
                  <ul className="text-sm text-muted-foreground space-y-1">
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
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => navigate('/send')}
              >
                <Send className="h-6 w-6 mb-2" />
                <span className="text-xs md:text-sm">Send Payment</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => navigate('/receive')}
              >
                <QrCode className="h-6 w-6 mb-2" />
                <span className="text-xs md:text-sm">Receive Payment</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => navigate('/history')}
              >
                <History className="h-6 w-6 mb-2" />
                <span className="text-xs md:text-sm">Transaction History</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={openInExplorer}
              >
                <ExternalLink className="h-6 w-6 mb-2" />
                <span className="text-xs md:text-sm">Block Explorer</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}