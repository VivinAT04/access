export type FocusTranslationKey =
  | "common.backDashboard"
  | "common.delete"
  | "common.saving"
  | "focus.eyebrow"
  | "focus.pageTitle"
  | "focus.pageDescription"
  | "focus.sessionsToday"
  | "focus.minutesToday"
  | "focus.allSessions"
  | "focus.totalMinutes"
  | "focus.companion"
  | "focus.companionAria"
  | "focus.level"
  | "focus.xpProgress"
  | "focus.state.running"
  | "focus.state.paused"
  | "focus.state.finished"
  | "focus.state.idle"
  | "focus.message.running"
  | "focus.message.paused"
  | "focus.message.finishedLong"
  | "focus.message.finished"
  | "focus.message.idle"
  | "focus.reward"
  | "focus.rewardFailed"
  | "focus.longBreak"
  | "focus.shortBreak"
  | "focus.timer"
  | "focus.oneStep"
  | "focus.minutesShort"
  | "focus.customDuration"
  | "focus.remaining"
  | "focus.ready"
  | "focus.focusing"
  | "focus.paused"
  | "focus.complete"
  | "focus.resume"
  | "focus.start"
  | "focus.pause"
  | "focus.reset"
  | "focus.saveCompleted"
  | "focus.beginAnother"
  | "focus.endEarly"
  | "focus.plan"
  | "focus.planQuestion"
  | "focus.intention"
  | "focus.intentionPlaceholder"
  | "focus.linkTask"
  | "focus.noLinkedTask"
  | "focus.notes"
  | "focus.notesPlaceholder"
  | "focus.tipTitle"
  | "focus.tipDescription"
  | "focus.history"
  | "focus.recentSessions"
  | "focus.loadingSessions"
  | "focus.emptyTitle"
  | "focus.emptyDescription"
  | "focus.minutesProgress"
  | "focus.status.completed"
  | "focus.status.cancelled"
  | "focus.enterIntention"
  | "focus.startBeforeSaving"
  | "focus.sessionsLoadFailed"
  | "focus.statisticsLoadFailed"
  | "focus.tasksLoadFailed"
  | "focus.companionLoadFailed"
  | "focus.dataLoadFailed"
  | "focus.saveFailed"
  | "focus.completedMessage"
  | "focus.cancelledMessage"
  | "focus.deleteConfirm"
  | "focus.deleteFailed"
  | "focus.deleted"
  | "focus.invalidResponse";


type FocusDictionary =
  Record<FocusTranslationKey, string>;


