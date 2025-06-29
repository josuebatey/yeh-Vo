import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      <div className="p-4 md:p-6 space-y-6">
        <BackButton />
        <h1 className="text-2xl md:text-3xl font-bold">Transaction History</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <BackButton />
        <h1 className="text-2xl md:text-3xl font-bold">Transaction History</h1>
        <p className="text-muted-foreground">View all your payment transactions</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by address or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterChannel} onValueChange={setFilterChannel}>
              <SelectTrigger className="w-full lg:w-40">
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
              <SelectTrigger className="w-full lg:w-32">
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
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="h-16 w-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Filter className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No transactions found</h3>
                <p className="text-muted-foreground">
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
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className={`p-2 rounded-full flex-shrink-0 ${
                        tx.type === 'send' 
                          ? 'bg-red-500/10 text-red-500' 
                          : 'bg-green-500/10 text-green-500'
                      }`}>
                        {tx.type === 'send' ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="font-semibold">
                            {tx.type === 'send' ? 'Sent' : 'Received'}
                          </span>
                          <Badge variant="outline" className={getStatusColor(tx.status)}>
                            {tx.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
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
                      <div className="text-lg font-semibold">
                        {tx.type === 'send' ? '-' : '+'}
                        {tx.amount.toFixed(4)} {tx.currency}
                      </div>
                      {tx.algorand_tx_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openInExplorer(tx.algorand_tx_id!)}
                          className="mt-1"
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
  )
}