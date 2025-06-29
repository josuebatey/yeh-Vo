import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Loader2, Wallet, Mic, Shield, Globe, Zap, Eye, EyeOff, Mail, Lock, User, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { LanguageSelector } from '@/components/ui/language-selector'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function AuthPage() {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('signin')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  })
  const { signIn, signUp } = useAuthStore()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await signIn(formData.email, formData.password)
      toast.success(t('auth.welcomeBack'))
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await signUp(formData.email, formData.password, formData.fullName)
      toast.success(t('auth.accountCreated'))
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const features = [
    {
      icon: Mic,
      title: t('auth.voiceCommands'),
      description: 'Control payments with natural voice commands',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: t('auth.blockchainSecure'),
      description: 'Bank-level security with blockchain technology',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Globe,
      title: t('auth.multiLanguage'),
      description: 'Available in 13 languages worldwide',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Zap,
      title: t('auth.instantPayments'),
      description: 'Send and receive payments instantly',
      gradient: 'from-yellow-500 to-orange-500'
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        {/* Floating Orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 right-1/3 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl"
        />
      </div>
      
      {/* Top Controls */}
      <div className="absolute top-6 right-6 flex items-center space-x-3 z-50">
        <LanguageSelector />
        <ThemeToggle />
      </div>

      {/* Mobile Logo */}
      <div className="absolute top-6 left-6 lg:hidden z-50">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex items-center space-x-3"
        >
          <div className="relative">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              {t('auth.title')}
            </h1>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding & Features */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block space-y-10"
          >
            {/* Hero Section */}
            <div className="space-y-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="inline-flex items-center space-x-4"
              >
                <div className="relative">
                  <div className="h-20 w-20 rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center shadow-2xl">
                    <Wallet className="h-10 w-10 text-white" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-2 -right-2 h-6 w-6 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full flex items-center justify-center"
                  >
                    <Sparkles className="h-3 w-3 text-white" />
                  </motion.div>
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                    {t('auth.title')}
                  </h1>
                  <p className="text-xl text-purple-200 font-medium">
                    {t('auth.subtitle')}
                  </p>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg text-purple-100/80 leading-relaxed max-w-lg"
              >
                Experience the future of digital payments with voice-controlled transactions, 
                multi-channel support, and blockchain security.
              </motion.p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/30 transition-all duration-300">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-4 shadow-lg`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-white mb-2 text-lg">{feature.title}</h3>
                    <p className="text-purple-200/80 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center space-x-8 text-purple-200/80"
            >
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-400" />
                <span className="font-medium">Bank-Level Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-blue-400" />
                <span className="font-medium">13 Languages</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span className="font-medium">TestNet Safe</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md mx-auto lg:max-w-none mt-20 lg:mt-0"
          >
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-3xl"></div>
              
              <Card className="relative bg-white/95 dark:bg-black/80 backdrop-blur-2xl border-0 shadow-2xl rounded-3xl overflow-hidden">
                {/* Card Header Gradient */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600"></div>
                
                <CardHeader className="text-center space-y-4 pt-8 pb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {t('auth.getStarted')}
                    </CardTitle>
                  </motion.div>
                  <CardDescription className="text-muted-foreground text-lg">
                    {t('auth.description')}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-8 px-8 pb-8">
                  {/* Premium Tab System */}
                  <div className="relative">
                    <div className="flex bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 rounded-2xl p-1.5 backdrop-blur-sm">
                      <motion.div
                        layout
                        className={`absolute top-1.5 bottom-1.5 rounded-xl bg-white dark:bg-white/10 shadow-lg transition-all duration-300 ${
                          activeTab === 'signin' ? 'left-1.5 right-1/2 mr-0.75' : 'right-1.5 left-1/2 ml-0.75'
                        }`}
                      />
                      <button
                        onClick={() => setActiveTab('signin')}
                        className={`relative flex-1 py-4 px-6 text-sm font-semibold rounded-xl transition-all duration-300 ${
                          activeTab === 'signin'
                            ? 'text-purple-600 dark:text-white'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {t('auth.signIn')}
                      </button>
                      <button
                        onClick={() => setActiveTab('signup')}
                        className={`relative flex-1 py-4 px-6 text-sm font-semibold rounded-xl transition-all duration-300 ${
                          activeTab === 'signup'
                            ? 'text-purple-600 dark:text-white'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {t('auth.signUp')}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {activeTab === 'signin' ? (
                      <motion.form
                        key="signin"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleSignIn}
                        className="space-y-6"
                      >
                        {/* Premium Email Input */}
                        <div className="space-y-3">
                          <Label htmlFor="signin-email" className="text-sm font-semibold text-foreground">
                            {t('auth.email')}
                          </Label>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl group-focus-within:blur-2xl transition-all duration-300"></div>
                            <div className="relative flex items-center">
                              <Mail className="absolute left-4 h-5 w-5 text-purple-500 z-10" />
                              <Input
                                id="signin-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => updateFormData('email', e.target.value)}
                                placeholder={t('auth.enterEmail')}
                                className="pl-12 h-14 bg-white/80 dark:bg-white/5 border-2 border-purple-200/50 dark:border-white/10 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-base"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Premium Password Input */}
                        <div className="space-y-3">
                          <Label htmlFor="signin-password" className="text-sm font-semibold text-foreground">
                            {t('auth.password')}
                          </Label>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl group-focus-within:blur-2xl transition-all duration-300"></div>
                            <div className="relative flex items-center">
                              <Lock className="absolute left-4 h-5 w-5 text-purple-500 z-10" />
                              <Input
                                id="signin-password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => updateFormData('password', e.target.value)}
                                placeholder={t('auth.enterPassword')}
                                className="pl-12 pr-12 h-14 bg-white/80 dark:bg-white/5 border-2 border-purple-200/50 dark:border-white/10 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-base"
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 h-10 w-10 rounded-xl hover:bg-purple-100 dark:hover:bg-white/10"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Premium Submit Button */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button 
                            type="submit" 
                            className="w-full h-14 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white font-semibold text-base rounded-2xl shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300" 
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : null}
                            {t('auth.signIn')}
                          </Button>
                        </motion.div>
                      </motion.form>
                    ) : (
                      <motion.form
                        key="signup"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleSignUp}
                        className="space-y-6"
                      >
                        {/* Full Name Input */}
                        <div className="space-y-3">
                          <Label htmlFor="signup-name" className="text-sm font-semibold text-foreground">
                            {t('auth.fullName')}
                          </Label>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl group-focus-within:blur-2xl transition-all duration-300"></div>
                            <div className="relative flex items-center">
                              <User className="absolute left-4 h-5 w-5 text-purple-500 z-10" />
                              <Input
                                id="signup-name"
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => updateFormData('fullName', e.target.value)}
                                placeholder={t('auth.enterFullName')}
                                className="pl-12 h-14 bg-white/80 dark:bg-white/5 border-2 border-purple-200/50 dark:border-white/10 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-base"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-3">
                          <Label htmlFor="signup-email" className="text-sm font-semibold text-foreground">
                            {t('auth.email')}
                          </Label>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl group-focus-within:blur-2xl transition-all duration-300"></div>
                            <div className="relative flex items-center">
                              <Mail className="absolute left-4 h-5 w-5 text-purple-500 z-10" />
                              <Input
                                id="signup-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => updateFormData('email', e.target.value)}
                                placeholder={t('auth.enterEmail')}
                                className="pl-12 h-14 bg-white/80 dark:bg-white/5 border-2 border-purple-200/50 dark:border-white/10 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-base"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-3">
                          <Label htmlFor="signup-password" className="text-sm font-semibold text-foreground">
                            {t('auth.password')}
                          </Label>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl group-focus-within:blur-2xl transition-all duration-300"></div>
                            <div className="relative flex items-center">
                              <Lock className="absolute left-4 h-5 w-5 text-purple-500 z-10" />
                              <Input
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => updateFormData('password', e.target.value)}
                                placeholder={t('auth.createPassword')}
                                className="pl-12 pr-12 h-14 bg-white/80 dark:bg-white/5 border-2 border-purple-200/50 dark:border-white/10 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-base"
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 h-10 w-10 rounded-xl hover:bg-purple-100 dark:hover:bg-white/10"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Premium Submit Button */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button 
                            type="submit" 
                            className="w-full h-14 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white font-semibold text-base rounded-2xl shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300" 
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : null}
                            {t('auth.createAccount')}
                          </Button>
                        </motion.div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Premium Social Login */}
                  <div className="space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-4 text-muted-foreground font-medium">
                          {t('auth.orContinueWith')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          className="h-14 bg-white/80 dark:bg-white/5 border-2 border-gray-200/50 dark:border-white/10 hover:border-purple-300 dark:hover:border-white/20 rounded-2xl transition-all duration-300 group"
                          onClick={() => toast.info('Google login coming soon!')}
                        >
                          <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          <span className="font-medium">Google</span>
                        </Button>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          className="h-14 bg-white/80 dark:bg-white/5 border-2 border-gray-200/50 dark:border-white/10 hover:border-purple-300 dark:hover:border-white/20 rounded-2xl transition-all duration-300 group"
                          onClick={() => toast.info('Apple login coming soon!')}
                        >
                          <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                          </svg>
                          <span className="font-medium">Apple</span>
                        </Button>
                      </motion.div>
                    </div>
                  </div>

                  {/* Terms */}
                  <p className="text-xs text-center text-muted-foreground leading-relaxed">
                    {t('auth.termsAndPrivacy')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Mobile Features Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-8 text-center lg:hidden"
            >
              <div className="flex items-center justify-center space-x-6 text-sm text-purple-200/80">
                <div className="flex items-center space-x-2">
                  <Mic className="h-4 w-4" />
                  <span>Voice Commands</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>13 Languages</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}