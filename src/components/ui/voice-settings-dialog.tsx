import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Settings, Volume2, VolumeX } from 'lucide-react'
import { toast } from 'sonner'
import { voiceService } from '@/services/voiceService'

interface VoiceSettingsDialogProps {
  children: React.ReactNode
}

export function VoiceSettingsDialog({ children }: VoiceSettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState({
    language: 'en-US',
    voiceSpeed: [1],
    voicePitch: [1],
    autoSpeak: true,
    continuousListening: false,
  })

  const handleTestVoice = async () => {
    try {
      const utterance = new SpeechSynthesisUtterance('This is a test of your voice settings.')
      utterance.rate = settings.voiceSpeed[0]
      utterance.pitch = settings.voicePitch[0]
      utterance.lang = settings.language
      
      speechSynthesis.speak(utterance)
      toast.success('Voice test completed!')
    } catch (error) {
      toast.error('Voice test failed')
    }
  }

  const handleSaveSettings = () => {
    // In a real app, you'd save these to localStorage or user preferences
    localStorage.setItem('voiceSettings', JSON.stringify(settings))
    toast.success('Voice settings saved!')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            Customize your voice recognition and text-to-speech preferences
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language">Recognition Language</Label>
            <Select 
              value={settings.language} 
              onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
            >
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
            <Label>Voice Speed: {settings.voiceSpeed[0].toFixed(1)}x</Label>
            <Slider
              value={settings.voiceSpeed}
              onValueChange={(value) => setSettings(prev => ({ ...prev, voiceSpeed: value }))}
              min={0.5}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Voice Pitch: {settings.voicePitch[0].toFixed(1)}</Label>
            <Slider
              value={settings.voicePitch}
              onValueChange={(value) => setSettings(prev => ({ ...prev, voicePitch: value }))}
              min={0.5}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-speak">Auto-speak responses</Label>
              <p className="text-sm text-muted-foreground">
                Automatically speak AI responses and confirmations
              </p>
            </div>
            <Switch
              id="auto-speak"
              checked={settings.autoSpeak}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSpeak: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="continuous">Continuous listening</Label>
              <p className="text-sm text-muted-foreground">
                Keep microphone active for multiple commands
              </p>
            </div>
            <Switch
              id="continuous"
              checked={settings.continuousListening}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, continuousListening: checked }))}
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleTestVoice} variant="outline" className="flex-1">
              {settings.autoSpeak ? <Volume2 className="mr-2 h-4 w-4" /> : <VolumeX className="mr-2 h-4 w-4" />}
              Test Voice
            </Button>
            <Button onClick={handleSaveSettings} className="flex-1">
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}