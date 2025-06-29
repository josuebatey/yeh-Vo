import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Settings, Volume2, Mic } from 'lucide-react'
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

  const handleSaveSettings = () => {
    localStorage.setItem('voiceSettings', JSON.stringify(settings))
    toast.success('Voice settings saved!')
  }

  const testVoice = () => {
    const utterance = new SpeechSynthesisUtterance('This is a test of your voice settings.')
    utterance.rate = settings.speed[0]
    utterance.pitch = settings.pitch[0]
    utterance.volume = settings.volume[0]
    speechSynthesis.speak(utterance)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Voice Settings</span>
          </DialogTitle>
          <DialogDescription>
            Customize your voice command and text-to-speech preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="language">Recognition Language</Label>
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
            <Label>Speech Speed: {settings.speed[0]}</Label>
            <Slider
              value={settings.speed}
              onValueChange={(value) => setSettings(prev => ({ ...prev, speed: value }))}
              max={2}
              min={0.5}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Speech Pitch: {settings.pitch[0]}</Label>
            <Slider
              value={settings.pitch}
              onValueChange={(value) => setSettings(prev => ({ ...prev, pitch: value }))}
              max={2}
              min={0.5}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Volume: {Math.round(settings.volume[0] * 100)}%</Label>
            <Slider
              value={settings.volume}
              onValueChange={(value) => setSettings(prev => ({ ...prev, volume: value }))}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="auto-speak">Auto-speak responses</Label>
            <Switch
              id="auto-speak"
              checked={settings.autoSpeak}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSpeak: checked }))}
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={testVoice} variant="outline" className="flex-1">
              <Volume2 className="mr-2 h-4 w-4" />
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