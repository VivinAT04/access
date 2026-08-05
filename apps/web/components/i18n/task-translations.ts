export type TaskTranslationKey =
  | "common.backDashboard"
  | "common.cancel"
  | "common.edit"
  | "common.delete"
  | "common.saving"
  | "common.loading"
  | "task.navigation"
  | "task.eyebrow"
  | "task.pageTitle"
  | "task.pageDescription"
  | "task.total"
  | "task.todo"
  | "task.inProgress"
  | "task.completed"
  | "task.overdue"
  | "task.planner"
  | "task.yourTasks"
  | "task.add"
  | "task.search"
  | "task.searchPlaceholder"
  | "task.status"
  | "task.allStatuses"
  | "task.priority"
  | "task.allPriorities"
  | "task.low"
  | "task.medium"
  | "task.high"
  | "task.urgent"
  | "task.loading"
  | "task.emptyTitle"
  | "task.emptyDescription"
  | "task.create"
  | "task.noDueDate"
  | "task.due"
  | "task.reopenLabel"
  | "task.completeLabel"
  | "task.updateEyebrow"
  | "task.newEyebrow"
  | "task.editTitle"
  | "task.addTitle"
  | "task.closeForm"
  | "task.titleLabel"
  | "task.titlePlaceholder"
  | "task.descriptionLabel"
  | "task.descriptionPlaceholder"
  | "task.dueDate"
  | "task.saveChanges"
  | "task.enterTitle"
  | "task.loadFailed"
  | "task.summaryFailed"
  | "task.saveFailed"
  | "task.updated"
  | "task.created"
  | "task.updateFailed"
  | "task.completedMessage"
  | "task.reopenedMessage"
  | "task.deleteConfirm"
  | "task.deleteFailed"
  | "task.deleted"
  | "task.invalidResponse"
  | "task.requestFailed"
  | "subtask.breakdown"
  | "subtask.none"
  | "subtask.progress"
  | "subtask.hide"
  | "subtask.breakIntoSteps"
  | "subtask.percentComplete"
  | "subtask.allComplete"
  | "subtask.editStep"
  | "subtask.addSmallStep"
  | "subtask.cancelEdit"
  | "subtask.titlePlaceholder"
  | "subtask.notesPlaceholder"
  | "subtask.saveStep"
  | "subtask.addStep"
  | "subtask.loading"
  | "subtask.emptyTitle"
  | "subtask.emptyDescription"
  | "subtask.reopenLabel"
  | "subtask.completeLabel"
  | "subtask.moveUp"
  | "subtask.moveDown"
  | "subtask.startFocus"
  | "subtask.enterTitle"
  | "subtask.loadFailed"
  | "subtask.progressFailed"
  | "subtask.saveFailed"
  | "subtask.updated"
  | "subtask.added"
  | "subtask.updateFailed"
  | "subtask.completedMessage"
  | "subtask.reopenedMessage"
  | "subtask.deleteConfirm"
  | "subtask.deleteFailed"
  | "subtask.deleted"
  | "subtask.reorderFailed"
  | "subtask.orderUpdated";


type TaskDictionary =
  Record<TaskTranslationKey, string>;


