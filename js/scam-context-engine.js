// VoiceShield India - Scam Context & Threat NLP Engine
// Analyzes conversational transcripts for urgency, impersonation, money requests & coercion

class ScamContextEngine {
  constructor() {
    this.threatPatterns = [
      // 1. Urgency & Panic Tactics
      { regex: /\b(turant|jaldi|immediately|urgent|right now|emergency|jaldi se|at once|danger|critical|asap|fast)\b/gi, type: 'urgency', label: 'Urgency Pressure' },
      { regex: /(तुरंत|जल्दी|इमरजेंसी|आपातकालीन|तत्काल|फौरन|संकट|अभी|एकदम)/gi, type: 'urgency', label: 'Urgency Pressure (Hindi)' },
      { regex: /(तातडीने|लगेच|आणीबाणी|तातडीची|धोका|त्वरीत)/gi, type: 'urgency', label: 'Urgency Pressure (Marathi)' },
      { regex: /\b(accident|hospital|icu|injured|danger|critical condition)\b/gi, type: 'urgency', label: 'Emergency Duress' },
      { regex: /(एक्सीडेंट|अस्पताल|घायल|दुर्घटना|गंभीर)/gi, type: 'urgency', label: 'Emergency Duress (Hindi)' },
      { regex: /(अपघात|रुग्णालय|जखमी|गंभीर)/gi, type: 'urgency', label: 'Emergency Duress (Marathi)' },
      { regex: /\b(kisi ko mat batana|don'?t tell anyone|secret|don'?t call|chup chap|private|keep quiet)\b/gi, type: 'urgency', label: 'Secrecy Coercion' },
      { regex: /(किसी को मत बताना|गुप्त|फोन मत करना|चुपचाप|किसी से मत कहना)/gi, type: 'urgency', label: 'Secrecy Coercion (Hindi)' },
      { regex: /(कोणालाही सांगू नका|गुपित|फोन करू नका|चूपचाप|सांगू नका)/gi, type: 'urgency', label: 'Secrecy Coercion (Marathi)' },

      // 2. Financial Demands & Payment Channels
      { regex: /(₹|rs\.?|inr)\s?[\d,]+/gi, type: 'money', label: 'Direct Cash Demand' },
      { regex: /\b\d{2,6}\s?(rupees|hazar|k|lakh|thousand)?\b/gi, type: 'money', label: 'Numerical Financial Demand' },
      { regex: /(\d+)\s?(रुपये|हजार|लाख|रुपया)/gi, type: 'money', label: 'Financial Demand (Devanagari)' },
      { regex: /\b(gpay|phonepe|paytm|upi|google pay|wire transfer|escrow|deposit|bhejo|transfer|send money|otp|card pin|bhej do)\b/gi, type: 'money', label: 'Digital Payment Channel' },
      { regex: /(जीपे|फोनपे|पेटीएम|यूपीआई|पैसे भेजो|पैसे ट्रांसफर|पैसे डालो|ओटीपी|खाते में|बैंक)/gi, type: 'money', label: 'Digital Payment Channel (Hindi)' },
      { regex: /(जीपे|फोनपे|पेटीएम|युपीआय|पैसे पाठवा|पैसे ट्रान्सफर|पैसे टाका|ओटीपी|खात्यात|बँक)/gi, type: 'money', label: 'Digital Payment Channel (Marathi)' },

      // 3. Authority & Family Impersonation
      { regex: /\b(papa|mom|mummy|dad|beta|bhai|son|daughter|family|didi|uncle)\b/gi, type: 'impersonation', label: 'Family Impersonation' },
      { regex: /(पापा|पिताजी|मम्मी|माँ|बेटा|भाई|दीदी|चाचा|काका)/gi, type: 'impersonation', label: 'Family Impersonation (Hindi)' },
      { regex: /(बाबा|वडील|आई|मुलगा|भाऊ|ताई|काका)/gi, type: 'impersonation', label: 'Family Impersonation (Marathi)' },
      { regex: /\b(police|inspector|dcp|cbi|crime branch|cyber cell|magistrate|customs|narco|rbi|bank manager)\b/gi, type: 'authority', label: 'Law Enforcement Persona' },
      { regex: /(पुलिस|इंस्पेक्टर|थाना|थानेदार|सीबीआई|क्राइम ब्रांच|कस्टम्स|मजिस्ट्रेट|आरबीआई)/gi, type: 'authority', label: 'Law Enforcement Persona (Hindi)' },
      { regex: /(पोलीस|इन्स्पेक्टर|ठाणे|गुन्हे शाखा|सीबीआय|कस्टम्स|मॅजिस्ट्रेट)/gi, type: 'authority', label: 'Law Enforcement Persona (Marathi)' },

      // 4. Legal & Physical Duress / Pressure Language
      { regex: /\b(arrest|jail|fir|custody|lockup|non-bailable|court|warrant|digital arrest|block account|freeze|detained)\b/gi, type: 'authority', label: 'Arrest & Custody Threat' },
      { regex: /(अरेस्ट|गिरफ्तार|जेल|एफआईआर|वारंट|हिरासत|डिजिटल अरेस्ट|खाता सीज|ब्लॉक)/gi, type: 'authority', label: 'Arrest & Custody Threat (Hindi)' },
      { regex: /(अटक|तुरुंग|जेल|एफआयआर|वारंट|कोठडी|डिजिटल अटक|खाते गोठवले|ब्लॉक)/gi, type: 'authority', label: 'Arrest & Custody Threat (Marathi)' }
    ];
  }

