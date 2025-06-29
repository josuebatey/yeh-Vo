import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Settings, Volume2, Mic } from 'lucide-react'

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
    continuousListening: false,
  })

  const handleSaveSettings = () => {
    // Save settings to localStorage or user preferences
    localStorage.setItem('voiceSettings', JSON.stringify(settings))
    console.log('Voice settings saved:', settings)
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
            Customize your voice command and speech settings
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Voice Selection */}
          <div className="space-y-2">
            <Label>Voice</Label>
            <Select 
              value={settings.voice} 
              onValueChange={(value) => setSettings(prev => ({ ...prev, voice: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Speech Speed */}
          <div className="space-y-2">
            <Label>Speech Speed</Label>
            <div className="px-2">
              <Slider
                value={settings.speed}
                onValueChange={(value) => setSettings(prev => ({ ...prev, speed: value }))}
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

          {/* Volume */}
          <div className="space-y-2">
            <Label>Volume</Label>
            <div className="px-2">
              <Slider
                value={settings.volume}
                onValueChange={(value) => setSettings(prev => ({ ...prev, volume: value }))}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Quiet</span>
                <span>Loud</span>
              </div>
            </div>
          </div>

          {/* Auto Speak */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Speak Responses</Label>
              <div className="text-sm text-muted-foreground">
                Automatically speak AI responses
              </div>
            </div>
            <Switch
              checked={settings.autoSpeak}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSpeak: checked }))}
            />
          </div>

          {/* Continuous Listening */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Continuous Listening</Label>
              <div className="text-sm text-muted-foreground">
                Keep microphone active for commands
              </div>
            </div>
            <Switch
              checked={settings.continuousListening}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, continuousListening: checked }))}
            />
          </div>

          {/* Test Buttons */}
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Volume2 className="mr-2 h-4 w-4" />
              Test Voice
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Mic className="mr-2 h-4 w-4" />
              Test Microphone
            </Button>
          </div>

          {/* Save Button */}
          <Button onClick={handleSaveSettings} className="w-full">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}