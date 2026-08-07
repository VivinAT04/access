export type TranslationKey =
  | "dashboard.space"
  | "dashboard.welcome"
  | "dashboard.description"
  | "dashboard.plan.title"
  | "dashboard.plan.description"
  | "dashboard.plan.action"
  | "dashboard.focus.title"
  | "dashboard.focus.description"
  | "dashboard.focus.action"
  | "dashboard.mood.title"
  | "dashboard.mood.description"
  | "dashboard.mood.action"
  | "dashboard.accessibility.title"
  | "dashboard.accessibility.description"
  | "dashboard.accessibility.action"
  | "dashboard.reflection.title"
  | "dashboard.reflection.description"
  | "dashboard.reflection.action"
  | "dashboard.anxiety.title"
  | "dashboard.anxiety.description"
  | "dashboard.anxiety.action"
  | "dashboard.quickCalm.title"
  | "dashboard.quickCalm.description"
  | "dashboard.quickCalm.action"
  | "dashboard.routines.title"
  | "dashboard.routines.description"
  | "dashboard.routines.action"
  | "dashboard.reminders.title"
  | "dashboard.reminders.description"
  | "dashboard.reminders.action"
  | "dashboard.companion.title"
  | "dashboard.companion.description"
  | "dashboard.companion.action"
  | "dashboard.sensory.title"
  | "dashboard.sensory.description"
  | "dashboard.sensory.action"
  | "dashboard.insights.title"
  | "dashboard.insights.description"
  | "dashboard.insights.action"
  | "dashboard.language.title"
  | "dashboard.language.description"
  | "dashboard.language.action"
  | "dashboard.account"
  | "dashboard.profile"
  | "dashboard.fullName"
  | "dashboard.email"
  | "dashboard.accountStatus"
  | "dashboard.emailVerification"
  | "dashboard.active"
  | "dashboard.inactive"
  | "dashboard.verified"
  | "dashboard.community.title"
  | "dashboard.community.description"
  | "dashboard.community.action"
  | "dashboard.notifications.title"
  | "dashboard.notifications.description"
  | "dashboard.notifications.action"
  | "dashboard.personalisation.title"
  | "dashboard.personalisation.description"
  | "dashboard.personalisation.action"
  | "dashboard.notVerified";


type TranslationDictionary =
  Record<TranslationKey, string>;