const english: FocusDictionary = {
  "common.backDashboard":
    "Back to dashboard",

  "common.delete":
    "Delete",

  "common.saving":
    "Saving...",

  "focus.eyebrow":
    "Calm, structured concentration",

  "focus.pageTitle":
    "Focus session",

  "focus.pageDescription":
    "Choose one clear intention, set a comfortable duration and work without pressure.",

  "focus.sessionsToday":
    "Sessions today",

  "focus.minutesToday":
    "Minutes today",

  "focus.allSessions":
    "All sessions",

  "focus.totalMinutes":
    "Total minutes",

  "focus.companion":
    "Body-doubling companion",

  "focus.companionAria":
    "{name}, {type} companion",

  "focus.level":
    "Level {level}",

  "focus.xpProgress":
    "{percentage}% through this level",

  "focus.state.running":
    "Focusing with you",

  "focus.state.paused":
    "Taking a pause",

  "focus.state.finished":
    "Session complete",

  "focus.state.idle":
    "Ready when you are",

  "focus.message.running":
    "{name} is staying beside you. You only need to focus on the next small step.",

  "focus.message.paused":
    "Pausing is allowed. Take a breath, stretch, or return whenever you feel ready.",

  "focus.message.finishedLong":
    "You completed a longer session. A proper screen break may help now.",

  "focus.message.finished":
    "You finished the session. Take a moment to notice what you achieved.",

  "focus.message.idle":
    "{name} is ready to work alongside you. Short sessions count too.",

  "focus.reward":
    "+{xp} XP — {name} completed this session with you.",

  "focus.rewardFailed":
    "The session was saved, but companion XP could not be updated.",

  "focus.longBreak":
    "You completed a longer session. Consider stepping away from the screen for a few minutes.",

  "focus.shortBreak":
    "A drink of water, stretch or quiet pause can help before the next session.",

  "focus.timer":
    "Focus timer",

  "focus.oneStep":
    "One step at a time",

  "focus.minutesShort":
    "{minutes} min",

  "focus.customDuration":
    "Custom duration",

  "focus.remaining":
    "{time} remaining",

  "focus.ready":
    "Ready",

  "focus.focusing":
    "Focusing",

  "focus.paused":
    "Paused",

  "focus.complete":
    "Complete",

  "focus.resume":
    "Resume",

  "focus.start":
    "Start focus",

  "focus.pause":
    "Pause",

  "focus.reset":
    "Reset",

  "focus.saveCompleted":
    "Save completed session",

  "focus.beginAnother":
    "Begin another session",

  "focus.endEarly":
    "End session early",

  "focus.plan":
    "Session plan",

  "focus.planQuestion":
    "What will you focus on?",

  "focus.intention":
    "Focus intention",

  "focus.intentionPlaceholder":
    "Example: Finish the results section",

  "focus.linkTask":
    "Link a task",

  "focus.noLinkedTask":
    "No linked task",

  "focus.notes":
    "Session notes",

  "focus.notesPlaceholder":
    "Write the next small step or remove distractions",

  "focus.tipTitle":
    "Gentle focus tip",

  "focus.tipDescription":
    "Choose one clear outcome. You can always start another session afterwards.",

  "focus.history":
    "Session history",

  "focus.recentSessions":
    "Recent focus sessions",

  "focus.loadingSessions":
    "Loading sessions...",

  "focus.emptyTitle":
    "No focus sessions yet",

  "focus.emptyDescription":
    "Complete your first timer session and it will appear here.",

  "focus.minutesProgress":
    "{completed} of {planned} minutes",

  "focus.status.completed":
    "Completed",

  "focus.status.cancelled":
    "Cancelled",

  "focus.enterIntention":
    "Enter what you want to focus on.",

  "focus.startBeforeSaving":
    "Start the timer before saving the session.",

  "focus.sessionsLoadFailed":
    "Sessions could not be loaded.",

  "focus.statisticsLoadFailed":
    "Statistics could not be loaded.",

  "focus.tasksLoadFailed":
    "Tasks could not be loaded.",

  "focus.companionLoadFailed":
    "Companion could not be loaded.",

  "focus.dataLoadFailed":
    "Focus data could not be loaded.",

  "focus.saveFailed":
    "The session could not be saved.",

  "focus.completedMessage":
    "Focus session completed.",

  "focus.cancelledMessage":
    "Focus session saved as cancelled.",

  "focus.deleteConfirm":
    "Delete \"{title}\"?",

  "focus.deleteFailed":
    "The session could not be deleted.",

  "focus.deleted":
    "Focus session deleted.",

  "focus.invalidResponse":
    "The server returned an invalid response.",
};


