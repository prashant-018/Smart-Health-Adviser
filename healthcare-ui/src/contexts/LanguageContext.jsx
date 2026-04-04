import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const LANGUAGES = {
  en: { name: "English", nativeName: "English", flag: "🇬🇧" },
  hi: { name: "Hindi", nativeName: "हिंदी", flag: "🇮🇳" },
  ta: { name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  te: { name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  bn: { name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳" },
  mr: { name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
  gu: { name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳" },
  kn: { name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳" },
  ml: { name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳" },
  pa: { name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
};

const TRANSLATIONS = {
  en: {
    // Navigation
    home: "Home",
    about: "About",
    bodyMap: "Body Map",
    uploadLabReport: "Upload lab report",
    uploadMedicine: "Upload medicine",
    skinDetector: "Skin detector",
    contactUs: "Contact us",
    findNearbyHospital: "Find nearby hospital",
    
    // Home page
    homeTitle: "Get best quality health care services at reasonable cost",
    homeSubtitle: "Healthcare AI Assistant is your digital front door for everyday health questions. Describe how you feel in plain language, get organized guidance, and see when it makes sense to speak with a clinician — all in one place.",
    startHealthChat: "Start health chat",
    symptomChatGuidance: "Symptom chat & guidance",
    labMedicineUploads: "Lab & medicine uploads",
    hospitalsNearYou: "Hospitals near you",
    
    // Chat
    chatTitle: "Healthcare AI Assistant",
    chatSubtitle: "Chat about symptoms here. For lab reports or medicine photos, use Upload lab report or Upload medicine in the menu above.",
    typeMessage: "Describe symptoms or ask a question...",
    send: "Send",
    speak: "Speak",
    readAloud: "Read aloud",
    
    // Body Map
    bodyMapTitle: "Body Map Symptom Checker",
    bodyMapSubtitle: "Click on body parts to select symptoms, adjust intensity, and get AI-powered health insights.",
    selectAffectedArea: "Select Affected Area",
    clickBodyParts: "Click on body parts to see related symptoms",
    generalSymptoms: "General Symptoms:",
    symptomsSelected: "symptoms selected",
    symptomSelected: "symptom selected",
    intensity: "Intensity:",
    mild: "mild",
    moderate: "moderate",
    severe: "severe",
    reset: "Reset",
    analyzeSymptoms: "Analyze Symptoms",
    analyzing: "Analyzing...",
    analysisResult: "Analysis Result",
    continueInChat: "Continue in Chat",
    selectAtLeastOne: "Please select at least one symptom",
    
    // Upload pages
    uploadMedicineTitle: "Upload medicine photo",
    uploadMedicineSubtitle: "Take or upload a clear photo of the packaging or label. The assistant will try to identify the medicine and share usage-oriented details.",
    uploadLabReportTitle: "Upload lab report",
    uploadLabReportSubtitle: "Upload blood test reports and get easy-to-understand summaries with health insights.",
    skinDetectorTitle: "Skin Disease Detector",
    skinDetectorSubtitle: "Upload a clear photo of the affected skin area (rash, acne, mole, etc.) and the AI will suggest a possible condition with care tips.",
    dropImageHere: "Drop an image here, or click to browse",
    uploadAndIdentify: "Upload & identify",
    analyzeSkin: "Analyze Skin",
    result: "Result",
    
    // Common
    backToHome: "Back to Home",
    loading: "Loading...",
    serverError: "Server error occurred.",
    noFileSelected: "No file selected.",
    
    // Features
    featuresTitle: "Everything you need for better health",
    bodyMapFeature: "Click on body parts to select symptoms visually. Adjust intensity and get instant AI diagnosis.",
    chatFeature: "Describe symptoms in plain language and get instant health guidance with precautions.",
    skinFeature: "Upload photos of rashes, acne, or skin conditions for AI-powered analysis and care tips.",
    labFeature: "Upload blood test reports and get easy-to-understand summaries with health insights.",
    medicineFeature: "Take a photo of medicine packaging to identify it and learn about uses and side effects.",
    hospitalFeature: "Locate hospitals near you with ratings, phone numbers, and directions. Available in the header.",
    tryItNow: "Try it now",
    new: "NEW",
  },
  
  hi: {
    // Navigation
    home: "होम",
    about: "हमारे बारे में",
    bodyMap: "बॉडी मैप",
    uploadLabReport: "लैब रिपोर्ट अपलोड करें",
    uploadMedicine: "दवा अपलोड करें",
    skinDetector: "त्वचा जांच",
    contactUs: "संपर्क करें",
    findNearbyHospital: "नजदीकी अस्पताल खोजें",
    
    // Home page
    homeTitle: "उचित मूल्य पर सर्वोत्तम गुणवत्ता वाली स्वास्थ्य सेवाएं प्राप्त करें",
    homeSubtitle: "हेल्थकेयर एआई असिस्टेंट आपके रोजमर्रा के स्वास्थ्य प्रश्नों के लिए डिजिटल दरवाजा है। सरल भाषा में बताएं कि आप कैसा महसूस कर रहे हैं, संगठित मार्गदर्शन प्राप्त करें।",
    startHealthChat: "स्वास्थ्य चैट शुरू करें",
    symptomChatGuidance: "लक्षण चैट और मार्गदर्शन",
    labMedicineUploads: "लैब और दवा अपलोड",
    hospitalsNearYou: "आपके पास अस्पताल",
    
    // Chat
    chatTitle: "हेल्थकेयर एआई असिस्टेंट",
    chatSubtitle: "यहां लक्षणों के बारे में चैट करें। लैब रिपोर्ट या दवा की तस्वीरों के लिए, ऊपर मेनू में लैब रिपोर्ट अपलोड करें या दवा अपलोड करें का उपयोग करें।",
    typeMessage: "लक्षण बताएं या प्रश्न पूछें...",
    send: "भेजें",
    speak: "बोलें",
    readAloud: "जोर से पढ़ें",
    
    // Body Map
    bodyMapTitle: "बॉडी मैप लक्षण जांच",
    bodyMapSubtitle: "शरीर के अंगों पर क्लिक करें, लक्षण चुनें, तीव्रता समायोजित करें और एआई-संचालित स्वास्थ्य जानकारी प्राप्त करें।",
    selectAffectedArea: "प्रभावित क्षेत्र चुनें",
    clickBodyParts: "संबंधित लक्षण देखने के लिए शरीर के अंगों पर क्लिक करें",
    generalSymptoms: "सामान्य लक्षण:",
    symptomsSelected: "लक्षण चुने गए",
    symptomSelected: "लक्षण चुना गया",
    intensity: "तीव्रता:",
    mild: "हल्का",
    moderate: "मध्यम",
    severe: "गंभीर",
    reset: "रीसेट",
    analyzeSymptoms: "लक्षणों का विश्लेषण करें",
    analyzing: "विश्लेषण हो रहा है...",
    analysisResult: "विश्लेषण परिणाम",
    continueInChat: "चैट में जारी रखें",
    selectAtLeastOne: "कृपया कम से कम एक लक्षण चुनें",
    
    // Upload pages
    uploadMedicineTitle: "दवा की तस्वीर अपलोड करें",
    uploadMedicineSubtitle: "पैकेजिंग या लेबल की स्पष्ट तस्वीर लें या अपलोड करें। सहायक दवा की पहचान करने और उपयोग-उन्मुख विवरण साझा करने का प्रयास करेगा।",
    uploadLabReportTitle: "लैब रिपोर्ट अपलोड करें",
    uploadLabReportSubtitle: "रक्त परीक्षण रिपोर्ट अपलोड करें और स्वास्थ्य अंतर्दृष्टि के साथ समझने में आसान सारांश प्राप्त करें।",
    skinDetectorTitle: "त्वचा रोग डिटेक्टर",
    skinDetectorSubtitle: "प्रभावित त्वचा क्षेत्र की स्पष्ट तस्वीर अपलोड करें और एआई संभावित स्थिति और देखभाल युक्तियों का सुझाव देगा।",
    dropImageHere: "यहां एक छवि छोड़ें, या ब्राउज़ करने के लिए क्लिक करें",
    uploadAndIdentify: "अपलोड करें और पहचानें",
    analyzeSkin: "त्वचा का विश्लेषण करें",
    result: "परिणाम",
    
    // Common
    backToHome: "होम पर वापस जाएं",
    loading: "लोड हो रहा है...",
    serverError: "सर्वर त्रुटि हुई।",
    noFileSelected: "कोई फ़ाइल चयनित नहीं।",
    
    // Features
    featuresTitle: "बेहतर स्वास्थ्य के लिए आपको जो कुछ भी चाहिए",
    bodyMapFeature: "दृश्य रूप से लक्षण चुनने के लिए शरीर के अंगों पर क्लिक करें। तीव्रता समायोजित करें और तत्काल एआई निदान प्राप्त करें।",
    chatFeature: "सरल भाषा में लक्षणों का वर्णन करें और सावधानियों के साथ तत्काल स्वास्थ्य मार्गदर्शन प्राप्त करें।",
    skinFeature: "एआई-संचालित विश्लेषण और देखभाल युक्तियों के लिए चकत्ते, मुंहासे या त्वचा की स्थिति की तस्वीरें अपलोड करें।",
    labFeature: "रक्त परीक्षण रिपोर्ट अपलोड करें और स्वास्थ्य अंतर्दृष्टि के साथ समझने में आसान सारांश प्राप्त करें।",
    medicineFeature: "दवा की पैकेजिंग की तस्वीर लें, इसकी पहचान करें और उपयोग और दुष्प्रभावों के बारे में जानें।",
    hospitalFeature: "रेटिंग, फोन नंबर और दिशाओं के साथ अपने पास के अस्पतालों का पता लगाएं। हेडर में उपलब्ध।",
    tryItNow: "अभी आज़माएं",
    new: "नया",
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("preferredLanguage") || "en";
  });

  useEffect(() => {
    localStorage.setItem("preferredLanguage", language);
  }, [language]);

  const t = (key) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
