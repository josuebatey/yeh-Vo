import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Volume2, Mic } from 'lucide-react'
import { toast } from 'sonner'

interface VoiceSettingsDialogProps {
  children: React.ReactNode
}

export function VoiceSettingsDialog({ children }: VoiceSettingsDialogProps) {
  const [settings, setSettings] = useState({
    voice: 'default',
    speed: [1],
    pitch: [1],
    volume: [0.8],
    autoSpeak: true,
    language: 'en-US'
  })

  const handleTestVoice = () => {
    const utterance = new SpeechSynthesisUtterance('This is a test of your voice settings.')
    utterance.rate = settings.speed[0]
    utterance.pitch = settings.pitch[0]
    utterance.volume = settings.volume[0]
    utterance.lang = settings.language
    speechSynthesis.speak(utterance)
    toast.success('Voice test completed!')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Voice Settings</DialogTitle>
          <DialogDescription>
            Customize your voice recognition and text-to-speech preferences
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Text-to-Speech</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={settings.language} onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                    <SelectItem value="es-ES">Spanish</SelectItem>
                    <SelectItem value="fr-FR">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Speed: {settings.speed[0]}</Label>
                <Slider
                  value={settings.speed}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, speed: value }))}
                  min={0.5}
                  max={2}
                  step={0.1}
                />
              </div>

              <div className="space-y-2">
                <Label>Volume: {Math.round(settings.volume[0] * 100)}%</Label>
                <Slider
                  value={settings.volume}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, volume: value }))}
                  min={0}
                  max={1}
                  step={0.1}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Auto-speak responses</Label>
                <Switch
                  checked={settings.autoSpeak}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSpeak: checked }))}
                />
              </div>

              <Button onClick={handleTestVoice} variant="outline" className="w-full">
                <Volume2 className="mr-2 h-4 w-4" />
                Test Voice
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Speech Recognition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Speech recognition uses your browser's built-in capabilities. Make sure to:
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Allow microphone access</li>
                <li>• Speak clearly and at normal pace</li>
                <li>• Use a quiet environment</li>
                <li>• Wait for the listening indicator</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}