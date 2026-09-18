// VoiceShield India - Multilingual Warning & Speech Synthesis Engine
// Delivers localized warnings in English, Hindi (हिंदी), and Marathi (मराठी)

class MultilingualEngine {
  constructor() {
    this.currentLang = 'en';
    this.synth = window.speechSynthesis || null;
    this.voices = [];
    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;
    const loadVoices = () => {
      this.voices = this.synth.getVoices();
    };
    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  setLanguage(lang) {
    if (['en', 'hi', 'mr'].includes(lang)) {
      this.currentLang = lang;
    }
    return this.currentLang;
  }

  /**
   * Retrieves localized warning object for scenario OR dynamically for custom audio based on risk
   */
  getWarning(scenario, lang = this.currentLang, riskScore = 0) {
    // If scenario has preset multilingual copy, use it
    if (scenario && scenario.multilingual) {
      return scenario.multilingual[lang] || scenario.multilingual['en'];
    }

    // Dynamic copy for custom uploaded files or live mic recording
    if (riskScore >= 70) {
      const highAlerts = {
        en: {
          headline: "CRITICAL ALERT: HIGH-CONFIDENCE VOICE CLONE DETECTED",
          message: "Acoustic and semantic analysis confirms an artificial voice clone attempting urgent financial extortion. Do NOT transfer funds via UPI or reveal credentials. Verify with contact directly.",
          tts: "Critical Alert. VoiceShield detected an artificial voice clone attempting financial fraud. Do not transfer money. Verify with your contact directly."
        },
        hi: {
          headline: "गंभीर चेतावनी: AI क्लोन आवाज और फिरौती की आशंका",
          message: "सावधान! यह ऑडियो AI तकनीक द्वारा तैयार की गई नकली (क्लोन) आवाज है। फोन करने वाला किसी आपात स्थिति का बहाना बनाकर पैसे की मांग कर रहा है। तुरंत पैसे न भेजें। पहले सीधे संपर्क करें।",
          tts: "सावधान! वॉइस शील्ड ने नकली AI आवाज पहचानी है। कृपया किसी भी यूपीआई पर पैसे न भेजें। सीधे सामान्य कॉल करके पुष्टि करें।"
        },
        mr: {
          headline: "अतिदक्षतेचा इशारा: AI क्लोन केलेला खोटा आवाज आढळला",
          message: "सतर्क रहा! हा व्हॉइस मेसेज AI तंत्रज्ञानाने तयार केलेला खोटा आवाज आहे. कॉलर पैशांची तातडीची मागणी करत आहे. एकही रुपया पाठवू नका. थेट फोन करून खात्री करा.",
          tts: "अतिदक्षतेचा इशारा! हा आवाज AI द्वारे क्लोन केलेला आहे. कोणतीही रक्कम पाठवू नका. तातडीने थेट संपर्क साधा."
        }
      };
      return highAlerts[lang] || highAlerts['en'];
    } else if (riskScore >= 35) {
      const medAlerts = {
        en: {
          headline: "CAUTION: SUSPICIOUS URGENCY PATTERN DETECTED",
          message: "The analyzed audio exhibits artificial pressure tactics and potential robocall markers. Do not reveal bank OTPs, passwords, or personal identity details.",
          tts: "Caution. Never share bank OTP or passwords over phone. Banks never threaten instant account freeze."
        },
        hi: {
          headline: "सावधानी: संदेहास्पद कॉल एवं जल्दबाजी का दबाव",
          message: "सतर्क रहें! इस कॉल में अनावश्यक दबाव के संकेत मिले हैं। किसी को भी बैंक OTP, पासवर्ड या व्यक्तिगत दस्तावेज फोन पर न दें।",
          tts: "सावधानी! फोन पर किसी को भी अपना गुप्त पासवर्ड या ओटीपी न बताएं।"
        },
        mr: {
          headline: "सावधान: संशयास्पद कॉल आढळला",
          message: "बँक किंवा शासकीय अधिकारी कधीही फोनवरून ओटीपी किंवा गोपनीय माहिती मागत नाहीत. कोणतीही माहिती सांगू नका.",
          tts: "सतर्क रहा! फोनवर कोणतीही गोपनीय माहिती किंवा ओटीपी सांगू नका."
        }
      };
      return medAlerts[lang] || medAlerts['en'];
    } else if (riskScore > 0) {
      const lowAlerts = {
        en: {
          headline: "AUTHENTIC AUDIO: NO SCAM SIGNATURES DETECTED",
          message: "Voice authenticity metrics confirm genuine biological human speech patterns with zero financial or emotional coercion markers. Safe to interact.",
          tts: "VoiceShield analysis complete. The voice is authentic human with zero scam indicators. Safe call."
        },
        hi: {
          headline: "सुरक्षित कॉल: प्राकृतिक एवं वास्तविक मानवीय आवाज",
          message: "ऑडियो विश्लेषण से स्पष्ट है कि यह प्राकृतिक मानवीय आवाज है। इसमें किसी भी प्रकार की धोखाधड़ी या दबाव के संकेत नहीं हैं।",
          tts: "वॉइस शील्ड विश्लेषण पूर्ण। यह कॉल सुरक्षित और वास्तविक मानवीय आवाज है।"
        },
        mr: {
          headline: "सुरक्षित ऑडिओ: खरा मानवी आवाज",
          message: "आवाज विश्लेषणावरून हा खरा मानवी आवाज असल्याचे सिद्ध झाले आहे. यात कोणताही संशयास्पद किंवा फसवणुकीचा धोका नाही.",
          tts: "विश्लेषण पूर्ण झाले आहे. हा आवाज पूर्णपणे सुरक्षित आणि खरा आहे."
        }
      };
      return lowAlerts[lang] || lowAlerts['en'];
    }

    return {
      headline: "AWAITING AUDIO ANALYSIS",
      message: "Select an audio sample or upload a voice note and run the VoiceShield scan to view localized threat advisories.",
      tts: "VoiceShield is awaiting audio analysis."
    };
  }

  speakWarning(scenario, lang = this.currentLang, riskScore = 0, onStart, onEnd) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported in this browser.');
      if (onEnd) onEnd();
      return;
    }

    this.synth.cancel();

    const warning = this.getWarning(scenario, lang, riskScore);
    const textToSpeak = warning.tts || warning.message;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    if (lang === 'hi') {
      utterance.lang = 'hi-IN';
      const hiVoice = this.voices.find(v => v.lang.includes('hi') || v.name.includes('Hindi'));
      if (hiVoice) utterance.voice = hiVoice;
    } else if (lang === 'mr') {
      utterance.lang = 'mr-IN';
      const mrVoice = this.voices.find(v => v.lang.includes('mr') || v.name.includes('Marathi'));
      if (mrVoice) utterance.voice = mrVoice;
      else {
        const hiVoice = this.voices.find(v => v.lang.includes('hi'));
        if (hiVoice) utterance.voice = hiVoice;
      }
    } else {
      utterance.lang = 'en-IN';
      const enVoice = this.voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en'));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onstart = () => { if (onStart) onStart(); };
    utterance.onend = () => { if (onEnd) onEnd(); };
    utterance.onerror = () => { if (onEnd) onEnd(); };

    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

window.MultilingualEngine = MultilingualEngine;
