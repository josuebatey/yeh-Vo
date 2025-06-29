import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Volume2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { voiceService } from '@/services/voiceService'

interface VoiceCommandButtonProps {
  onCommand: (transcript: string) => void
  className?: string
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
}

export function VoiceCommandButton({ 
  onCommand, 
  className = '',
  size = 'default',
  variant = 'default'
}: VoiceCommandButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if voice recognition is supported
    setIsSupported(voiceService.isSupported())
    
    // Check microphone permission on mobile
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then(permission => {
          setHasPermission(permission.state === 'granted')
          
          permission.addEventListener('change', () => {
            setHasPermission(permission.state === 'granted')
          })
        })
        .catch(() => {
          // Permissions API not supported, test directly
          voiceService.testMicrophone().then(setHasPermission)
        })
    } else {
      // Fallback for browsers without Permissions API
      voiceService.testMicrophone().then(setHasPermission)
    }
  }, [])

  const handleVoiceCommand = async () => {
    if (!isSupported) {
      toast.error('Voice commands are not supported in this browser')
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    try {
      setIsListening(true)
      
      // Test microphone access first
      const micAccess = await voiceService.testMicrophone()
      if (!micAccess) {
        throw new Error('Microphone access denied. Please allow microphone permissions in your browser settings.')
      }

      // Show listening feedback
      toast.info('🎤 Listening... Speak your command now', {
        duration: 3000,
        id: 'voice-listening'
      })

      const transcript = await voiceService.startListening()
      
      // Dismiss listening toast
      toast.dismiss('voice-listening')
      
      if (transcript.trim()) {
        toast.success(`Voice command received: "${transcript}"`)
        onCommand(transcript)
      } else {
        toast.error('No speech detected. Please try again.')
      }
    } catch (error: any) {
      console.error('Voice command failed:', error)
      
      // Dismiss listening toast
      toast.dismiss('voice-listening')
      
      // Show specific error messages
      let errorMessage = error.message || 'Voice command failed'
      
      if (error.message.includes('not-allowed') || error.message.includes('permission')) {
        errorMessage = 'Microphone permission required. Please allow microphone access and try again.'
        setHasPermission(false)
      } else if (error.message.includes('no-speech')) {
        errorMessage = 'No speech detected. Please speak clearly and try again.'
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      }
      
      toast.error(errorMessage, { duration: 5000 })
    } finally {
      setIsListening(false)
    }
  }

  const testVoice = async () => {
    try {
      await voiceService.speak('Voice test successful! VoicePay is ready to listen to your commands.')
      toast.success('Voice test completed!')
    } catch (error) {
      toast.error('Voice test failed. Please check your audio settings.')
    }
  }

  if (!isSupported) {
    return (
      <Button 
        variant="outline" 
        size={size}
        className={className}
        disabled
        title="Voice commands not supported in this browser"
      >
        <MicOff className="h-4 w-4 mr-2" />
        Voice Not Supported
      </Button>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <AnimatePresence>
        <motion.div
          initial={{ scale: 1 }}
          animate={{ 
            scale: isListening ? [1, 1.1, 1] : 1,
            transition: { 
              repeat: isListening ? Infinity : 0,
              duration: 1
            }
          }}
        >
          <Button
            onClick={handleVoiceCommand}
            variant={isListening ? 'destructive' : variant}
            size={size}
            className={`${className} ${isListening ? 'animate-pulse' : ''}`}
            disabled={hasPermission === false}
            title={
              hasPermission === false 
                ? 'Microphone permission required'
                : isListening 
                  ? 'Click to stop listening'
                  : 'Click to start voice command'
            }
          >
            {isListening ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Mic className="h-4 w-4 mr-2" />
                </motion.div>
                Listening...
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Voice Command
              </>
            )}
          </Button>
        </motion.div>
      </AnimatePresence>

      {/* Voice test button for troubleshooting */}
      <Button
        onClick={testVoice}
        variant="ghost"
        size="sm"
        className="hidden md:flex"
        title="Test voice output"
      >
        <Volume2 className="h-4 w-4" />
      </Button>
    </div>
  )
}