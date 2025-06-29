import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [isSupported, setIsSupported] = useState(true)

  const handleVoiceCommand = async () => {
    // Check if voice is supported
    if (!voiceService.isSupported()) {
      setIsSupported(false)
      toast.error('Voice commands are not supported on this device/browser')
      return
    }

    // Check microphone permission on mobile
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      try {
        const hasPermission = await voiceService.testMicrophone()
        if (!hasPermission) {
          toast.error('Microphone permission required. Please allow microphone access in your browser settings.')
          return
        }
      } catch (error) {
        toast.error('Unable to access microphone. Please check your device settings.')
        return
      }
    }

    setIsListening(true)
    
    try {
      // Add a small delay to ensure UI updates
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const transcript = await voiceService.startListening()
      
      if (transcript && transcript.trim()) {
        onCommand(transcript)
        toast.success(`Voice command: "${transcript}"`)
      } else {
        toast.error('No speech detected. Please try again.')
      }
    } catch (error: any) {
      console.error('Voice command error:', error)
      
      // Provide specific error messages
      let errorMessage = 'Voice command failed'
      if (error.message.includes('not-allowed')) {
        errorMessage = 'Microphone permission denied. Please allow microphone access.'
      } else if (error.message.includes('no-speech')) {
        errorMessage = 'No speech detected. Please speak clearly and try again.'
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection.'
      } else if (error.message.includes('audio-capture')) {
        errorMessage = 'Microphone not accessible. Please check your device settings.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setIsListening(false)
    }
  }

  if (!isSupported) {
    return (
      <Button 
        variant="outline" 
        size={size}
        disabled
        className="opacity-50"
      >
        <MicOff className="h-4 w-4 mr-2" />
        Voice Not Supported
      </Button>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isListening ? 'listening' : 'idle'}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          onClick={handleVoiceCommand}
          disabled={disabled || isListening}
          variant={isListening ? 'destructive' : variant}
          size={size}
          className={`relative ${isListening ? 'animate-pulse' : ''}`}
        >
          {isListening ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Listening...
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Voice Command
            </>
          )}
          
          {isListening && (
            <motion.div
              className="absolute inset-0 rounded-md bg-red-500/20"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </Button>
      </motion.div>
    </AnimatePresence>
  )
}