const english: TranslationDictionary = {
  "dashboard.space":
    "Your Aksess space",

  "dashboard.welcome":
    "Welcome, {name}.",

  "dashboard.description":
    "Your wellbeing dashboard is ready. Choose a tool that feels useful today.",

  "dashboard.plan.title":
    "Plan my day",

  "dashboard.plan.description":
    "Organise tasks into manageable, realistic steps.",

  "dashboard.plan.action":
    "Open task manager",

  "dashboard.focus.title":
    "Focus session",

  "dashboard.focus.description":
    "Create a calm environment for focused work.",

  "dashboard.focus.action":
    "Start focus",

  "dashboard.mood.title":
    "Mood check-in",

  "dashboard.mood.description":
    "Record how you feel without pressure or judgement.",

  "dashboard.mood.action":
    "Check in now",

  "dashboard.accessibility.title":
    "Accessibility",

  "dashboard.accessibility.description":
    "Personalise text, motion, contrast and sensory settings.",

  "dashboard.accessibility.action":
    "Open settings",

  "dashboard.reflection.title":
    "Daily reflection",

  "dashboard.reflection.description":
    "Notice one positive moment, one challenge and one accomplishment.",

  "dashboard.reflection.action":
    "Reflect on today",

  "dashboard.anxiety.title":
    "Calm and grounding",

  "dashboard.anxiety.description":
    "Use breathing, grounding and calming sounds during anxious or overwhelming moments.",

  "dashboard.anxiety.action":
    "Open calm tools",

  "dashboard.quickCalm.title":
    "Quick Calm",

  "dashboard.quickCalm.description":
    "Open a low-distraction calming screen in one step.",

  "dashboard.quickCalm.action":
    "Calm now",

  "dashboard.routines.title":
    "Daily routines",

  "dashboard.routines.description":
    "Build reusable morning, study, work and evening routines from manageable steps.",

  "dashboard.routines.action":
    "Open routines",

  "dashboard.reminders.title":
    "Reminders",

  "dashboard.reminders.description":
    "Set optional reminders for tasks, routines and important personal prompts.",

  "dashboard.reminders.action":
    "View reminders",

  "dashboard.companion.title":
    "Focus companion",

  "dashboard.companion.description":
    "Choose a gentle body-doubling companion that grows alongside your focused minutes.",

  "dashboard.companion.action":
    "Meet companion",

  "dashboard.sensory.title":
    "Sensory support",

  "dashboard.sensory.description":
    "Adjust sound, brightness, spacing and visual intensity for a calmer experience.",

  "dashboard.sensory.action":
    "Open sensory tools",

  "dashboard.insights.title":
    "Reflection insights",

  "dashboard.insights.description":
    "Notice weekly patterns in mood, energy, stress, focus and reflection activity.",

  "dashboard.insights.action":
    "View insights",

  "dashboard.language.title":
    "Language and reading",

  "dashboard.language.description":
    "Choose your language, text direction and reading-support preferences.",

  "dashboard.language.action":
    "Open language settings",

  "dashboard.community.title":
    "Peer community",

  "dashboard.community.description":
    "Share experiences, supportive strategies and small wins in a moderated community.",

  "dashboard.community.action":
    "Open community",

  "dashboard.notifications.title":
    "Notifications",

  "dashboard.notifications.description":
    "Control gentle reminders, browser notifications, quiet hours and your notification inbox.",

  "dashboard.notifications.action":
    "Open notifications",

  "dashboard.personalisation.title":
    "Adaptive personalisation",

  "dashboard.personalisation.description":
    "Choose how Aksess adapts suggestions using preferences you explicitly control.",

  "dashboard.personalisation.action":
    "Open personalisation",

  "dashboard.account":
    "Account",

  "dashboard.profile":
    "Your profile",

  "dashboard.fullName":
    "Full name",

  "dashboard.email":
    "Email",

  "dashboard.accountStatus":
    "Account status",

  "dashboard.emailVerification":
    "Email verification",

  "dashboard.active":
    "Active",

  "dashboard.inactive":
    "Inactive",

  "dashboard.verified":
    "Verified",

  "dashboard.notVerified":
    "Not verified",
};


