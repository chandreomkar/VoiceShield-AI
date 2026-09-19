# 🛡️ VoiceShield India (वॉइसशील्ड इंडिया)
### AI-Powered Voice Cloning Scam Detection and Prevention System

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](LICENSE)
[![Hackathon: National Cyber Defense](https://img.shields.io/badge/Hackathon-Ready-emerald.svg)](#)
[![Stack: HTML5 / WebAudio / Node / FastAPI](https://img.shields.io/badge/Tech-Zero--Dependency%20Runnable-purple.svg)](#)

> **VoiceShield India** is an AI-powered defense system engineered specifically for the Indian threat landscape to neutralize deepfake audio extortion, digital arrest threats, and urgent UPI kidnapping scams.

---

## 🌐 Public Live Demo URL (Hackathon Deployment)

The prototype is actively deployed and accessible publicly on any computer, tablet, or smartphone:
👉 **[https://civil-gnu-perceived-resolved.trycloudflare.com](https://civil-gnu-perceived-resolved.trycloudflare.com)**

- **Full HTTPS Encryption**: Required for Web Speech API and microphone access.
- **Works on any device/network**: Accessible worldwide without VPN or localhost tunnel setup.
- **All 7 Steps Fully Functional**: Audio Ingestion, Spectral Voice Analysis, NLP Scam Parsing, Risk Gauge, Multilingual TTS Warnings, Trusted Contact Challenge, and Chakshu / 1930 Reporting.

---

## 🏗️ Architecture: Pure Client-Side Zero-Dependency

VoiceShield India is engineered as a **100% self-contained, zero-dependency browser application**.
- **No Python or Node.js server required** to run the complete end-to-end demo.
- All forensic audio analysis, synthetic voice classification, NLP threat extraction, multilingual speech, and trusted-contact challenges run directly in client-side WebAssembly/Web Audio APIs.
- The `backend/` folder is strictly an **optional future-scope reference architecture** for post-hackathon carrier-grade integration (e.g. telecom-level PyTorch Wav2Vec2 inference).

---

## 🚀 Quickstart: How to Run

### Option A: Instant Zero-Setup (Double-click `index.html`) — Recommended for Stage Demo
Simply open `index.html` directly in any web browser (Chrome, Edge, Brave, Firefox):
```powershell
Start-Process "index.html"
```
- ✅ **100% works out of the box** — zero commands, zero terminal setup.
- ✅ All 4 pre-loaded Indian scam scenarios work instantly.
- ✅ Custom audio file uploads (`.mp3`, `.wav`, `.m4a`) work instantly.
- ✅ Forensic spectral analysis, risk gauge, NLP breakdown, multilingual TTS advisories, and family safe-word verification work seamlessly.

### Option B: Local Web Server (Required only for Live Microphone Recording)
Modern browsers enforce a **Secure Context** security rule: hardware microphone access (`navigator.mediaDevices.getUserMedia`) is restricted when opening files via `file:///`. If you wish to test live microphone recording with your own voice:
```powershell
# Using Python:
python -m http.server 5173

# Or using Node:
node server.js
```
Then navigate to: **`http://localhost:5173`** (or `http://localhost:3000`).

---

## ⚡ The 7-Step Detection & Prevention Flow

| Step | Component | Description |
|---|---|---|
| **01** | **Audio Input Hub** | Ingest audio via pre-loaded Indian scam scenarios, file upload (`.wav`, `.mp3`), or live microphone capture. |
| **02** | **Voice Authenticity Analysis** | Evaluates acoustic spectral markers: vocoder roll-off (>7.4 kHz), pitch contour flatness, and phoneme stitching discontinuities. |
| **03** | **Scam Context NLP** | Analyzes conversational intent for high urgency, authority/family impersonation, financial demands (GPay/UPI), and duress. |
| **04** | **Composite Risk Score** | Calculates calibrated multi-factor risk: $\text{Risk} = (0.55 \times \text{Synthetic}) + (0.45 \times \text{Threat})$. |
| **05** | **Multilingual Alerts** | Delivers clear advisories and audible speech readouts in **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**. |
| **06** | **Trusted Contact Verification** | For High-Risk calls, triggers out-of-band secondary verification (SMS/WhatsApp) with family safe-word challenges. |
| **07** | **Safer Decision Center** | Instant one-click citizen actions: Block Caller, pre-fill DoT Chakshu / 1930 Cyber Helpline report, and export forensic JSON. |

---

## 🎯 Preloaded Hackathon Demo Scenarios

1. **Scenario 1 (High Risk - 94%)**: *Son's Fake Accident / Police Bail Extortion*
   - *"Papa, police caught me in an accident! Transfer ₹50,000 on GPay right now or they will lock me in jail!"*
   - Triggers High-Risk Crimson alert, Voice Clone detection (96%), and Trusted Contact (Rahul - Son) safe-word verification.
2. **Scenario 2 (High Risk - 91%)**: *CBI / Delhi Police "Digital Arrest"*
   - Impersonation of cyber crime police demanding ₹1,20,000 "RBI security deposit" for a parcel intercepted with narcotics.
   - Highlights that "Digital Arrest" does not legally exist in India.
3. **Scenario 3 (Medium Risk - 64%)**: *State Bank of India (SBI) YONO KYC Freeze*
   - Threatens to suspend netbanking in 2 hours unless customer reveals OTP over phone.
4. **Scenario 4 (Low Risk - 12%)**: *Authentic Family Voice Note*
   - Daughter leaving a message about being home late from office with zero financial urgency. Proves authentic baseline.

---

## 🏛️ Project Directory Structure

```
voiceshield-india/
├── index.html                   # High-tech Cyber Command Dashboard UI
├── css/
│   └── style.css                # Dark-mode cybersecurity theme (glassmorphism, neon accents)
├── js/
│   ├── app.js                   # Application controller and UI state management
│   ├── audio-analyzer.js        # Web Audio API visualizer & real-time mic recorder
│   ├── ai-engine.js             # Simulated Wav2Vec2 authenticity classification engine
│   ├── scam-context-engine.js   # NLP threat vector extractor (Urgency, Money, Coercion)
│   ├── multilingual.js          # Warnings & Web Speech Synthesis (EN, HI, MR)
│   ├── trusted-contact.js       # Out-of-band WhatsApp/SMS secondary channel simulation
│   └── mock-scenarios.js        # Calibrated Indian scam test cases
├── backend/                     # [FUTURE SCOPE / REFERENCE ONLY] Carrier-grade PyTorch Wav2Vec2 service
│   ├── app.py                   # FastAPI REST API endpoints
│   ├── model_engine.py          # PyTorch Wav2Vec2 + SpecNet deepfake pipeline
│   ├── requirements.txt         # Python dependencies
│   └── README.md                # ML integration guide
├── server.js                    # Zero-dependency local development server
└── README.md                    # Project documentation & presentation guide
```

---

## 🇮🇳 India-Specific Integrations

- **National Cyber Crime Helpline (1930)**: Direct dial link and auto-generated incident dossier.
- **DoT Chakshu Portal (Sanchar Saathi)**: Evidence packaging format compatible with Department of Telecommunications fraud reporting.
- **UPI / Mobile Payment Context**: Specifically flags PhonePe, Google Pay, and Paytm extortion patterns.
