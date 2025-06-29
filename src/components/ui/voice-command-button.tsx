import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { voiceService } from '@/services/voiceService'

interface VoiceCommandButtonProps {
  onCommand: (transcript: string) => void
  disabled?: boolean
}

export function VoiceCommandButton({ onCommand, disabled = false }: VoiceCommandButtonProps) {
  const [isListening, setIsListening] = useState(false)

  const handleVoiceCommand = async () => {
    if (!voiceService.isSupported()) {
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
      
      if (transcript.trim()) {
        onCommand(transcript)
        toast.success(`Voice command: "${transcript}"`)
      } else {
        toast.error('No voice input detected')
      }
    } catch (error) {
      console.error('Voice command failed:', error)
      toast.error('Voice command failed')
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
        disabled={disabled}
        variant={isListening ? "destructive" : "default"}
        size="sm"
        className={`relative ${isListening ? 'animate-pulse' : ''}`}
      >
        {isListening ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
        <span className="ml-2">
          {isListening ? 'Stop' : 'Voice'}
        </span>
        
        {isListening && (
          <motion.div
            className="absolute -inset-1 rounded-md bg-red-500/20"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        )}
      </Button>
    </motion.div>
  )
}