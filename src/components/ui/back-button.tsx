import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  className?: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg'
}

export function BackButton({ 
  className, 
  variant = 'ghost', 
  size = 'sm' 
}: BackButtonProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBack}
      className={cn(
        "flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors",
        "h-8 px-2 rounded-full", // Consistent circular styling
        "bg-muted/50 hover:bg-muted dark:bg-muted/30 dark:hover:bg-muted/50", // Consistent background
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="hidden sm:inline text-sm">Back</span>
    </Button>
  )
}