import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { voiceService } from '@/services/voiceService'

interface VoiceCommandButtonProps {
  onCommand: (transcript: string) => void
  className?: string
}

export function VoiceCommandButton({ onCommand, className }: VoiceCommandButtonProps) {
  const [isListening, setIsListening] = useState(false)

  const handleVoiceCommand = async () => {
    if (!voiceService.isSupported()) {
      toast.error('Voice commands are not supported in your browser')
      return
    }

    try {
      setIsListening(true)
      const transcript = await voiceService.startListening()
      onCommand(transcript)
      toast.success(`Voice command received: "${transcript}"`)
    } catch (error) {
      console.error('Voice command failed:', error)
      toast.error('Voice command failed. Please try again.')
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
        disabled={isListening}
        className={className}
        variant={isListening ? "destructive" : "default"}
      >
        {isListening ? (
          <>
            <MicOff className="mr-2 h-4 w-4 animate-pulse" />
            Listening...
          </>
        ) : (
          <>
            <Mic className="mr-2 h-4 w-4" />
            Voice Command
          </>
        )}
      </Button>
    </motion.div>
  )
}