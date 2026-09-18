global.window = global;
global.window.speechSynthesis = null;

const fs = require('fs');
const path = require('path');

console.log("Running VoiceShield India unit validation...");

require('./js/mock-scenarios.js');
require('./js/scam-context-engine.js');
require('./js/ai-engine.js');
require('./js/multilingual.js');

async function testAll() {
  const ai = new global.VoiceAIEngine();
  const nlp = new global.ScamContextEngine();
  const multi = new global.MultilingualEngine();

  console.log("\n--- TEST 1: Preset Scenario Flow (Son Kidnapping Extortion) ---");
  const preset = global.MOCK_SCENARIOS[0];
  const v1 = await ai.analyzeVoice({ scenario: preset });
  const c1 = nlp.analyzeContext({
    sourceType: 'scenario',
    scenario: preset
  });
  const r1 = nlp.calculateCompositeRisk(v1.syntheticProbability, c1.contextScore);
  const w1_hi = multi.getWarning(preset, 'hi', r1.score);
  const w1_mr = multi.getWarning(preset, 'mr', r1.score);

  console.log(`Source Label: ${c1.sourceLabel}`);
  console.log(`Source Badge: ${c1.sourceBadge}`);
  console.log(`Risk: ${r1.classification} (${r1.score}%) - Synthetic: ${v1.syntheticProbability}%`);
  console.log(`Factors: Urgency=${c1.urgencyDetected}, Money=${c1.moneyRequestDetected}, Impersonation=${c1.impersonationDetected}, Pressure=${c1.pressureDetected}`);
  console.log(`Hindi Alert: ${w1_hi.headline}`);

  if (c1.sourceLabel !== 'Source: Hackathon Scenario Demo') throw new Error("TEST 1: sourceLabel mismatch");
  if (!c1.urgencyDetected || !c1.moneyRequestDetected || !c1.impersonationDetected || !c1.pressureDetected) {
    throw new Error("TEST 1: 4 factors should all be detected for extortion scenario");
  }
  if (r1.score < 70) throw new Error("Preset 1 should be High Risk!");

  console.log("\n--- TEST 2: Custom Uploaded Audio (Hindi Audio Demo Fallback) ---");
  const customFile = { name: "kidnap_voicenote_urgent.mp3", size: 52000, type: "audio/mp3" };
  const v2 = await ai.analyzeVoice({ scenario: null, audioBlob: customFile, filename: customFile.name });
  const c2 = nlp.analyzeContext({
    sourceType: 'upload',
    scenario: null,
    filename: customFile.name,
    language: 'hi'
  });
  const r2 = nlp.calculateCompositeRisk(v2.syntheticProbability, c2.contextScore);
  console.log(`Source Label: ${c2.sourceLabel}`);
  console.log(`Source Badge: ${c2.sourceBadge}`);
  console.log(`Transcript: ${c2.rawTranscript}`);
  console.log(`Custom Upload Risk: ${r2.classification} (${r2.score}%)`);
  console.log(`Factors: Urgency=${c2.urgencyDetected}, Money=${c2.moneyRequestDetected}, Impersonation=${c2.impersonationDetected}, Pressure=${c2.pressureDetected}`);

  if (c2.sourceLabel !== 'Source: Uploaded Audio') throw new Error("TEST 2: sourceLabel should be 'Source: Uploaded Audio'");
  if (!c2.sourceBadge.includes(customFile.name)) throw new Error("TEST 2: sourceBadge should mention the file name");
  if (!c2.rawTranscript.includes(customFile.name)) throw new Error("TEST 2: Transcript must be specific to uploaded audio");
  if (!c2.urgencyDetected || !c2.moneyRequestDetected) throw new Error("TEST 2: Urgency and Money factors should be detected in Hindi scam note");

  console.log("\n--- TEST 3: Custom Uploaded Audio (User-Verified Spoken Words) ---");
  const userText = "Police station se bol raha hoon, 25000 UPI pe turant transfer karo nahi toh jail bhej denge";
  const c3 = nlp.analyzeContext({
    sourceType: 'upload',
    scenario: null,
    filename: "my_recording.wav",
    transcriptText: userText,
    isUserEdited: true,
    language: 'hi'
  });
  console.log(`Source Label: ${c3.sourceLabel}`);
  console.log(`Source Badge: ${c3.sourceBadge}`);
  console.log(`Spoken Words: "${c3.rawTranscript}"`);
  console.log(`Threat Score: ${c3.contextScore}%`);
  console.log(`Factors: Urgency=${c3.urgencyDetected}, Money=${c3.moneyRequestDetected}, Impersonation=${c3.impersonationDetected}, Pressure=${c3.pressureDetected}`);

  if (c3.rawTranscript !== userText) throw new Error("TEST 3: Transcript must match user-provided spoken words exactly");
  if (c3.sourceBadge !== 'User-Verified Spoken Words') throw new Error("TEST 3: sourceBadge must be 'User-Verified Spoken Words'");
  if (!c3.isRealSpeechToText) throw new Error("TEST 3: isRealSpeechToText should be true");
  if (!c3.urgencyDetected || !c3.moneyRequestDetected || !c3.pressureDetected) throw new Error("TEST 3: Factors should detect urgency, money, pressure");

  console.log("\n--- TEST 4: Marathi Devanagari Audio Upload ---");
  const c4 = nlp.analyzeContext({
    sourceType: 'upload',
    scenario: null,
    filename: "marathi_urgent.m4a",
    language: 'mr'
  });
  console.log(`Marathi Transcript: ${c4.rawTranscript}`);
  console.log(`Language Label: ${c4.languageLabel}`);
  console.log(`Threat Score: ${c4.contextScore}%`);
  console.log(`Factors: Urgency=${c4.urgencyDetected}, Money=${c4.moneyRequestDetected}, Impersonation=${c4.impersonationDetected}, Pressure=${c4.pressureDetected}`);

  if (c4.languageLabel !== 'MARATHI (मराठी)') throw new Error("TEST 4: languageLabel should be MARATHI (मराठी)");
  if (!c4.urgencyDetected || !c4.moneyRequestDetected) throw new Error("TEST 4: Marathi Devanagari regex must detect urgency and money");

  console.log("\n--- TEST 5: Live Mic Recording Flow with Web Speech ASR ---");
  const micSpoken = "Papa, urgent accident hospital mein, send 40000 on GPay right now";
  const c5 = nlp.analyzeContext({
    sourceType: 'mic',
    scenario: null,
    filename: 'mic-recording.wav',
    transcriptText: micSpoken,
    isRealAic: true,
    language: 'hi-IN'
  });
  console.log(`Mic Source: ${c5.sourceLabel} [${c5.sourceBadge}]`);
  console.log(`Mic Words: "${c5.rawTranscript}"`);
  console.log(`Factors: Urgency=${c5.urgencyDetected}, Money=${c5.moneyRequestDetected}`);

  if (c5.sourceLabel !== 'Source: Recorded Audio') throw new Error("TEST 5: sourceLabel must be 'Source: Recorded Audio'");
  if (c5.sourceBadge !== 'Live Web Speech ASR') throw new Error("TEST 5: sourceBadge must be 'Live Web Speech ASR'");
  if (c5.rawTranscript !== micSpoken) throw new Error("TEST 5: Mic transcript must be the spoken speech");

  console.log("\n--- TEST 6: Mic Baseline Authentic Audio (Low Threat) ---");
  const micBlob = { type: "audio/wav", size: 32000 };
  const v6 = await ai.analyzeVoice({ scenario: null, audioBlob: micBlob, isMic: true });
  const c6 = nlp.analyzeContext({
    sourceType: 'mic',
    scenario: null,
    filename: 'mic-recording.wav',
    language: 'en'
  });
  const r6 = nlp.calculateCompositeRisk(v6.syntheticProbability, c6.contextScore);
  console.log(`Mic Baseline Risk: ${r6.classification} (${r6.score}%) - Synthetic: ${v6.syntheticProbability}%`);
  console.log(`Context Score: ${c6.contextScore}%`);
  console.log(`Factors: Urgency=${c6.urgencyDetected}, Money=${c6.moneyRequestDetected}`);

  if (r6.score >= 35) throw new Error("TEST 6: Authentic human mic recording must be LOW RISK");
  if (c6.urgencyDetected || c6.moneyRequestDetected) throw new Error("TEST 6: Baseline should have zero threat factors detected");

  console.log("\n✅ ALL 6 UNIT TESTS PASSED PERFECTLY!");
  console.log("Step 3 now strictly isolates Audio Upload vs Recorded Mic vs Scenario Presets, preserves language, and labels sources honestly.");
}

testAll().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
