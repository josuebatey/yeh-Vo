import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  Home, 
  Send, 
  QrCode, 
  History, 
  TrendingUp, 
  Settings,
  Wallet,
  Mic,
  Bot,
  PanelLeftClose,
  PanelLeftOpen,
  Globe2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'dashboard', href: '/', icon: Home },
  { name: 'sendPayment', href: '/send', icon: Send },
  { name: 'receive', href: '/receive', icon: QrCode },
  { name: 'history', href: '/history', icon: History },
  { name: 'invest', href: '/invest', icon: TrendingUp },
  { name: 'wallet', href: '/wallet', icon: Wallet },
  { name: 'voiceCommands', href: '/voice', icon: Mic },
  { name: 'aiAssistant', href: '/assistant', icon: Bot },
  { name: 'settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const { t } = useTranslation()

  return (
    <div className={cn(
      "flex h-full flex-col bg-card border-r transition-all duration-200 flex-shrink-0",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className={cn(
        "flex h-16 items-center border-b flex-shrink-0",
        collapsed ? "justify-center px-2" : "justify-between px-6"
      )}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <Globe2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">yehVo</span>
          </motion.div>
        )}
        
        {collapsed && (
          <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
            <Globe2 className="h-5 w-5 text-white" />
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className={cn(
            "h-8 w-8 p-0 hidden md:flex",
            collapsed && "mx-auto mt-2"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
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
                  'group flex items-center text-sm font-medium rounded-md transition-colors',
                  collapsed ? 'justify-center p-2' : 'px-3 py-2',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
              title={collapsed ? t(`nav.${item.name}`) : undefined}
            >
              <item.icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
              {!collapsed && (
                <span className="truncate">{t(`nav.${item.name}`)}</span>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      <div className={cn(
        "p-4 border-t flex-shrink-0",
        collapsed && "px-2"
      )}>
        <p className={cn(
          "text-xs text-muted-foreground text-center",
          collapsed && "hidden"
        )}>
          Built with ❤️ on <span className="font-semibold text-purple-500">Bolt.new</span>
        </p>
      </div>
    </div>
  )
}