const english: TaskDictionary = {
  "common.backDashboard": "Back to dashboard",
  "common.cancel": "Cancel",
  "common.edit": "Edit",
  "common.delete": "Delete",
  "common.saving": "Saving...",
  "common.loading": "Loading...",

  "task.navigation": "Task navigation",
  "task.eyebrow": "Plan without pressure",
  "task.pageTitle": "Task manager",
  "task.pageDescription":
    "Capture what needs doing, choose a realistic priority and focus on one manageable step at a time.",
  "task.total": "Total tasks",
  "task.todo": "To do",
  "task.inProgress": "In progress",
  "task.completed": "Completed",
  "task.overdue": "Overdue",
  "task.planner": "Executive-function planner",
  "task.yourTasks": "Your tasks",
  "task.add": "Add task",
  "task.search": "Search",
  "task.searchPlaceholder": "Search tasks",
  "task.status": "Status",
  "task.allStatuses": "All statuses",
  "task.priority": "Priority",
  "task.allPriorities": "All priorities",
  "task.low": "Low",
  "task.medium": "Medium",
  "task.high": "High",
  "task.urgent": "Urgent",
  "task.loading": "Loading your tasks...",
  "task.emptyTitle": "No tasks found",
  "task.emptyDescription":
    "Add your first task or adjust the current filters.",
  "task.create": "Create a task",
  "task.noDueDate": "No due date",
  "task.due": "Due",
  "task.reopenLabel": "Reopen {title}",
  "task.completeLabel": "Complete {title}",
  "task.updateEyebrow": "Update task",
  "task.newEyebrow": "New task",
  "task.editTitle": "Edit task",
  "task.addTitle": "Add a task",
  "task.closeForm": "Close task form",
  "task.titleLabel": "Task title",
  "task.titlePlaceholder": "What needs to be done?",
  "task.descriptionLabel": "Description",
  "task.descriptionPlaceholder":
    "Add helpful notes or the next small step",
  "task.dueDate": "Due date",
  "task.saveChanges": "Save changes",
  "task.enterTitle": "Enter a title for the task.",
  "task.loadFailed": "Tasks could not be loaded.",
  "task.summaryFailed": "Task summary could not be loaded.",
  "task.saveFailed": "The task could not be saved.",
  "task.updated": "Task updated.",
  "task.created": "Task created.",
  "task.updateFailed": "The task could not be updated.",
  "task.completedMessage": "Task completed.",
  "task.reopenedMessage": "Task reopened.",
  "task.deleteConfirm": "Delete \"{title}\"?",
  "task.deleteFailed": "The task could not be deleted.",
  "task.deleted": "Task deleted.",
  "task.invalidResponse": "The server returned an invalid response.",
  "task.requestFailed": "Request failed with status {status}.",

  "subtask.breakdown": "Task breakdown",
  "subtask.none": "No subtasks yet",
  "subtask.progress": "{completed} of {total} completed",
  "subtask.hide": "Hide steps",
  "subtask.breakIntoSteps": "Break into steps",
  "subtask.percentComplete": "{percentage}% complete",
  "subtask.allComplete": "All steps complete",
  "subtask.editStep": "Edit step",
  "subtask.addSmallStep": "Add a small step",
  "subtask.cancelEdit": "Cancel edit",
  "subtask.titlePlaceholder": "Example: Write the introduction",
  "subtask.notesPlaceholder": "Optional notes for this step",
  "subtask.saveStep": "Save step",
  "subtask.addStep": "Add step",
  "subtask.loading": "Loading steps...",
  "subtask.emptyTitle": "No steps yet",
  "subtask.emptyDescription":
    "Add the smallest action you could begin with.",
  "subtask.reopenLabel": "Reopen {title}",
  "subtask.completeLabel": "Complete {title}",
  "subtask.moveUp": "Move {title} up",
  "subtask.moveDown": "Move {title} down",
  "subtask.startFocus": "Start focus for this task",
  "subtask.enterTitle": "Enter a title for the subtask.",
  "subtask.loadFailed": "Subtasks could not be loaded.",
  "subtask.progressFailed": "Task progress could not be loaded.",
  "subtask.saveFailed": "The subtask could not be saved.",
  "subtask.updated": "Subtask updated.",
  "subtask.added": "Subtask added.",
  "subtask.updateFailed": "The subtask could not be updated.",
  "subtask.completedMessage": "Subtask completed.",
  "subtask.reopenedMessage": "Subtask reopened.",
  "subtask.deleteConfirm": "Delete \"{title}\"?",
  "subtask.deleteFailed": "The subtask could not be deleted.",
  "subtask.deleted": "Subtask deleted.",
  "subtask.reorderFailed": "Subtasks could not be reordered.",
  "subtask.orderUpdated": "Subtask order updated.",
};


