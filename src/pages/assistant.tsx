import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, Bot, User, Mic, Volume2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useWalletStore } from '@/stores/walletStore'
import { voiceService } from '@/services/voiceService'
import { BackButton } from '@/components/ui/back-button'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function AIAssistant() {
  const { wallet } = useWalletStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your yehVo AI assistant. I can help you with your wallet, transactions, and answer questions about your finances. What would you like to know?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const generateResponse = async (userInput: string): Promise<string> => {
    const lowerInput = userInput.toLowerCase()
    
    // Balance inquiries
    if (lowerInput.includes('balance') || lowerInput.includes('how much')) {
      return `Your current wallet balance is ${wallet?.balance?.toFixed(4) || '0'} ALGO.`
    }
    
    // Wallet address
    if (lowerInput.includes('address') || lowerInput.includes('wallet')) {
      return `Your wallet address is ${wallet?.address || 'not available'}. You can share this address to receive payments.`
    }
    
    // Investment info
    if (lowerInput.includes('invest') || lowerInput.includes('returns')) {
      return 'yehVo offers investment opportunities with different risk levels: Conservative (5.5% APY), Balanced (8.5% APY), and Growth (12% APY). You can start investing from the Investment page.'
    }
    
    // How to send money
    if (lowerInput.includes('send') || lowerInput.includes('payment')) {
      return 'To send money, you can: 1) Use voice commands like "Send 10 dollars to Alice", 2) Use the Send Payment page, or 3) Scan a QR code. yehVo supports Algorand blockchain, mobile money, and bank transfers.'
    }
    
    // Security
    if (lowerInput.includes('security') || lowerInput.includes('safe')) {
      return 'yehVo uses bank-level security with encrypted wallets and Supabase authentication. Your recovery phrase is securely stored and only you can access it. This is currently running on Algorand TestNet for demonstration.'
    }
    
    // Voice commands
    if (lowerInput.includes('voice') || lowerInput.includes('command')) {
      return 'You can use voice commands like: "Send 10 dollars to Alice", "Check my balance", "Show transaction history", or "Invest 20 dollars". Just click the voice command button and speak clearly.'
    }
    
    // General help
    if (lowerInput.includes('help') || lowerInput.includes('how')) {
      return 'I can help you with: checking your balance, explaining how to send payments, investment information, security questions, and using voice commands. What specific topic would you like to know about?'
    }
    
    // Default response
    return 'I understand you\'re asking about yehVo. I can help with wallet information, sending payments, investments, and voice commands. Could you be more specific about what you\'d like to know?'
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await generateResponse(input)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Speak the response
      await voiceService.speak(response)
      
    } catch (error) {
      console.error('Failed to generate response:', error)
      toast.error('Failed to get AI response')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceInput = async () => {
    if (!voiceService.isSupported()) {
      toast.error('Voice input is not supported in your browser')
      return
    }

    try {
      setIsListening(true)
      const transcript = await voiceService.startListening()
      setInput(transcript)
      toast.success(`Voice input received: "${transcript}"`)
    } catch (error) {
      console.error('Voice input failed:', error)
      toast.error('Voice input failed')
    } finally {
      setIsListening(false)
    }
  }

  const speakMessage = async (content: string) => {
    try {
      await voiceService.speak(content)
    } catch (error) {
      toast.error('Failed to speak message')
    }
  }

  return (
    <div className="h-full flex flex-col overflow-scroll border border-red-500 mt-10">
      {/* Header Section - Fixed with proper spacing */}
      <div className="flex-shrink-0 p-4 md:p-6 border-b bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">AI Assistant</h1>
              <p className="text-muted-foreground">Get help with yehVo features and your finances</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section - Scrollable */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Chat Card - Takes remaining space */}
          <Card className="h-[calc(100vh-200px)] md:h-[600px] flex flex-col">
            <CardHeader className="border-b flex-shrink-0">
              <CardTitle className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1" />
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span>yehVo Assistant</span>
                <div className="flex-1" />
                <div className="text-xs text-muted-foreground">
                  Powered by AI
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0 min-h-0">
              {/* Messages - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-2 max-w-[85%] md:max-w-[70%] ${
                        message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          {message.type === 'user' ? (
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          ) : (
                            <>
                              <AvatarImage src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1" />
                              <AvatarFallback>
                                <Bot className="h-4 w-4" />
                              </AvatarFallback>
                            </>
                          )}
                        </Avatar>
                        <div className={`rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}>
                          <div className="text-sm break-words">{message.content}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                          {message.type === 'assistant' && (
                            <Button
                              onClick={() => speakMessage(message.content)}
                              variant="ghost"
                              size="sm"
                              className="mt-2 h-6 px-2"
                            >
                              <Volume2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1" />
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Section - Fixed at bottom */}
              <div className="border-t p-4 flex-shrink-0">
                <div className="flex space-x-2">
                  <Button
                    onClick={handleVoiceInput}
                    disabled={isListening}
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0 rounded-full h-10 w-10 p-0 bg-muted/50 hover:bg-muted"
                  >
                    <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse text-red-500' : ''}`} />
                  </Button>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything about yehVo..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={isLoading || !input.trim()}
                    className="flex-shrink-0 rounded-full h-10 w-10 p-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions - Fixed height */}
          <Card className="flex-shrink-0">
            <CardHeader>
              <CardTitle>Quick Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  "What's my current balance?",
                  "How do I send money?",
                  "What are the investment options?",
                  "How do voice commands work?",
                  "Is yehVo secure?",
                  "How do I receive payments?"
                ].map((question) => (
                  <Button
                    key={question}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(question)}
                    className="justify-start text-left h-auto py-2 px-3"
                  >
                    <span className="truncate">{question}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}