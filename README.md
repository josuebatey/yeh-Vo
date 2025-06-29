# VoicePay PWA

A production-ready, mobile-first Progressive Web App that enables users to send and receive blockchain-backed micropayments using voice commands, QR codes, mobile money, and bank transfers.

## 🚀 Features

### Core Functionality
- **Voice-Powered Payments**: Send money using natural language voice commands
- **Multi-Channel Support**: Algorand blockchain, mobile money, and bank transfers
- **QR Code Integration**: Scan addresses for quick payments
- **Investment Platform**: Automated investing with simulated APY returns
- **AI Assistant**: Powered by Tavus avatar with intelligent responses
- **Real-time Balance**: Live Algorand TestNet integration

### Technical Features
- **Progressive Web App**: Offline support and mobile installation
- **Dark Mode**: Beautiful dark theme optimized for all devices
- **Voice Recognition**: Web Speech API with ElevenL Labs TTS
- **Secure Wallet**: Algorand wallet generation with encrypted storage
- **Real-time Updates**: Live balance and transaction status
- **Responsive Design**: Mobile-first with desktop optimization

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: Zustand + React Query
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Blockchain**: Algorand JavaScript SDK (TestNet)
- **Voice AI**: Web Speech API + ElevenLabs TTS
- **QR Codes**: react-qr-reader + qr-code-styling
- **Animations**: Framer Motion
- **PWA**: Vite PWA plugin with Workbox

## 🔧 Environment Setup

Create a `.env` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# ElevenLabs TTS (Optional)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key

# RevenueCat (Optional)
VITE_REVENUECAT_KEY=your_revenuecat_key

# Algorand TestNet
VITE_ALGOD_TOKEN=
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGOD_PORT=443

# AI Services (Optional)
VITE_TAVUS_API_KEY=your_tavus_api_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd voicepay-pwa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the migration file: `supabase/migrations/create_schema.sql`
   - Copy your project URL and anon key to `.env`

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

The app uses Supabase with the following tables:

- **profiles**: User profile information
- **wallets**: Algorand wallet storage with encrypted mnemonics
- **transactions**: All payment transactions across channels
- **investments**: Investment tracking with APY calculations
- **user_limits**: Daily sending limits and pro status

## 🎯 Usage Guide

### Getting Started
1. **Sign Up**: Create an account with email/password
2. **Wallet Creation**: Automatic Algorand TestNet wallet generation
3. **Fund Wallet**: Use the TestNet dispenser for demo funds
4. **Start Transacting**: Send/receive payments via voice or manual entry

### Voice Commands
- `"Send 10 dollars to Alice"` - Send payment
- `"Send 5 algos to [address] via mobile money"` - Multi-channel payment
- `"Check my balance"` - View wallet balance
- `"Show transaction history"` - View past transactions
- `"Invest 20 dollars"` - Start investment

### TestNet Wallet Guide
1. **Automatic Creation**: Wallet generated on first login
2. **Funding**: Click "Fund from TestNet" for demo ALGO
3. **Security**: Recovery phrase stored encrypted in Supabase
4. **Explorer**: View transactions on AlgoExplorer TestNet

## 🔐 Security Features

- **Row Level Security**: Supabase RLS policies protect user data
- **Encrypted Storage**: Wallet mnemonics encrypted at rest
- **TestNet Only**: Safe demo environment with no real funds
- **Authentication**: Secure email/password with Supabase Auth
- **HTTPS Only**: All communications encrypted in transit

## 🚀 Deployment

### Netlify (Recommended)
1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository
   - Set environment variables in Netlify dashboard
   - Deploy automatically on push

### Manual Deployment
1. **Build for production**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

## 🎨 Design System

- **Color Palette**: Purple/blue gradient theme with dark mode
- **Typography**: Inter font family with proper hierarchy
- **Components**: shadcn/ui with custom styling
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Lucide React icon library
- **Responsive**: Mobile-first with breakpoints at 768px and 1024px

## 🔊 Voice Integration

### Web Speech API
- **Recognition**: Browser-native speech recognition
- **Synthesis**: Text-to-speech feedback
- **Commands**: Natural language parsing
- **Fallbacks**: Graceful degradation for unsupported browsers

### ElevenLabs Integration
- **Premium TTS**: High-quality voice synthesis
- **Fallback**: Browser TTS when API unavailable
- **Customizable**: Voice settings and models

## 💰 Monetization

### Free Tier
- $10/day sending limit
- Basic investment options
- Standard voice features

### Pro Tier (Coming Soon)
- Unlimited daily sending
- Advanced investment strategies
- Premium voice features
- Priority support

## 🤖 AI Assistant

- **Natural Language**: Understands financial queries
- **Context Aware**: Knows your balance and transaction history
- **Voice Enabled**: Speaks responses using TTS
- **Helpful**: Guides users through app features

## 📱 PWA Features

- **Offline Support**: Core functionality works offline
- **Install Prompt**: Add to home screen capability
- **Push Notifications**: Transaction alerts (when enabled)
- **Background Sync**: Sync when connection restored

## 🧪 Testing

### Manual Testing
1. **Voice Commands**: Test in quiet environment
2. **QR Scanning**: Use camera-enabled device
3. **Responsive**: Test on mobile, tablet, desktop
4. **Offline**: Test with network disabled

### TestNet Safety
- Uses Algorand TestNet only
- No real money involved
- Safe for development and demos
- Dispenser provides free test ALGO

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Route components
├── services/           # API and external service logic
├── stores/             # Zustand state management
├── types/              # TypeScript type definitions
├── lib/                # Utility functions
└── hooks/              # Custom React hooks
```

### Key Services
- **algorandService**: Blockchain interactions
- **paymentService**: Multi-channel payment processing
- **voiceService**: Speech recognition and synthesis
- **supabase**: Database and authentication

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the demo video script

## 🎬 Demo

A complete demo script is available in `docs/video-script.md` for showcasing all features.

---

**Built with ❤️ using Bolt.new**