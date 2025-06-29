import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Send, 
  QrCode, 
  History, 
  TrendingUp, 
  Settings,
  Wallet,
  Mic,
  Bot
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Send Payment', href: '/send', icon: Send },
  { name: 'Receive', href: '/receive', icon: QrCode },
  { name: 'History', href: '/history', icon: History },
  { name: 'Invest', href: '/invest', icon: TrendingUp },
  { name: 'Wallet', href: '/wallet', icon: Wallet },
  { name: 'Voice Commands', href: '/voice', icon: Mic },
  { name: 'AI Assistant', href: '/assistant', icon: Bot },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      <div className="flex h-16 items-center px-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2"
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600" />
          <span className="text-xl font-bold">VoicePay</span>
        </motion.div>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      <div className="p-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Built on <span className="font-semibold">Bolt</span>
        </p>
      </div>
    </div>
  )
}