export type AuthTranslationKey =
  | "login.welcomeBack"
  | "login.heroTitle"
  | "login.heroDescription"
  | "login.sideNote"
  | "login.account"
  | "login.title"
  | "login.description"
  | "login.email"
  | "login.emailPlaceholder"
  | "login.password"
  | "login.passwordPlaceholder"
  | "login.submit"
  | "login.submitting"
  | "login.newUser"
  | "login.createAccount"
  | "login.failed"
  | "register.start"
  | "register.heroTitle"
  | "register.heroDescription"
  | "register.sideNote"
  | "register.space"
  | "register.title"
  | "register.description"
  | "register.fullName"
  | "register.fullNamePlaceholder"
  | "register.email"
  | "register.emailPlaceholder"
  | "register.password"
  | "register.passwordPlaceholder"
  | "register.confirmPassword"
  | "register.confirmPasswordPlaceholder"
  | "register.submit"
  | "register.submitting"
  | "register.existingUser"
  | "register.signIn"
  | "register.passwordMismatch"
  | "register.passwordLength"
  | "register.failed"
  | "register.createdSignIn"
  | "common.tryAgain"
  | "logout.button"
  | "logout.loading";


type AuthDictionary =
  Record<AuthTranslationKey, string>;


const english: AuthDictionary = {
  "login.welcomeBack":
    "Welcome back",

  "login.heroTitle":
    "Your wellbeing tools, all in one place.",

  "login.heroDescription":
    "Plan your day, manage difficult moments and build routines that work with your brain.",

  "login.sideNote":
    "Designed for different minds, needs and ways of working.",

  "login.account":
    "Aksess account",

  "login.title":
    "Sign in",

  "login.description":
    "Enter your account details to continue.",

  "login.email":
    "Email address",

  "login.emailPlaceholder":
    "you@example.com",

  "login.password":
    "Password",

  "login.passwordPlaceholder":
    "Enter your password",

  "login.submit":
    "Sign in",

  "login.submitting":
    "Signing in...",

  "login.newUser":
    "New to Aksess?",

  "login.createAccount":
    "Create an account",

  "login.failed":
    "Login failed.",

  "register.start":
    "Start with Aksess",

  "register.heroTitle":
    "Support that adapts to you.",

  "register.heroDescription":
    "Create a calm, accessible space for planning, focus, reflection and everyday wellbeing.",

  "register.sideNote":
    "You control how Aksess looks, feels and supports you.",

  "register.space":
    "Create your space",

  "register.title":
    "Create an account",

  "register.description":
    "Set up your account to begin personalising your experience.",

  "register.fullName":
    "Full name",

  "register.fullNamePlaceholder":
    "Your full name",

  "register.email":
    "Email address",

  "register.emailPlaceholder":
    "you@example.com",

  "register.password":
    "Password",

  "register.passwordPlaceholder":
    "At least 8 characters",

  "register.confirmPassword":
    "Confirm password",

  "register.confirmPasswordPlaceholder":
    "Enter the password again",

  "register.submit":
    "Create account",

  "register.submitting":
    "Creating account...",

  "register.existingUser":
    "Already have an account?",

  "register.signIn":
    "Sign in",

  "register.passwordMismatch":
    "Passwords do not match.",

  "register.passwordLength":
    "Password must contain at least 8 characters.",

  "register.failed":
    "Registration failed.",

  "register.createdSignIn":
    "Account created. Please sign in.",

  "common.tryAgain":
    "Something went wrong. Please try again.",

  "logout.button":
    "Sign out",

  "logout.loading":
    "Signing out...",
};


