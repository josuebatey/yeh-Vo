import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Settings as SettingsIcon, User, Bell, Shield, CreditCard, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

export function Settings() {
  const { user, profile, signOut } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || '',
    avatar_url: profile?.avatar_url || '',
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

  const handleUpdateProfile = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user?.id)

      if (error) throw error

      toast.success('Profile updated successfully!')
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileData.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {profileData.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    Change Photo
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    JPG, GIF or PNG. 1MB max.
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <Button onClick={handleUpdateProfile} disabled={isLoading}>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Account Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge variant="secondary" className="mb-2">
                  Free Plan
                </Badge>
                <div className="text-sm text-muted-foreground">
                  $10/day sending limit
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Daily Limit:</span>
                  <span>$10.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Used Today:</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Investments:</span>
                  <span>Basic</span>
                </div>
              </div>

              <Button onClick={upgradeToProPLAN} className="w-full">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email Notifications</div>
                  <div className="text-sm text-muted-foreground">
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
                  <div className="font-medium">Push Notifications</div>
                  <div className="text-sm text-muted-foreground">
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
                  <div className="font-medium">Voice Feedback</div>
                  <div className="text-sm text-muted-foreground">
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
                  <div className="font-medium">Transaction Alerts</div>
                  <div className="text-sm text-muted-foreground">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security & Privacy</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Two-Factor Authentication</div>
                  <div className="text-sm text-muted-foreground">
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
                  <div className="font-medium">Biometric Authentication</div>
                  <div className="text-sm text-muted-foreground">
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
                  <div className="font-medium">Auto-Lock</div>
                  <div className="text-sm text-muted-foreground">
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

              <div className="space-y-2">
                <Button variant="outline" className="w-full">
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
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1">
                Export Data
              </Button>
              <Button variant="outline" className="flex-1">
                Download Transactions
              </Button>
              <Button variant="destructive" onClick={handleSignOut} className="flex-1">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
            
            <Separator />
            
            <div className="text-center">
              <Button variant="ghost" className="text-destructive">
                Delete Account
              </Button>
              <div className="text-xs text-muted-foreground mt-1">
                This action cannot be undone
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}