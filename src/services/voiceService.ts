interface VoiceCommand {
  action: 'send' | 'balance' | 'history' | 'invest'
  amount?: number
  recipient?: string
  channel?: 'algorand' | 'mobile_money' | 'bank'
}

export const voiceService = {
  isSupported: (): boolean => {
    // Check for both standard and webkit speech recognition
    const hasSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    const hasSpeechSynthesis = 'speechSynthesis' in window
    
    return hasSpeechRecognition && hasSpeechSynthesis
  },

  speak: (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      // Cancel any ongoing speech
      speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      
      // Configure for better mobile support
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      
      // Try to use a more natural voice
      const voices = speechSynthesis.getVoices()
      if (voices.length > 0) {
        // Prefer English voices
        const englishVoice = voices.find(voice => 
          voice.lang.startsWith('en') && !voice.name.includes('Google')
        ) || voices[0]
        utterance.voice = englishVoice
      }

      utterance.onend = () => resolve()
      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error)
        reject(error)
      }
      
      // Ensure voices are loaded (important for mobile)
      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.addEventListener('voiceschanged', () => {
          speechSynthesis.speak(utterance)
        }, { once: true })
      } else {
        speechSynthesis.speak(utterance)
      }
    })
  },

  startListening: (): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Use the correct constructor for different browsers
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (!SpeechRecognition) {
        reject(new Error('Speech recognition not supported in this browser'))
        return
      }

      const recognition = new SpeechRecognition()
      
      // Configure for better mobile support
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 1
      
      // Mobile-specific settings
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        recognition.continuous = false // Important for mobile
        recognition.interimResults = false
      }

      let hasResult = false

      recognition.onstart = () => {
        console.log('Voice recognition started')
      }

      recognition.onresult = (event: any) => {
        if (hasResult) return // Prevent multiple results
        hasResult = true
        
        const transcript = event.results[0][0].transcript
        console.log('Voice recognition result:', transcript)
        recognition.stop()
        resolve(transcript)
      }

      recognition.onerror = (event: any) => {
        console.error('Voice recognition error:', event.error)
        recognition.stop()
        
        let errorMessage = 'Voice recognition failed'
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.'
            break
          case 'audio-capture':
            errorMessage = 'Microphone not accessible. Please check permissions.'
            break
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.'
            break
          case 'network':
            errorMessage = 'Network error. Please check your connection.'
            break
          case 'service-not-allowed':
            errorMessage = 'Speech service not available. Please try again later.'
            break
        }
        
        reject(new Error(errorMessage))
      }

      recognition.onend = () => {
        if (!hasResult) {
          reject(new Error('No speech detected. Please try again.'))
        }
      }

      try {
        recognition.start()
        
        // Auto-stop after 10 seconds to prevent hanging
        setTimeout(() => {
          if (!hasResult) {
            recognition.stop()
            reject(new Error('Voice recognition timeout. Please try again.'))
          }
        }, 10000)
        
      } catch (error) {
        reject(new Error('Failed to start voice recognition'))
      }
    })
  },

  parseVoiceCommand: (transcript: string): VoiceCommand | null => {
    const text = transcript.toLowerCase().trim()
    
    // Send payment patterns - more flexible matching
    const sendPatterns = [
      /send\s+(\d+(?:\.\d+)?)\s*(?:dollars?|algos?|usd)?\s+to\s+(.+?)(?:\s+(?:via|using)\s+(mobile money|bank|algorand))?$/i,
      /pay\s+(\d+(?:\.\d+)?)\s*(?:dollars?|algos?|usd)?\s+to\s+(.+?)(?:\s+(?:via|using)\s+(mobile money|bank|algorand))?$/i,
      /transfer\s+(\d+(?:\.\d+)?)\s*(?:dollars?|algos?|usd)?\s+to\s+(.+?)(?:\s+(?:via|using)\s+(mobile money|bank|algorand))?$/i
    ]
    
    for (const pattern of sendPatterns) {
      const sendMatch = text.match(pattern)
      if (sendMatch) {
        return {
          action: 'send',
          amount: parseFloat(sendMatch[1]),
          recipient: sendMatch[2].trim(),
          channel: sendMatch[3]?.replace(' ', '_') as any || 'algorand'
        }
      }
    }

    // Balance check patterns
    const balancePatterns = [
      /(?:check|show|what.?s)\s+(?:my\s+)?balance/i,
      /how\s+much\s+(?:do\s+i\s+have|money)/i,
      /what.?s\s+my\s+balance/i,
      /balance\s+check/i
    ]
    
    for (const pattern of balancePatterns) {
      if (pattern.test(text)) {
        return { action: 'balance' }
      }
    }

    // History patterns
    const historyPatterns = [
      /(?:show|view|check)\s+(?:my\s+)?(?:transaction\s+)?history/i,
      /(?:show|view)\s+(?:my\s+)?transactions/i,
      /transaction\s+history/i,
      /payment\s+history/i
    ]
    
    for (const pattern of historyPatterns) {
      if (pattern.test(text)) {
        return { action: 'history' }
      }
    }

    // Investment patterns
    const investPatterns = [
      /invest\s+(\d+(?:\.\d+)?)\s*(?:dollars?|algos?)?/i,
      /start\s+investing\s+(\d+(?:\.\d+)?)\s*(?:dollars?|algos?)?/i,
      /put\s+(\d+(?:\.\d+)?)\s*(?:dollars?|algos?)?\s+in\s+investment/i
    ]
    
    for (const pattern of investPatterns) {
      const investMatch = text.match(pattern)
      if (investMatch) {
        return {
          action: 'invest',
          amount: parseFloat(investMatch[1])
        }
      }
    }
    
    // Simple invest command
    if (/invest|investment/i.test(text)) {
      return { action: 'invest' }
    }

    return null
  },

  async speakWithElevenLabs(text: string): Promise<void> {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY
    if (!apiKey) {
      // Fallback to browser TTS
      return this.speak(text)
    }

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        
        return new Promise((resolve, reject) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl)
            resolve()
          }
          audio.onerror = (error) => {
            URL.revokeObjectURL(audioUrl)
            reject(error)
          }
          audio.play().catch(reject)
        })
      } else {
        // Fallback to browser TTS
        return this.speak(text)
      }
    } catch (error) {
      console.error('ElevenLabs TTS failed:', error)
      return this.speak(text)
    }
  },

  // Test microphone access
  async testMicrophone(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch (error) {
      console.error('Microphone test failed:', error)
      return false
    }
  }
}

// Add global type declarations
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}