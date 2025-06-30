import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Bell, Menu, LogOut, User } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useWalletStore } from '@/stores/walletStore'
import { LanguageSelector } from '@/components/ui/language-selector'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useTranslation } from 'react-i18next'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { t } = useTranslation()
  const { user, profile, signOut } = useAuthStore()
  const { wallet } = useWalletStore()

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6 flex-shrink-0">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onMenuClick} className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        
        {wallet && (
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Balance: </span>
              <span className="font-semibold">{wallet.balance.toFixed(4)} ALGO</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Language Selector with circular background */}
        <div className="p-1 rounded-full bg-muted/50 hover:bg-muted transition-colors">
          <LanguageSelector />
        </div>
        
        {/* Theme Toggle with circular background */}
        <div className="p-1 rounded-full bg-muted/50 hover:bg-muted transition-colors">
          <ThemeToggle />
        </div>
        
        {/* Notification Bell with circular background */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 rounded-full bg-muted/50 hover:bg-muted transition-colors p-0"
        >
          <Bell className="h-4 w-4" />
        </Button>

        {/* Profile Dropdown with Name and Email */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>
                  {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('common.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}