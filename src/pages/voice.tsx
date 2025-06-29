import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mic, Volume2, MessageSquare, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { VoiceCommandButton } from '@/components/ui/voice-command-button'
import { VoiceSettingsDialog } from '@/components/ui/voice-settings-dialog'
import { voiceService } from '@/services/voiceService'
import { useNavigate } from 'react-router-dom'
import { BackButton } from '@/components/ui/back-button'

export function VoiceCommands() {
  const navigate = useNavigate()
  const [isSupported, setIsSupported] = useState(false)
  const [commandHistory, setCommandHistory] = useState<Array<{
    transcript: string
    timestamp: Date
    success: boolean
    action?: string
  }>>([])

  useEffect(() => {
    setIsSupported(voiceService.isSupported())
  }, [])

  const handleVoiceCommand = async (transcript: string) => {
    const command = voiceService.parseVoiceCommand(transcript)
    
    const historyItem = {
      transcript,
      timestamp: new Date(),
      success: !!command,
      action: command?.action
    }
    
    setCommandHistory(prev => [historyItem, ...prev.slice(0, 9)])
    
    if (!command) {
      await voiceService.speak('Sorry, I didn\'t understand that command. Try saying something like "send 5 dollars to Alice" or "check my balance"')
      return
    }

    switch (command.action) {
      case 'send':
        navigate('/send', { state: { command } })
        break
      case 'balance':
        navigate('/wallet')
        break
      case 'history':
        navigate('/history')
        break
      case 'invest':
        navigate('/invest', { state: { command } })
        break
    }
  }

  const testTTS = async () => {
    try {
      await voiceService.speak('Hello! VoicePay text to speech is working perfectly.')
      toast.success('Text-to-speech test completed!')
    } catch (error) {
      toast.error('Text-to-speech test failed')
    }
  }

  const voiceCommands = [
    {
      command: '"Send 10 dollars to Alice"',
      description: 'Send money to a recipient',
      action: 'send'
    },
    {
      command: '"Send 5 algos to [address] via mobile money"',
      description: 'Send with specific channel',
      action: 'send'
    },
    {
      command: '"Check my balance"',
      description: 'View wallet balance',
      action: 'balance'
    },
    {
      command: '"Show my transaction history"',
      description: 'View transaction history',
      action: 'history'
    },
    {
      command: '"Invest 20 dollars"',
      description: 'Start an investment',
      action: 'invest'
    }
  ]

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <BackButton />
          <h1 className="text-2xl md:text-3xl font-bold">Voice Commands</h1>
          <p className="text-muted-foreground">Control VoicePay with your voice</p>
        </div>
      </div>

      {/* Voice Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mic className="h-6 w-6" />
              <span>Voice Control Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Speech Recognition:</span>
                  <Badge variant={isSupported ? "default" : "destructive"}>
                    {isSupported ? "Supported" : "Not Supported"}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {isSupported 
                    ? "Your browser supports voice commands"
                    : "Voice commands require a modern browser with microphone access"
                  }
                </div>
              </div>
              {isSupported && (
                <VoiceCommandButton onCommand={handleVoiceCommand} />
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={testTTS} variant="outline" className="flex-1">
                <Volume2 className="mr-2 h-4 w-4" />
                Test Text-to-Speech
              </Button>
              <VoiceSettingsDialog>
                <Button variant="outline" className="flex-1">
                  <Settings className="mr-2 h-4 w-4" />
                  Voice Settings
                </Button>
              </VoiceSettingsDialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Available Commands */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Available Commands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {voiceCommands.map((cmd, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="font-mono text-sm bg-muted px-2 py-1 rounded break-words">
                      {cmd.command}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {cmd.description}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {cmd.action}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Command History */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Commands</CardTitle>
            </CardHeader>
            <CardContent>
              {commandHistory.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No commands yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Try using the voice command button above
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {commandHistory.map((item, index) => (
                      <motion.div
                        key={`${item.timestamp.getTime()}-${index}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`p-3 rounded-lg border ${
                          item.success 
                            ? 'border-green-500/20 bg-green-500/5' 
                            : 'border-red-500/20 bg-red-500/5'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium break-words">
                              "{item.transcript}"
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            {item.action && (
                              <Badge variant="outline" className="text-xs">
                                {item.action}
                              </Badge>
                            )}
                            <Badge 
                              variant={item.success ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {item.success ? "Success" : "Failed"}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tips & Help */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Voice Command Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-3">Best Practices</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Speak clearly and at a normal pace</li>
                  <li>• Use specific amounts and recipient names</li>
                  <li>• Include payment channel if needed</li>
                  <li>• Wait for the beep before speaking</li>
                  <li>• Use a quiet environment for better recognition</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Supported Formats</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• "Send [amount] to [recipient]"</li>
                  <li>• "Send [amount] via [channel]"</li>
                  <li>• "Check balance" or "How much do I have"</li>
                  <li>• "Show history" or "View transactions"</li>
                  <li>• "Invest [amount]"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}