const tamil: TranslationDictionary = {
  "dashboard.space":
    "உங்கள் Aksess இடம்",

  "dashboard.welcome":
    "வரவேற்கிறோம், {name}.",

  "dashboard.description":
    "உங்கள் நலவாழ்வு முகப்புப் பலகை தயாராக உள்ளது. இன்று உங்களுக்கு உதவும் கருவியைத் தேர்ந்தெடுக்கவும்.",

  "dashboard.plan.title":
    "என் நாளைத் திட்டமிடு",

  "dashboard.plan.description":
    "பணிகளை எளிதாகச் செய்யக்கூடிய நடைமுறை படிகளாக ஒழுங்குபடுத்துங்கள்.",

  "dashboard.plan.action":
    "பணி மேலாளரைத் திற",

  "dashboard.focus.title":
    "கவன அமர்வு",

  "dashboard.focus.description":
    "கவனமாகப் பணியாற்ற அமைதியான சூழலை உருவாக்குங்கள்.",

  "dashboard.focus.action":
    "கவனத்தைத் தொடங்கு",

  "dashboard.mood.title":
    "மனநிலை பதிவு",

  "dashboard.mood.description":
    "அழுத்தமோ தீர்ப்போ இல்லாமல் உங்கள் உணர்வைப் பதிவு செய்யுங்கள்.",

  "dashboard.mood.action":
    "இப்போது பதிவு செய்",

  "dashboard.accessibility.title":
    "அணுகல்தன்மை",

  "dashboard.accessibility.description":
    "உரை, இயக்கம், மாறுபாடு மற்றும் உணர்வு அமைப்புகளைத் தனிப்பயனாக்குங்கள்.",

  "dashboard.accessibility.action":
    "அமைப்புகளைத் திற",

  "dashboard.reflection.title":
    "தினசரி சிந்தனை",

  "dashboard.reflection.description":
    "ஒரு நல்ல தருணம், ஒரு சவால் மற்றும் ஒரு சாதனையை நினைவுகூருங்கள்.",

  "dashboard.reflection.action":
    "இன்றையதைப் பதிவு செய்",

  "dashboard.anxiety.title":
    "அமைதி மற்றும் நிலைப்படுத்தல்",

  "dashboard.anxiety.description":
    "பதட்டம் அல்லது அதிகமான மனஅழுத்த நேரங்களில் சுவாசம் மற்றும் நிலைப்படுத்தல் கருவிகளைப் பயன்படுத்துங்கள்.",

  "dashboard.anxiety.action":
    "அமைதி கருவிகளைத் திற",

  "dashboard.quickCalm.title":
    "விரைவு அமைதி",

  "dashboard.quickCalm.description":
    "ஒரே படியில் குறைந்த கவனச்சிதறலுள்ள அமைதி திரையைத் திறக்கவும்.",

  "dashboard.quickCalm.action":
    "இப்போது அமைதியாகு",

  "dashboard.routines.title":
    "தினசரி நடைமுறைகள்",

  "dashboard.routines.description":
    "காலை, படிப்பு, வேலை மற்றும் மாலை நடைமுறைகளைச் சிறிய படிகளிலிருந்து உருவாக்குங்கள்.",

  "dashboard.routines.action":
    "நடைமுறைகளைத் திற",

  "dashboard.reminders.title":
    "நினைவூட்டல்கள்",

  "dashboard.reminders.description":
    "பணிகள், நடைமுறைகள் மற்றும் முக்கிய தனிப்பட்ட செயல்களுக்கு நினைவூட்டல்களை அமைக்கவும்.",

  "dashboard.reminders.action":
    "நினைவூட்டல்களைப் பார்க்க",

  "dashboard.companion.title":
    "கவன துணை",

  "dashboard.companion.description":
    "உங்கள் கவன நேரத்துடன் வளரக்கூடிய மென்மையான துணையைத் தேர்ந்தெடுக்கவும்.",

  "dashboard.companion.action":
    "துணையைச் சந்திக்க",

  "dashboard.sensory.title":
    "உணர்வு ஆதரவு",

  "dashboard.sensory.description":
    "அமைதியான அனுபவத்திற்காக ஒலி, வெளிச்சம், இடைவெளி மற்றும் காட்சி தீவிரத்தை மாற்றுங்கள்.",

  "dashboard.sensory.action":
    "உணர்வு கருவிகளைத் திற",

  "dashboard.insights.title":
    "சிந்தனை பகுப்பாய்வு",

  "dashboard.insights.description":
    "மனநிலை, ஆற்றல், அழுத்தம், கவனம் மற்றும் சிந்தனைகளில் வாராந்திர முறைகளை கவனியுங்கள்.",

  "dashboard.insights.action":
    "பகுப்பாய்வைப் பார்க்க",

  "dashboard.language.title":
    "மொழி மற்றும் வாசிப்பு",

  "dashboard.language.description":
    "உங்கள் மொழி, உரை திசை மற்றும் வாசிப்பு ஆதரவு விருப்பங்களைத் தேர்ந்தெடுக்கவும்.",

  "dashboard.language.action":
    "மொழி அமைப்புகளைத் திற",

  "dashboard.community.title":
    "சக சமூக ஆதரவு",

  "dashboard.community.description":
    "மிதமாக கண்காணிக்கப்படும் சமூகத்தில் அனுபவங்கள், உதவும் முறைகள் மற்றும் சிறிய வெற்றிகளைப் பகிருங்கள்.",

  "dashboard.community.action":
    "சமூகத்தைத் திற",

  "dashboard.notifications.title":
    "அறிவிப்புகள்",

  "dashboard.notifications.description":
    "மென்மையான நினைவூட்டல்கள், உலாவி அறிவிப்புகள், அமைதியான நேரங்கள் மற்றும் அறிவிப்பு பெட்டியை நிர்வகிக்கவும்.",

  "dashboard.notifications.action":
    "அறிவிப்புகளைத் திற",

  "dashboard.personalisation.title":
    "தனிப்பயன் உதவி",

  "dashboard.personalisation.description":
    "நீங்கள் தேர்வு செய்யும் விருப்பங்களின் அடிப்படையில் Aksess பரிந்துரைகளை மாற்ற அனுமதிக்கவும்.",

  "dashboard.personalisation.action":
    "தனிப்பயனாக்கத்தைத் திற",

  "dashboard.account":
    "கணக்கு",

  "dashboard.profile":
    "உங்கள் சுயவிவரம்",

  "dashboard.fullName":
    "முழுப் பெயர்",

  "dashboard.email":
    "மின்னஞ்சல்",

  "dashboard.accountStatus":
    "கணக்கு நிலை",

  "dashboard.emailVerification":
    "மின்னஞ்சல் சரிபார்ப்பு",

  "dashboard.active":
    "செயலில் உள்ளது",

  "dashboard.inactive":
    "செயலில் இல்லை",

  "dashboard.verified":
    "சரிபார்க்கப்பட்டது",

  "dashboard.notVerified":
    "சரிபார்க்கப்படவில்லை",
};