  /**
   * Primary context evaluator
   * Ensures STRICT source separation:
   * - Hackathon Scenarios use their own predefined transcript ONLY
   * - Uploaded Audio uses its own audio transcript/demo
   * - Recorded Mic uses live speech or mic baseline
   */
  analyzeContext(input = {}) {
    const sourceType = input.sourceType || (input.scenario ? 'scenario' : 'upload');

    // CASE 1: Hackathon Scenario Demo (ONLY when explicitly 'scenario')
    if (sourceType === 'scenario' && input.scenario && input.scenario.contextThreat) {
      const threat = input.scenario.contextThreat;
      return {
        sourceType: 'scenario',
        sourceLabel: 'Source: Hackathon Scenario Demo',
        sourceBadge: `Predefined Scenario: ${input.scenario.title.split('/')[0].trim()}`,
        isRealSpeechToText: false,
        languageLabel: 'HINGLISH / ENGLISH',
        contextScore: threat.score,
        urgencyLevel: threat.urgencyLevel,
        impersonationTarget: threat.impersonationTarget,
        financialDemand: threat.financialDemand,
        coercionFlags: threat.coercionFlags || [],
        transcriptHtml: this.renderHighlightedTranscript(input.scenario.rawTranscript, threat.tokens),
        rawTranscript: input.scenario.rawTranscript,
        reasons: input.scenario.reasons || [],
        urgencyDetected: Boolean(threat.urgencyLevel && !threat.urgencyLevel.includes('NONE')),
        moneyRequestDetected: Boolean(threat.financialDemand && !threat.financialDemand.includes('None')),
        impersonationDetected: Boolean(threat.impersonationTarget && !threat.impersonationTarget.includes('None')),
        pressureDetected: Boolean(threat.coercionFlags && threat.coercionFlags.length > 0)
      };
    }

    // CASE 2: Uploaded Audio OR Recorded Microphone Audio
    // NEVER COPY SCENARIO 1 OR PRESET TEXT HERE!
    const isMic = sourceType === 'mic';
    const lang = (input.language || 'hi').toLowerCase();
    let rawText = (input.transcriptText || '').trim();

    // If no text provided, generate an honest dedicated demo transcript
    let isDemoFallback = false;
    if (!rawText) {
      isDemoFallback = true;
      if (isMic) {
        // Microphone Baseline Recording
        if (lang.startsWith('mr')) {
          rawText = "नमस्कार, ही मायक्रोफोन ऑडिओ रेकॉर्डिंग आहे. आवाज पूर्णपणे नैसर्गिक आणि मानवी आढळला. कोणतीही आणीबाणी किंवा खंडणीची मागणी नाही.";
        } else if (lang.startsWith('hi')) {
          rawText = "नमस्ते, यह माइक्रोफ़ोन से रिकॉर्ड की गई वास्तविक ऑडियो है। आवाज पूरी तरह प्राकृतिक और सुरक्षित है। कोई आपातकालीन फिरौती नहीं पाई गई।";
        } else {
          rawText = "Hello, this is a live microphone audio recording test. The vocal baseline is natural human with zero extortion or coercion detected.";
        }
      } else {
        // Uploaded Audio File Demo
        const fileName = input.filename || "audio-note";
        if (lang.startsWith('mr')) {
          rawText = `बाबा, माझा अपघात झाला असून पोलिसांनी मला ताब्यात घेतले आहे. ताबडतोब 50,000 रुपये जीपेवर पाठवा, नाहीतर जेलमध्ये पाठवतील. कोणालाही सांगू नका! [ऑडिओ: ${fileName}]`;
        } else if (lang.startsWith('hi')) {
          rawText = `पापा, मेरा कॉलेज के पास एक्सीडेंट हो गया है और पुलिस वाले मुझे थाने ले जा रहे हैं। तुरंत 50,000 रुपये जीपे (GPay) पर भेजो, नहीं तो जेल भेज देंगे। किसी को मत बताना! [ऑडियो: ${fileName}]`;
        } else {
          rawText = `Dad, I met with an emergency accident and police are taking me into custody. Transfer ₹50,000 on GPay right now or they will lock me in jail. Don't tell anyone! [Audio: ${fileName}]`;
        }
      }
    }

    // Analyze the text using multi-lingual NLP pattern matching
    const semantics = this.parseTextSemantics(rawText);

    // Build honest source labeling
    let sourceLabel = isMic ? 'Source: Recorded Audio' : 'Source: Uploaded Audio';
    let sourceBadge = '';
    if (isMic) {
      sourceBadge = input.isRealAic ? 'Live Web Speech ASR' : (isDemoFallback ? 'Demo Transcription (Mic Baseline)' : 'Recorded Audio Transcript');
    } else {
      sourceBadge = input.isUserEdited 
        ? 'User-Verified Spoken Words' 
        : (isDemoFallback ? `Demo Transcription (${input.filename || 'Uploaded File'})` : 'Uploaded Audio Speech-to-Text');
    }

    let languageLabel = 'ENGLISH';
    if (lang.startsWith('hi')) languageLabel = 'HINDI (हिंदी)';
    else if (lang.startsWith('mr')) languageLabel = 'MARATHI (मराठी)';

    return {
      sourceType: sourceType,
      sourceLabel: sourceLabel,
      sourceBadge: sourceBadge,
      isRealSpeechToText: Boolean(input.isRealAic || input.isUserEdited),
      languageLabel: languageLabel,
      ...semantics
    };
  }

