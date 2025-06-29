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
        title: 'VoicePay',
        subtitle: 'Send and receive payments with your voice',
        getStarted: 'Get Started',
        description: 'Create an account or sign in to start using VoicePay',
        signIn: 'Sign In',
        signUp: 'Sign Up',
        email: 'Email',
        password: 'Password',
        fullName: 'Full Name',
        enterEmail: 'Enter your email',
        enterPassword: 'Enter your password',
        createPassword: 'Create a password',
        enterFullName: 'Enter your full name',
        createAccount: 'Create Account',
        features: 'Voice commands • QR codes • Multi-channel payments',
        welcomeBack: 'Welcome back!',
        accountCreated: 'Account created! Check your email to verify.',
        forgotPassword: 'Forgot Password?',
        noAccount: "Don't have an account?",
        haveAccount: 'Already have an account?',
        signUpLink: 'Sign up',
        signInLink: 'Sign in',
        orContinueWith: 'Or continue with',
        google: 'Google',
        apple: 'Apple',
        microsoft: 'Microsoft',
        termsAndPrivacy: 'By continuing, you agree to our Terms of Service and Privacy Policy',
        secureLogin: 'Secure Login',
        encryptedData: 'Your data is encrypted and secure',
        multiLanguage: 'Multi-language Support',
        voiceCommands: 'Voice Commands',
        blockchainSecure: 'Blockchain Secure',
        instantPayments: 'Instant Payments'
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
        title: 'VoicePay',
        subtitle: 'Envía y recibe pagos con tu voz',
        getStarted: 'Comenzar',
        description: 'Crea una cuenta o inicia sesión para comenzar a usar VoicePay',
        signIn: 'Iniciar Sesión',
        signUp: 'Registrarse',
        email: 'Correo Electrónico',
        password: 'Contraseña',
        fullName: 'Nombre Completo',
        enterEmail: 'Ingresa tu correo electrónico',
        enterPassword: 'Ingresa tu contraseña',
        createPassword: 'Crea una contraseña',
        enterFullName: 'Ingresa tu nombre completo',
        createAccount: 'Crear Cuenta',
        features: 'Comandos de voz • Códigos QR • Pagos multicanal',
        welcomeBack: '¡Bienvenido de vuelta!',
        accountCreated: '¡Cuenta creada! Revisa tu correo para verificar.',
        orContinueWith: 'O continúa con',
        termsAndPrivacy: 'Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad',
        voiceCommands: 'Comandos de Voz',
        blockchainSecure: 'Seguridad Blockchain',
        instantPayments: 'Pagos Instantáneos',
        multiLanguage: 'Soporte Multiidioma',
        encryptedData: 'Tus datos están encriptados y seguros'
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
        title: 'VoicePay',
        subtitle: 'Envoyez et recevez des paiements avec votre voix',
        getStarted: 'Commencer',
        description: 'Créez un compte ou connectez-vous pour commencer à utiliser VoicePay',
        signIn: 'Se Connecter',
        signUp: "S'inscrire",
        email: 'Email',
        password: 'Mot de passe',
        fullName: 'Nom complet',
        enterEmail: 'Entrez votre email',
        enterPassword: 'Entrez votre mot de passe',
        createPassword: 'Créez un mot de passe',
        enterFullName: 'Entrez votre nom complet',
        createAccount: 'Créer un compte',
        features: 'Commandes vocales • Codes QR • Paiements multi-canaux',
        welcomeBack: 'Bon retour !',
        accountCreated: 'Compte créé ! Vérifiez votre email pour confirmer.',
        orContinueWith: 'Ou continuer avec',
        termsAndPrivacy: 'En continuant, vous acceptez nos Conditions de Service et Politique de Confidentialité',
        voiceCommands: 'Commandes Vocales',
        blockchainSecure: 'Sécurité Blockchain',
        instantPayments: 'Paiements Instantanés',
        multiLanguage: 'Support Multilingue',
        encryptedData: 'Vos données sont cryptées et sécurisées'
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
        title: 'VoicePay',
        subtitle: 'Envie e receba pagamentos com sua voz',
        getStarted: 'Começar',
        description: 'Crie uma conta ou faça login para começar a usar o VoicePay',
        signIn: 'Entrar',
        signUp: 'Cadastrar',
        email: 'Email',
        password: 'Senha',
        fullName: 'Nome Completo',
        enterEmail: 'Digite seu email',
        enterPassword: 'Digite sua senha',
        createPassword: 'Crie uma senha',
        enterFullName: 'Digite seu nome completo',
        createAccount: 'Criar Conta',
        features: 'Comandos de voz • Códigos QR • Pagamentos multicanal',
        welcomeBack: 'Bem-vindo de volta!',
        accountCreated: 'Conta criada! Verifique seu email para confirmar.',
        orContinueWith: 'Ou continue com',
        termsAndPrivacy: 'Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade',
        voiceCommands: 'Comandos de Voz',
        blockchainSecure: 'Segurança Blockchain',
        instantPayments: 'Pagamentos Instantâneos',
        multiLanguage: 'Suporte Multilíngue',
        encryptedData: 'Seus dados são criptografados e seguros'
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
        title: 'VoicePay',
        subtitle: 'أرسل واستقبل المدفوعات بصوتك',
        getStarted: 'ابدأ',
        description: 'أنشئ حساباً أو سجل دخولك لبدء استخدام VoicePay',
        signIn: 'تسجيل الدخول',
        signUp: 'إنشاء حساب',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        fullName: 'الاسم الكامل',
        enterEmail: 'أدخل بريدك الإلكتروني',
        enterPassword: 'أدخل كلمة المرور',
        createPassword: 'أنشئ كلمة مرور',
        enterFullName: 'أدخل اسمك الكامل',
        createAccount: 'إنشاء حساب',
        features: 'أوامر صوتية • رموز QR • مدفوعات متعددة القنوات',
        welcomeBack: 'مرحباً بعودتك!',
        accountCreated: 'تم إنشاء الحساب! تحقق من بريدك الإلكتروني للتأكيد.',
        orContinueWith: 'أو تابع مع',
        termsAndPrivacy: 'بالمتابعة، أنت توافق على شروط الخدمة وسياسة الخصوصية',
        voiceCommands: 'الأوامر الصوتية',
        blockchainSecure: 'أمان البلوك تشين',
        instantPayments: 'مدفوعات فورية',
        multiLanguage: 'دعم متعدد اللغات',
        encryptedData: 'بياناتك مشفرة وآمنة'
      },
      common: {
        loading: 'جاري التحميل...',
        language: 'اللغة',
        logout: 'تسجيل الخروج'
      },
      nav: {
        dashboard: 'لوحة التحكم',
        sendPayment: 'إرسال دفعة',
        receive: 'استقبال',
        history: 'التاريخ',
        invest: 'استثمار',
        wallet: 'المحفظة',
        voiceCommands: 'الأوامر الصوتية',
        aiAssistant: 'المساعد الذكي',
        settings: 'الإعدادات'
      }
    }
  },

  // Swahili (East Africa)
  sw: {
    translation: {
      auth: {
        title: 'VoicePay',
        subtitle: 'Tuma na pokea malipo kwa sauti yako',
        getStarted: 'Anza',
        description: 'Fungua akaunti au ingia ili kuanza kutumia VoicePay',
        signIn: 'Ingia',
        signUp: 'Jisajili',
        email: 'Barua pepe',
        password: 'Nenosiri',
        fullName: 'Jina kamili',
        enterEmail: 'Ingiza barua pepe yako',
        enterPassword: 'Ingiza nenosiri lako',
        createPassword: 'Tengeneza nenosiri',
        enterFullName: 'Ingiza jina lako kamili',
        createAccount: 'Fungua Akaunti',
        features: 'Amri za sauti • Misimbo ya QR • Malipo ya njia nyingi',
        welcomeBack: 'Karibu tena!',
        accountCreated: 'Akaunti imetengenezwa! Angalia barua pepe yako ili kuthibitisha.',
        orContinueWith: 'Au endelea na',
        termsAndPrivacy: 'Kwa kuendelea, unakubali Masharti yetu ya Huduma na Sera ya Faragha',
        voiceCommands: 'Amri za Sauti',
        blockchainSecure: 'Usalama wa Blockchain',
        instantPayments: 'Malipo ya Haraka',
        multiLanguage: 'Msaada wa Lugha Nyingi',
        encryptedData: 'Data yako imefichwa na ni salama'
      },
      common: {
        loading: 'Inapakia...',
        language: 'Lugha',
        logout: 'Toka'
      },
      nav: {
        dashboard: 'Dashibodi',
        sendPayment: 'Tuma Malipo',
        receive: 'Pokea',
        history: 'Historia',
        invest: 'Wekeza',
        wallet: 'Mkoba',
        voiceCommands: 'Amri za Sauti',
        aiAssistant: 'Msaidizi wa AI',
        settings: 'Mipangilio'
      }
    }
  },

  // Hausa (West Africa)
  ha: {
    translation: {
      auth: {
        title: 'VoicePay',
        subtitle: 'Aika da karɓar kuɗi da muryar ku',
        getStarted: 'Fara',
        description: 'Ƙirƙiri asusun ko shiga don fara amfani da VoicePay',
        signIn: 'Shiga',
        signUp: 'Yi rajista',
        email: 'Imel',
        password: 'Kalmar sirri',
        fullName: 'Cikakken suna',
        enterEmail: 'Shigar da imel ɗin ku',
        enterPassword: 'Shigar da kalmar sirrin ku',
        createPassword: 'Ƙirƙiri kalmar sirri',
        enterFullName: 'Shigar da cikakken sunan ku',
        createAccount: 'Ƙirƙiri Asusun',
        features: 'Umarnin murya • Lambobin QR • Biyan kuɗi ta hanyoyi daban-daban',
        welcomeBack: 'Barka da dawowa!',
        accountCreated: 'An ƙirƙiri asusun! Duba imel ɗin ku don tabbatarwa.',
        orContinueWith: 'Ko ci gaba da',
        termsAndPrivacy: 'Ta hanyar ci gaba, kun yarda da Sharuɗɗan Sabis ɗinmu da Manufar Sirri',
        voiceCommands: 'Umarnin Murya',
        blockchainSecure: 'Tsaron Blockchain',
        instantPayments: 'Biyan Kuɗi nan take',
        multiLanguage: 'Goyan bayan Harsuna da yawa',
        encryptedData: 'Bayanan ku an ɓoye kuma suna da aminci'
      },
      common: {
        loading: 'Ana lodawa...',
        language: 'Harshe',
        logout: 'Fita'
      }
    }
  },

  // Yoruba (West Africa)
  yo: {
    translation: {
      auth: {
        title: 'VoicePay',
        subtitle: 'Fi ohùn rẹ ránṣẹ́ àti gbà owó',
        getStarted: 'Bẹ̀rẹ̀',
        description: 'Ṣẹ̀dá àkáǹtì tàbí wọlé láti bẹ̀rẹ̀ lílo VoicePay',
        signIn: 'Wọlé',
        signUp: 'Forúkọsílẹ̀',
        email: 'Ímeèlì',
        password: 'Ọ̀rọ̀ aṣínà',
        fullName: 'Orúkọ kíkún',
        enterEmail: 'Tẹ ímeèlì rẹ sínú',
        enterPassword: 'Tẹ ọ̀rọ̀ aṣínà rẹ sínú',
        createPassword: 'Ṣẹ̀dá ọ̀rọ̀ aṣínà',
        enterFullName: 'Tẹ orúkọ kíkún rẹ sínú',
        createAccount: 'Ṣẹ̀dá Àkáǹtì',
        features: 'Àwọn àṣẹ ohùn • Àwọn kóòdù QR • Ìsanwó ọ̀nà púpọ̀',
        welcomeBack: 'Káàbọ̀ padà!',
        accountCreated: 'A ti ṣẹ̀dá àkáǹtì! Wo ímeèlì rẹ fún ìjẹ́rìísí.',
        orContinueWith: 'Tàbí tẹ̀síwájú pẹ̀lú',
        termsAndPrivacy: 'Nípa títẹ̀síwájú, o gbà àwọn Òfin Iṣẹ́ wa àti Ìlànà Àṣírí',
        voiceCommands: 'Àwọn Àṣẹ Ohùn',
        blockchainSecure: 'Àábo Blockchain',
        instantPayments: 'Ìsanwó Lẹ́sẹ̀kẹsẹ̀',
        multiLanguage: 'Àtìlẹ́yìn Èdè Púpọ̀',
        encryptedData: 'Dátà rẹ ti di ìkọ̀kọ̀ ó sì wà láàbò'
      },
      common: {
        loading: 'Ń gbé...',
        language: 'Èdè',
        logout: 'Jáde'
      }
    }
  },

  // Amharic (Ethiopia)
  am: {
    translation: {
      auth: {
        title: 'VoicePay',
        subtitle: 'በድምፅዎ ገንዘብ ይላኩ እና ይቀበሉ',
        getStarted: 'ይጀምሩ',
        description: 'VoicePay መጠቀም ለመጀመር መለያ ይፍጠሩ ወይም ይግቡ',
        signIn: 'ግባ',
        signUp: 'ይመዝገቡ',
        email: 'ኢሜል',
        password: 'የይለፍ ቃል',
        fullName: 'ሙሉ ስም',
        enterEmail: 'ኢሜልዎን ያስገቡ',
        enterPassword: 'የይለፍ ቃልዎን ያስገቡ',
        createPassword: 'የይለፍ ቃል ይፍጠሩ',
        enterFullName: 'ሙሉ ስምዎን ያስገቡ',
        createAccount: 'መለያ ይፍጠሩ',
        features: 'የድምፅ ትዕዛዞች • QR ኮዶች • ባለብዙ ቻናል ክፍያዎች',
        welcomeBack: 'እንኳን ደህና መጡ!',
        accountCreated: 'መለያ ተፈጥሯል! ለማረጋገጥ ኢሜልዎን ይመልከቱ።',
        orContinueWith: 'ወይም ይቀጥሉ በ',
        termsAndPrivacy: 'በመቀጠል የእኛን የአገልግሎት ውሎች እና የግላዊነት ፖሊሲ ይቀበላሉ',
        voiceCommands: 'የድምፅ ትዕዛዞች',
        blockchainSecure: 'የብሎክቼይን ደህንነት',
        instantPayments: 'ፈጣን ክፍያዎች',
        multiLanguage: 'ባለብዙ ቋንቋ ድጋፍ',
        encryptedData: 'መረጃዎ የተመሰጠረ እና ደህንነቱ የተጠበቀ ነው'
      },
      common: {
        loading: 'በመጫን ላይ...',
        language: 'ቋንቋ',
        logout: 'ውጣ'
      }
    }
  },

  // Hindi (India)
  hi: {
    translation: {
      auth: {
        title: 'VoicePay',
        subtitle: 'अपनी आवाज़ से पैसे भेजें और प्राप्त करें',
        getStarted: 'शुरू करें',
        description: 'VoicePay का उपयोग शुरू करने के लिए खाता बनाएं या साइन इन करें',
        signIn: 'साइन इन करें',
        signUp: 'साइन अप करें',
        email: 'ईमेल',
        password: 'पासवर्ड',
        fullName: 'पूरा नाम',
        enterEmail: 'अपना ईमेल दर्ज करें',
        enterPassword: 'अपना पासवर्ड दर्ज करें',
        createPassword: 'पासवर्ड बनाएं',
        enterFullName: 'अपना पूरा नाम दर्ज करें',
        createAccount: 'खाता बनाएं',
        features: 'आवाज़ कमांड • QR कोड • मल्टी-चैनल भुगतान',
        welcomeBack: 'वापसी पर स्वागत है!',
        accountCreated: 'खाता बनाया गया! सत्यापन के लिए अपना ईमेल जांचें।',
        orContinueWith: 'या जारी रखें',
        termsAndPrivacy: 'जारी रखकर, आप हमारी सेवा की शर्तों और गोपनीयता नीति से सहमत हैं',
        voiceCommands: 'आवाज़ कमांड',
        blockchainSecure: 'ब्लॉकचेन सुरक्षा',
        instantPayments: 'तत्काल भुगतान',
        multiLanguage: 'बहुभाषी समर्थन',
        encryptedData: 'आपका डेटा एन्क्रिप्टेड और सुरक्षित है'
      },
      common: {
        loading: 'लोड हो रहा है...',
        language: 'भाषा',
        logout: 'लॉग आउट'
      }
    }
  },

  // Chinese Simplified (China)
  zh: {
    translation: {
      auth: {
        title: 'VoicePay',
        subtitle: '用您的声音发送和接收付款',
        getStarted: '开始使用',
        description: '创建账户或登录以开始使用VoicePay',
        signIn: '登录',
        signUp: '注册',
        email: '邮箱',
        password: '密码',
        fullName: '全名',
        enterEmail: '输入您的邮箱',
        enterPassword: '输入您的密码',
        createPassword: '创建密码',
        enterFullName: '输入您的全名',
        createAccount: '创建账户',
        features: '语音命令 • 二维码 • 多渠道支付',
        welcomeBack: '欢迎回来！',
        accountCreated: '账户已创建！请检查您的邮箱进行验证。',
        orContinueWith: '或继续使用',
        termsAndPrivacy: '继续即表示您同意我们的服务条款和隐私政策',
        voiceCommands: '语音命令',
        blockchainSecure: '区块链安全',
        instantPayments: '即时支付',
        multiLanguage: '多语言支持',
        encryptedData: '您的数据已加密且安全'
      },
      common: {
        loading: '加载中...',
        language: '语言',
        logout: '退出登录'
      }
    }
  },

  // Russian (Russia & Eastern Europe)
  ru: {
    translation: {
      auth: {
        title: 'VoicePay',
        subtitle: 'Отправляйте и получайте платежи голосом',
        getStarted: 'Начать',
        description: 'Создайте аккаунт или войдите, чтобы начать использовать VoicePay',
        signIn: 'Войти',
        signUp: 'Регистрация',
        email: 'Электронная почта',
        password: 'Пароль',
        fullName: 'Полное имя',
        enterEmail: 'Введите вашу электронную почту',
        enterPassword: 'Введите ваш пароль',
        createPassword: 'Создайте пароль',
        enterFullName: 'Введите ваше полное имя',
        createAccount: 'Создать аккаунт',
        features: 'Голосовые команды • QR-коды • Многоканальные платежи',
        welcomeBack: 'Добро пожаловать обратно!',
        accountCreated: 'Аккаунт создан! Проверьте вашу электронную почту для подтверждения.',
        orContinueWith: 'Или продолжить с',
        termsAndPrivacy: 'Продолжая, вы соглашаетесь с нашими Условиями обслуживания и Политикой конфиденциальности',
        voiceCommands: 'Голосовые команды',
        blockchainSecure: 'Безопасность блокчейна',
        instantPayments: 'Мгновенные платежи',
        multiLanguage: 'Многоязычная поддержка',
        encryptedData: 'Ваши данные зашифрованы и защищены'
      },
      common: {
        loading: 'Загрузка...',
        language: 'Язык',
        logout: 'Выйти'
      }
    }
  },

  // Japanese (Japan)
  ja: {
    translation: {
      auth: {
        title: 'VoicePay',
        subtitle: '音声で支払いを送受信',
        getStarted: '始める',
        description: 'VoicePayの使用を開始するにはアカウントを作成するかサインインしてください',
        signIn: 'サインイン',
        signUp: 'サインアップ',
        email: 'メール',
        password: 'パスワード',
        fullName: 'フルネーム',
        enterEmail: 'メールアドレスを入力',
        enterPassword: 'パスワードを入力',
        createPassword: 'パスワードを作成',
        enterFullName: 'フルネームを入力',
        createAccount: 'アカウント作成',
        features: '音声コマンド • QRコード • マルチチャネル決済',
        welcomeBack: 'おかえりなさい！',
        accountCreated: 'アカウントが作成されました！確認のためメールをチェックしてください。',
        orContinueWith: 'または続行',
        termsAndPrivacy: '続行することで、利用規約とプライバシーポリシーに同意したものとみなされます',
        voiceCommands: '音声コマンド',
        blockchainSecure: 'ブロックチェーンセキュリティ',
        instantPayments: '即座の支払い',
        multiLanguage: '多言語サポート',
        encryptedData: 'あなたのデータは暗号化され安全です'
      },
      common: {
        loading: '読み込み中...',
        language: '言語',
        logout: 'ログアウト'
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