const tamil: AuthDictionary = {
  "login.welcomeBack":
    "மீண்டும் வரவேற்கிறோம்",

  "login.heroTitle":
    "உங்கள் நலவாழ்வு கருவிகள் அனைத்தும் ஒரே இடத்தில்.",

  "login.heroDescription":
    "உங்கள் நாளைத் திட்டமிடுங்கள், கடினமான தருணங்களை நிர்வகியுங்கள் மற்றும் உங்களுக்கு ஏற்ற நடைமுறைகளை உருவாக்குங்கள்.",

  "login.sideNote":
    "பல்வேறு சிந்தனை முறைகள், தேவைகள் மற்றும் வேலை செய்யும் வழிகளுக்காக வடிவமைக்கப்பட்டது.",

  "login.account":
    "Aksess கணக்கு",

  "login.title":
    "உள்நுழைக",

  "login.description":
    "தொடர உங்கள் கணக்கு விவரங்களை உள்ளிடுங்கள்.",

  "login.email":
    "மின்னஞ்சல் முகவரி",

  "login.emailPlaceholder":
    "you@example.com",

  "login.password":
    "கடவுச்சொல்",

  "login.passwordPlaceholder":
    "உங்கள் கடவுச்சொல்லை உள்ளிடுங்கள்",

  "login.submit":
    "உள்நுழைக",

  "login.submitting":
    "உள்நுழைகிறது...",

  "login.newUser":
    "Aksess-க்கு புதியவரா?",

  "login.createAccount":
    "கணக்கை உருவாக்குங்கள்",

  "login.failed":
    "உள்நுழைவு தோல்வியடைந்தது.",

  "register.start":
    "Aksess உடன் தொடங்குங்கள்",

  "register.heroTitle":
    "உங்களுக்கு ஏற்ப மாறும் ஆதரவு.",

  "register.heroDescription":
    "திட்டமிடல், கவனம், சிந்தனை மற்றும் தினசரி நலவாழ்விற்கான அமைதியான அணுகக்கூடிய இடத்தை உருவாக்குங்கள்.",

  "register.sideNote":
    "Aksess எப்படி தோன்ற வேண்டும் மற்றும் உங்களை எப்படி ஆதரிக்க வேண்டும் என்பதை நீங்கள் கட்டுப்படுத்துகிறீர்கள்.",

  "register.space":
    "உங்கள் இடத்தை உருவாக்குங்கள்",

  "register.title":
    "கணக்கை உருவாக்குங்கள்",

  "register.description":
    "உங்கள் அனுபவத்தைத் தனிப்பயனாக்க கணக்கை அமைக்கவும்.",

  "register.fullName":
    "முழுப் பெயர்",

  "register.fullNamePlaceholder":
    "உங்கள் முழுப் பெயர்",

  "register.email":
    "மின்னஞ்சல் முகவரி",

  "register.emailPlaceholder":
    "you@example.com",

  "register.password":
    "கடவுச்சொல்",

  "register.passwordPlaceholder":
    "குறைந்தது 8 எழுத்துகள்",

  "register.confirmPassword":
    "கடவுச்சொல்லை உறுதிப்படுத்துங்கள்",

  "register.confirmPasswordPlaceholder":
    "கடவுச்சொல்லை மீண்டும் உள்ளிடுங்கள்",

  "register.submit":
    "கணக்கை உருவாக்குங்கள்",

  "register.submitting":
    "கணக்கு உருவாக்கப்படுகிறது...",

  "register.existingUser":
    "ஏற்கனவே கணக்கு உள்ளதா?",

  "register.signIn":
    "உள்நுழைக",

  "register.passwordMismatch":
    "கடவுச்சொற்கள் பொருந்தவில்லை.",

  "register.passwordLength":
    "கடவுச்சொல் குறைந்தது 8 எழுத்துகளைக் கொண்டிருக்க வேண்டும்.",

  "register.failed":
    "பதிவு தோல்வியடைந்தது.",

  "register.createdSignIn":
    "கணக்கு உருவாக்கப்பட்டது. உள்நுழையுங்கள்.",

  "common.tryAgain":
    "ஏதோ தவறு ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.",

  "logout.button":
    "வெளியேறு",

  "logout.loading":
    "வெளியேறுகிறது...",
};


const hindi: AuthDictionary = {
  "login.welcomeBack":
    "वापसी पर स्वागत है",

  "login.heroTitle":
    "आपके सभी वेलबीइंग टूल एक ही स्थान पर।",

  "login.heroDescription":
    "अपने दिन की योजना बनाएं, कठिन क्षणों को संभालें और अपने लिए उपयोगी दिनचर्या बनाएं।",

  "login.sideNote":
    "अलग-अलग सोच, जरूरतों और काम करने के तरीकों के लिए बनाया गया।",

  "login.account":
    "Aksess खाता",

  "login.title":
    "साइन इन करें",

  "login.description":
    "जारी रखने के लिए अपने खाते का विवरण दर्ज करें।",

  "login.email":
    "ईमेल पता",

  "login.emailPlaceholder":
    "you@example.com",

  "login.password":
    "पासवर्ड",

  "login.passwordPlaceholder":
    "अपना पासवर्ड दर्ज करें",

  "login.submit":
    "साइन इन करें",

  "login.submitting":
    "साइन इन हो रहा है...",

  "login.newUser":
    "Aksess पर नए हैं?",

  "login.createAccount":
    "खाता बनाएं",

  "login.failed":
    "साइन इन विफल रहा।",

  "register.start":
    "Aksess के साथ शुरुआत करें",

  "register.heroTitle":
    "सहायता जो आपके अनुसार बदलती है।",

  "register.heroDescription":
    "योजना, फोकस, चिंतन और दैनिक वेलबीइंग के लिए शांत और सुगम स्थान बनाएं।",

  "register.sideNote":
    "Aksess कैसा दिखे और आपकी सहायता कैसे करे, यह आप नियंत्रित करते हैं।",

  "register.space":
    "अपना स्थान बनाएं",

  "register.title":
    "खाता बनाएं",

  "register.description":
    "अपने अनुभव को व्यक्तिगत बनाने के लिए खाता सेट करें।",

  "register.fullName":
    "पूरा नाम",

  "register.fullNamePlaceholder":
    "आपका पूरा नाम",

  "register.email":
    "ईमेल पता",

  "register.emailPlaceholder":
    "you@example.com",

  "register.password":
    "पासवर्ड",

  "register.passwordPlaceholder":
    "कम से कम 8 अक्षर",

  "register.confirmPassword":
    "पासवर्ड की पुष्टि करें",

  "register.confirmPasswordPlaceholder":
    "पासवर्ड फिर से दर्ज करें",

  "register.submit":
    "खाता बनाएं",

  "register.submitting":
    "खाता बनाया जा रहा है...",

  "register.existingUser":
    "पहले से खाता है?",

  "register.signIn":
    "साइन इन करें",

  "register.passwordMismatch":
    "पासवर्ड मेल नहीं खाते।",

  "register.passwordLength":
    "पासवर्ड में कम से कम 8 अक्षर होने चाहिए।",

  "register.failed":
    "पंजीकरण विफल रहा।",

  "register.createdSignIn":
    "खाता बन गया। कृपया साइन इन करें।",

  "common.tryAgain":
    "कुछ गलत हुआ। कृपया फिर से प्रयास करें।",

  "logout.button":
    "साइन आउट करें",

  "logout.loading":
    "साइन आउट हो रहा है...",
};


