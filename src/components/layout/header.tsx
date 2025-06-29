import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Menu, LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useWalletStore } from '@/stores/walletStore'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, profile, signOut } = useAuthStore()
  const { wallet } = useWalletStore()

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
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

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm">
          <Bell className="h-5 w-5" />
        </Button>

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
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}