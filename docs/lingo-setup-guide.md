# Lingo Multi-Language Setup Guide

## Overview
VoicePay now includes comprehensive multi-language support using react-i18next. This guide explains how to use and extend the language system, including how to integrate with Lingo's professional translation services.

## Current Language Support
- **English (en)** - Default language
- **Spanish (es)** - Español
- **French (fr)** - Français
- **German (de)** - Deutsch
- **Chinese (zh)** - 中文

## How to Use

### Language Selector Component
The `LanguageSelector` component is available throughout the app:

```tsx
import { LanguageSelector } from '@/components/ui/language-selector'

// Basic usage
<LanguageSelector />

// With custom styling
<LanguageSelector variant="outline" size="sm" showLabel={true} />
```

### Using Translations in Components
```tsx
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('auth.title')}</h1>
      <p>{t('auth.subtitle')}</p>
    </div>
  )
}
```

### Translation Keys Structure
```
auth.title
auth.subtitle
auth.signIn
auth.signUp
common.loading
common.error
nav.dashboard
nav.sendPayment
dashboard.title
dashboard.subtitle
```

## Adding New Languages

### 1. Add Language to Resources
Edit `src/lib/i18n.ts` and add your new language:

```typescript
const resources = {
  // ... existing languages
  pt: {
    translation: {
      auth: {
        title: 'VoicePay',
        subtitle: 'Envie e receba pagamentos com sua voz',
        // ... more translations
      }
    }
  }
}
```

### 2. Update Language Selector
Add the new language to `src/components/ui/language-selector.tsx`:

```typescript
const languages = [
  // ... existing languages
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
]
```

## Professional Translation with Lingo

### What is Lingo?
Lingo is a professional translation management platform that helps teams manage multilingual content efficiently. It provides:

- Professional human translators
- Translation memory and consistency
- Collaborative translation workflows
- Quality assurance and review processes
- API integration for automated workflows

### Setting Up Lingo Pro

#### 1. Create a Lingo Account
1. Visit [lingo.com](https://lingo.com)
2. Sign up for a professional account
3. Choose the Pro plan for advanced features

#### 2. Project Setup
1. Create a new project in Lingo
2. Set English as your source language
3. Add target languages (Spanish, French, German, Chinese, etc.)
4. Upload your translation files

#### 3. Export Translation Files
From your VoicePay project, export the current translations:

```bash
# Create a translations directory
mkdir translations

# Export English source file
cat > translations/en.json << 'EOF'
{
  "auth": {
    "title": "VoicePay",
    "subtitle": "Send and receive payments with your voice",
    "getStarted": "Get Started",
    // ... all your English translations
  }
}
EOF
```

#### 4. Upload to Lingo
1. In your Lingo project, go to "Files" section
2. Upload your `en.json` file as the source
3. Lingo will automatically detect the JSON structure
4. Assign translators for each target language

#### 5. Translation Workflow
1. **Assignment**: Assign professional translators to each language
2. **Translation**: Translators work on their assigned languages
3. **Review**: Quality assurance team reviews translations
4. **Approval**: Project manager approves final translations
5. **Export**: Download completed translation files

#### 6. Integration with VoicePay
Once translations are complete:

1. Download translated files from Lingo
2. Update your `src/lib/i18n.ts` file with new translations
3. Test all languages in your application
4. Deploy updated version

### Lingo Pro Features

#### Translation Memory
- Reuses previously translated content
- Ensures consistency across your app
- Reduces translation costs over time

#### Collaborative Workflow
- Multiple translators can work simultaneously
- Built-in review and approval process
- Comments and feedback system

#### Quality Assurance
- Automated quality checks
- Linguistic review process
- Cultural adaptation for different markets

#### API Integration
```javascript
// Example: Automated translation sync
const lingoAPI = {
  uploadSource: async (content) => {
    // Upload new content to Lingo
  },
  downloadTranslations: async () => {
    // Download completed translations
  },
  getProjectStatus: async () => {
    // Check translation progress
  }
}
```

### Cost Optimization Tips

#### 1. Translation Memory
- Reuse existing translations when possible
- Maintain consistent terminology
- Use Lingo's translation memory features

#### 2. Batch Updates
- Group translation updates together
- Plan releases to minimize rush fees
- Use Lingo's project management tools

#### 3. Quality vs Speed
- Balance quality requirements with timeline
- Use Lingo's different service levels appropriately
- Consider machine translation + human review for less critical content

### Best Practices

#### 1. Content Organization
```typescript
// Organize translations by feature/page
const translations = {
  auth: { /* authentication related */ },
  dashboard: { /* dashboard specific */ },
  payments: { /* payment related */ },
  common: { /* shared across app */ }
}
```

#### 2. Context for Translators
```json
{
  "auth": {
    "title": "VoicePay", // App name - do not translate
    "subtitle": "Send and receive payments with your voice", // Main tagline
    "signIn": "Sign In", // Button text for login
    "signUp": "Sign Up" // Button text for registration
  }
}
```

#### 3. Pluralization
```typescript
// Use i18next pluralization features
{
  "transaction": "transaction",
  "transaction_plural": "transactions",
  "transactionCount": "{{count}} transaction",
  "transactionCount_plural": "{{count}} transactions"
}
```

#### 4. Variable Interpolation
```typescript
// Use variables for dynamic content
{
  "welcomeMessage": "Welcome back, {{name}}!",
  "balanceDisplay": "Your balance is {{amount}} {{currency}}"
}
```

### Maintenance and Updates

#### 1. Regular Sync
- Set up regular sync schedule with Lingo
- Monitor translation progress
- Update app with new translations

#### 2. Quality Monitoring
- Collect user feedback on translations
- Monitor app analytics by language
- Regular review with Lingo team

#### 3. Expansion Planning
- Plan for new languages based on user demand
- Consider regional variations (e.g., Spanish for different countries)
- Budget for ongoing translation maintenance

## Technical Implementation

### Language Detection
The app automatically detects user language preference:
1. Saved language preference (localStorage)
2. Browser language setting
3. Falls back to English

### RTL Language Support
For future RTL languages (Arabic, Hebrew):

```css
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .sidebar {
  right: 0;
  left: auto;
}
```

### Performance Optimization
- Lazy load translation files
- Cache translations in localStorage
- Minimize bundle size with tree shaking

## Conclusion

With Lingo Pro integration, VoicePay can provide professional-quality translations that enhance user experience across different markets. The investment in professional translation services pays off through:

- Better user engagement
- Reduced support tickets
- Increased market penetration
- Professional brand image

For more information about Lingo Pro features and pricing, visit [lingo.com/pro](https://lingo.com/pro).