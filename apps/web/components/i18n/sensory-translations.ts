type Dictionary =
  Record<string, string>;


const english: Dictionary = {
  "backDashboard": "Back to dashboard",

  "page.eyebrow": "Sensory support",
  "page.title": "Shape the space around you.",
  "page.description":
    "Choose sound, visual intensity and spacing settings that make Aksess feel easier to use.",

  "sound.eyebrow": "Soundscape library",
  "sound.title": "Choose a steady background",
  "sound.description":
    "These sounds are generated locally in your browser and stop when you leave this page.",
  "sound.stop": "Stop all sounds",
  "sound.play": "Play",
  "sound.playing": "Playing",
  "sound.volume": "Volume {value}%",

  "sound.rain.label": "Gentle rain",
  "sound.rain.description":
    "Soft filtered noise for a steady background.",

  "sound.ocean.label": "Ocean waves",
  "sound.ocean.description":
    "Slow rising and falling ambient sound.",

  "sound.forest.label": "Quiet forest",
  "sound.forest.description":
    "A light natural texture with softer frequencies.",

  "sound.cafe.label": "Calm café",
  "sound.cafe.description":
    "Low, blurred background activity.",

  "sound.white-noise.label": "White noise",
  "sound.white-noise.description":
    "Even sound across the frequency range.",

  "sound.brown-noise.label": "Brown noise",
  "sound.brown-noise.description":
    "A deeper and softer noise profile.",

  "brightness.label": "Brightness",
  "brightness.description":
    "Adjust the overall visual intensity.",
  "brightness.soft": "Soft",
  "brightness.balanced": "Balanced",
  "brightness.bright": "Bright",

  "interface.label": "Interface style",
  "interface.description":
    "Choose how visually detailed the interface feels.",
  "interface.calm": "Calm",
  "interface.standard": "Standard",
  "interface.high-clarity": "High clarity",

  "width.label": "Reading width",
  "width.description":
    "Control how wide reading content appears.",
  "width.narrow": "Narrow",
  "width.comfortable": "Comfortable",
  "width.wide": "Wide",

  "spacing.label": "Line spacing",
  "spacing.description":
    "Increase space between lines of text.",
  "spacing.normal": "Normal",
  "spacing.relaxed": "Relaxed",
  "spacing.spacious": "Spacious",

  "reduced.eyebrow": "Reduced stimulation",
  "reduced.title": "Make the interface quieter",
  "reduced.description":
    "Removes decorative movement, softens visual emphasis and reduces unnecessary animation.",
  "reduced.enabled":
    "Reduced stimulation enabled",
  "reduced.enable":
    "Enable reduced stimulation",

  "preview.eyebrow": "Live reading preview",
  "preview.title":
    "A calmer reading experience",
  "preview.description":
    "You do not need to process everything at once. A short, clear step is enough. Your visual preferences apply across Aksess.",
  "preview.action": "Example action",
};