  /**
   * Performs dynamic regex token extraction and semantic scoring on any text
   */
  parseTextSemantics(rawText) {
    const tokens = [];
    const matchedTypes = new Set();
    const flags = [];

    this.threatPatterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.regex.source, 'gi');
      while ((match = regex.exec(rawText)) !== null) {
        const word = match[0];
        if (!tokens.some(t => t.word.toLowerCase() === word.toLowerCase())) {
          tokens.push({ word: word, type: pattern.type });
          matchedTypes.add(pattern.type);
          if (!flags.includes(pattern.label)) {
            flags.push(pattern.label);
          }
        }
      }
    });

    // Compute dynamic threat score
    let score = 10;
    if (matchedTypes.has('urgency')) score += 25;
    if (matchedTypes.has('money')) score += 30;
    if (matchedTypes.has('impersonation')) score += 20;
    if (matchedTypes.has('authority')) score += 25;
    score = Math.min(100, Math.max(10, score));

    // Determine category summaries
    let urgencyLevel = "NONE (Conversational)";
    if (matchedTypes.has('urgency')) urgencyLevel = score >= 70 ? "CRITICAL (< 10 Mins)" : "MODERATE (Urgent Action)";

    let impersonationTarget = "None Detected";
    if (matchedTypes.has('impersonation')) impersonationTarget = "Family Member Persona";
    if (matchedTypes.has('authority')) impersonationTarget = "Law Enforcement / Police Persona";

    let financialDemand = "None ($0 / ₹0)";
    const moneyToken = tokens.find(t => t.type === 'money');
    if (moneyToken) {
      financialDemand = `Immediate Transfer (${moneyToken.word})`;
    }

    // Build explainable reasons
    const reasons = [];
    if (matchedTypes.has('money') && matchedTypes.has('urgency')) {
      reasons.push({
        level: "danger",
        icon: "🚨",
        title: "Immediate Financial Extortion Pattern Detected",
        detail: `The text pairs urgent time pressure with a direct monetary demand (${financialDemand}).`
      });
    }
    if (matchedTypes.has('authority') || matchedTypes.has('impersonation')) {
      reasons.push({
        level: "danger",
        icon: "🎭",
        title: "Authority / Family Impersonation Signals",
        detail: `The caller utilizes identity cues ('${impersonationTarget}') commonly exploited in Indian social engineering attacks.`
      });
    }
    if (flags.includes("Secrecy Coercion") || flags.includes("Arrest & Custody Threat")) {
      reasons.push({
        level: "warning",
        icon: "⚖️",
        title: "Psychological Isolation & Duress Tactics",
        detail: "Threatening legal custody or demanding secrecy ('don't tell anyone') is a standard extortion tactic."
      });
    }
    if (reasons.length === 0) {
      reasons.push({
        level: "safe",
        icon: "✅",
        title: "Zero Coercive Scam Patterns Found",
        detail: "The conversational text does not exhibit emergency ransom demands, police arrest threats, or urgent UPI transfers."
      });
    }

    return {
      contextScore: score,
      urgencyLevel: urgencyLevel,
      impersonationTarget: impersonationTarget,
      financialDemand: financialDemand,
      coercionFlags: flags.length > 0 ? flags : ["Zero Coercion"],
      transcriptHtml: this.renderHighlightedTranscript(rawText, tokens),
      rawTranscript: rawText,
      tokens: tokens,
      reasons: reasons,
      urgencyDetected: matchedTypes.has('urgency'),
      moneyRequestDetected: matchedTypes.has('money'),
      impersonationDetected: matchedTypes.has('impersonation') || matchedTypes.has('authority'),
      pressureDetected: matchedTypes.has('authority') || flags.some(f => f.includes('Secrecy') || f.includes('Arrest'))
    };
  }

  renderHighlightedTranscript(text, tokens = []) {
    if (!tokens || tokens.length === 0) return text;

    let html = text;
    const sortedTokens = [...tokens].sort((a, b) => b.word.length - a.word.length);

    sortedTokens.forEach(token => {
      const regex = new RegExp(`(${token.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      let badgeClass = 'token-urgency';
      if (token.type === 'money') badgeClass = 'token-money';
      if (token.type === 'authority' || token.type === 'impersonation') badgeClass = 'token-authority';

      html = html.replace(regex, `<span class="threat-token ${badgeClass}">$1</span>`);
    });

    return html;
  }

  calculateCompositeRisk(syntheticProb, contextScore) {
    const raw = (syntheticProb * 0.55) + (contextScore * 0.45);
    const score = Math.round(Math.min(100, Math.max(0, raw)));

    let classification = "LOW RISK";
    let badgeClass = "badge-low";
    let alertClass = "alert-low";

    if (score >= 70) {
      classification = "HIGH RISK";
      badgeClass = "badge-high";
      alertClass = "alert-high";
    } else if (score >= 35) {
      classification = "MEDIUM RISK";
      badgeClass = "badge-medium";
      alertClass = "alert-med";
    }

    return { score, classification, badgeClass, alertClass };
  }
}

window.ScamContextEngine = ScamContextEngine;
