import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { voiceService } from '@/services/voiceService'
import { cn } from '@/lib/utils'

interface VoiceCommandButtonProps {
  onCommand: (transcript: string) => void
  className?: string
  size?: 'sm' | 'default' | 'lg'
}

export function VoiceCommandButton({ 
  onCommand, 
  className,
  size = 'default'
}: VoiceCommandButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported] = useState(voiceService.isSupported())

  const handleVoiceCommand = async () => {
    if (!isSupported) {
      toast.error('Voice commands are not supported in your browser')
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    try {
      setIsListening(true)
      const transcript = await voiceService.startListening()
      
      if (transcript) {
        onCommand(transcript)
        toast.success(`Voice command received: "${transcript}"`)
      }
    } catch (error: any) {
      console.error('Voice command failed:', error)
      toast.error(error.message || 'Voice command failed')
    } finally {
      setIsListening(false)
    }
  }

  if (!isSupported) {
    return null
  }

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
      onClick={handleVoiceCommand}
      disabled={!isSupported}
      className={cn(
        // Circular design with consistent styling
        "rounded-full flex items-center justify-center transition-all duration-200",
        sizeClasses[size],
        // Consistent background and colors for light/dark mode
        isListening 
          ? "bg-red-500 hover:bg-red-600 text-white shadow-lg animate-pulse" 
          : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg",
        // Mobile-specific adjustments
        "md:gap-2 md:px-4 md:w-auto md:rounded-lg", // Desktop: pill shape with text
        className
      )}
      title={isListening ? "Stop listening" : "Start voice command"}
    >
      <AnimatePresence mode="wait">
        {isListening ? (
          <motion.div
            key="listening"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MicOff className={iconSizes[size]} />
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Mic className={iconSizes[size]} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Text only visible on desktop */}
      <AnimatePresence>
        <span className="hidden md:inline-block text-sm font-medium ml-1">
          {isListening ? 'Listening...' : 'Voice Command'}
        </span>
      </AnimatePresence>
    </Button>
  )
}