import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { voiceService } from '@/services/voiceService'

interface VoiceCommandButtonProps {
  onCommand: (transcript: string) => void
  disabled?: boolean
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
}

export function VoiceCommandButton({ 
  onCommand, 
  disabled = false, 
  size = 'default',
  variant = 'default'
}: VoiceCommandButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const listeningTimeoutRef = useRef<NodeJS.Timeout>()
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    setIsSupported(voiceService.isSupported())
    
    // Cleanup on unmount
    return () => {
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current)
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (error) {
          console.warn('Voice recognition cleanup warning:', error)
        }
        recognitionRef.current = null
      }
    }
  }, [])

  const handleVoiceCommand = async () => {
    if (!isSupported) {
      toast.error('Voice commands are not supported in your browser')
      return
    }

    if (isListening) {
      // Stop listening
      setIsListening(false)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (error) {
          console.warn('Failed to stop recognition:', error)
        }
        recognitionRef.current = null
      }
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current)
        listeningTimeoutRef.current = undefined
      }
      return
    }

    try {
      setIsListening(true)
      
      // Set a timeout to automatically stop listening
      listeningTimeoutRef.current = setTimeout(() => {
        setIsListening(false)
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop()
          } catch (error) {
            console.warn('Timeout stop recognition warning:', error)
          }
          recognitionRef.current = null
        }
        toast.info('Voice command timeout. Please try again.')
      }, 10000) // 10 second timeout

      const transcript = await voiceService.startListening()
      
      // Clear timeout since we got a result
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current)
        listeningTimeoutRef.current = undefined
      }
      
      setIsListening(false)
      recognitionRef.current = null
      
      if (transcript && transcript.trim()) {
        onCommand(transcript)
        toast.success(`Voice command received: "${transcript}"`)
      } else {
        toast.error('No voice command detected. Please try again.')
      }
    } catch (error: any) {
      setIsListening(false)
      recognitionRef.current = null
      
      // Clear timeout on error
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current)
        listeningTimeoutRef.current = undefined
      }
      
      console.error('Voice command failed:', error)
      
      // Show user-friendly error messages
      const errorMessage = error.message || 'Voice command failed'
      if (errorMessage.includes('not-allowed') || errorMessage.includes('permission')) {
        toast.error('Microphone permission denied. Please allow microphone access and try again.')
      } else if (errorMessage.includes('no-speech')) {
        toast.error('No speech detected. Please speak clearly and try again.')
      } else if (errorMessage.includes('network')) {
        toast.error('Network error. Please check your connection and try again.')
      } else {
        toast.error(errorMessage)
      }
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <div className="relative">
      <Button
        onClick={handleVoiceCommand}
        disabled={disabled}
        variant={variant}
        size={size}
        className={`relative ${isListening ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="listening"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center"
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Listening...</span>
              <span className="sm:hidden">🎤</span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center"
            >
              <Mic className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Voice Command</span>
              <span className="sm:hidden">Voice</span>
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Listening indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-2 h-2 bg-white rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}