const tamil: TaskDictionary = {
  "common.backDashboard": "முகப்புப் பலகைக்குத் திரும்பு",
  "common.cancel": "ரத்து செய்",
  "common.edit": "திருத்து",
  "common.delete": "நீக்கு",
  "common.saving": "சேமிக்கப்படுகிறது...",
  "common.loading": "ஏற்றப்படுகிறது...",

  "task.navigation": "பணி வழிசெலுத்தல்",
  "task.eyebrow": "அழுத்தமின்றித் திட்டமிடுங்கள்",
  "task.pageTitle": "பணி மேலாளர்",
  "task.pageDescription":
    "செய்ய வேண்டியவற்றைப் பதிவு செய்து, நடைமுறை முன்னுரிமையைத் தேர்ந்தெடுத்து, ஒரு நேரத்தில் ஒரு சிறிய படியில் கவனம் செலுத்துங்கள்.",
  "task.total": "மொத்த பணிகள்",
  "task.todo": "செய்ய வேண்டியது",
  "task.inProgress": "செயலில் உள்ளது",
  "task.completed": "முடிக்கப்பட்டது",
  "task.overdue": "தாமதமானது",
  "task.planner": "நிர்வாகச் செயல்பாட்டுத் திட்டம்",
  "task.yourTasks": "உங்கள் பணிகள்",
  "task.add": "பணியைச் சேர்",
  "task.search": "தேடல்",
  "task.searchPlaceholder": "பணிகளைத் தேடுங்கள்",
  "task.status": "நிலை",
  "task.allStatuses": "அனைத்து நிலைகளும்",
  "task.priority": "முன்னுரிமை",
  "task.allPriorities": "அனைத்து முன்னுரிமைகளும்",
  "task.low": "குறைவு",
  "task.medium": "நடுத்தரம்",
  "task.high": "அதிகம்",
  "task.urgent": "அவசரம்",
  "task.loading": "உங்கள் பணிகள் ஏற்றப்படுகின்றன...",
  "task.emptyTitle": "பணிகள் எதுவும் இல்லை",
  "task.emptyDescription":
    "உங்கள் முதல் பணியைச் சேர்க்கவும் அல்லது வடிகட்டிகளை மாற்றவும்.",
  "task.create": "பணியை உருவாக்கு",
  "task.noDueDate": "காலக்கெடு இல்லை",
  "task.due": "காலக்கெடு",
  "task.reopenLabel": "{title} பணியை மீண்டும் திற",
  "task.completeLabel": "{title} பணியை முடி",
  "task.updateEyebrow": "பணியைப் புதுப்பிக்கவும்",
  "task.newEyebrow": "புதிய பணி",
  "task.editTitle": "பணியைத் திருத்து",
  "task.addTitle": "பணியைச் சேர்",
  "task.closeForm": "பணி படிவத்தை மூடு",
  "task.titleLabel": "பணியின் தலைப்பு",
  "task.titlePlaceholder": "என்ன செய்ய வேண்டும்?",
  "task.descriptionLabel": "விளக்கம்",
  "task.descriptionPlaceholder":
    "உதவும் குறிப்புகள் அல்லது அடுத்த சிறிய படியைச் சேர்க்கவும்",
  "task.dueDate": "காலக்கெடு",
  "task.saveChanges": "மாற்றங்களைச் சேமி",
  "task.enterTitle": "பணிக்கான தலைப்பை உள்ளிடுங்கள்.",
  "task.loadFailed": "பணிகளை ஏற்ற முடியவில்லை.",
  "task.summaryFailed": "பணிச் சுருக்கத்தை ஏற்ற முடியவில்லை.",
  "task.saveFailed": "பணியைச் சேமிக்க முடியவில்லை.",
  "task.updated": "பணி புதுப்பிக்கப்பட்டது.",
  "task.created": "பணி உருவாக்கப்பட்டது.",
  "task.updateFailed": "பணியைப் புதுப்பிக்க முடியவில்லை.",
  "task.completedMessage": "பணி முடிக்கப்பட்டது.",
  "task.reopenedMessage": "பணி மீண்டும் திறக்கப்பட்டது.",
  "task.deleteConfirm": "\"{title}\" பணியை நீக்கவா?",
  "task.deleteFailed": "பணியை நீக்க முடியவில்லை.",
  "task.deleted": "பணி நீக்கப்பட்டது.",
  "task.invalidResponse": "சேவையகம் தவறான பதிலை வழங்கியது.",
  "task.requestFailed": "கோரிக்கை தோல்வியடைந்தது: {status}.",

  "subtask.breakdown": "பணி பிரிப்பு",
  "subtask.none": "இன்னும் சிறு படிகள் இல்லை",
  "subtask.progress": "{total} இல் {completed} முடிந்தது",
  "subtask.hide": "படிகளை மறை",
  "subtask.breakIntoSteps": "சிறு படிகளாகப் பிரி",
  "subtask.percentComplete": "{percentage}% முடிந்தது",
  "subtask.allComplete": "அனைத்து படிகளும் முடிந்தன",
  "subtask.editStep": "படியைத் திருத்து",
  "subtask.addSmallStep": "ஒரு சிறிய படியைச் சேர்",
  "subtask.cancelEdit": "திருத்தத்தை ரத்து செய்",
  "subtask.titlePlaceholder": "உதாரணம்: அறிமுகத்தை எழுதுங்கள்",
  "subtask.notesPlaceholder": "இந்த படிக்கான விருப்பக் குறிப்புகள்",
  "subtask.saveStep": "படியைச் சேமி",
  "subtask.addStep": "படியைச் சேர்",
  "subtask.loading": "படிகள் ஏற்றப்படுகின்றன...",
  "subtask.emptyTitle": "இன்னும் படிகள் இல்லை",
  "subtask.emptyDescription":
    "நீங்கள் தொடங்கக்கூடிய மிகச் சிறிய செயலைச் சேர்க்கவும்.",
  "subtask.reopenLabel": "{title} படியை மீண்டும் திற",
  "subtask.completeLabel": "{title} படியை முடி",
  "subtask.moveUp": "{title} படியை மேலே நகர்த்து",
  "subtask.moveDown": "{title} படியை கீழே நகர்த்து",
  "subtask.startFocus": "இந்த பணிக்கான கவன அமர்வைத் தொடங்கு",
  "subtask.enterTitle": "சிறு படிக்கான தலைப்பை உள்ளிடுங்கள்.",
  "subtask.loadFailed": "சிறு படிகளை ஏற்ற முடியவில்லை.",
  "subtask.progressFailed": "பணி முன்னேற்றத்தை ஏற்ற முடியவில்லை.",
  "subtask.saveFailed": "சிறு படியைச் சேமிக்க முடியவில்லை.",
  "subtask.updated": "சிறு படி புதுப்பிக்கப்பட்டது.",
  "subtask.added": "சிறு படி சேர்க்கப்பட்டது.",
  "subtask.updateFailed": "சிறு படியைப் புதுப்பிக்க முடியவில்லை.",
  "subtask.completedMessage": "சிறு படி முடிக்கப்பட்டது.",
  "subtask.reopenedMessage": "சிறு படி மீண்டும் திறக்கப்பட்டது.",
  "subtask.deleteConfirm": "\"{title}\" படியை நீக்கவா?",
  "subtask.deleteFailed": "சிறு படியை நீக்க முடியவில்லை.",
  "subtask.deleted": "சிறு படி நீக்கப்பட்டது.",
  "subtask.reorderFailed": "படிகளின் வரிசையை மாற்ற முடியவில்லை.",
  "subtask.orderUpdated": "படிகளின் வரிசை புதுப்பிக்கப்பட்டது.",
};


