import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Translation resources with expanded language support
const resources = {
  // English (Global)
  en: {
    translation: {
      // Auth Page
      auth: {
        appName: 'VoicePay',
        title: 'VoicePay',
        subtitle: 'Send and receive payments with your voice',
        tagline: 'The future of voice-powered payments',
        getStarted: 'Get Started',
        description: 'Create an account or sign in to start using VoicePay',
        loginDescription: 'Welcome back! Please sign in to your account.',
        signupDescription: 'Create your account to get started with VoicePay.',
        signIn: 'Sign In',
        signUp: 'Sign Up',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        fullName: 'Full Name',
        emailPlaceholder: 'Enter your email',
        passwordPlaceholder: 'Enter your password',
        confirmPasswordPlaceholder: 'Confirm your password',
        fullNamePlaceholder: 'Enter your full name',
        createAccount: 'Create Account',
        welcomeBack: 'Welcome back!',
        accountCreated: 'Account created! Check your email to verify.',
        loginSuccess: 'Successfully signed in!',
        signupSuccess: 'Account created successfully!',
        passwordMismatch: 'Passwords do not match',
        error: 'An error occurred. Please try again.',
        or: 'or',
        noAccount: "Don't have an account? Sign up",
        hasAccount: 'Already have an account? Sign in',
        features: {
          wallet: {
            title: 'Secure Wallet',
            description: 'Your crypto wallet with bank-level security'
          },
          voice: {
            title: 'Voice Commands',
            description: 'Send payments using natural voice commands'
          },
          security: {
            title: 'Blockchain Security',
            description: 'Protected by Algorand blockchain technology'
          },
          global: {
            title: 'Global Reach',
            description: 'Send money anywhere in the world instantly'
          },
          instant: {
            title: 'Instant Payments',
            description: 'Lightning-fast transactions in seconds'
          },
          investment: {
            title: 'Smart Investing',
            description: 'Grow your wealth with automated investing'
          }
        }
      },
      // Common
      common: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        cancel: 'Cancel',
        confirm: 'Confirm',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        submit: 'Submit',
        retry: 'Retry',
        refresh: 'Refresh',
        search: 'Search',
        filter: 'Filter',
        language: 'Language',
        theme: 'Theme',
        settings: 'Settings',
        profile: 'Profile',
        account: 'Account',
        dashboard: 'Dashboard',
        home: 'Home',
        logout: 'Logout'
      },
      // Navigation
      nav: {
        dashboard: 'Dashboard',
        sendPayment: 'Send Payment',
        receive: 'Receive',
        history: 'History',
        invest: 'Invest',
        wallet: 'Wallet',
        voiceCommands: 'Voice Commands',
        aiAssistant: 'AI Assistant',
        settings: 'Settings'
      },
      // Dashboard
      dashboard: {
        title: 'Dashboard',
        subtitle: 'Welcome back to VoicePay',
        walletBalance: 'Wallet Balance',
        thisMonth: 'This Month',
        totalSent: 'Total Sent',
        totalReceived: 'Total Received',
        quickActions: 'Quick Actions',
        recentActivity: 'Recent Activity',
        walletManagement: 'Wallet Management',
        noRecentTransactions: 'No recent transactions',
        makeFirstPayment: 'Make Your First Payment',
        viewAllTransactions: 'View All Transactions',
        refreshBalance: 'Refresh Balance',
        fundFromTestnet: 'Fund from Testnet',
        autoRefresh: 'Auto-refresh every 10 seconds',
        liveTransactionMonitoring: 'Live transaction monitoring'
      }
    }
  },
  
  // Spanish (Latin America & Spain)
  es: {
    translation: {
      auth: {
        appName: 'VoicePay',
        title: 'VoicePay',
        subtitle: 'Envía y recibe pagos con tu voz',
        tagline: 'El futuro de los pagos por voz',
        getStarted: 'Comenzar',
        description: 'Crea una cuenta o inicia sesión para comenzar a usar VoicePay',
        loginDescription: '¡Bienvenido de vuelta! Por favor inicia sesión en tu cuenta.',
        signupDescription: 'Crea tu cuenta para comenzar con VoicePay.',
        signIn: 'Iniciar Sesión',
        signUp: 'Registrarse',
        email: 'Correo Electrónico',
        password: 'Contraseña',
        confirmPassword: 'Confirmar Contraseña',
        fullName: 'Nombre Completo',
        emailPlaceholder: 'Ingresa tu correo electrónico',
        passwordPlaceholder: 'Ingresa tu contraseña',
        confirmPasswordPlaceholder: 'Confirma tu contraseña',
        fullNamePlaceholder: 'Ingresa tu nombre completo',
        createAccount: 'Crear Cuenta',
        welcomeBack: '¡Bienvenido de vuelta!',
        accountCreated: '¡Cuenta creada! Revisa tu correo para verificar.',
        loginSuccess: '¡Sesión iniciada exitosamente!',
        signupSuccess: '¡Cuenta creada exitosamente!',
        passwordMismatch: 'Las contraseñas no coinciden',
        error: 'Ocurrió un error. Por favor intenta de nuevo.',
        or: 'o',
        noAccount: '¿No tienes cuenta? Regístrate',
        hasAccount: '¿Ya tienes cuenta? Inicia sesión',
        features: {
          wallet: {
            title: 'Billetera Segura',
            description: 'Tu billetera cripto con seguridad bancaria'
          },
          voice: {
            title: 'Comandos de Voz',
            description: 'Envía pagos usando comandos de voz naturales'
          },
          security: {
            title: 'Seguridad Blockchain',
            description: 'Protegido por la tecnología blockchain de Algorand'
          },
          global: {
            title: 'Alcance Global',
            description: 'Envía dinero a cualquier parte del mundo al instante'
          },
          instant: {
            title: 'Pagos Instantáneos',
            description: 'Transacciones ultrarrápidas en segundos'
          },
          investment: {
            title: 'Inversión Inteligente',
            description: 'Haz crecer tu riqueza con inversión automatizada'
          }
        }
      },
      common: {
        loading: 'Cargando...',
        language: 'Idioma',
        logout: 'Cerrar Sesión'
      },
      nav: {
        dashboard: 'Panel',
        sendPayment: 'Enviar Pago',
        receive: 'Recibir',
        history: 'Historial',
        invest: 'Invertir',
        wallet: 'Billetera',
        voiceCommands: 'Comandos de Voz',
        aiAssistant: 'Asistente IA',
        settings: 'Configuración'
      }
    }
  },

  // French (France & Francophone Africa)
  fr: {
    translation: {
      auth: {
        appName: 'VoicePay',
        title: 'VoicePay',
        subtitle: 'Envoyez et recevez des paiements avec votre voix',
        tagline: 'L\'avenir des paiements vocaux',
        getStarted: 'Commencer',
        description: 'Créez un compte ou connectez-vous pour commencer à utiliser VoicePay',
        loginDescription: 'Bon retour ! Veuillez vous connecter à votre compte.',
        signupDescription: 'Créez votre compte pour commencer avec VoicePay.',
        signIn: 'Se Connecter',
        signUp: "S'inscrire",
        email: 'Email',
        password: 'Mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        fullName: 'Nom complet',
        emailPlaceholder: 'Entrez votre email',
        passwordPlaceholder: 'Entrez votre mot de passe',
        confirmPasswordPlaceholder: 'Confirmez votre mot de passe',
        fullNamePlaceholder: 'Entrez votre nom complet',
        createAccount: 'Créer un compte',
        welcomeBack: 'Bon retour !',
        accountCreated: 'Compte créé ! Vérifiez votre email pour confirmer.',
        loginSuccess: 'Connexion réussie !',
        signupSuccess: 'Compte créé avec succès !',
        passwordMismatch: 'Les mots de passe ne correspondent pas',
        error: 'Une erreur s\'est produite. Veuillez réessayer.',
        or: 'ou',
        noAccount: 'Pas de compte ? Inscrivez-vous',
        hasAccount: 'Déjà un compte ? Connectez-vous',
        features: {
          wallet: {
            title: 'Portefeuille Sécurisé',
            description: 'Votre portefeuille crypto avec sécurité bancaire'
          },
          voice: {
            title: 'Commandes Vocales',
            description: 'Envoyez des paiements avec des commandes vocales naturelles'
          },
          security: {
            title: 'Sécurité Blockchain',
            description: 'Protégé par la technologie blockchain Algorand'
          },
          global: {
            title: 'Portée Mondiale',
            description: 'Envoyez de l\'argent partout dans le monde instantanément'
          },
          instant: {
            title: 'Paiements Instantanés',
            description: 'Transactions ultra-rapides en secondes'
          },
          investment: {
            title: 'Investissement Intelligent',
            description: 'Faites fructifier votre patrimoine avec l\'investissement automatisé'
          }
        }
      },
      common: {
        loading: 'Chargement...',
        language: 'Langue',
        logout: 'Se Déconnecter'
      },
      nav: {
        dashboard: 'Tableau de bord',
        sendPayment: 'Envoyer un paiement',
        receive: 'Recevoir',
        history: 'Historique',
        invest: 'Investir',
        wallet: 'Portefeuille',
        voiceCommands: 'Commandes vocales',
        aiAssistant: 'Assistant IA',
        settings: 'Paramètres'
      }
    }
  },

  // Portuguese (Brazil & Lusophone Africa)
  pt: {
    translation: {
      auth: {
        appName: 'VoicePay',
        title: 'VoicePay',
        subtitle: 'Envie e receba pagamentos com sua voz',
        tagline: 'O futuro dos pagamentos por voz',
        getStarted: 'Começar',
        description: 'Crie uma conta ou faça login para começar a usar o VoicePay',
        loginDescription: 'Bem-vindo de volta! Por favor, faça login em sua conta.',
        signupDescription: 'Crie sua conta para começar com o VoicePay.',
        signIn: 'Entrar',
        signUp: 'Cadastrar',
        email: 'Email',
        password: 'Senha',
        confirmPassword: 'Confirmar Senha',
        fullName: 'Nome Completo',
        emailPlaceholder: 'Digite seu email',
        passwordPlaceholder: 'Digite sua senha',
        confirmPasswordPlaceholder: 'Confirme sua senha',
        fullNamePlaceholder: 'Digite seu nome completo',
        createAccount: 'Criar Conta',
        welcomeBack: 'Bem-vindo de volta!',
        accountCreated: 'Conta criada! Verifique seu email para confirmar.',
        loginSuccess: 'Login realizado com sucesso!',
        signupSuccess: 'Conta criada com sucesso!',
        passwordMismatch: 'As senhas não coincidem',
        error: 'Ocorreu um erro. Tente novamente.',
        or: 'ou',
        noAccount: 'Não tem conta? Cadastre-se',
        hasAccount: 'Já tem conta? Faça login',
        features: {
          wallet: {
            title: 'Carteira Segura',
            description: 'Sua carteira cripto com segurança bancária'
          },
          voice: {
            title: 'Comandos de Voz',
            description: 'Envie pagamentos usando comandos de voz naturais'
          },
          security: {
            title: 'Segurança Blockchain',
            description: 'Protegido pela tecnologia blockchain Algorand'
          },
          global: {
            title: 'Alcance Global',
            description: 'Envie dinheiro para qualquer lugar do mundo instantaneamente'
          },
          instant: {
            title: 'Pagamentos Instantâneos',
            description: 'Transações ultrarrápidas em segundos'
          },
          investment: {
            title: 'Investimento Inteligente',
            description: 'Faça seu patrimônio crescer com investimento automatizado'
          }
        }
      },
      common: {
        loading: 'Carregando...',
        language: 'Idioma',
        logout: 'Sair'
      },
      nav: {
        dashboard: 'Painel',
        sendPayment: 'Enviar Pagamento',
        receive: 'Receber',
        history: 'Histórico',
        invest: 'Investir',
        wallet: 'Carteira',
        voiceCommands: 'Comandos de Voz',
        aiAssistant: 'Assistente IA',
        settings: 'Configurações'
      }
    }
  },

  // Arabic (Middle East & North Africa)
  ar: {
    translation: {
      auth: {
        appName: 'VoicePay',
        title: 'VoicePay',
        subtitle: 'أرسل واستقبل المدفوعات بصوتك',
        tagline: 'مستقبل المدفوعات الصوتية',
        getStarted: 'ابدأ',
        description: 'أنشئ حساباً أو سجل دخولك لبدء استخدام VoicePay',
        loginDescription: 'مرحباً بعودتك! يرجى تسجيل الدخول إلى حسابك.',
        signupDescription: 'أنشئ حسابك للبدء مع VoicePay.',
        signIn: 'تسجيل الدخول',
        signUp: 'إنشاء حساب',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        confirmPassword: 'تأكيد كلمة المرور',
        fullName: 'الاسم الكامل',
        emailPlaceholder: 'أدخل بريدك الإلكتروني',
        passwordPlaceholder: 'أدخل كلمة المرور',
        confirmPasswordPlaceholder: 'أكد كلمة المرور',
        fullNamePlaceholder: 'أدخل اسمك الكامل',
        createAccount: 'إنشاء حساب',
        welcomeBack: 'مرحباً بعودتك!',
        accountCreated: 'تم إنشاء الحساب! تحقق من بريدك الإلكتروني للتأكيد.',
        loginSuccess: 'تم تسجيل الدخول بنجاح!',
        signupSuccess: 'تم إنشاء الحساب بنجاح!',
        passwordMismatch: 'كلمات المرور غير متطابقة',
        error: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
        or: 'أو',
        noAccount: 'ليس لديك حساب؟ سجل الآن',
        hasAccount: 'لديك حساب بالفعل؟ سجل دخولك',
        features: {
          wallet: {
            title: 'محفظة آمنة',
            description: 'محفظتك الرقمية بأمان مصرفي'
          },
          voice: {
            title: 'الأوامر الصوتية',
            description: 'أرسل المدفوعات باستخدام أوامر صوتية طبيعية'
          },
          security: {
            title: 'أمان البلوك تشين',
            description: 'محمي بتقنية البلوك تشين من Algorand'
          },
          global: {
            title: 'وصول عالمي',
            description: 'أرسل الأموال إلى أي مكان في العالم فوراً'
          },
          instant: {
            title: 'مدفوعات فورية',
            description: 'معاملات فائقة السرعة في ثوانٍ'
          },
          investment: {
            title: 'استثمار ذكي',
            description: 'نمِّ ثروتك بالاستثمار الآلي'
          }
        }
      },
      common: {
        loading: 'جاري التحميل...',
        language: 'اللغة',
        logout: 'تسجيل الخروج'
      }
    }
  },

  // Swahili (East Africa)
  sw: {
    translation: {
      auth: {
        appName: 'VoicePay',
        title: 'VoicePay',
        subtitle: 'Tuma na pokea malipo kwa sauti yako',
        tagline: 'Mustakabali wa malipo ya sauti',
        getStarted: 'Anza',
        description: 'Fungua akaunti au ingia ili kuanza kutumia VoicePay',
        loginDescription: 'Karibu tena! Tafadhali ingia kwenye akaunti yako.',
        signupDescription: 'Fungua akaunti yako ili kuanza na VoicePay.',
        signIn: 'Ingia',
        signUp: 'Jisajili',
        email: 'Barua pepe',
        password: 'Nenosiri',
        confirmPassword: 'Thibitisha Nenosiri',
        fullName: 'Jina kamili',
        emailPlaceholder: 'Ingiza barua pepe yako',
        passwordPlaceholder: 'Ingiza nenosiri lako',
        confirmPasswordPlaceholder: 'Thibitisha nenosiri lako',
        fullNamePlaceholder: 'Ingiza jina lako kamili',
        createAccount: 'Fungua Akaunti',
        welcomeBack: 'Karibu tena!',
        accountCreated: 'Akaunti imetengenezwa! Angalia barua pepe yako ili kuthibitisha.',
        loginSuccess: 'Umeingia kwa mafanikio!',
        signupSuccess: 'Akaunti imetengenezwa kwa mafanikio!',
        passwordMismatch: 'Nenosiri hazifanani',
        error: 'Hitilafu imetokea. Tafadhali jaribu tena.',
        or: 'au',
        noAccount: 'Huna akaunti? Jisajili',
        hasAccount: 'Una akaunti tayari? Ingia',
        features: {
          wallet: {
            title: 'Mkoba Salama',
            description: 'Mkoba wako wa kripto na usalama wa benki'
          },
          voice: {
            title: 'Amri za Sauti',
            description: 'Tuma malipo kwa kutumia amri za sauti za asili'
          },
          security: {
            title: 'Usalama wa Blockchain',
            description: 'Umelindwa na teknolojia ya blockchain ya Algorand'
          },
          global: {
            title: 'Ufikio wa Kimataifa',
            description: 'Tuma pesa popote duniani papo hapo'
          },
          instant: {
            title: 'Malipo ya Haraka',
            description: 'Miamala ya kasi sana kwa sekunde'
          },
          investment: {
            title: 'Uwekezaji Mahiri',
            description: 'Ongeza utajiri wako kwa uwekezaji wa kiotomatiki'
          }
        }
      },
      common: {
        loading: 'Inapakia...',
        language: 'Lugha',
        logout: 'Toka'
      }
    }
  },

  // Chinese Simplified (China)
  zh: {
    translation: {
      auth: {
        appName: 'VoicePay',
        title: 'VoicePay',
        subtitle: '用您的声音发送和接收付款',
        tagline: '语音支付的未来',
        getStarted: '开始使用',
        description: '创建账户或登录以开始使用VoicePay',
        loginDescription: '欢迎回来！请登录您的账户。',
        signupDescription: '创建您的账户以开始使用VoicePay。',
        signIn: '登录',
        signUp: '注册',
        email: '邮箱',
        password: '密码',
        confirmPassword: '确认密码',
        fullName: '全名',
        emailPlaceholder: '输入您的邮箱',
        passwordPlaceholder: '输入您的密码',
        confirmPasswordPlaceholder: '确认您的密码',
        fullNamePlaceholder: '输入您的全名',
        createAccount: '创建账户',
        welcomeBack: '欢迎回来！',
        accountCreated: '账户已创建！请检查您的邮箱进行验证。',
        loginSuccess: '登录成功！',
        signupSuccess: '账户创建成功！',
        passwordMismatch: '密码不匹配',
        error: '发生错误，请重试。',
        or: '或',
        noAccount: '没有账户？立即注册',
        hasAccount: '已有账户？立即登录',
        features: {
          wallet: {
            title: '安全钱包',
            description: '您的加密钱包具有银行级安全性'
          },
          voice: {
            title: '语音命令',
            description: '使用自然语音命令发送付款'
          },
          security: {
            title: '区块链安全',
            description: '受Algorand区块链技术保护'
          },
          global: {
            title: '全球覆盖',
            description: '即时向世界任何地方汇款'
          },
          instant: {
            title: '即时支付',
            description: '秒级超快交易'
          },
          investment: {
            title: '智能投资',
            description: '通过自动投资增长您的财富'
          }
        }
      },
      common: {
        loading: '加载中...',
        language: '语言',
        logout: '退出登录'
      }
    }
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  })

export default i18n