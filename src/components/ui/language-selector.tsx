import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LanguageSelectorProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  showLabel?: boolean
  className?: string
}

const languages = [
  // Global Languages
  { code: 'en', name: 'English', flag: '🇺🇸', region: 'Global' },
  { code: 'es', name: 'Español', flag: '🇪🇸', region: 'Latin America & Spain' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', region: 'France & Francophone Africa' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', region: 'Brazil & Lusophone Africa' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', region: 'Middle East & North Africa' },
  { code: 'zh', name: '中文', flag: '🇨🇳', region: 'China' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', region: 'India' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', region: 'Russia & Eastern Europe' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', region: 'Japan' },
  
  // African Languages
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪', region: 'East Africa' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬', region: 'West Africa' },
  { code: 'yo', name: 'Yorùbá', flag: '🇳🇬', region: 'West Africa' },
  { code: 'am', name: 'አማርኛ', flag: '🇪🇹', region: 'Ethiopia' },
]

export function LanguageSelector({ 
  variant = 'outline', 
  size = 'default', 
  showLabel = false,
  className 
}: LanguageSelectorProps) {
  const { i18n, t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode)
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={cn(
            "flex items-center space-x-2 min-w-0",
            className
          )}
        >
          <Globe className="h-4 w-4 flex-shrink-0" />
          <span className="text-lg">{currentLanguage.flag}</span>
          {showLabel && (
            <span className="hidden sm:inline truncate">
              {currentLanguage.name}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-64 max-h-80 overflow-y-auto"
        sideOffset={5}
      >
        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground border-b">
          {t('common.language')}
        </div>
        
        {/* Group by regions */}
        <div className="py-1">
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
            Global Languages
          </div>
          {languages.filter(lang => ['en', 'es', 'fr', 'pt', 'ar', 'zh', 'hi', 'ru', 'ja'].includes(lang.code)).map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className="flex items-center justify-between px-3 py-2 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{language.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{language.name}</span>
                  <span className="text-xs text-muted-foreground">{language.region}</span>
                </div>
              </div>
              {i18n.language === language.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </div>

        <div className="py-1 border-t">
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
            African Languages
          </div>
          {languages.filter(lang => ['sw', 'ha', 'yo', 'am'].includes(lang.code)).map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className="flex items-center justify-between px-3 py-2 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{language.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{language.name}</span>
                  <span className="text-xs text-muted-foreground">{language.region}</span>
                </div>
              </div>
              {i18n.language === language.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}