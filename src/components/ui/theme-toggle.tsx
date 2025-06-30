import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'default' | 'lg'
}

export function ThemeToggle({ className, size = 'sm' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const sizeClasses = {
    sm: 'h-8 w-8',
    default: 'h-10 w-10',
    lg: 'h-12 w-12'
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    default: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className={cn(
        "rounded-full transition-all duration-200",
        sizeClasses[size],
        "bg-muted/50 hover:bg-muted dark:bg-muted/30 dark:hover:bg-muted/50",
        "border border-border/50 hover:border-border",
        className
      )}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <Sun className={cn(
        iconSizes[size],
        "rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
      )} />
      <Moon className={cn(
        iconSizes[size],
        "absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
      )} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}