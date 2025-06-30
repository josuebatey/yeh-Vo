import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Bell, Shield, CreditCard, LogOut, Upload, Download, FileText, Phone, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { BackButton } from '@/components/ui/back-button'
import { paymentService } from '@/services/paymentService'
import { PhoneVerificationDialog } from '@/components/ui/phone-verification-dialog'
import { BankLinkingDialog } from '@/components/ui/bank-linking-dialog'

export function Settings() {
  const { user, profile, refreshUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPhoneDialog, setShowPhoneDialog] = useState(false)
  const [showBankDialog, setShowBankDialog] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || '',
    avatar_url: profile?.avatar_url || '',
    phone_number: profile?.phone_number || '',
    phone_verified: profile?.phone_verified || false,
    bank_account_info: profile?.bank_account_info || null,
  })
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    voice_feedback: true,
    transaction_alerts: true,
  })
  const [securitySettings, setSecuritySettings] = useState({
    two_factor_auth: false,
    biometric_auth: false,
    auto_lock: true,
  })

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || '',
        phone_number: profile.phone_number || '',
        phone_verified: profile.phone_verified || false,
        bank_account_info: profile.bank_account_info || null,
      })
    }
  }, [profile])

  const handleUpdateProfile = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url,
        })
        .eq('id', user?.id)

      if (error) throw error

      await refreshUser()
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true)
      
      // In a real app, you'd upload to Supabase Storage
      // For demo, we'll use a placeholder URL
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setProfileData(prev => ({ ...prev, avatar_url: result }))
        toast.success('Profile picture updated!')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error('Failed to upload profile picture')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneVerified = async () => {
    await refreshUser()
    setProfileData(prev => ({ ...prev, phone_verified: true }))
  }

  const handleBankLinked = async () => {
    await refreshUser()
    toast.success('Bank account linked successfully!')
  }

  const handleExportData = async () => {
    try {
      setIsLoading(true)
      
      // Get user data
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)

      const { data: investments } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user?.id)

      const { data: wallet } = await supabase
        .from('wallets')
        .select('algorand_address, balance, created_at')
        .eq('user_id', user?.id)

      const exportData = {
        profile: profile,
        transactions: transactions || [],
        investments: investments || [],
        wallet: wallet?.[0] || null,
        exported_at: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `yehvo-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Data exported successfully!')
    } catch (error) {
      toast.error('Failed to export data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadTransactions = async () => {
    try {
      setIsLoading(true)
      
      const transactions = await paymentService.getTransactionHistory(user?.id || '', 1000)
      
      const csvContent = [
        'Date,Type,Amount,Currency,Channel,Status,To/From Address,Transaction ID',
        ...transactions.map(tx => [
          new Date(tx.created_at).toLocaleDateString(),
          tx.type,
          tx.amount,
          tx.currency,
          tx.channel,
          tx.status,
          tx.to_address || tx.from_address || '',
          tx.algorand_tx_id || ''
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `yehvo-transactions-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Transactions downloaded successfully!')
    } catch (error) {
      toast.error('Failed to download transactions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const { signOut } = useAuthStore.getState()
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const upgradeToProPLAN = () => {
    toast.info('Pro upgrade coming soon with RevenueCat integration!')
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
                Settings
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage your account and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-xl font-semibold">
                  <User className="h-6 w-6" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileData.avatar_url} />
                    <AvatarFallback className="text-xl">
                      {profileData.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-3 text-center sm:text-left">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <Button variant="outline" size="sm" asChild className="border-slate-300 dark:border-slate-600">
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        Change Photo
                      </label>
                    </Button>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      JPG, GIF or PNG. 1MB max.
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label htmlFor="full-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</Label>
                    <Input
                      id="full-name"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter your full name"
                      className="h-12 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                {/* Phone Verification */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      value={profileData.phone_number || 'Not verified'}
                      disabled
                      className="flex-1 h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                    {profileData.phone_verified ? (
                      <Badge variant="default" className="bg-green-500 text-white">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Button 
                        onClick={() => setShowPhoneDialog(true)}
                        variant="outline"
                        size="sm"
                        className="border-slate-300 dark:border-slate-600"
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        Verify Phone
                      </Button>
                    )}
                  </div>
                </div>

                {/* Bank Account */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bank Account</Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      value={profileData.bank_account_info ? 'Bank account linked' : 'Not linked'}
                      disabled
                      className="flex-1 h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                    {profileData.bank_account_info ? (
                      <Badge variant="default" className="bg-green-500 text-white">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Linked
                      </Badge>
                    ) : (
                      <Button 
                        onClick={() => setShowBankDialog(true)}
                        variant="outline"
                        size="sm"
                        className="border-slate-300 dark:border-slate-600"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Link Bank
                      </Button>
                    )}
                  </div>
                </div>

                <Button onClick={handleUpdateProfile} disabled={isLoading} className="h-12">
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-xl font-semibold">
                  <CreditCard className="h-6 w-6" />
                  <span>Account Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <Badge variant="secondary" className="mb-3 text-sm">
                    Free Plan
                  </Badge>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    10 ALGO/day sending limit
                  </div>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Daily Limit:</span>
                    <span className="font-medium">10 ALGO</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Used Today:</span>
                    <span className="font-medium">0 ALGO</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Phone Verified:</span>
                    <span>{profileData.phone_verified ? '✅' : '❌'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Bank Linked:</span>
                    <span>{profileData.bank_account_info ? '✅' : '❌'}</span>
                  </div>
                </div>

                <Button onClick={upgradeToProPLAN} className="w-full h-12">
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-xl font-semibold">
                <Bell className="h-6 w-6" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800 dark:text-slate-200">Email Notifications</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Receive transaction updates via email
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.email_notifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, email_notifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800 dark:text-slate-200">Push Notifications</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Get instant payment alerts
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.push_notifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, push_notifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800 dark:text-slate-200">Voice Feedback</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Hear spoken confirmations
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.voice_feedback}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, voice_feedback: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800 dark:text-slate-200">Transaction Alerts</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Notifications for all transactions
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.transaction_alerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, transaction_alerts: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-xl font-semibold">
                <Shield className="h-6 w-6" />
                <span>Security & Privacy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800 dark:text-slate-200">Two-Factor Authentication</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Add an extra layer of security
                    </div>
                  </div>
                  <Switch
                    checked={securitySettings.two_factor_auth}
                    onCheckedChange={(checked) => 
                      setSecuritySettings(prev => ({ ...prev, two_factor_auth: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800 dark:text-slate-200">Biometric Authentication</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Use fingerprint or face unlock
                    </div>
                  </div>
                  <Switch
                    checked={securitySettings.biometric_auth}
                    onCheckedChange={(checked) => 
                      setSecuritySettings(prev => ({ ...prev, biometric_auth: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800 dark:text-slate-200">Auto-Lock</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Lock app when inactive
                    </div>
                  </div>
                  <Switch
                    checked={securitySettings.auto_lock}
                    onCheckedChange={(checked) => 
                      setSecuritySettings(prev => ({ ...prev, auto_lock: checked }))
                    }
                  />
                </div>

                <div className="space-y-3">
                  <Button variant="outline" className="w-full h-12 border-slate-300 dark:border-slate-600">
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 border-slate-300 dark:border-slate-600"
                  onClick={handleExportData}
                  disabled={isLoading}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Export Data
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 border-slate-300 dark:border-slate-600"
                  onClick={handleDownloadTransactions}
                  disabled={isLoading}
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Download Transactions
                </Button>
                <Button variant="destructive" onClick={handleSignOut} className="flex-1 h-12">
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign Out
                </Button>
              </div>
              
              <Separator />
              
              <div className="text-center">
                <Button variant="ghost" className="text-destructive hover:text-destructive">
                  Delete Account
                </Button>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  This action cannot be undone
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dialogs */}
        <PhoneVerificationDialog
          open={showPhoneDialog}
          onOpenChange={setShowPhoneDialog}
          onVerified={handlePhoneVerified}
        />

        <BankLinkingDialog
          open={showBankDialog}
          onOpenChange={setShowBankDialog}
          onLinked={handleBankLinked}
        />
      </div>
    </div>
  )
}