// VoiceShield India - Multilingual Warning & Speech Synthesis Engine
// Delivers localized warnings in English, Hindi (हिंदी), and Marathi (मराठी)
// Guaranteed non-blocking with resilient fallback for speech synthesis

class MultilingualEngine {
  constructor() {
    this.currentLang = 'en';
    this.synth = (typeof window !== 'undefined' && 'speechSynthesis' in window) ? window.speechSynthesis : null;
    this.voices = [];
    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;
    try {
      const loadVoices = () => {
        try {
          this.voices = this.synth.getVoices() || [];
        } catch (e) {
          this.voices = [];
        }
      };
      loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = loadVoices;
      }
    } catch (e) {
      console.warn('[MultilingualEngine] Web Speech API initialization notice:', e);
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
    // Check if scenario has pre-translated content
    if (scenario && scenario.multilingual && scenario.multilingual[lang]) {
      const entry = scenario.multilingual[lang];
      return {
        headline: entry.headline,
        message: entry.message,
        recommendedAction: this.getRecommendedAction(riskScore, lang),
        tts: entry.tts || entry.message
      };
    }

    // Dynamic translation dictionary based on risk tier
    if (riskScore >= 70) {
      const highAlerts = {
        en: {
          headline: "CRITICAL ALERT: HIGH-CONFIDENCE VOICE CLONE DETECTED",
          message: "Acoustic and semantic analysis confirms an artificial voice clone attempting urgent financial extortion. Do NOT transfer funds via UPI or reveal credentials.",
          recommendedAction: "⚠️ Do not send money until verification is complete. Initiate secondary out-of-band verification with your registered family contact.",
          tts: "Critical Alert. VoiceShield detected an artificial voice clone attempting financial fraud. Do not transfer money. Verify with your contact directly."
        },
        hi: {
          headline: "गंभीर चेतावनी: AI क्लोन आवाज और फिरौती की आशंका",
          message: "सावधान! यह ऑडियो AI तकनीक द्वारा तैयार की गई नकली (क्लोन) आवाज है। कॉलर किसी आपात स्थिति का बहाना बनाकर पैसे की मांग कर रहा है।",
          recommendedAction: "⚠️ सत्यापन पूरा होने तक पैसे न भेजें। अपने पंजीकृत पारिवारिक संपर्क से तुरंत स्वतंत्र रूप से पुष्टि करें।",
          tts: "सावधान! वॉइस शील्ड ने नकली AI आवाज पहचानी है। कृपया किसी भी यूपीआई पर पैसे न भेजें। सीधे संपर्क करके पुष्टि करें।"
        },
        mr: {
          headline: "अतिदक्षतेचा इशारा: AI क्लोन केलेला खोटा आवाज आढळला",
          message: "सतर्क रहा! हा व्हॉइस मेसेज AI तंत्रज्ञानाने तयार केलेला खोटा आवाज आहे. कॉलर पैशांची तातडीची मागणी करत आहे. कोणताही व्यवहार करू नका.",
          recommendedAction: "⚠️ पडताळणी पूर्ण होईपर्यंत पैसे पाठवू नका. तुमच्या नोंदणीकृत कुटुंबातील सदस्याशी थेट संपर्क साधून खात्री करा.",
          tts: "अतिदक्षतेचा इशारा! हा आवाज AI द्वारे क्लोन केलेला आहे. कोणतीही रक्कम पाठवू नका. तातडीने थेट संपर्क साधा."
        }
      };
      return highAlerts[lang] || highAlerts['en'];
    } else if (riskScore >= 35) {
      const medAlerts = {
        en: {
          headline: "CAUTION: SUSPICIOUS URGENCY & COERCION PATTERN",
          message: "The analyzed audio exhibits artificial pressure tactics and potential robocall markers. Never reveal bank OTPs, passwords, or personal documents.",
          recommendedAction: "⚠️ Exercise caution. Banks and police never demand instant money or OTPs over phone. Hang up and verify through official helpline 1930.",
          tts: "Caution. Never share bank OTP or passwords over phone. Banks never threaten instant account freeze."
        },
        hi: {
          headline: "सावधानी: संदेहास्पद कॉल एवं जल्दबाजी का दबाव",
          message: "सतर्क रहें! इस कॉल में अनावश्यक जल्दबाजी और दबाव के संकेत मिले हैं। किसी को भी बैंक OTP, पासवर्ड या दस्तावेज फोन पर न दें।",
          recommendedAction: "⚠️ सतर्क रहें। बैंक या पुलिस कभी फोन पर तुरंत पैसे या OTP नहीं मांगते। कॉल काटें और 1930 पर संपर्क करें।",
          tts: "सावधानी! फोन पर किसी को भी अपना गुप्त पासवर्ड या ओटीपी न बताएं।"
        },
        mr: {
          headline: "सावधान: संशयास्पद कॉल आणि भीती दाखवण्याचा प्रयत्न",
          message: "बँक किंवा शासकीय अधिकारी कधीही फोनवरून ओटीपी किंवा गोपनीय माहिती मागत नाहीत. कोणतीही माहिती सांगू नका.",
          recommendedAction: "⚠️ सतर्क रहा. फोनवर कोणतीही माहिती देऊ नका. १९३० या अधिकृत सायबर हेल्पलाइनशी संपर्क साधा.",
          tts: "सतर्क रहा! फोनवर कोणतीही गोपनीय माहिती किंवा ओटीपी सांगू नका."
        }
      };
      return medAlerts[lang] || medAlerts['en'];
    } else {
      const lowAlerts = {
        en: {
          headline: "AUTHENTIC AUDIO: NO SCAM SIGNATURES DETECTED",
          message: "Voice authenticity metrics confirm genuine biological human speech patterns with zero financial or emotional coercion markers.",
          recommendedAction: "✅ Call classified as safe human communication. Normal interaction may proceed.",
          tts: "VoiceShield analysis complete. The voice is authentic human with zero scam indicators. Safe call."
        },
        hi: {
          headline: "सुरक्षित कॉल: प्राकृतिक एवं वास्तविक मानवीय आवाज",
          message: "ऑडियो विश्लेषण से स्पष्ट है कि यह प्राकृतिक मानवीय आवाज है। इसमें किसी भी प्रकार की धोखाधड़ी या दबाव के संकेत नहीं हैं।",
          recommendedAction: "✅ कॉल सुरक्षित पाई गई। सामान्य बातचीत जारी रखी जा सकती है।",
          tts: "वॉइस शील्ड विश्लेषण पूर्ण। यह कॉल सुरक्षित और वास्तविक मानवीय आवाज है।"
        },
        mr: {
          headline: "सुरक्षित ऑडिओ: खरा नैसर्गिक मानवी आवाज",
          message: "आवाज विश्लेषणावरून हा खरा मानवी आवाज असल्याचे सिद्ध झाले आहे. यात कोणताही संशयास्पद किंवा फसवणुकीचा धोका नाही.",
          recommendedAction: "✅ हा कॉल सुरक्षित आढळला. नेहमीप्रमाणे संवाद साधू शकता.",
          tts: "विश्लेषण पूर्ण झाले आहे. हा आवाज पूर्णपणे सुरक्षित आणि खरा आहे."
        }
      };
      return lowAlerts[lang] || lowAlerts['en'];
    }
  }