const tamil: FocusDictionary = {
  ...english,

  "common.backDashboard":
    "முகப்புப் பலகைக்குத் திரும்பு",

  "common.delete":
    "நீக்கு",

  "common.saving":
    "சேமிக்கப்படுகிறது...",

  "focus.eyebrow":
    "அமைதியான, கட்டமைக்கப்பட்ட கவனம்",

  "focus.pageTitle":
    "கவன அமர்வு",

  "focus.pageDescription":
    "ஒரு தெளிவான நோக்கத்தைத் தேர்ந்தெடுத்து, வசதியான நேரத்தை அமைத்து, அழுத்தமின்றிப் பணியாற்றுங்கள்.",

  "focus.sessionsToday":
    "இன்றைய அமர்வுகள்",

  "focus.minutesToday":
    "இன்றைய நிமிடங்கள்",

  "focus.allSessions":
    "அனைத்து அமர்வுகள்",

  "focus.totalMinutes":
    "மொத்த நிமிடங்கள்",

  "focus.companion":
    "கவன துணை",

  "focus.companionAria":
    "{name}, {type} துணை",

  "focus.level":
    "நிலை {level}",

  "focus.xpProgress":
    "இந்த நிலையில் {percentage}% முன்னேற்றம்",

  "focus.state.running":
    "உங்களுடன் கவனம் செலுத்துகிறது",

  "focus.state.paused":
    "சிறு இடைவேளை",

  "focus.state.finished":
    "அமர்வு முடிந்தது",

  "focus.state.idle":
    "நீங்கள் தயாராகும் போது தொடங்கலாம்",

  "focus.message.running":
    "{name} உங்களுடன் இருக்கிறது. அடுத்த சிறிய படியில் மட்டும் கவனம் செலுத்துங்கள்.",

  "focus.message.paused":
    "இடைநிறுத்துவது சரிதான். மூச்செடுக்கவும், நீட்டவும் அல்லது தயாரானபோது திரும்பவும்.",

  "focus.message.finishedLong":
    "நீண்ட அமர்வை முடித்துள்ளீர்கள். இப்போது திரையிலிருந்து ஓய்வு எடுத்துக்கொள்ளுங்கள்.",

  "focus.message.finished":
    "அமர்வை முடித்துள்ளீர்கள். நீங்கள் செய்ததை ஒரு நிமிடம் கவனியுங்கள்.",

  "focus.message.idle":
    "{name} உங்களுடன் பணியாற்றத் தயாராக உள்ளது. குறுகிய அமர்வுகளும் முக்கியம்.",

  "focus.reward":
    "+{xp} XP — {name} இந்த அமர்வை உங்களுடன் முடித்தது.",

  "focus.rewardFailed":
    "அமர்வு சேமிக்கப்பட்டது, ஆனால் துணையின் XP-ஐ புதுப்பிக்க முடியவில்லை.",

  "focus.longBreak":
    "நீண்ட அமர்வை முடித்துள்ளீர்கள். சில நிமிடங்கள் திரையிலிருந்து விலகுங்கள்.",

  "focus.shortBreak":
    "அடுத்த அமர்வுக்கு முன் தண்ணீர், நீட்டல் அல்லது அமைதியான இடைவேளை உதவும்.",

  "focus.timer":
    "கவன நேரக்கணிப்பான்",

  "focus.oneStep":
    "ஒரு நேரத்தில் ஒரு படி",

  "focus.minutesShort":
    "{minutes} நிமி",

  "focus.customDuration":
    "தனிப்பயன் நேரம்",

  "focus.remaining":
    "{time} மீதமுள்ளது",

  "focus.ready":
    "தயார்",

  "focus.focusing":
    "கவனம் செலுத்துகிறது",

  "focus.paused":
    "இடைநிறுத்தப்பட்டது",

  "focus.complete":
    "முடிந்தது",

  "focus.resume":
    "தொடரவும்",

  "focus.start":
    "கவனத்தைத் தொடங்கு",

  "focus.pause":
    "இடைநிறுத்து",

  "focus.reset":
    "மீட்டமை",

  "focus.saveCompleted":
    "முடிந்த அமர்வைச் சேமி",

  "focus.beginAnother":
    "மற்றொரு அமர்வைத் தொடங்கு",

  "focus.endEarly":
    "அமர்வை முன்கூட்டியே முடி",

  "focus.plan":
    "அமர்வுத் திட்டம்",

  "focus.planQuestion":
    "எதில் கவனம் செலுத்தப் போகிறீர்கள்?",

  "focus.intention":
    "கவன நோக்கம்",

  "focus.intentionPlaceholder":
    "உதாரணம்: முடிவுகள் பகுதியை முடிக்கவும்",

  "focus.linkTask":
    "பணியை இணைக்கவும்",

  "focus.noLinkedTask":
    "இணைக்கப்பட்ட பணி இல்லை",

  "focus.notes":
    "அமர்வுக் குறிப்புகள்",

  "focus.notesPlaceholder":
    "அடுத்த சிறிய படியை எழுதுங்கள் அல்லது கவனச்சிதறல்களை அகற்றுங்கள்",

  "focus.tipTitle":
    "மென்மையான கவன உதவி",

  "focus.tipDescription":
    "ஒரு தெளிவான முடிவைத் தேர்ந்தெடுக்கவும். பின்னர் மற்றொரு அமர்வைத் தொடங்கலாம்.",

  "focus.history":
    "அமர்வு வரலாறு",

  "focus.recentSessions":
    "சமீபத்திய கவன அமர்வுகள்",

  "focus.loadingSessions":
    "அமர்வுகள் ஏற்றப்படுகின்றன...",

  "focus.emptyTitle":
    "இன்னும் கவன அமர்வுகள் இல்லை",

  "focus.emptyDescription":
    "உங்கள் முதல் நேர அமர்வை முடித்ததும் அது இங்கே தோன்றும்.",

  "focus.minutesProgress":
    "{planned} நிமிடங்களில் {completed} நிமிடங்கள்",

  "focus.status.completed":
    "முடிக்கப்பட்டது",

  "focus.status.cancelled":
    "ரத்து செய்யப்பட்டது",

  "focus.enterIntention":
    "எதில் கவனம் செலுத்த விரும்புகிறீர்கள் என்பதை உள்ளிடுங்கள்.",

  "focus.startBeforeSaving":
    "அமர்வைச் சேமிப்பதற்கு முன் நேரக்கணிப்பைத் தொடங்குங்கள்.",

  "focus.sessionsLoadFailed":
    "அமர்வுகளை ஏற்ற முடியவில்லை.",

  "focus.statisticsLoadFailed":
    "புள்ளிவிவரங்களை ஏற்ற முடியவில்லை.",

  "focus.tasksLoadFailed":
    "பணிகளை ஏற்ற முடியவில்லை.",

  "focus.companionLoadFailed":
    "துணையை ஏற்ற முடியவில்லை.",

  "focus.dataLoadFailed":
    "கவனத் தரவை ஏற்ற முடியவில்லை.",

  "focus.saveFailed":
    "அமர்வைச் சேமிக்க முடியவில்லை.",

  "focus.completedMessage":
    "கவன அமர்வு முடிந்தது.",

  "focus.cancelledMessage":
    "கவன அமர்வு ரத்து செய்யப்பட்டதாகச் சேமிக்கப்பட்டது.",

  "focus.deleteConfirm":
    "\"{title}\" அமர்வை நீக்கவா?",

  "focus.deleteFailed":
    "அமர்வை நீக்க முடியவில்லை.",

  "focus.deleted":
    "கவன அமர்வு நீக்கப்பட்டது.",

  "focus.invalidResponse":
    "சேவையகம் தவறான பதிலை வழங்கியது.",
};


