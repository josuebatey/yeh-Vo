import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { voiceService } from '@/services/voiceService'

interface VoiceCommandButtonProps {
  onCommand: (transcript: string) => void
  className?: string
}

export function VoiceCommandButton({ onCommand, className }: VoiceCommandButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported] = useState(() => voiceService.isSupported())

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

  if (!isSupported) {
    return null
  }

  return (
    <Button
      onClick={handleVoiceCommand}
      variant={isListening ? "default" : "outline"}
      size="sm"
      className={`relative overflow-hidden transition-all duration-200 ${
        isListening 
          ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' 
          : 'hover:bg-accent'
      } ${className}`}
      disabled={!isSupported}
    >
      <AnimatePresence mode="wait">
        {isListening ? (
          <motion.div
            key="listening"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex items-center space-x-2"
          >
            <MicOff className="h-4 w-4 animate-pulse" />
            {/* Hide text on mobile, show on desktop */}
            <span className="hidden sm:inline">Listening...</span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex items-center space-x-2"
          >
            <Mic className="h-4 w-4" />
            {/* Hide text on mobile, show on desktop */}
            <span className="hidden sm:inline">Voice Command</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulse animation when listening */}
      {isListening && (
        <motion.div
          className="absolute inset-0 bg-red-400 rounded-md"
          initial={{ scale: 1, opacity: 0.3 }}
          animate={{ scale: 1.05, opacity: 0 }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </Button>
  )
}