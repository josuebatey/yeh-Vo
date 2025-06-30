import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowUpRight, ArrowDownRight, ExternalLink, Search, Filter } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { paymentService } from '@/services/paymentService'
import { algorandService } from '@/services/algorandService'
import { format } from 'date-fns'
import { BackButton } from '@/components/ui/back-button'

interface Transaction {
  id: string
  type: 'send' | 'receive'
  amount: number
  currency: string
  channel: 'algorand' | 'mobile_money' | 'bank'
  to_address?: string
  from_address?: string
  algorand_tx_id?: string
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  metadata?: any
}

export function TransactionHistory() {
  const { user } = useAuthStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterChannel, setFilterChannel] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    if (user) {
      loadTransactions()
    }
  }, [user])

  const loadTransactions = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      const data = await paymentService.getTransactionHistory(user.id)
      setTransactions(data)
    } catch (error) {
      console.error('Failed to load transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = !searchTerm || 
      tx.to_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.from_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.algorand_tx_id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesChannel = filterChannel === 'all' || tx.channel === filterChannel
    const matchesStatus = filterStatus === 'all' || tx.status === filterStatus
    
    return matchesSearch && matchesChannel && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20'
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const getChannelDisplay = (channel: string) => {
    switch (channel) {
      case 'algorand': return 'Algorand'
      case 'mobile_money': return 'Mobile Money'
      case 'bank': return 'Bank Transfer'
      default: return channel
    }
  }

  const openInExplorer = (txId: string) => {
    const url = algorandService.getExplorerUrl(txId)
    window.open(url, '_blank')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header Section - Fixed */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-4">
              <BackButton />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Transaction History
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  View all your payment transactions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
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
                Transaction History
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                View all your payment transactions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Filters */}
        <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <Input
                    placeholder="Search by address or transaction ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                </div>
              </div>
              <Select value={filterChannel} onValueChange={setFilterChannel}>
                <SelectTrigger className="w-full lg:w-40 h-12 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="algorand">Algorand</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full lg:w-32 h-12 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <div className="space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center">
                  <Filter className="h-10 w-10 text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">No transactions found</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {searchTerm || filterChannel !== 'all' || filterStatus !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Start by sending or receiving a payment'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl hover:shadow-2xl transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className={`p-3 rounded-xl flex-shrink-0 ${
                          tx.type === 'send' 
                            ? 'bg-red-500/10 text-red-500' 
                            : 'bg-green-500/10 text-green-500'
                        }`}>
                          {tx.type === 'send' ? (
                            <ArrowUpRight className="h-5 w-5" />
                          ) : (
                            <ArrowDownRight className="h-5 w-5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {tx.type === 'send' ? 'Sent' : 'Received'}
                            </span>
                            <Badge variant="outline" className={getStatusColor(tx.status)}>
                              {tx.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                            <div className="break-all">
                              {tx.type === 'send' ? 'To: ' : 'From: '}
                              <span className="font-mono">
                                {(tx.to_address || tx.from_address || 'Unknown')
                                  .slice(0, 20)}...
                              </span>
                            </div>
                            <div>
                              {format(new Date(tx.created_at), 'MMM dd, yyyy HH:mm')} • {getChannelDisplay(tx.channel)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-1">
                          {tx.type === 'send' ? '-' : '+'}
                          {tx.amount.toFixed(4)} {tx.currency}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                          ${algorandService.convertAlgoToUSD(tx.amount)} USD
                        </div>
                        {tx.algorand_tx_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openInExplorer(tx.algorand_tx_id!)}
                            className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Explorer
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}