const arabic: AuthDictionary = {
  "login.welcomeBack":
    "مرحبًا بعودتك",

  "login.heroTitle":
    "أدوات العافية الخاصة بك في مكان واحد.",

  "login.heroDescription":
    "خطط ليومك، وتعامل مع اللحظات الصعبة، وابنِ روتينًا يناسب طريقة تفكيرك.",

  "login.sideNote":
    "مصمم لطرق تفكير واحتياجات وأساليب عمل مختلفة.",

  "login.account":
    "حساب Aksess",

  "login.title":
    "تسجيل الدخول",

  "login.description":
    "أدخل تفاصيل حسابك للمتابعة.",

  "login.email":
    "عنوان البريد الإلكتروني",

  "login.emailPlaceholder":
    "you@example.com",

  "login.password":
    "كلمة المرور",

  "login.passwordPlaceholder":
    "أدخل كلمة المرور",

  "login.submit":
    "تسجيل الدخول",

  "login.submitting":
    "جارٍ تسجيل الدخول...",

  "login.newUser":
    "جديد في Aksess؟",

  "login.createAccount":
    "إنشاء حساب",

  "login.failed":
    "فشل تسجيل الدخول.",

  "register.start":
    "ابدأ مع Aksess",

  "register.heroTitle":
    "دعم يتكيف معك.",

  "register.heroDescription":
    "أنشئ مساحة هادئة وسهلة الوصول للتخطيط والتركيز والتأمل والعافية اليومية.",

  "register.sideNote":
    "أنت تتحكم في شكل Aksess وطريقة دعمه لك.",

  "register.space":
    "أنشئ مساحتك",

  "register.title":
    "إنشاء حساب",

  "register.description":
    "أنشئ حسابك لتبدأ في تخصيص تجربتك.",

  "register.fullName":
    "الاسم الكامل",

  "register.fullNamePlaceholder":
    "اسمك الكامل",

  "register.email":
    "عنوان البريد الإلكتروني",

  "register.emailPlaceholder":
    "you@example.com",

  "register.password":
    "كلمة المرور",

  "register.passwordPlaceholder":
    "8 أحرف على الأقل",

  "register.confirmPassword":
    "تأكيد كلمة المرور",

  "register.confirmPasswordPlaceholder":
    "أدخل كلمة المرور مرة أخرى",

  "register.submit":
    "إنشاء حساب",

  "register.submitting":
    "جارٍ إنشاء الحساب...",

  "register.existingUser":
    "لديك حساب بالفعل؟",

  "register.signIn":
    "تسجيل الدخول",

  "register.passwordMismatch":
    "كلمتا المرور غير متطابقتين.",

  "register.passwordLength":
    "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.",

  "register.failed":
    "فشل إنشاء الحساب.",

  "register.createdSignIn":
    "تم إنشاء الحساب. يرجى تسجيل الدخول.",

  "common.tryAgain":
    "حدث خطأ. يرجى المحاولة مرة أخرى.",

  "logout.button":
    "تسجيل الخروج",

  "logout.loading":
    "جارٍ تسجيل الخروج...",
};


const dictionaries:
  Record<string, AuthDictionary> = {
    en: english,
    ta: tamil,
    hi: hindi,
    ar: arabic,
  };


export function authText(
  locale: string,
  key: AuthTranslationKey,
): string {
  const language =
    locale
      .split("-")[0]
      .toLowerCase();

  return (
    dictionaries[language]?.[key]
    ?? english[key]
  );
}