const tamil: Dictionary = {
  ...english,

  "backDashboard":
    "முகப்புப் பலகைக்குத் திரும்பு",

  "page.eyebrow":
    "உணர்வு ஆதரவு",

  "page.title":
    "உங்களைச் சுற்றிய சூழலை உங்களுக்கு ஏற்றவாறு மாற்றுங்கள்.",

  "page.description":
    "Aksess பயன்படுத்த எளிதாக இருக்க ஒலி, காட்சி தீவிரம் மற்றும் இடைவெளி அமைப்புகளைத் தேர்ந்தெடுக்கவும்.",

  "sound.eyebrow":
    "ஒலி சூழல் தொகுப்பு",

  "sound.title":
    "நிலையான பின்னணி ஒலியைத் தேர்ந்தெடுக்கவும்",

  "sound.description":
    "இந்த ஒலிகள் உங்கள் உலாவியிலேயே உருவாக்கப்படுகின்றன; இந்தப் பக்கத்தை விட்டு வெளியேறும்போது நிறுத்தப்படும்.",

  "sound.stop":
    "அனைத்து ஒலிகளையும் நிறுத்து",

  "sound.play":
    "இயக்கு",

  "sound.playing":
    "இயங்குகிறது",

  "sound.volume":
    "ஒலி அளவு {value}%",

  "sound.rain.label":
    "மென்மையான மழை",

  "sound.rain.description":
    "நிலையான பின்னணிக்கான மென்மையான வடிகட்டிய ஒலி.",

  "sound.ocean.label":
    "கடல் அலைகள்",

  "sound.ocean.description":
    "மெதுவாக உயரும் மற்றும் தாழும் சுற்றுப்புற ஒலி.",

  "sound.forest.label":
    "அமைதியான காடு",

  "sound.forest.description":
    "மென்மையான அதிர்வெண்களுடன் இயற்கையான ஒலி.",

  "sound.cafe.label":
    "அமைதியான கஃபே",

  "sound.cafe.description":
    "மென்மையான பின்னணி செயல்பாட்டு ஒலி.",

  "sound.white-noise.label":
    "வெள்ளை ஒலி",

  "sound.white-noise.description":
    "அனைத்து அதிர்வெண்களிலும் சமமான ஒலி.",

  "sound.brown-noise.label":
    "பழுப்பு ஒலி",

  "sound.brown-noise.description":
    "ஆழமான மற்றும் மென்மையான ஒலி அமைப்பு.",

  "brightness.label":
    "பிரகாசம்",

  "brightness.description":
    "மொத்த காட்சி தீவிரத்தை மாற்றுங்கள்.",

  "brightness.soft":
    "மென்மை",

  "brightness.balanced":
    "சமநிலை",

  "brightness.bright":
    "பிரகாசம்",

  "interface.label":
    "இடைமுக பாணி",

  "interface.description":
    "இடைமுகத்தின் காட்சி விவர அளவைத் தேர்ந்தெடுக்கவும்.",

  "interface.calm":
    "அமைதி",

  "interface.standard":
    "வழக்கமான",

  "interface.high-clarity":
    "அதிக தெளிவு",

  "width.label":
    "வாசிப்பு அகலம்",

  "width.description":
    "வாசிப்பு உள்ளடக்கத்தின் அகலத்தை கட்டுப்படுத்துங்கள்.",

  "width.narrow":
    "குறுகியது",

  "width.comfortable":
    "வசதியானது",

  "width.wide":
    "அகலம்",

  "spacing.label":
    "வரி இடைவெளி",

  "spacing.description":
    "உரை வரிகளுக்கிடையிலான இடைவெளியை அதிகரிக்கவும்.",

  "spacing.normal":
    "வழக்கமான",

  "spacing.relaxed":
    "தளர்வான",

  "spacing.spacious":
    "விசாலமான",

  "reduced.eyebrow":
    "குறைந்த தூண்டுதல்",

  "reduced.title":
    "இடைமுகத்தை அமைதியாக்குங்கள்",

  "reduced.description":
    "அலங்கார இயக்கங்களை நீக்கி, காட்சி தீவிரத்தையும் தேவையற்ற அசைவுகளையும் குறைக்கிறது.",

  "reduced.enabled":
    "குறைந்த தூண்டுதல் இயக்கப்பட்டுள்ளது",

  "reduced.enable":
    "குறைந்த தூண்டுதலை இயக்கு",

  "preview.eyebrow":
    "நேரடி வாசிப்பு முன்னோட்டம்",

  "preview.title":
    "அமைதியான வாசிப்பு அனுபவம்",

  "preview.description":
    "எல்லாவற்றையும் ஒரே நேரத்தில் செயலாக்க வேண்டியதில்லை. ஒரு சிறிய தெளிவான படி போதுமானது. உங்கள் காட்சி விருப்பங்கள் Aksess முழுவதும் பயன்படுத்தப்படும்.",

  "preview.action":
    "உதாரண செயல்",
};


const hindi: Dictionary = {
  ...english,

  "backDashboard":
    "डैशबोर्ड पर वापस जाएं",

  "page.eyebrow":
    "सेंसरी सहायता",

  "page.title":
    "अपने आसपास की जगह को अपने अनुसार बनाएं।",

  "page.description":
    "ध्वनि, दृश्य तीव्रता और दूरी की सेटिंग चुनें जिससे Aksess उपयोग करना आसान लगे।",

  "sound.eyebrow":
    "साउंडस्केप लाइब्रेरी",

  "sound.title":
    "एक स्थिर पृष्ठभूमि ध्वनि चुनें",

  "sound.description":
    "ये ध्वनियां आपके ब्राउज़र में स्थानीय रूप से बनती हैं और पेज छोड़ने पर बंद हो जाती हैं।",

  "sound.stop":
    "सभी ध्वनियां बंद करें",

  "sound.play":
    "चलाएं",

  "sound.playing":
    "चल रहा है",

  "sound.volume":
    "आवाज़ {value}%",

  "sound.rain.label":
    "हल्की बारिश",

  "sound.ocean.label":
    "समुद्र की लहरें",

  "sound.forest.label":
    "शांत जंगल",

  "sound.cafe.label":
    "शांत कैफ़े",

  "sound.white-noise.label":
    "व्हाइट नॉइज़",

  "sound.brown-noise.label":
    "ब्राउन नॉइज़",

  "brightness.label":
    "चमक",

  "brightness.description":
    "समग्र दृश्य तीव्रता समायोजित करें।",

  "brightness.soft":
    "हल्का",

  "brightness.balanced":
    "संतुलित",

  "brightness.bright":
    "उज्ज्वल",

  "interface.label":
    "इंटरफ़ेस शैली",

  "interface.description":
    "इंटरफ़ेस कितना विस्तृत दिखे यह चुनें।",

  "interface.calm":
    "शांत",

  "interface.standard":
    "मानक",

  "interface.high-clarity":
    "उच्च स्पष्टता",

  "width.label":
    "पढ़ने की चौड़ाई",

  "width.narrow":
    "संकीर्ण",

  "width.comfortable":
    "आरामदायक",

  "width.wide":
    "चौड़ा",

  "spacing.label":
    "लाइन दूरी",

  "spacing.normal":
    "सामान्य",

  "spacing.relaxed":
    "आरामदायक",

  "spacing.spacious":
    "अधिक दूरी",

  "reduced.eyebrow":
    "कम उत्तेजना",

  "reduced.title":
    "इंटरफ़ेस को शांत बनाएं",

  "reduced.enabled":
    "कम उत्तेजना चालू है",

  "reduced.enable":
    "कम उत्तेजना चालू करें",

  "preview.eyebrow":
    "लाइव रीडिंग प्रीव्यू",

  "preview.title":
    "अधिक शांत पढ़ने का अनुभव",

  "preview.action":
    "उदाहरण क्रिया",
};


