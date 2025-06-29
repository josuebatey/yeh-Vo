interface VoiceCommand {
  action: 'send' | 'balance' | 'history' | 'invest'
  amount?: number
  recipient?: string
  channel?: 'algorand' | 'mobile_money' | 'bank'
}

export const voiceService = {
  isSupported: (): boolean => {
    return 'speechSynthesis' in window && 'webkitSpeechRecognition' in window
  },

  speak: (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.onend = () => resolve()
      utterance.onerror = reject
      
      speechSynthesis.speak(utterance)
    })
  },

  startListening: (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window)) {
        reject(new Error('Speech recognition not supported'))
        return
      }

      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        resolve(transcript)
      }

      recognition.onerror = reject
      recognition.start()
    })
  },

  parseVoiceCommand: (transcript: string): VoiceCommand | null => {
    const text = transcript.toLowerCase()
    
    // Send payment patterns
    const sendMatch = text.match(/send (\d+(?:\.\d+)?)\s*(?:dollars?|algos?|usd)?\s*to\s*(.+?)(?:\s+(?:via|using)\s+(mobile money|bank|algorand))?/)
    if (sendMatch) {
      return {
        action: 'send',
        amount: parseFloat(sendMatch[1]),
        recipient: sendMatch[2].trim(),
        channel: sendMatch[3]?.replace(' ', '_') as any || 'algorand'
      }
    }

    // Balance check
    if (text.includes('balance') || text.includes('how much')) {
      return { action: 'balance' }
    }

    // History check
    if (text.includes('history') || text.includes('transactions')) {
      return { action: 'history' }
    }

    // Investment
    if (text.includes('invest')) {
      const investMatch = text.match(/invest (\d+(?:\.\d+)?)\s*(?:dollars?|algos?)?/)
      if (investMatch) {
        return {
          action: 'invest',
          amount: parseFloat(investMatch[1])
        }
      }
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
          audio.onended = () => resolve()
          audio.onerror = reject
          audio.play()
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
}