const hindi: FocusDictionary = {
  ...english,

  "common.backDashboard":
    "डैशबोर्ड पर वापस जाएं",

  "common.delete":
    "हटाएं",

  "common.saving":
    "सहेजा जा रहा है...",

  "focus.eyebrow":
    "शांत और व्यवस्थित एकाग्रता",

  "focus.pageTitle":
    "फोकस सत्र",

  "focus.pageDescription":
    "एक स्पष्ट उद्देश्य चुनें, आरामदायक समय निर्धारित करें और बिना दबाव के काम करें।",

  "focus.sessionsToday":
    "आज के सत्र",

  "focus.minutesToday":
    "आज के मिनट",

  "focus.allSessions":
    "सभी सत्र",

  "focus.totalMinutes":
    "कुल मिनट",

  "focus.companion":
    "फोकस साथी",

  "focus.level":
    "स्तर {level}",

  "focus.state.running":
    "आपके साथ फोकस कर रहा है",

  "focus.state.paused":
    "विराम ले रहा है",

  "focus.state.finished":
    "सत्र पूरा हुआ",

  "focus.state.idle":
    "जब आप तैयार हों",

  "focus.timer":
    "फोकस टाइमर",

  "focus.oneStep":
    "एक समय में एक चरण",

  "focus.minutesShort":
    "{minutes} मिनट",

  "focus.customDuration":
    "अपनी अवधि",

  "focus.ready":
    "तैयार",

  "focus.focusing":
    "फोकस जारी",

  "focus.paused":
    "रुका हुआ",

  "focus.complete":
    "पूर्ण",

  "focus.resume":
    "जारी रखें",

  "focus.start":
    "फोकस शुरू करें",

  "focus.pause":
    "रोकें",

  "focus.reset":
    "रीसेट",

  "focus.saveCompleted":
    "पूर्ण सत्र सहेजें",

  "focus.beginAnother":
    "दूसरा सत्र शुरू करें",

  "focus.endEarly":
    "सत्र जल्दी समाप्त करें",

  "focus.plan":
    "सत्र योजना",

  "focus.planQuestion":
    "आप किस पर फोकस करेंगे?",

  "focus.intention":
    "फोकस उद्देश्य",

  "focus.linkTask":
    "कार्य जोड़ें",

  "focus.noLinkedTask":
    "कोई कार्य नहीं",

  "focus.notes":
    "सत्र नोट्स",

  "focus.tipTitle":
    "हल्का फोकस सुझाव",

  "focus.history":
    "सत्र इतिहास",

  "focus.recentSessions":
    "हाल के फोकस सत्र",

  "focus.loadingSessions":
    "सत्र लोड हो रहे हैं...",

  "focus.emptyTitle":
    "अभी कोई फोकस सत्र नहीं",

  "focus.status.completed":
    "पूर्ण",

  "focus.status.cancelled":
    "रद्द",

  "focus.enterIntention":
    "जिस पर फोकस करना चाहते हैं उसे दर्ज करें।",

  "focus.completedMessage":
    "फोकस सत्र पूरा हुआ।",

  "focus.cancelledMessage":
    "फोकस सत्र रद्द रूप में सहेजा गया।",

  "focus.deleted":
    "फोकस सत्र हटाया गया।",
};


