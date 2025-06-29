import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { voiceService } from '@/services/voiceService'

interface VoiceCommandButtonProps {
  onCommand: (transcript: string) => void
  disabled?: boolean
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'secondary'
}

export function VoiceCommandButton({ 
  onCommand, 
  disabled = false, 
  size = 'default',
  variant = 'default'
}: VoiceCommandButtonProps) {
  const [isListening, setIsListening] = useState(false)

  const handleVoiceCommand = async () => {
    if (!voiceService.isSupported()) {
      toast.error('Voice commands are not supported in your browser')
      return
    }

    try {
      setIsListening(true)
      const transcript = await voiceService.startListening()
      
      if (transcript.trim()) {
        onCommand(transcript)
        toast.success(`Voice command: "${transcript}"`)
      } else {
        toast.error('No speech detected. Please try again.')
      }
    } catch (error: any) {
      console.error('Voice command failed:', error)
      toast.error(error.message || 'Voice command failed')
    } finally {
      setIsListening(false)
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        onClick={handleVoiceCommand}
        disabled={disabled || isListening}
        size={size}
        variant={variant}
        className={`relative ${isListening ? 'animate-pulse' : ''}`}
      >
        {isListening ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Mic className={`h-4 w-4 mr-2 ${isListening ? 'text-red-500' : ''}`} />
        )}
        {isListening ? 'Listening...' : 'Voice Command'}
        
        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-md border-2 border-red-500"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </Button>
    </motion.div>
  )
}