  getRecommendedAction(riskScore, lang = 'en') {
    if (riskScore >= 70) {
      if (lang === 'hi') return "⚠️ सत्यापन पूरा होने तक पैसे न भेजें। अपने पंजीकृत पारिवारिक संपर्क से तुरंत स्वतंत्र रूप से पुष्टि करें।";
      if (lang === 'mr') return "⚠️ पडताळणी पूर्ण होईपर्यंत पैसे पाठवू नका. तुमच्या नोंदणीकृत कुटुंबातील सदस्याशी थेट संपर्क साधून खात्री करा.";
      return "⚠️ Do not send money until verification is complete. Initiate secondary out-of-band verification with your registered family contact.";
    } else if (riskScore >= 35) {
      if (lang === 'hi') return "⚠️ सतर्क रहें। बैंक या पुलिस कभी फोन पर तुरंत पैसे या OTP नहीं मांगते। कॉल काटें और 1930 पर संपर्क करें।";
      if (lang === 'mr') return "⚠️ सतर्क रहा. फोनवर कोणतीही माहिती देऊ नका. १९३० या अधिकृत सायबर हेल्पलाइनशी संपर्क साधा.";
      return "⚠️ Exercise caution. Banks and police never demand instant money or OTPs over phone. Hang up and verify through official helpline 1930.";
    } else {
      if (lang === 'hi') return "✅ कॉल सुरक्षित पाई गई। सामान्य बातचीत जारी रखी जा सकती है।";
      if (lang === 'mr') return "✅ हा कॉल सुरक्षित आढळला. नेहमीप्रमाणे संवाद साधू शकता.";
      return "✅ Call classified as safe human communication. Normal interaction may proceed.";
    }
  }

  /**
   * Resilient, non-blocking TTS
   * Guarantees fallback and timeout safety so UI NEVER hangs
   */
  speakWarning(scenario, lang = this.currentLang, riskScore = 0, onStart, onEnd) {
    if (!this.synth) {
      console.log('[MultilingualEngine] TTS not supported or disabled in this browser.');
      if (onEnd) onEnd(false);
      return;
    }

    try {
      this.synth.cancel();

      const warning = this.getWarning(scenario, lang, riskScore);
      const textToSpeak = warning.tts || warning.message;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Safe voice matching
      const voices = this.voices.length > 0 ? this.voices : (this.synth.getVoices ? this.synth.getVoices() : []);
      if (lang === 'hi') {
        utterance.lang = 'hi-IN';
        const match = voices.find(v => (v.lang && v.lang.includes('hi')) || (v.name && v.name.toLowerCase().includes('hindi')));
        if (match) utterance.voice = match;
      } else if (lang === 'mr') {
        utterance.lang = 'mr-IN';
        const match = voices.find(v => (v.lang && v.lang.includes('mr')) || (v.name && v.name.toLowerCase().includes('marathi')));
        if (match) utterance.voice = match;
        else {
          // Fallback to Hindi voice if Marathi not installed
          const hiMatch = voices.find(v => (v.lang && v.lang.includes('hi')));
          if (hiMatch) utterance.voice = hiMatch;
        }
      } else {
        utterance.lang = 'en-IN';
        const match = voices.find(v => (v.lang && (v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en-US'))));
        if (match) utterance.voice = match;
      }

      let completed = false;
      const finish = (success) => {
        if (!completed) {
          completed = true;
          if (onEnd) onEnd(success);
        }
      };

      // Watchdog timeout to prevent speech synthesis hang (recovers in 4.5s)
      const timeoutId = setTimeout(() => {
        try { this.synth.cancel(); } catch (e) {}
        finish(false);
      }, 4500);

      utterance.onstart = () => {
        if (onStart) onStart();
      };
      utterance.onend = () => {
        clearTimeout(timeoutId);
        finish(true);
      };
      utterance.onerror = (err) => {
        clearTimeout(timeoutId);
        finish(false);
      };

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('[MultilingualEngine] Error triggering TTS:', err);
      if (onEnd) onEnd(false);
    }
  }

  stopSpeaking() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
  }
}

window.MultilingualEngine = MultilingualEngine;