const hindi: TaskDictionary = {
  ...english,

  "common.backDashboard": "डैशबोर्ड पर वापस जाएं",
  "common.cancel": "रद्द करें",
  "common.edit": "संपादित करें",
  "common.delete": "हटाएं",
  "common.saving": "सहेजा जा रहा है...",

  "task.eyebrow": "बिना दबाव के योजना बनाएं",
  "task.pageTitle": "कार्य प्रबंधक",
  "task.pageDescription":
    "ज़रूरी काम दर्ज करें, व्यावहारिक प्राथमिकता चुनें और एक समय में एक छोटे चरण पर ध्यान दें।",
  "task.total": "कुल कार्य",
  "task.todo": "करना है",
  "task.inProgress": "प्रगति में",
  "task.completed": "पूर्ण",
  "task.overdue": "समय से पीछे",
  "task.yourTasks": "आपके कार्य",
  "task.add": "कार्य जोड़ें",
  "task.search": "खोजें",
  "task.searchPlaceholder": "कार्य खोजें",
  "task.status": "स्थिति",
  "task.priority": "प्राथमिकता",
  "task.low": "कम",
  "task.medium": "मध्यम",
  "task.high": "उच्च",
  "task.urgent": "तत्काल",
  "task.loading": "आपके कार्य लोड हो रहे हैं...",
  "task.emptyTitle": "कोई कार्य नहीं मिला",
  "task.create": "कार्य बनाएं",
  "task.noDueDate": "कोई नियत तिथि नहीं",
  "task.due": "नियत",
  "task.editTitle": "कार्य संपादित करें",
  "task.addTitle": "कार्य जोड़ें",
  "task.titleLabel": "कार्य का शीर्षक",
  "task.descriptionLabel": "विवरण",
  "task.dueDate": "नियत तिथि",
  "task.saveChanges": "परिवर्तन सहेजें",
  "task.created": "कार्य बनाया गया।",
  "task.updated": "कार्य अपडेट किया गया।",
  "task.deleted": "कार्य हटाया गया।",

  "subtask.breakdown": "कार्य के छोटे चरण",
  "subtask.none": "अभी कोई छोटा चरण नहीं",
  "subtask.hide": "चरण छिपाएं",
  "subtask.breakIntoSteps": "छोटे चरणों में बांटें",
  "subtask.allComplete": "सभी चरण पूर्ण",
  "subtask.editStep": "चरण संपादित करें",
  "subtask.addSmallStep": "एक छोटा चरण जोड़ें",
  "subtask.cancelEdit": "संपादन रद्द करें",
  "subtask.saveStep": "चरण सहेजें",
  "subtask.addStep": "चरण जोड़ें",
  "subtask.loading": "चरण लोड हो रहे हैं...",
  "subtask.emptyTitle": "अभी कोई चरण नहीं",
  "subtask.startFocus": "इस कार्य के लिए फोकस शुरू करें",
  "subtask.updated": "चरण अपडेट किया गया।",
  "subtask.added": "चरण जोड़ा गया।",
  "subtask.deleted": "चरण हटाया गया।",
};


