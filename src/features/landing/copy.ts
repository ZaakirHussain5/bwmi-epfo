import type { AppLocale } from "@/i18n/config";

export const LANDING_LOCALES = ["en", "hi", "kn"] as const;

export type LandingLocale = AppLocale;

export const LOCALE_META: Record<
  LandingLocale,
  { label: string; native: string; htmlLang: string }
> = {
  en: { label: "English", native: "English", htmlLang: "en" },
  hi: { label: "Hindi", native: "हिन्दी", htmlLang: "hi" },
  kn: { label: "Kannada", native: "ಕನ್ನಡ", htmlLang: "kn" },
};

export type LandingCopy = {
  skip: string;
  nav: {
    features: string;
    journey: string;
    voice: string;
    enter: string;
    openDashboard: string;
    language: string;
  };
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
    cta: string;
    secondary: string;
    signedInCta: string;
  };
  stats: { value: string; label: string }[];
  scene: {
    balance: string;
    health: string;
    claim: string;
    ask: string;
    month: string;
    listening: string;
  };
  features: {
    kicker: string;
    title: string;
    subtitle: string;
    items: { id: string; title: string; body: string }[];
  };
  voice: {
    kicker: string;
    title: string;
    body: string;
    points: string[];
  };
  journey: {
    kicker: string;
    title: string;
    subtitle: string;
    steps: { title: string; body: string }[];
  };
  prompts: {
    kicker: string;
    title: string;
    subtitle: string;
    items: string[];
  };
  cta: {
    title: string;
    body: string;
    button: string;
    signedInButton: string;
  };
  footer: {
    notice: string;
    privacy: string;
    terms: string;
    home: string;
  };
};