const arabic: Dictionary = {
  ...english,

  "backDashboard":
    "العودة إلى لوحة التحكم",

  "page.eyebrow":
    "الدعم الحسي",

  "page.title":
    "شكّل المساحة من حولك.",

  "page.description":
    "اختر إعدادات الصوت والكثافة البصرية والمسافات التي تجعل استخدام Aksess أكثر راحة.",

  "sound.eyebrow":
    "مكتبة الأصوات",

  "sound.title":
    "اختر خلفية صوتية ثابتة",

  "sound.description":
    "يتم إنشاء هذه الأصوات محليًا في متصفحك وتتوقف عند مغادرة هذه الصفحة.",

  "sound.stop":
    "إيقاف جميع الأصوات",

  "sound.play":
    "تشغيل",

  "sound.playing":
    "قيد التشغيل",

  "sound.volume":
    "مستوى الصوت {value}%",

  "sound.rain.label":
    "مطر هادئ",

  "sound.rain.description":
    "ضوضاء ناعمة لخلفية مستقرة.",

  "sound.ocean.label":
    "أمواج البحر",

  "sound.ocean.description":
    "صوت محيطي يرتفع وينخفض ببطء.",

  "sound.forest.label":
    "غابة هادئة",

  "sound.forest.description":
    "نسيج طبيعي خفيف بترددات أكثر نعومة.",

  "sound.cafe.label":
    "مقهى هادئ",

  "sound.cafe.description":
    "نشاط خلفي منخفض وغير مشتت.",

  "sound.white-noise.label":
    "ضوضاء بيضاء",

  "sound.white-noise.description":
    "صوت متوازن عبر نطاق الترددات.",

  "sound.brown-noise.label":
    "ضوضاء بنية",

  "sound.brown-noise.description":
    "نمط صوتي أعمق وأكثر نعومة.",

  "brightness.label":
    "السطوع",

  "brightness.description":
    "اضبط شدة العرض العامة.",

  "brightness.soft":
    "ناعم",

  "brightness.balanced":
    "متوازن",

  "brightness.bright":
    "ساطع",

  "interface.label":
    "نمط الواجهة",

  "interface.description":
    "اختر مقدار التفاصيل البصرية في الواجهة.",

  "interface.calm":
    "هادئ",

  "interface.standard":
    "قياسي",

  "interface.high-clarity":
    "وضوح عالٍ",

  "width.label":
    "عرض القراءة",

  "width.description":
    "تحكم في عرض محتوى القراءة.",

  "width.narrow":
    "ضيق",

  "width.comfortable":
    "مريح",

  "width.wide":
    "واسع",

  "spacing.label":
    "تباعد الأسطر",

  "spacing.description":
    "زد المسافة بين أسطر النص.",

  "spacing.normal":
    "عادي",

  "spacing.relaxed":
    "مريح",

  "spacing.spacious":
    "واسع",

  "reduced.eyebrow":
    "تحفيز أقل",

  "reduced.title":
    "اجعل الواجهة أكثر هدوءًا",

  "reduced.description":
    "يقلل الحركة الزخرفية والتأكيد البصري والرسوم المتحركة غير الضرورية.",

  "reduced.enabled":
    "تم تفعيل التحفيز المنخفض",

  "reduced.enable":
    "تفعيل التحفيز المنخفض",

  "preview.eyebrow":
    "معاينة القراءة المباشرة",

  "preview.title":
    "تجربة قراءة أكثر هدوءًا",

  "preview.description":
    "لا تحتاج إلى معالجة كل شيء دفعة واحدة. خطوة قصيرة وواضحة تكفي. تنطبق تفضيلاتك البصرية في جميع أنحاء Aksess.",

  "preview.action":
    "إجراء تجريبي",
};


const dictionaries:
  Record<string, Dictionary> = {
    en: english,
    ta: tamil,
    hi: hindi,
    ar: arabic,
  };


export function sensoryText(
  locale: string,
  key: string,
  values: Record<
    string,
    string | number
  > = {},
): string {
  const language =
    locale
      .split("-")[0]
      .toLowerCase();

  let result =
    dictionaries[language]?.[key]
    ?? english[key]
    ?? key;

  for (
    const [name, value]
    of Object.entries(values)
  ) {
    result =
      result.replaceAll(
        `{${name}}`,
        String(value),
      );
  }

  return result;
}