const hindi: TranslationDictionary = {
  "dashboard.space":
    "आपका Aksess स्थान",

  "dashboard.welcome":
    "स्वागत है, {name}.",

  "dashboard.description":
    "आपका वेलबीइंग डैशबोर्ड तैयार है। आज उपयोगी लगने वाला कोई टूल चुनें।",

  "dashboard.plan.title":
    "मेरे दिन की योजना",

  "dashboard.plan.description":
    "कार्यों को छोटे और व्यावहारिक चरणों में व्यवस्थित करें।",

  "dashboard.plan.action":
    "कार्य प्रबंधक खोलें",

  "dashboard.focus.title":
    "फोकस सत्र",

  "dashboard.focus.description":
    "ध्यान से काम करने के लिए शांत वातावरण बनाएं।",

  "dashboard.focus.action":
    "फोकस शुरू करें",

  "dashboard.mood.title":
    "मूड चेक-इन",

  "dashboard.mood.description":
    "बिना दबाव या निर्णय के अपनी भावना दर्ज करें।",

  "dashboard.mood.action":
    "अभी चेक-इन करें",

  "dashboard.accessibility.title":
    "सुगम्यता",

  "dashboard.accessibility.description":
    "टेक्स्ट, मोशन, कॉन्ट्रास्ट और सेंसरी सेटिंग्स को अनुकूलित करें।",

  "dashboard.accessibility.action":
    "सेटिंग्स खोलें",

  "dashboard.reflection.title":
    "दैनिक चिंतन",

  "dashboard.reflection.description":
    "एक अच्छी बात, एक चुनौती और एक उपलब्धि पर ध्यान दें।",

  "dashboard.reflection.action":
    "आज का चिंतन लिखें",

  "dashboard.anxiety.title":
    "शांति और ग्राउंडिंग",

  "dashboard.anxiety.description":
    "चिंता या अधिक तनाव के समय श्वास और ग्राउंडिंग टूल का उपयोग करें।",

  "dashboard.anxiety.action":
    "शांति टूल खोलें",

  "dashboard.quickCalm.title":
    "त्वरित शांति",

  "dashboard.quickCalm.description":
    "एक चरण में कम ध्यान भटकाने वाली शांत स्क्रीन खोलें।",

  "dashboard.quickCalm.action":
    "अभी शांत हों",

  "dashboard.routines.title":
    "दैनिक दिनचर्या",

  "dashboard.routines.description":
    "सुबह, पढ़ाई, काम और शाम की दोहराने योग्य दिनचर्या बनाएं।",

  "dashboard.routines.action":
    "दिनचर्या खोलें",

  "dashboard.reminders.title":
    "रिमाइंडर",

  "dashboard.reminders.description":
    "कार्यों, दिनचर्या और महत्वपूर्ण व्यक्तिगत गतिविधियों के लिए रिमाइंडर सेट करें।",

  "dashboard.reminders.action":
    "रिमाइंडर देखें",

  "dashboard.companion.title":
    "फोकस साथी",

  "dashboard.companion.description":
    "एक शांत साथी चुनें जो आपके फोकस समय के साथ बढ़ता है।",

  "dashboard.companion.action":
    "साथी से मिलें",

  "dashboard.sensory.title":
    "सेंसरी सहायता",

  "dashboard.sensory.description":
    "शांत अनुभव के लिए ध्वनि, चमक, दूरी और दृश्य तीव्रता बदलें।",

  "dashboard.sensory.action":
    "सेंसरी टूल खोलें",

  "dashboard.insights.title":
    "चिंतन इनसाइट्स",

  "dashboard.insights.description":
    "मूड, ऊर्जा, तनाव, फोकस और चिंतन में साप्ताहिक पैटर्न देखें।",

  "dashboard.insights.action":
    "इनसाइट्स देखें",

  "dashboard.language.title":
    "भाषा और पढ़ना",

  "dashboard.language.description":
    "अपनी भाषा, टेक्स्ट दिशा और पढ़ने की सहायता चुनें।",

  "dashboard.language.action":
    "भाषा सेटिंग्स खोलें",

  "dashboard.community.title":
    "सहयोगी समुदाय",

  "dashboard.community.description":
    "एक मॉडरेटेड समुदाय में अनुभव, सहायक तरीके और छोटी सफलताएँ साझा करें।",

  "dashboard.community.action":
    "समुदाय खोलें",

  "dashboard.notifications.title":
    "सूचनाएँ",

  "dashboard.notifications.description":
    "हल्के रिमाइंडर, ब्राउज़र सूचनाएँ, शांत समय और अपने सूचना इनबॉक्स को नियंत्रित करें।",

  "dashboard.notifications.action":
    "सूचनाएँ खोलें",

  "dashboard.personalisation.title":
    "अनुकूलित सुझाव",

  "dashboard.personalisation.description":
    "आपकी चुनी हुई प्राथमिकताओं के आधार पर Aksess सुझावों को अनुकूलित कर सकता है।",

  "dashboard.personalisation.action":
    "अनुकूलन खोलें",

  "dashboard.account":
    "खाता",

  "dashboard.profile":
    "आपकी प्रोफ़ाइल",

  "dashboard.fullName":
    "पूरा नाम",

  "dashboard.email":
    "ईमेल",

  "dashboard.accountStatus":
    "खाता स्थिति",

  "dashboard.emailVerification":
    "ईमेल सत्यापन",

  "dashboard.active":
    "सक्रिय",

  "dashboard.inactive":
    "निष्क्रिय",

  "dashboard.verified":
    "सत्यापित",

  "dashboard.notVerified":
    "सत्यापित नहीं",
};


