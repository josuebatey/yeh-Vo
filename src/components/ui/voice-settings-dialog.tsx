import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Volume2, Mic, Settings } from 'lucide-react'
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
    noiseReduction: true,
  })

  const handleTestVoice = async () => {
    try {
      await voiceService.speak('This is a test of your voice settings. How does this sound?')
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

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
  ]

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
            Customize your voice recognition and speech settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Language Selection */}
          <div className="space-y-2">
            <Label>Recognition Language</Label>
            <Select 
              value={settings.language} 
              onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Voice Speed */}
          <div className="space-y-3">
            <Label>Speech Speed</Label>
            <div className="px-2">
              <Slider
                value={settings.voiceSpeed}
                onValueChange={(value) => setSettings(prev => ({ ...prev, voiceSpeed: value }))}
                max={2}
                min={0.5}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Slow</span>
                <span>Normal</span>
                <span>Fast</span>
              </div>
            </div>
          </div>

          {/* Voice Pitch */}
          <div className="space-y-3">
            <Label>Speech Pitch</Label>
            <div className="px-2">
              <Slider
                value={settings.voicePitch}
                onValueChange={(value) => setSettings(prev => ({ ...prev, voicePitch: value }))}
                max={2}
                min={0.5}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Low</span>
                <span>Normal</span>
                <span>High</span>
              </div>
            </div>
          </div>

          {/* Toggle Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-speak Responses</Label>
                <p className="text-sm text-muted-foreground">Automatically speak AI responses</p>
              </div>
              <Switch
                checked={settings.autoSpeak}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSpeak: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Continuous Listening</Label>
                <p className="text-sm text-muted-foreground">Keep microphone active</p>
              </div>
              <Switch
                checked={settings.continuousListening}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, continuousListening: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Noise Reduction</Label>
                <p className="text-sm text-muted-foreground">Filter background noise</p>
              </div>
              <Switch
                checked={settings.noiseReduction}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, noiseReduction: checked }))}
              />
            </div>
          </div>

          {/* Test Button */}
          <Button onClick={handleTestVoice} variant="outline" className="w-full">
            <Volume2 className="mr-2 h-4 w-4" />
            Test Voice Settings
          </Button>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
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