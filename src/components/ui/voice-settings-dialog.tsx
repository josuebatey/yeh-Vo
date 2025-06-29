import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Volume2, Settings } from 'lucide-react'
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
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('This is a test of your voice settings.')
      utterance.rate = settings.speed[0]
      utterance.pitch = settings.pitch[0]
      utterance.volume = settings.volume[0]
      utterance.lang = settings.language
      speechSynthesis.speak(utterance)
    } else {
      toast.error('Speech synthesis not supported')
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Voice Settings</span>
          </DialogTitle>
          <DialogDescription>
            Customize your voice command and feedback preferences
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
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
                <SelectItem value="de-DE">German</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Speech Speed</Label>
            <Slider
              value={settings.speed}
              onValueChange={(value) => setSettings(prev => ({ ...prev, speed: value }))}
              min={0.5}
              max={2}
              step={0.1}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">
              {settings.speed[0]}x speed
            </div>
          </div>

          <div className="space-y-2">
            <Label>Voice Pitch</Label>
            <Slider
              value={settings.pitch}
              onValueChange={(value) => setSettings(prev => ({ ...prev, pitch: value }))}
              min={0.5}
              max={2}
              step={0.1}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">
              {settings.pitch[0]}x pitch
            </div>
          </div>

          <div className="space-y-2">
            <Label>Volume</Label>
            <Slider
              value={settings.volume}
              onValueChange={(value) => setSettings(prev => ({ ...prev, volume: value }))}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">
              {Math.round(settings.volume[0] * 100)}% volume
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-speak responses</Label>
              <div className="text-sm text-muted-foreground">
                Automatically speak AI responses
              </div>
            </div>
            <Switch
              checked={settings.autoSpeak}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSpeak: checked }))}
            />
          </div>

          <Button onClick={handleTestVoice} variant="outline" className="w-full">
            <Volume2 className="mr-2 h-4 w-4" />
            Test Voice Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}