const arabic: TranslationDictionary = {
  "dashboard.space":
    "مساحتك في Aksess",

  "dashboard.welcome":
    "مرحبًا، {name}.",

  "dashboard.description":
    "لوحة العافية الخاصة بك جاهزة. اختر أداة تبدو مفيدة لك اليوم.",

  "dashboard.plan.title":
    "خطط ليومي",

  "dashboard.plan.description":
    "قسّم المهام إلى خطوات واقعية ويمكن إدارتها.",

  "dashboard.plan.action":
    "افتح مدير المهام",

  "dashboard.focus.title":
    "جلسة تركيز",

  "dashboard.focus.description":
    "أنشئ بيئة هادئة للعمل بتركيز.",

  "dashboard.focus.action":
    "ابدأ التركيز",

  "dashboard.mood.title":
    "تسجيل الحالة المزاجية",

  "dashboard.mood.description":
    "سجّل شعورك دون ضغط أو حكم.",

  "dashboard.mood.action":
    "سجّل الآن",

  "dashboard.accessibility.title":
    "إمكانية الوصول",

  "dashboard.accessibility.description":
    "خصّص النص والحركة والتباين والإعدادات الحسية.",

  "dashboard.accessibility.action":
    "افتح الإعدادات",

  "dashboard.reflection.title":
    "تأمل يومي",

  "dashboard.reflection.description":
    "لاحظ لحظة إيجابية وتحديًا وإنجازًا واحدًا.",

  "dashboard.reflection.action":
    "سجّل تأمل اليوم",

  "dashboard.anxiety.title":
    "الهدوء والتأريض",

  "dashboard.anxiety.description":
    "استخدم تمارين التنفس والتأريض عند القلق أو الإرهاق.",

  "dashboard.anxiety.action":
    "افتح أدوات الهدوء",

  "dashboard.quickCalm.title":
    "هدوء سريع",

  "dashboard.quickCalm.description":
    "افتح شاشة هادئة قليلة التشتيت بخطوة واحدة.",

  "dashboard.quickCalm.action":
    "اهدأ الآن",

  "dashboard.routines.title":
    "الروتين اليومي",

  "dashboard.routines.description":
    "أنشئ روتينًا للصباح والدراسة والعمل والمساء من خطوات بسيطة.",

  "dashboard.routines.action":
    "افتح الروتين",

  "dashboard.reminders.title":
    "التذكيرات",

  "dashboard.reminders.description":
    "اضبط تذكيرات اختيارية للمهام والروتين والأمور الشخصية المهمة.",

  "dashboard.reminders.action":
    "عرض التذكيرات",

  "dashboard.companion.title":
    "رفيق التركيز",

  "dashboard.companion.description":
    "اختر رفيقًا لطيفًا ينمو مع دقائق تركيزك.",

  "dashboard.companion.action":
    "قابل الرفيق",

  "dashboard.sensory.title":
    "الدعم الحسي",

  "dashboard.sensory.description":
    "اضبط الصوت والسطوع والمسافات والكثافة البصرية لتجربة أكثر هدوءًا.",

  "dashboard.sensory.action":
    "افتح الأدوات الحسية",

  "dashboard.insights.title":
    "رؤى التأمل",

  "dashboard.insights.description":
    "لاحظ الأنماط الأسبوعية في المزاج والطاقة والتوتر والتركيز والتأمل.",

  "dashboard.insights.action":
    "عرض الرؤى",

  "dashboard.language.title":
    "اللغة والقراءة",

  "dashboard.language.description":
    "اختر لغتك واتجاه النص وتفضيلات دعم القراءة.",

  "dashboard.language.action":
    "افتح إعدادات اللغة",

  "dashboard.community.title":
    "مجتمع الدعم",

  "dashboard.community.description":
    "شارك التجارب والاستراتيجيات الداعمة والإنجازات الصغيرة في مجتمع خاضع للإشراف.",

  "dashboard.community.action":
    "فتح المجتمع",

  "dashboard.notifications.title":
    "الإشعارات",

  "dashboard.notifications.description":
    "تحكم في التذكيرات اللطيفة وإشعارات المتصفح وساعات الهدوء وصندوق الإشعارات.",

  "dashboard.notifications.action":
    "فتح الإشعارات",

  "dashboard.personalisation.title":
    "التخصيص التكيفي",

  "dashboard.personalisation.description":
    "اسمح لـ Aksess بتخصيص الاقتراحات باستخدام التفضيلات التي تختارها بنفسك.",

  "dashboard.personalisation.action":
    "فتح التخصيص",

  "dashboard.account":
    "الحساب",

  "dashboard.profile":
    "ملفك الشخصي",

  "dashboard.fullName":
    "الاسم الكامل",

  "dashboard.email":
    "البريد الإلكتروني",

  "dashboard.accountStatus":
    "حالة الحساب",

  "dashboard.emailVerification":
    "التحقق من البريد الإلكتروني",

  "dashboard.active":
    "نشط",

  "dashboard.inactive":
    "غير نشط",

  "dashboard.verified":
    "تم التحقق",

  "dashboard.notVerified":
    "لم يتم التحقق",
};


export const dictionaries:
  Record<string, TranslationDictionary> = {
    en: english,
    ta: tamil,
    hi: hindi,
    ar: arabic,
  };


export function getDictionary(
  locale: string,
): TranslationDictionary {
  const language =
    locale
      .split("-")[0]
      .toLowerCase();

  return (
    dictionaries[language]
    ?? english
  );
}