export const landingCopy: Record<LandingLocale, LandingCopy> = {
  en: {
    skip: "Skip to content",
    nav: {
      features: "Features",
      journey: "How it works",
      voice: "Voice",
      enter: "Enter portal",
      openDashboard: "Open dashboard",
      language: "Language",
    },
    hero: {
      kicker: "Independent EPF member experience",
      title: "Your EPF, in conversation.",
      subtitle:
        "Nidhi turns balances, passbook rows, and claim stages into plain language — then helps you act. Chat or speak, in the language you prefer.",
      cta: "Enter the portal",
      secondary: "Explore features",
      signedInCta: "Open your dashboard",
    },
    stats: [
      { value: "Text + voice", label: "Ask Nidhi on every page" },
      { value: "One full claim", label: "Medical advance, draft to submit" },
      { value: "Account health", label: "KYC, nominees, and next actions" },
    ],
    scene: {
      balance: "Total balance",
      health: "Account health",
      claim: "Medical advance",
      ask: "Ask Nidhi",
      month: "Jun 2026",
      listening: "Listening",
    },
    features: {
      kicker: "What you can do",
      title: "Every portal surface, explained.",
      subtitle:
        "From the first balance check to a submitted claim, Nidhi stays beside the work — not a separate chatbot island.",
      items: [
        {
          id: "assistant",
          title: "Ask Nidhi",
          body: "A left-rail assistant on every signed-in page. Nidhi reads your account data, explains what happened and what to do next, and can open the right screen for you.",
        },
        {
          id: "voice",
          title: "Voice agent",
          body: "Speak instead of typing. Speech is transcribed, then follows the same tools as chat — including confirmation before a claim submit or support ticket.",
        },
        {
          id: "dashboard",
          title: "Dashboard",
          body: "See your balance snapshot, account health score, pending tasks, and shortcuts to passbook, claims, KYC, and services.",
        },
        {
          id: "passbook",
          title: "Passbook",
          body: "Review monthly employee and employer contributions, compare periods, search months, and spot unusual entries with plain-language notes.",
        },
        {
          id: "claims",
          title: "Claims",
          body: "Track who owns each stage, follow a detailed timeline, and complete a medical advance: draft, autosave, review, confirm, then submit.",
        },
        {
          id: "profile",
          title: "Profile",
          body: "Keep mobile, email, bank, KYC, employment history, and nominees current — nominee shares should total 100% — before you claim.",
        },
        {
          id: "services",
          title: "Services",
          body: "Browse common EPF services, see what is available for your situation, and jump into the right flow, including PF transfer.",
        },
        {
          id: "help",
          title: "Help & cases",
          body: "Search curated guidance, open My Cases, check status, and escalate with Nidhi. Sensitive tickets wait for your confirmation.",
        },
      ],
    },
    voice: {
      kicker: "Hands-free",
      title: "Talk to Nidhi like you would a help desk.",
      body: "The microphone uses the same approved actions as typed chat. Nidhi will not invent balances or claim stages, and it will not submit until you clearly agree.",
      points: [
        "Transcribe speech, then answer with your live account facts",
        "Navigate to dashboard, passbook, claims, profile, services, or help",
        "Draft a medical advance, then wait for an explicit confirm",
        "Raise a support ticket only after you say yes",
      ],
    },
    journey: {
      kicker: "Citizen journey",
      title: "One credible path, start to finish.",
      subtitle: "Nidhi is built around a complete member journey before extra breadth.",
      steps: [
        {
          title: "Sign in with UAN, then OTP",
          body: "Choose a demo account or enter a UAN. OTP is the second step before the portal opens.",
        },
        {
          title: "Understand balance and health",
          body: "The dashboard shows totals, pending work, and why a check is green, amber, or blocked.",
        },
        {
          title: "Track a claim in plain language",
          body: "See the current owner, whether you need to act, and what happens next on the timeline.",
        },
        {
          title: "Finish a medical advance",
          body: "Start a draft, come back later, review the details, confirm, and watch it appear as an active claim.",
        },
        {
          title: "Ask Nidhi — text or voice",
          body: "Explain a month, open a page, submit a claim, or raise a ticket without leaving the conversation.",
        },
      ],
    },
    prompts: {
      kicker: "Try asking",
      title: "Nidhi answers with your data, not guesses.",
      subtitle: "After you sign in, these prompts use the same tools as the left-rail assistant.",
      items: [
        "How much EPF do I have?",
        "Where is my claim?",
        "Take me to passbook",
        "Explain June contributions",
        "Submit a medical advance of 25000",
        "Raise a ticket about June passbook",
      ],
    },
    cta: {
      title: "Ready to see your EPF in conversation?",
      body: "Sign in with a demo UAN. This is an independent experience with illustrative member data — not official EPFO.",
      button: "Enter the portal",
      signedInButton: "Continue to dashboard",
    },
    footer: {
      notice:
        "Independent UX concept, not affiliated with EPFO or Government of India. Member information, claims, and transactions shown after sign-in are illustrative.",
      privacy: "Privacy",
      terms: "Terms",
      home: "Nidhi",
    },
  },
  hi: {
    skip: "मुख्य सामग्री पर जाएँ",
    nav: {
      features: "विशेषताएँ",
      journey: "यह कैसे काम करता है",
      voice: "आवाज़",
      enter: "पोर्टल में प्रवेश",
      openDashboard: "डैशबोर्ड खोलें",
      language: "भाषा",
    },
    hero: {
      kicker: "स्वतंत्र ईपीएफ सदस्य अनुभव",
      title: "आपका ईपीएफ, बातचीत में।",
      subtitle:
        "निधि बैलेंस, पासबुक पंक्तियाँ और दावे की स्थिति को साधारण भाषा में बदलती है — फिर आगे बढ़ने में मदद करती है। लिखें या बोलें, अपनी भाषा में।",
      cta: "पोर्टल में प्रवेश करें",
      secondary: "विशेषताएँ देखें",
      signedInCta: "अपना डैशबोर्ड खोलें",
    },
    stats: [
      { value: "लिखाई + आवाज़", label: "हर पेज पर निधि से पूछें" },
      { value: "पूरा दावा", label: "मेडिकल एडवांस, ड्राफ्ट से जमा तक" },
      { value: "खाता स्वास्थ्य", label: "केवाईसी, नॉमिनी और अगले कदम" },
    ],
    scene: {
      balance: "कुल बैलेंस",
      health: "खाता स्वास्थ्य",
      claim: "मेडिकल एडवांस",
      ask: "निधि से पूछें",
      month: "जून 2026",
      listening: "सुन रही है",
    },
    features: {
      kicker: "आप क्या कर सकते हैं",
      title: "पोर्टल की हर सतह, समझाई हुई।",
      subtitle:
        "पहले बैलेंस चेक से जमा दावे तक, निधि काम के साथ रहती है — कोई अलग चैटबॉट द्वीप नहीं।",
      items: [
        {
          id: "assistant",
          title: "निधि से पूछें",
          body: "हर साइन-इन पेज पर बाईं ओर सहायक। निधि आपके खाते का डेटा पढ़ती है, क्या हुआ और आगे क्या करें समझाती है, और सही स्क्रीन खोल सकती है।",
        },
        {
          id: "voice",
          title: "आवाज़ सहायक",
          body: "टाइप करने की जगह बोलें। आवाज़ को टेक्स्ट में बदला जाता है, फिर चैट जैसी ही क्रियाएँ चलती हैं — दावा जमा या टिकट से पहले पुष्टि जरूरी है।",
        },
        {
          id: "dashboard",
          title: "डैशबोर्ड",
          body: "बैलेंस, खाता स्वास्थ्य स्कोर, लंबित कार्य, और पासबुक, दावे, केवाईसी व सेवाओं के शॉर्टकट एक जगह देखें।",
        },
        {
          id: "passbook",
          title: "पासबुक",
          body: "मासिक कर्मचारी और नियोक्ता अंशदान देखें, अवधियाँ तुलना करें, महीने खोजें, और असामान्य प्रविष्टियाँ साधारण भाषा में समझें।",
        },
        {
          id: "claims",
          title: "दावे",
          body: "हर चरण का मालिक कौन है ट्रैक करें, विस्तृत टाइमलाइन देखें, और मेडिकल एडवांस पूरा करें: ड्राफ्ट, ऑटोसेव, समीक्षा, पुष्टि, फिर जमा।",
        },
        {
          id: "profile",
          title: "प्रोफ़ाइल",
          body: "दावा करने से पहले मोबाइल, ईमेल, बैंक, केवाईसी, रोजगार इतिहास और नॉमिनी अपडेट रखें — नॉमिनी हिस्सा कुल 100% होना चाहिए।",
        },
        {
          id: "services",
          title: "सेवाएँ",
          body: "आम ईपीएफ सेवाएँ देखें, आपकी स्थिति में क्या उपलब्ध है जानें, और सही प्रक्रिया शुरू करें — पीएफ ट्रांसफर सहित।",
        },
        {
          id: "help",
          title: "सहायता और मामले",
          body: "मार्गदर्शन खोजें, मेरे मामले खोलें, स्थिति देखें, और निधि से आगे बढ़ाएँ। संवेदनशील टिकट आपकी पुष्टि का इंतज़ार करते हैं।",
        },
      ],
    },
    voice: {
      kicker: "बिना हाथ लगाए",
      title: "निधि से ऐसे बात करें जैसे हेल्प डेस्क से।",
      body: "माइक्रोफ़ोन वही स्वीकृत क्रियाएँ चलाता है जो टाइप चैट चलाती है। निधि बैलेंस या दावे की स्थिति गढ़ती नहीं, और स्पष्ट सहमति से पहले जमा नहीं करती।",
      points: [
        "आवाज़ को टेक्स्ट बनाकर आपके खाते के तथ्यों से उत्तर",
        "डैशबोर्ड, पासबुक, दावे, प्रोफ़ाइल, सेवाएँ या सहायता पर ले जाना",
        "मेडिकल एडवांस का ड्राफ्ट, फिर स्पष्ट पुष्टि का इंतज़ार",
        "टिकट तभी, जब आप हाँ कहें",
      ],
    },
    journey: {
      kicker: "नागरिक यात्रा",
      title: "एक विश्वसनीय रास्ता, शुरू से अंत तक।",
      subtitle: "निधि पहले एक पूरी सदस्य यात्रा पर बनी है, फिर और चौड़ाई पर।",
      steps: [
        {
          title: "UAN से साइन इन, फिर OTP",
          body: "डेमो खाता चुनें या UAN दर्ज करें। पोर्टल खुलने से पहले OTP दूसरा चरण है।",
        },
        {
          title: "बैलेंस और स्वास्थ्य समझें",
          body: "डैशबोर्ड कुल राशि, लंबित काम, और कोई जाँच हरी, पीली या रुकी क्यों है दिखाता है।",
        },
        {
          title: "दावे को साधारण भाषा में ट्रैक करें",
          body: "अभी मालिक कौन है, क्या आपको कार्रवाई करनी है, और टाइमलाइन पर आगे क्या होगा देखें।",
        },
        {
          title: "मेडिकल एडवांस पूरा करें",
          body: "ड्राफ्ट शुरू करें, बाद में लौटें, विवरण जाँचें, पुष्टि करें, और सक्रिय दावे के रूप में देखें।",
        },
        {
          title: "निधि से पूछें — लिखकर या बोलकर",
          body: "कोई महीना समझाएँ, पेज खोलें, दावा जमा करें, या बातचीत छोड़े बिना टिकट उठाएँ।",
        },
      ],
    },
    prompts: {
      kicker: "ये पूछकर देखें",
      title: "निधि अनुमान नहीं, आपके डेटा से उत्तर देती है।",
      subtitle: "साइन इन के बाद ये प्रश्न बाईं ओर के सहायक जैसे ही टूल इस्तेमाल करते हैं।",
      items: [
        "मेरा ईपीएफ कितना है?",
        "मेरा दावा कहाँ है?",
        "मुझे पासबुक पर ले चलो",
        "जून के अंशदान समझाओ",
        "25000 का मेडिकल एडवांस जमा करो",
        "जून पासबुक पर टिकट खोलो",
      ],
    },
    cta: {
      title: "अपना ईपीएफ बातचीत में देखने के लिए तैयार?",
      body: "डेमो UAN से साइन इन करें। यह स्वतंत्र अनुभव है, चित्रण डेटा के साथ — आधिकारिक EPFO नहीं।",
      button: "पोर्टल में प्रवेश करें",
      signedInButton: "डैशबोर्ड पर जारी रखें",
    },
    footer: {
      notice:
        "स्वतंत्र UX अवधारणा, EPFO या भारत सरकार से संबद्ध नहीं। साइन इन के बाद दिखाए गए सदस्य विवरण, दावे और लेन-देन चित्रण हैं।",
      privacy: "गोपनीयता",
      terms: "शर्तें",
      home: "निधि",
    },
  },
  kn: {
    skip: "ಮುಖ್ಯ ವಿಷಯಕ್ಕೆ ಹೋಗಿ",
    nav: {
      features: "ವೈಶಿಷ್ಟ್ಯಗಳು",
      journey: "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ",
      voice: "ಧ್ವನಿ",
      enter: "ಪೋರ್ಟಲ್‌ಗೆ ಪ್ರವೇಶ",
      openDashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ",
      language: "ಭಾಷೆ",
    },
    hero: {
      kicker: "ಸ್ವತಂತ್ರ ಇಪಿಎಫ್ ಸದಸ್ಯ ಅನುಭವ",
      title: "ನಿಮ್ಮ ಇಪಿಎಫ್, ಸಂಭಾಷಣೆಯಲ್ಲಿ.",
      subtitle:
        "ನಿಧಿ ಬ್ಯಾಲೆನ್ಸ್, ಪಾಸ್‌ಬುಕ್ ಸಾಲುಗಳು ಮತ್ತು ಕ್ಲೇಮ್ ಹಂತಗಳನ್ನು ಸರಳ ಭಾಷೆಗೆ ತಿರುಗಿಸುತ್ತದೆ — ನಂತರ ಕ್ರಮ ತೆಗೆದುಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ. ಬರೆಯಿರಿ ಅಥವಾ ಮಾತನಾಡಿ, ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ.",
      cta: "ಪೋರ್ಟಲ್‌ಗೆ ಪ್ರವೇಶಿಸಿ",
      secondary: "ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ನೋಡಿ",
      signedInCta: "ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ",
    },
    stats: [
      { value: "ಪಠ್ಯ + ಧ್ವನಿ", label: "ಪ್ರತಿ ಪುಟದಲ್ಲಿ ನಿಧಿಯನ್ನು ಕೇಳಿ" },
      { value: "ಪೂರ್ಣ ಕ್ಲೇಮ್", label: "ವೈದ್ಯಕೀಯ ಮುಂಗಡ, ಡ್ರಾಫ್ಟ್‌ನಿಂದ ಸಲ್ಲಿಕೆ" },
      { value: "ಖಾತೆ ಆರೋಗ್ಯ", label: "ಕೆವೈಸಿ, ನಾಮಿನಿ ಮತ್ತು ಮುಂದಿನ ಕ್ರಮ" },
    ],
    scene: {
      balance: "ಒಟ್ಟು ಬ್ಯಾಲೆನ್ಸ್",
      health: "ಖಾತೆ ಆರೋಗ್ಯ",
      claim: "ವೈದ್ಯಕೀಯ ಮುಂಗಡ",
      ask: "ನಿಧಿಯನ್ನು ಕೇಳಿ",
      month: "ಜೂನ್ 2026",
      listening: "ಕೇಳುತ್ತಿದೆ",
    },
    features: {
      kicker: "ನೀವು ಏನು ಮಾಡಬಹುದು",
      title: "ಪೋರ್ಟಲ್‌ನ ಪ್ರತಿ ಮೇಲ್ಮೈ, ವಿವರಿಸಲಾಗಿದೆ.",
      subtitle:
        "ಮೊದಲ ಬ್ಯಾಲೆನ್ಸ್ ಪರಿಶೀಲನೆಯಿಂದ ಸಲ್ಲಿಸಿದ ಕ್ಲೇಮ್‌ವರೆಗೆ, ನಿಧಿ ಕೆಲಸದ ಪಕ್ಕದಲ್ಲೇ ಇರುತ್ತದೆ — ಪ್ರತ್ಯೇಕ ಚಾಟ್‌ಬಾಟ್ ದ್ವೀಪವಲ್ಲ.",
      items: [
        {
          id: "assistant",
          title: "ನಿಧಿಯನ್ನು ಕೇಳಿ",
          body: "ಪ್ರತಿ ಸೈನ್-ಇನ್ ಪುಟದಲ್ಲಿ ಎಡಭಾಗದ ಸಹಾಯಕ. ನಿಧಿ ನಿಮ್ಮ ಖಾತೆಯ ಡೇಟಾ ಓದಿ, ಏನಾಯಿತು ಮತ್ತು ಮುಂದೆ ಏನು ಮಾಡಬೇಕು ಎಂದು ವಿವರಿಸುತ್ತದೆ, ಸರಿಯಾದ ಪರದೆಯನ್ನು ತೆರೆಯಬಹುದು.",
        },
        {
          id: "voice",
          title: "ಧ್ವನಿ ಸಹಾಯಕ",
          body: "ಟೈಪ್ ಮಾಡುವ ಬದಲು ಮಾತನಾಡಿ. ಧ್ವನಿಯನ್ನು ಪಠ್ಯಕ್ಕೆ ಪರಿವರ್ತಿಸಿ ಚಾಟ್‌ನಂತೆಯೇ ಸಾಧನಗಳನ್ನು ಬಳಸುತ್ತದೆ — ಕ್ಲೇಮ್ ಸಲ್ಲಿಸುವ ಅಥವಾ ಟಿಕೆಟ್ ತೆರೆಯುವ ಮೊದಲು ದೃಢೀಕರಣ ಬೇಕು.",
        },
        {
          id: "dashboard",
          title: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
          body: "ಬ್ಯಾಲೆನ್ಸ್, ಖಾತೆ ಆರೋಗ್ಯ ಸ್ಕೋರ್, ಬಾಕಿ ಕೆಲಸಗಳು, ಮತ್ತು ಪಾಸ್‌ಬುಕ್, ಕ್ಲೇಮ್, ಕೆವೈಸಿ ಹಾಗೂ ಸೇವೆಗಳ ಶಾರ್ಟ್‌ಕಟ್‌ಗಳನ್ನು ಒಂದೇ ಕಡೆ ನೋಡಿ.",
        },
        {
          id: "passbook",
          title: "ಪಾಸ್‌ಬುಕ್",
          body: "ಮಾಸಿಕ ಉದ್ಯೋಗಿ ಮತ್ತು ಉದ್ಯೋಗದಾತ ಕೊಡುಗೆಗಳನ್ನು ನೋಡಿ, ಅವಧಿಗಳನ್ನು ಹೋಲಿಸಿ, ತಿಂಗಳುಗಳನ್ನು ಹುಡುಕಿ, ಮತ್ತು ಅಸಾಮಾನ್ಯ ನಮೂದುಗಳನ್ನು ಸರಳ ಭಾಷೆಯಲ್ಲಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ.",
        },
        {
          id: "claims",
          title: "ಕ್ಲೇಮ್‌ಗಳು",
          body: "ಪ್ರತಿ ಹಂತದ ಜವಾಬ್ದಾರಿ ಯಾರದು ಎಂದು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ, ವಿವರವಾದ ಟೈಮ್‌ಲೈನ್ ನೋಡಿ, ಮತ್ತು ವೈದ್ಯಕೀಯ ಮುಂಗಡ ಪೂರ್ಣಗೊಳಿಸಿ: ಡ್ರಾಫ್ಟ್, ಸ್ವಯಂ-ಉಳಿಸುವಿಕೆ, ಪರಿಶೀಲನೆ, ದೃಢೀಕರಣ, ನಂತರ ಸಲ್ಲಿಸಿ.",
        },
        {
          id: "profile",
          title: "ಪ್ರೊಫೈಲ್",
          body: "ಕ್ಲೇಮ್ ಮಾಡುವ ಮೊದಲು ಮೊಬೈಲ್, ಇಮೇಲ್, ಬ್ಯಾಂಕ್, ಕೆವೈಸಿ, ಉದ್ಯೋಗ ಇತಿಹಾಸ ಮತ್ತು ನಾಮಿನಿಗಳನ್ನು ನವೀಕರಿಸಿ — ನಾಮಿನಿ ಪಾಲು ಒಟ್ಟು 100% ಇರಬೇಕು.",
        },
        {
          id: "services",
          title: "ಸೇವೆಗಳು",
          body: "ಸಾಮಾನ್ಯ ಇಪಿಎಫ್ ಸೇವೆಗಳನ್ನು ನೋಡಿ, ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿಗೆ ಏನು ಲಭ್ಯವಿದೆ ತಿಳಿಯಿರಿ, ಮತ್ತು ಸರಿಯಾದ ಪ್ರಕ್ರಿಯೆ ಪ್ರಾರಂಭಿಸಿ — ಪಿಎಫ್ ವರ್ಗಾವಣೆ ಸೇರಿದಂತೆ.",
        },
        {
          id: "help",
          title: "ಸಹಾಯ ಮತ್ತು ಪ್ರಕರಣಗಳು",
          body: "ಮಾರ್ಗದರ್ಶನ ಹುಡುಕಿ, ನನ್ನ ಪ್ರಕರಣಗಳನ್ನು ತೆರೆಯಿರಿ, ಸ್ಥಿತಿ ನೋಡಿ, ಮತ್ತು ನಿಧಿಯೊಂದಿಗೆ ಮುಂದುವರಿಸಿ. ಸಂವೇದನಾಶೀಲ ಟಿಕೆಟ್‌ಗಳು ನಿಮ್ಮ ದೃಢೀಕರಣಕ್ಕಾಗಿ ಕಾಯುತ್ತವೆ.",
        },
      ],
    },
    voice: {
      kicker: "ಕೈ ಇಲ್ಲದೆ",
      title: "ಸಹಾಯ ಕೇಂದ್ರದಂತೆ ನಿಧಿಯೊಂದಿಗೆ ಮಾತನಾಡಿ.",
      body: "ಮೈಕ್ರೊಫೋನ್ ಟೈಪ್ ಚಾಟ್ ಬಳಸುವ ಅದೇ ಅನುಮೋದಿತ ಕ್ರಿಯೆಗಳನ್ನು ನಡೆಸುತ್ತದೆ. ನಿಧಿ ಬ್ಯಾಲೆನ್ಸ್ ಅಥವಾ ಕ್ಲೇಮ್ ಹಂತಗಳನ್ನು ಕಲ್ಪಿಸುವುದಿಲ್ಲ, ಮತ್ತು ನೀವು ಸ್ಪಷ್ಟವಾಗಿ ಒಪ್ಪುವವರೆಗೆ ಸಲ್ಲಿಸುವುದಿಲ್ಲ.",
      points: [
        "ಧ್ವನಿಯನ್ನು ಪಠ್ಯಗೊಳಿಸಿ ನಿಮ್ಮ ಖಾತೆಯ ಸತ್ಯಗಳಿಂದ ಉತ್ತರ",
        "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್, ಪಾಸ್‌ಬುಕ್, ಕ್ಲೇಮ್, ಪ್ರೊಫೈಲ್, ಸೇವೆಗಳು ಅಥವಾ ಸಹಾಯಕ್ಕೆ ನ್ಯಾವಿಗೇಟ್",
        "ವೈದ್ಯಕೀಯ ಮುಂಗಡ ಡ್ರಾಫ್ಟ್, ನಂತರ ಸ್ಪಷ್ಟ ದೃಢೀಕರಣಕ್ಕಾಗಿ ನಿರೀಕ್ಷೆ",
        "ನೀವು ಹೌದು ಎಂದಾಗ ಮಾತ್ರ ಟಿಕೆಟ್",
      ],
    },
    journey: {
      kicker: "ನಾಗರಿಕ ಪ್ರಯಾಣ",
      title: "ಒಂದು ನಂಬಲರ್ಹ ಮಾರ್ಗ, ಆರಂಭದಿಂದ ಅಂತ್ಯದವರೆಗೆ.",
      subtitle: "ನಿಧಿ ಮೊದಲು ಸಂಪೂರ್ಣ ಸದಸ್ಯ ಪ್ರಯಾಣದ ಮೇಲೆ ಕಟ್ಟಲಾಗಿದೆ, ನಂತರ ಹೆಚ್ಚು ವ್ಯಾಪ್ತಿ.",
      steps: [
        {
          title: "UAN ನಿಂದ ಸೈನ್ ಇನ್, ನಂತರ OTP",
          body: "ಡೆಮೊ ಖಾತೆ ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ UAN ನಮೂದಿಸಿ. ಪೋರ್ಟಲ್ ತೆರೆಯುವ ಮೊದಲು OTP ಎರಡನೇ ಹಂತ.",
        },
        {
          title: "ಬ್ಯಾಲೆನ್ಸ್ ಮತ್ತು ಆರೋಗ್ಯವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ",
          body: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಮೊತ್ತ, ಬಾಕಿ ಕೆಲಸ, ಮತ್ತು ಪರಿಶೀಲನೆ ಹಸಿರು, ಕಿತ್ತಳೆ ಅಥವಾ ನಿರ್ಬಂಧಿತ ಏಕೆ ಎಂದು ತೋರಿಸುತ್ತದೆ.",
        },
        {
          title: "ಕ್ಲೇಮ್ ಅನ್ನು ಸರಳ ಭಾಷೆಯಲ್ಲಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
          body: "ಈಗ ಜವಾಬ್ದಾರಿ ಯಾರದು, ನೀವು ಕ್ರಮ ತೆಗೆದುಕೊಳ್ಳಬೇಕೇ, ಮತ್ತು ಟೈಮ್‌ಲೈನ್‌ನಲ್ಲಿ ಮುಂದೆ ಏನಾಗುತ್ತದೆ ನೋಡಿ.",
        },
        {
          title: "ವೈದ್ಯಕೀಯ ಮುಂಗಡ ಪೂರ್ಣಗೊಳಿಸಿ",
          body: "ಡ್ರಾಫ್ಟ್ ಪ್ರಾರಂಭಿಸಿ, ನಂತರ ಹಿಂತಿರುಗಿ, ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ದೃಢೀಕರಿಸಿ, ಮತ್ತು ಸಕ್ರಿಯ ಕ್ಲೇಮ್ ಆಗಿ ನೋಡಿ.",
        },
        {
          title: "ನಿಧಿಯನ್ನು ಕೇಳಿ — ಬರೆದು ಅಥವಾ ಮಾತನಾಡಿ",
          body: "ತಿಂಗಳನ್ನು ವಿವರಿಸಿ, ಪುಟ ತೆರೆಯಿರಿ, ಕ್ಲೇಮ್ ಸಲ್ಲಿಸಿ, ಅಥವಾ ಸಂಭಾಷಣೆ ಬಿಡದೆ ಟಿಕೆಟ್ ಎತ್ತಿರಿ.",
        },
      ],
    },
    prompts: {
      kicker: "ಇವುಗಳನ್ನು ಕೇಳಿ ನೋಡಿ",
      title: "ನಿಧಿ ಊಹೆಯಿಂದಲ್ಲ, ನಿಮ್ಮ ಡೇಟಾದಿಂದ ಉತ್ತರಿಸುತ್ತದೆ.",
      subtitle: "ಸೈನ್ ಇನ್ ನಂತರ ಈ ಪ್ರಶ್ನೆಗಳು ಎಡಭಾಗದ ಸಹಾಯಕದ ಅದೇ ಸಾಧನಗಳನ್ನು ಬಳಸುತ್ತವೆ.",
      items: [
        "ನನ್ನ ಇಪಿಎಫ್ ಎಷ್ಟು ಇದೆ?",
        "ನನ್ನ ಕ್ಲೇಮ್ ಎಲ್ಲಿದೆ?",
        "ನನ್ನನ್ನು ಪಾಸ್‌ಬುಕ್‌ಗೆ ಕರೆದೊಯ್ಯಿ",
        "ಜೂನ್ ಕೊಡುಗೆಗಳನ್ನು ವಿವರಿಸಿ",
        "25000 ರ ವೈದ್ಯಕೀಯ ಮುಂಗಡ ಸಲ್ಲಿಸಿ",
        "ಜೂನ್ ಪಾಸ್‌ಬುಕ್ ಬಗ್ಗೆ ಟಿಕೆಟ್ ತೆರೆಯಿರಿ",
      ],
    },
    cta: {
      title: "ನಿಮ್ಮ ಇಪಿಎಫ್ ಅನ್ನು ಸಂಭಾಷಣೆಯಲ್ಲಿ ನೋಡಲು ಸಿದ್ಧರಿದ್ದೀರಾ?",
      body: "ಡೆಮೊ UAN ನಿಂದ ಸೈನ್ ಇನ್ ಮಾಡಿ. ಇದು ಸ್ವತಂತ್ರ ಅನುಭವ, ಚಿತ್ರಣ ಡೇಟಾದೊಂದಿಗೆ — ಅಧಿಕೃತ EPFO ಅಲ್ಲ.",
      button: "ಪೋರ್ಟಲ್‌ಗೆ ಪ್ರವೇಶಿಸಿ",
      signedInButton: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಮುಂದುವರಿಸಿ",
    },
    footer: {
      notice:
        "ಸ್ವತಂತ್ರ UX ಪರಿಕಲ್ಪನೆ, EPFO ಅಥವಾ ಭಾರತ ಸರ್ಕಾರದೊಂದಿಗೆ ಸಂಬಂಧವಿಲ್ಲ. ಸೈನ್ ಇನ್ ನಂತರ ತೋರಿಸುವ ಸದಸ್ಯ ಮಾಹಿತಿ, ಕ್ಲೇಮ್‌ಗಳು ಮತ್ತು ವಹಿವಾಟುಗಳು ಚಿತ್ರಣ.",
      privacy: "ಗೌಪ್ಯತೆ",
      terms: "ನಿಯಮಗಳು",
      home: "ನಿಧಿ",
    },
  },
};