const arabic: TaskDictionary = {
  ...english,

  "common.backDashboard": "العودة إلى لوحة التحكم",
  "common.cancel": "إلغاء",
  "common.edit": "تعديل",
  "common.delete": "حذف",
  "common.saving": "جارٍ الحفظ...",

  "task.navigation": "التنقل بين المهام",
  "task.eyebrow": "خطط دون ضغط",
  "task.pageTitle": "مدير المهام",
  "task.pageDescription":
    "سجل ما يجب فعله، واختر أولوية واقعية، وركز على خطوة صغيرة واحدة في كل مرة.",
  "task.total": "إجمالي المهام",
  "task.todo": "قيد الانتظار",
  "task.inProgress": "قيد التنفيذ",
  "task.completed": "مكتملة",
  "task.overdue": "متأخرة",
  "task.planner": "مخطط الوظائف التنفيذية",
  "task.yourTasks": "مهامك",
  "task.add": "إضافة مهمة",
  "task.search": "بحث",
  "task.searchPlaceholder": "ابحث عن المهام",
  "task.status": "الحالة",
  "task.allStatuses": "جميع الحالات",
  "task.priority": "الأولوية",
  "task.allPriorities": "جميع الأولويات",
  "task.low": "منخفضة",
  "task.medium": "متوسطة",
  "task.high": "مرتفعة",
  "task.urgent": "عاجلة",
  "task.loading": "جارٍ تحميل مهامك...",
  "task.emptyTitle": "لم يتم العثور على مهام",
  "task.emptyDescription":
    "أضف مهمتك الأولى أو غيّر عوامل التصفية.",
  "task.create": "إنشاء مهمة",
  "task.noDueDate": "لا يوجد موعد",
  "task.due": "الموعد",
  "task.reopenLabel": "إعادة فتح {title}",
  "task.completeLabel": "إكمال {title}",
  "task.updateEyebrow": "تحديث المهمة",
  "task.newEyebrow": "مهمة جديدة",
  "task.editTitle": "تعديل المهمة",
  "task.addTitle": "إضافة مهمة",
  "task.closeForm": "إغلاق نموذج المهمة",
  "task.titleLabel": "عنوان المهمة",
  "task.titlePlaceholder": "ما الذي يجب إنجازه؟",
  "task.descriptionLabel": "الوصف",
  "task.descriptionPlaceholder":
    "أضف ملاحظات مفيدة أو الخطوة الصغيرة التالية",
  "task.dueDate": "تاريخ الاستحقاق",
  "task.saveChanges": "حفظ التغييرات",
  "task.enterTitle": "أدخل عنوانًا للمهمة.",
  "task.loadFailed": "تعذر تحميل المهام.",
  "task.summaryFailed": "تعذر تحميل ملخص المهام.",
  "task.saveFailed": "تعذر حفظ المهمة.",
  "task.updated": "تم تحديث المهمة.",
  "task.created": "تم إنشاء المهمة.",
  "task.updateFailed": "تعذر تحديث المهمة.",
  "task.completedMessage": "اكتملت المهمة.",
  "task.reopenedMessage": "أعيد فتح المهمة.",
  "task.deleteConfirm": "حذف \"{title}\"؟",
  "task.deleteFailed": "تعذر حذف المهمة.",
  "task.deleted": "تم حذف المهمة.",
  "task.invalidResponse": "أعاد الخادم استجابة غير صالحة.",
  "task.requestFailed": "فشل الطلب بالحالة {status}.",

  "subtask.breakdown": "تقسيم المهمة",
  "subtask.none": "لا توجد خطوات بعد",
  "subtask.progress": "اكتملت {completed} من {total}",
  "subtask.hide": "إخفاء الخطوات",
  "subtask.breakIntoSteps": "تقسيمها إلى خطوات",
  "subtask.percentComplete": "اكتمل {percentage}%",
  "subtask.allComplete": "اكتملت جميع الخطوات",
  "subtask.editStep": "تعديل الخطوة",
  "subtask.addSmallStep": "إضافة خطوة صغيرة",
  "subtask.cancelEdit": "إلغاء التعديل",
  "subtask.titlePlaceholder": "مثال: كتابة المقدمة",
  "subtask.notesPlaceholder": "ملاحظات اختيارية لهذه الخطوة",
  "subtask.saveStep": "حفظ الخطوة",
  "subtask.addStep": "إضافة خطوة",
  "subtask.loading": "جارٍ تحميل الخطوات...",
  "subtask.emptyTitle": "لا توجد خطوات بعد",
  "subtask.emptyDescription":
    "أضف أصغر إجراء يمكنك البدء به.",
  "subtask.reopenLabel": "إعادة فتح {title}",
  "subtask.completeLabel": "إكمال {title}",
  "subtask.moveUp": "نقل {title} إلى الأعلى",
  "subtask.moveDown": "نقل {title} إلى الأسفل",
  "subtask.startFocus": "بدء التركيز لهذه المهمة",
  "subtask.enterTitle": "أدخل عنوانًا للخطوة.",
  "subtask.loadFailed": "تعذر تحميل الخطوات.",
  "subtask.progressFailed": "تعذر تحميل تقدم المهمة.",
  "subtask.saveFailed": "تعذر حفظ الخطوة.",
  "subtask.updated": "تم تحديث الخطوة.",
  "subtask.added": "تمت إضافة الخطوة.",
  "subtask.updateFailed": "تعذر تحديث الخطوة.",
  "subtask.completedMessage": "اكتملت الخطوة.",
  "subtask.reopenedMessage": "أعيد فتح الخطوة.",
  "subtask.deleteConfirm": "حذف \"{title}\"؟",
  "subtask.deleteFailed": "تعذر حذف الخطوة.",
  "subtask.deleted": "تم حذف الخطوة.",
  "subtask.reorderFailed": "تعذر إعادة ترتيب الخطوات.",
  "subtask.orderUpdated": "تم تحديث ترتيب الخطوات.",
};


const dictionaries:
  Record<string, TaskDictionary> = {
    en: english,
    ta: tamil,
    hi: hindi,
    ar: arabic,
  };


export function taskText(
  locale: string,
  key: TaskTranslationKey,
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
