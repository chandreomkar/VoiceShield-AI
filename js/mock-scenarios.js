// VoiceShield India - Realistic Indian Scam Scenarios
// Configured with deepfake acoustic signatures, Indian fraud archetypes, and multilingual warnings

window.MOCK_SCENARIOS = [
  {
    id: "scenario-1",
    title: "Son's Emergency Accident / Fake Police Bail Extortion",
    tag: "High Risk - Voice Clone",
    tagClass: "tag-high",
    riskLevel: "HIGH",
    riskScore: 94,
    callerNumber: "+91 98231 XXXXX (Spoofed)",
    duration: 11,
    snippet: '"Papa, police ne arrest kar liya hai accident ke baad! Turant 50,000 bhejo GPay pe nahi toh jail bhej denge!"',
    
    // Voice Authenticity Telemetry (Wav2Vec2 / SpecNet Simulation)
    voiceMetrics: {
      syntheticProb: 96,
      cutoff: "7.4 kHz (Vocoder Limit)",
      pitchFlatness: "91% (Artificial Monotone)",
      phonemeTransition: "14 Discontinuities / sec",
      jitterShimmer: "0.21% (Abnormally Low)"
    },

    // Scam Context NLP Threat Vectors
    contextThreat: {
      score: 92,
      urgencyLevel: "CRITICAL (< 10 Mins)",
      impersonationTarget: "Family Member (Son - Rahul)",
      financialDemand: "₹50,000 via UPI (Google Pay)",
      coercionFlags: ["Arrest Threat", "Panic Exploitation", "Isolation Request"],
      tokens: [
        { word: "Papa", type: "impersonation" },
        { word: "police ne arrest kar liya", type: "authority" },
        { word: "accident ke baad", type: "urgency" },
        { word: "Turant", type: "urgency" },
        { word: "₹50,000", type: "money" },
        { word: "GPay pe", type: "money" },
        { word: "jail bhej denge", type: "authority" }
      ]
    },

    rawTranscript: "Papa, police ne mujhe arrest kar liya hai ek bike accident ke baad! Inspector bol rahe hain turant 50,000 bhejo GPay pe nahi toh FIR file karke jail bhej denge! Please kisi ko mat batana, jaldi paise bhejo!",

    // Explainable AI Reasons Breakdown
    reasons: [
      {
        level: "danger",
        icon: "🤖",
        title: "High Confidence Synthetic Voice Clone Detected (96%)",
        detail: "Acoustic frequency spectrum exhibits abrupt cutoff at 7.4 kHz with synthetic neural vocoder phase artifacts common in Tortoise/Bark-TTS models."
      },
      {
        level: "danger",
        icon: "🚨",
        title: "Critical Emotional & Financial Coercion Detected",
        detail: "High urgency cue ('Turant / Immediately') coupled with immediate UPI demand of ₹50,000 and threat of jail custody."
      },
      {
        level: "warning",
        icon: "🎭",
        title: "Family Impersonation with Secrecy Pressure",
        detail: "Caller attempts to isolate victim ('Please kisi ko mat batana') — a 98% correlated marker of Indian ransom scams."
      }
    ],

    // Multilingual Alert Content
    multilingual: {
      en: {
        headline: "CRITICAL DANGER: HIGH-CONFIDENCE VOICE CLONE DETECTED",
        message: "This audio note is synthetically generated using AI voice cloning. The caller is impersonating your son to extort ₹50,000 via UPI. DO NOT send funds. Initiate secondary verification immediately.",
        tts: "Critical Alert. VoiceShield detected an artificial voice clone attempting financial fraud. Do not transfer money. Verify with your son directly."
      },
      hi: {
        headline: "गंभीर चेतावनी: AI क्लोन आवाज और फिरौती की आशंका",
        message: "सावधान! यह ऑडियो AI तकनीक द्वारा तैयार की गई नकली (क्लोन) आवाज है। फोन करने वाला आपके बेटे की आवाज बनाकर ₹50,000 UPI ट्रांसफर की मांग कर रहा है। तुरंत पैसे न भेजें। पहले सीधे संपर्क करें।",
        tts: "सावधान! वॉइस शील्ड ने आपके बेटे की नकली AI आवाज पहचानी है। कृपया किसी भी यूपीआई पर पैसे न भेजें। अपने बेटे को सीधे सामान्य कॉल करें।"
      },
      mr: {
        headline: "अतिदक्षतेचा इशारा: AI क्लोन केलेला खोटा आवाज आढळला",
        message: "सतर्क रहा! हा व्हॉइस मेसेज AI तंत्रज्ञानाने तयार केलेला खोटा आवाज आहे. कॉलर तुमच्या मुलाचा आवाज काढून ₹५०,००० ची तातडीने मागणी करत आहे. एकही रुपया पाठवू नका. थेट फोन करून खात्री करा.",
        tts: "अतिदक्षतेचा इशारा! हा आवाज AI द्वारे क्लोन केलेला आहे. कोणतीही रक्कम पाठवू नका. तातडीने थेट संपर्क साधा."
      }
    },

    trustedContact: {
      name: "Rahul Sharma",
      relation: "Son (Pre-registered Safe Contact)",
      phone: "+91 98765 43210",
      challengeQ: "What was the name of our first dog adopted in 2021?",
      simulatedReply: "Papa, I am completely safe in my college lecture hall! My phone was with me. That voice note is FAKE! Please don't send any money to anyone!"
    }
  },

  {
    id: "scenario-2",
    title: "CBI / Delhi Police 'Digital Arrest' & Money Laundering Threat",
    tag: "High Risk - Authority Scam",
    tagClass: "tag-high",
    riskLevel: "HIGH",
    riskScore: 91,
    callerNumber: "+91 11 2309 XXXXX (CBI Spoofed)",
    duration: 13,
    snippet: '"This is DCP Vikramaditya, Delhi Cyber Cell. A courier to Cambodia containing 16 fake passports and MDMA drugs has your Aadhaar linked..."',
    
    voiceMetrics: {
      syntheticProb: 89,
      cutoff: "7.6 kHz (Compression artifact)",
      pitchFlatness: "88% (Text-to-speech cadence)",
      phonemeTransition: "11 Discontinuities / sec",
      jitterShimmer: "0.29% (Artificial Stability)"
    },

    contextThreat: {
      score: 95,
      urgencyLevel: "EXTREME (Immediate Arrest Warrant)",
      impersonationTarget: "Law Enforcement / CBI Officer",
      financialDemand: "₹1,20,000 'RBI Security Verification Deposit'",
      coercionFlags: ["Digital Arrest", "National Security Act Threat", "Webcam Surveillance Demand"],
      tokens: [
        { word: "DCP Vikramaditya", type: "authority" },
        { word: "Delhi Cyber Cell", type: "authority" },
        { word: "narcotics and MDMA", type: "urgency" },
        { word: "Aadhaar linked", type: "authority" },
        { word: "Digital Arrest", type: "urgency" },
        { word: "Security Deposit", type: "money" }
      ]
    },

    rawTranscript: "This is DCP Vikramaditya from Delhi Police Cyber Crime Branch. A DHL parcel sent to Cambodia with 16 fake passports and synthetic drugs has been intercepted, and your Aadhaar card is registered. You are placed under immediate Digital Arrest. To clear your name before non-bailable warrant, transfer the refundable verification deposit of ₹1,20,000 to the secret RBI escrow account right now.",

    reasons: [
      {
        level: "danger",
        icon: "⚖️",
        title: "Indian Law Enforcement Impersonation ('Digital Arrest')",
        detail: "There is NO legal provision for 'Digital Arrest' in Indian law (CrPC / BSS). The Supreme Court and MHA have issued alerts that police never conduct arrests over phone/video calls."
      },
      {
        level: "danger",
        icon: "🤖",
        title: "Synthetic Authority Voice Match (89%)",
        detail: "Synthesized authoritarian voice contour generated via neural TTS engine with unnatural pause rhythm."
      },
      {
        level: "warning",
        icon: "💳",
        title: "Fake 'RBI Escrow' Account Financial Extortion",
        detail: "Reserve Bank of India does not hold citizen security escrow deposits for criminal clearances."
      }
    ],

    multilingual: {
      en: {
        headline: "HIGH-LEVEL EXTORTION: FAKE DIGITAL ARREST SCAM",
        message: "Law enforcement agencies in India never place citizens under 'Digital Arrest' or demand money transfer for case closure. The audio is synthetic. Report to 1930 Cyber Helpline immediately.",
        tts: "Warning. Digital arrest is an illegal cyber scam. Police never demand money over phone. Hang up and dial 1930."
      },
      hi: {
        headline: "धोखाधड़ी चेतावनी: फर्जी 'डिजिटल अरेस्ट' एवं CBI कॉल",
        message: "भारतीय कानून में 'डिजिटल अरेस्ट' नाम का कोई प्रावधान नहीं है। पुलिस या सीबीआई कभी भी फोन पर गिरफ्तारी की धमकी देकर पैसे नहीं मांगती। यह AI वॉइस फ्रॉड है। तुरंत 1930 पर शिकायत करें।",
        tts: "सावधान! डिजिटल अरेस्ट पूरी तरह से गैरकानूनी फ्रॉड है। पुलिस कभी फोन पर पैसे नहीं मांगती। कॉल काटें और 1930 डायल करें।"
      },
      mr: {
        headline: "धोकादायक कॉल: खोटे 'डिजिटल अरेस्ट' आणि खंडणी",
        message: "भारतात 'डिजिटल अरेस्ट' अशी कोणतीही कायदेशीर पद्धत नाही. पोलीस कधीही फोनवर पैसे ट्रान्सफर करायला सांगत नाहीत. त्वरित १९३० वर सायबर तक्रार नोंदवा.",
        tts: "सावधान! डिजिटल अरेस्ट हा सायबर गुन्हा आहे. पोलीस कधीही फोनवर पैसे मागत नाहीत. त्वरित १९३० ला कॉल करा."
      }
    },

    trustedContact: {
      name: "Adv. Anjali Deshmukh",
      relation: "Family Legal Advisor",
      phone: "+91 94220 XXXXX",
      challengeQ: "Is digital arrest recognized in the Indian Criminal Code?",
      simulatedReply: "Sir, this is 100% fake. Supreme Court and Ministry of Home Affairs have explicitly stated that Digital Arrest is a cyber crime syndicate scam. Do not pay, block immediately."
    }
  },

  {
    id: "scenario-3",
    title: "Bank KYC Expiry & Immediate Account Suspension Threat",
    tag: "Medium Risk - Banking Phishing",
    tagClass: "tag-med",
    riskLevel: "MEDIUM",
    riskScore: 64,
    callerNumber: "+91 80012 XXXXX (Virtual IVR)",
    duration: 9,
    snippet: '"Dear Customer, your SBI YONO netbanking has expired today. Your account will be frozen within 2 hours unless you update PAN details..."',
    
    voiceMetrics: {
      syntheticProb: 48,
      cutoff: "8.2 kHz (Near Natural / Recorded IVR)",
      pitchFlatness: "52% (Semi-natural Speech)",
      phonemeTransition: "6 Discontinuities / sec",
      jitterShimmer: "0.85% (Mixed Telephony)"
    },

    contextThreat: {
      score: 76,
      urgencyLevel: "HIGH (2 Hours Deadline)",
      impersonationTarget: "State Bank of India (Customer Care)",
      financialDemand: "Credential Extraction (PAN, OTP, Debit Card PIN)",
      coercionFlags: ["Account Freezing", "CIBIL Score Penalty"],
      tokens: [
        { word: "SBI YONO", type: "authority" },
        { word: "expired today", type: "urgency" },
        { word: "frozen within 2 hours", type: "urgency" },
        { word: "share 6-digit OTP", type: "money" }
      ]
    },

    rawTranscript: "Dear SBI Customer, your YONO NetBanking access will be permanently suspended within 2 hours due to unverified KYC update. Kindly share the 6-digit one-time password sent to your registered mobile number to prevent account freeze.",

    reasons: [
      {
        level: "warning",
        icon: "⚠️",
        title: "High Urgency Coercion with OTP Solicitation",
        detail: "Legitimate banks like SBI never set 2-hour deadlines or ask customers to verbally reveal OTPs or passwords."
      },
      {
        level: "warning",
        icon: "🎙️",
        title: "Automated Robocall / Mixed Synthetic IVR Detected",
        detail: "Acoustic telemetry suggests pre-recorded robocall synthesis combined with spoofed sender ID."
      }
    ],

    multilingual: {
      en: {
        headline: "MEDIUM RISK: BANKING KYC PHISHING DETECTED",
        message: "Banks never call to demand OTP or freeze accounts within hours. Never disclose passwords, OTPs, or debit card CVV over the phone.",
        tts: "Caution. Never share bank OTP or passwords over phone. Banks never threaten instant account freeze."
      },
      hi: {
        headline: "सावधानी: फर्जी बैंक KYC और OTP चोरी का प्रयास",
        message: "सतर्क रहें! कोई भी बैंक OTP या पासवर्ड नहीं मांगता और न ही 2 घंटे में खाता बंद करने की धमकी देता है। कोई भी जानकारी साझा न करें।",
        tts: "सावधानी! बैंक कभी भी फोन पर ओटीपी नहीं मांगते। किसी को भी अपना गुप्त पासवर्ड न बताएं।"
      },
      mr: {
        headline: "सावधान: बँक केवायसी आणि ओटीपी फसवणूक",
        message: "बँक कधीही फोन करून ओटीपी मागत नाही आणि २ तासांत खाते बंद करण्याची धमकी देत नाही. कोणतीही गुप्त माहिती देऊ नका.",
        tts: "सतर्क रहा! बँक अधिकारी कधीही ओटीपी मागत नाहीत. फोनवर कोणतीही माहिती सांगू नका."
      }
    },

    trustedContact: {
      name: "SBI Official Branch Helpline",
      relation: "Direct Banking Support",
      phone: "1800 1234 (Toll Free)",
      challengeQ: "Verify branch IFSC code",
      simulatedReply: "SBI automated notification: We never request OTP or PAN verification over phone calls. Your account status is normal."
    }
  },

  {
    id: "scenario-4",
    title: "Genuine Family Voice Note (Low Risk Baseline)",
    tag: "Low Risk - Authentic Human",
    tagClass: "tag-low",
    riskLevel: "LOW",
    riskScore: 12,
    callerNumber: "+91 98200 XXXXX (Known Contact)",
    duration: 8,
    snippet: '"Hi Mom, getting late at the office today due to project delivery. Please keep dinner in the fridge, will be home by 9:30 PM."',
    
    voiceMetrics: {
      syntheticProb: 8,
      cutoff: "14.2 kHz (Natural Human Bandwidth)",
      pitchFlatness: "14% (Rich Natural Intonation & Breath Pauses)",
      phonemeTransition: "0 Discontinuities (Organic Flow)",
      jitterShimmer: "1.42% (Normal Human Vocal Cord Micro-Jitter)"
    },

    contextThreat: {
      score: 10,
      urgencyLevel: "NONE (Normal Conversational)",
      impersonationTarget: "None (Known Daughter)",
      financialDemand: "None ($0 / ₹0)",
      coercionFlags: [],
      tokens: [
        { word: "office today", type: "normal" },
        { word: "dinner in fridge", type: "normal" },
        { word: "home by 9:30", type: "normal" }
      ]
    },

    rawTranscript: "Hi Mom, getting a bit late at the office today due to client project delivery. Please keep some dinner in the fridge, I will reach home safely by around 9:30 PM. See you soon!",

    reasons: [
      {
        level: "safe",
        icon: "✅",
        title: "Authentic Human Vocal Cord Dynamics Confirmed",
        detail: "Spectral bandwidth spans full 14+ kHz spectrum with organic vocal tract shimmer, breath pauses, and natural emotional prosody."
      },
      {
        level: "safe",
        icon: "✅",
        title: "Zero Scam / Extortion Intent Detected",
        detail: "No financial demands, no panic tactics, no urgency threats, and no requests for money or credentials."
      }
    ],

    multilingual: {
      en: {
        headline: "AUTHENTIC AUDIO: NO SCAM SIGNATURES DETECTED",
        message: "Voice authenticity metrics confirm genuine human biological speech patterns with zero financial or emotional coercion markers. Safe to interact.",
        tts: "VoiceShield analysis complete. The voice is authentic human with zero scam indicators. Safe call."
      },
      hi: {
        headline: "सुरक्षित कॉल: प्राकृतिक एवं वास्तविक मानवीय आवाज",
        message: "ऑडियो विश्लेषण से स्पष्ट है कि यह प्राकृतिक मानवीय आवाज है। इसमें किसी भी प्रकार की धोखाधड़ी या दबाव के संकेत नहीं हैं। सुरक्षित है।",
        tts: "वॉइस शील्ड विश्लेषण पूर्ण। यह कॉल सुरक्षित और वास्तविक मानवीय आवाज है।"
      },
      mr: {
        headline: "सुरक्षित ऑडिओ: खरा मानवी आवाज",
        message: "आवाज विश्लेषणावरून हा खरा मानवी आवाज असल्याचे सिद्ध झाले आहे. यात कोणताही संशयास्पद किंवा फसवणुकीचा धोका नाही.",
        tts: "विश्लेषण पूर्ण झाले आहे. हा आवाज पूर्णपणे सुरक्षित आणि खरा आहे."
      }
    },

    trustedContact: {
      name: "Pooja (Daughter)",
      relation: "Family Member",
      phone: "+91 98200 XXXXX",
      challengeQ: "Safe",
      simulatedReply: "Authentic Voice Note - No out-of-band verification required."
    }
  }
];