const arabic: FocusDictionary = {
  ...english,

  "common.backDashboard":
    "العودة إلى لوحة التحكم",

  "common.delete":
    "حذف",

  "common.saving":
    "جارٍ الحفظ...",

  "focus.eyebrow":
    "تركيز هادئ ومنظم",

  "focus.pageTitle":
    "جلسة تركيز",

  "focus.pageDescription":
    "اختر هدفًا واضحًا وحدد مدة مريحة واعمل دون ضغط.",

  "focus.sessionsToday":
    "جلسات اليوم",

  "focus.minutesToday":
    "دقائق اليوم",

  "focus.allSessions":
    "جميع الجلسات",

  "focus.totalMinutes":
    "إجمالي الدقائق",

  "focus.companion":
    "رفيق التركيز",

  "focus.companionAria":
    "{name}، رفيق {type}",

  "focus.level":
    "المستوى {level}",

  "focus.xpProgress":
    "تم اجتياز {percentage}% من هذا المستوى",

  "focus.state.running":
    "يركز معك",

  "focus.state.paused":
    "يأخذ استراحة",

  "focus.state.finished":
    "اكتملت الجلسة",

  "focus.state.idle":
    "جاهز عندما تكون جاهزًا",

  "focus.message.running":
    "{name} بجانبك. ركز فقط على الخطوة الصغيرة التالية.",

  "focus.message.paused":
    "يمكنك التوقف. تنفس أو تمدد أو عد عندما تشعر بالاستعداد.",

  "focus.message.finishedLong":
    "أكملت جلسة طويلة. قد تساعدك استراحة مناسبة من الشاشة.",

  "focus.message.finished":
    "أنهيت الجلسة. توقف لحظة ولاحظ ما أنجزته.",

  "focus.message.idle":
    "{name} مستعد للعمل بجانبك. الجلسات القصيرة مهمة أيضًا.",

  "focus.reward":
    "+{xp} XP — أكمل {name} هذه الجلسة معك.",

  "focus.rewardFailed":
    "تم حفظ الجلسة، ولكن تعذر تحديث نقاط الرفيق.",

  "focus.longBreak":
    "أكملت جلسة طويلة. ابتعد عن الشاشة لبضع دقائق.",

  "focus.shortBreak":
    "قد يساعد شرب الماء أو التمدد أو التوقف الهادئ قبل الجلسة التالية.",

  "focus.timer":
    "مؤقت التركيز",

  "focus.oneStep":
    "خطوة واحدة في كل مرة",

  "focus.minutesShort":
    "{minutes} دقيقة",

  "focus.customDuration":
    "مدة مخصصة",

  "focus.remaining":
    "متبقي {time}",

  "focus.ready":
    "جاهز",

  "focus.focusing":
    "جارٍ التركيز",

  "focus.paused":
    "متوقف مؤقتًا",

  "focus.complete":
    "مكتمل",

  "focus.resume":
    "متابعة",

  "focus.start":
    "بدء التركيز",

  "focus.pause":
    "إيقاف مؤقت",

  "focus.reset":
    "إعادة ضبط",

  "focus.saveCompleted":
    "حفظ الجلسة المكتملة",

  "focus.beginAnother":
    "بدء جلسة أخرى",

  "focus.endEarly":
    "إنهاء الجلسة مبكرًا",

  "focus.plan":
    "خطة الجلسة",

  "focus.planQuestion":
    "على ماذا ستركز؟",

  "focus.intention":
    "هدف التركيز",

  "focus.intentionPlaceholder":
    "مثال: إنهاء قسم النتائج",

  "focus.linkTask":
    "ربط مهمة",

  "focus.noLinkedTask":
    "لا توجد مهمة مرتبطة",

  "focus.notes":
    "ملاحظات الجلسة",

  "focus.notesPlaceholder":
    "اكتب الخطوة الصغيرة التالية أو أزل مصادر التشتيت",

  "focus.tipTitle":
    "نصيحة تركيز لطيفة",

  "focus.tipDescription":
    "اختر نتيجة واضحة واحدة. يمكنك دائمًا بدء جلسة أخرى لاحقًا.",

  "focus.history":
    "سجل الجلسات",

  "focus.recentSessions":
    "جلسات التركيز الأخيرة",

  "focus.loadingSessions":
    "جارٍ تحميل الجلسات...",

  "focus.emptyTitle":
    "لا توجد جلسات تركيز بعد",

  "focus.emptyDescription":
    "أكمل أول جلسة مؤقت وستظهر هنا.",

  "focus.minutesProgress":
    "{completed} من {planned} دقيقة",

  "focus.status.completed":
    "مكتملة",

  "focus.status.cancelled":
    "ملغاة",

  "focus.enterIntention":
    "أدخل ما تريد التركيز عليه.",

  "focus.startBeforeSaving":
    "ابدأ المؤقت قبل حفظ الجلسة.",

  "focus.sessionsLoadFailed":
    "تعذر تحميل الجلسات.",

  "focus.statisticsLoadFailed":
    "تعذر تحميل الإحصاءات.",

  "focus.tasksLoadFailed":
    "تعذر تحميل المهام.",

  "focus.companionLoadFailed":
    "تعذر تحميل الرفيق.",

  "focus.dataLoadFailed":
    "تعذر تحميل بيانات التركيز.",

  "focus.saveFailed":
    "تعذر حفظ الجلسة.",

  "focus.completedMessage":
    "اكتملت جلسة التركيز.",

  "focus.cancelledMessage":
    "تم حفظ جلسة التركيز كملغاة.",

  "focus.deleteConfirm":
    "حذف \"{title}\"؟",

  "focus.deleteFailed":
    "تعذر حذف الجلسة.",

  "focus.deleted":
    "تم حذف جلسة التركيز.",

  "focus.invalidResponse":
    "أعاد الخادم استجابة غير صالحة.",
};


const dictionaries:
  Record<string, FocusDictionary> = {
    en: english,
    ta: tamil,
    hi: hindi,
    ar: arabic,
  };


export function focusText(
  locale: string,
  key: FocusTranslationKey,
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
    ?? english[key];

  for (
    const [name, value]
    of Object.entries(values)
  ) {
    result = result.replaceAll(
      `{${name}}`,
      String(value),
    );
  }

  return result;
}
