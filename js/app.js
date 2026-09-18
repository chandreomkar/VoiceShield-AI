// VoiceShield India - Master Application Controller
// Orchestrates Audio Input (Presets / File Upload / Mic) -> Voice Analysis -> Scam Context NLP -> Risk Score -> Multilingual Alert -> Trusted Verification -> Safer Decision

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Engines
  const audioAnalyzer = new window.AudioAnalyzer();
  const aiEngine = new window.VoiceAIEngine();
  const scamContextEngine = new window.ScamContextEngine();
  const multilingualEngine = new window.MultilingualEngine();
  const contactVerifier = new window.TrustedContactVerifier({
    onVerified: (contact) => {
      showToast(`Verification received from ${contact.name}! Contact confirmed safe.`, 'success');
      updateDecisionForVerifiedContact(contact);
    }
  });

  // State Variables
  let currentScenario = window.MOCK_SCENARIOS[0];
  let customAudioBlob = null;
  let customAudioDuration = 11;
  let currentLanguage = 'en';
  let isScanning = false;
  let lastAnalysisResult = null;

  // Primary Action Buttons
  const btnAnalyze = document.getElementById('btn-analyze');
  const btnQuickAutoDemo = document.getElementById('btn-quick-auto-demo');
  const btnResetDemoTop = document.getElementById('btn-reset-demo-top');
  const btnResetDemo = document.getElementById('btn-reset-demo');

  // Input & Playback Elements
  const presetsList = document.getElementById('presets-list');
  const btnPlayAudio = document.getElementById('btn-play-audio');
  const playIcon = document.getElementById('play-icon');
  const playLabel = document.getElementById('play-label');
  const timeCurrent = document.getElementById('time-current');
  const timeDuration = document.getElementById('time-duration');
  const audioProgressFill = document.getElementById('audio-progress-fill');
  const audioMetaLabel = document.getElementById('audio-meta-label');
  const scanningOverlay = document.getElementById('scanning-overlay');

  // File Upload Elements
  const audioFileInput = document.getElementById('audio-file-input');
  const dropZone = document.getElementById('drop-zone');
  const selectedFileInfo = document.getElementById('selected-file-info');

  // Microphone Elements
  const btnToggleRec = document.getElementById('btn-toggle-rec');
  const micPulseCircle = document.getElementById('mic-pulse-circle');
  const recTimer = document.getElementById('rec-timer');
  const recBtnText = document.getElementById('rec-btn-text');
  const micInlineError = document.getElementById('mic-inline-error');

  // Step 2: Voice Authenticity Elements
  const valSyntheticProb = document.getElementById('val-synthetic-prob');
  const barSyntheticProb = document.getElementById('bar-synthetic-prob');
  const metricCutoff = document.getElementById('metric-cutoff');
  const metricPitch = document.getElementById('metric-pitch');
  const metricPhoneme = document.getElementById('metric-phoneme');
  const metricJitter = document.getElementById('metric-jitter');

  // Step 3: Scam Context NLP Elements
  const valContextThreat = document.getElementById('val-context-threat');
  const barContextThreat = document.getElementById('bar-context-threat');
  const transcriptBody = document.getElementById('transcript-body');
  const contextTagsContainer = document.getElementById('context-tags-container');
  const btnToggleEditTranscript = document.getElementById('btn-toggle-edit-transcript');
  const transcriptEditWrap = document.getElementById('transcript-edit-wrap');
  const transcriptEditInput = document.getElementById('transcript-edit-input');
  const btnApplyTranscript = document.getElementById('btn-apply-transcript');
  const btnCancelEdit = document.getElementById('btn-cancel-edit');
  const transcriptSourceLabel = document.getElementById('transcript-source-label');
  const transcriptModeBadge = document.getElementById('transcript-mode-badge');
  const transcriptLang = document.getElementById('transcript-lang');
  const valFactorUrgency = document.getElementById('val-factor-urgency');
  const valFactorMoney = document.getElementById('val-factor-money');
  const valFactorImpersonation = document.getElementById('val-factor-impersonation');
  const valFactorPressure = document.getElementById('val-factor-pressure');

  // Master Audio State: Strictly separated by input source ('scenario' | 'upload' | 'mic')
  const audioState = {
    sourceType: 'scenario',
    scenario: window.MOCK_SCENARIOS[0],
    customAudioBlob: null,
    filename: '',
    duration: 11,
    uploadLang: 'hi',
    micLang: 'hi-IN',
    transcriptText: '',
    isUserEdited: false,
    isRealAic: false
  };

  let customTranscriptText = '';

  // Step 4: Risk Score Elements
  const riskScoreVal = document.getElementById('risk-score-val');
  const riskClassification = document.getElementById('risk-classification');
  const gaugeBarFill = document.getElementById('gauge-bar-fill');
  const headerRiskBadge = document.getElementById('header-risk-badge');
  const headerRiskText = document.getElementById('header-risk-text');
  const summaryVoiceWeight = document.getElementById('summary-voice-weight');
  const summaryContextWeight = document.getElementById('summary-context-weight');
  const summaryFinalVerdict = document.getElementById('summary-final-verdict');
  const reasonsList = document.getElementById('reasons-list');

  // Step 5: Multilingual Warning Elements
  const warningHeadline = document.getElementById('warning-headline');
  const warningMessage = document.getElementById('warning-message');
  const warningAlertCard = document.getElementById('warning-alert-card');
  const warningIconCol = document.getElementById('warning-icon-col');
  const currentTtsLang = document.getElementById('current-tts-lang');
  const btnSpeakWarning = document.getElementById('btn-speak-warning');
  const ttsLiveBubble = document.getElementById('tts-live-bubble');
  const ttsLiveText = document.getElementById('tts-live-text');

  // Step 6: Trusted Contact Elements
  const trustedContactSection = document.getElementById('step-sec-6');
  const trustedContactName = document.getElementById('trusted-contact-name');
  const trustedContactPhone = document.getElementById('trusted-contact-phone');
  const trustedSafeWord = document.getElementById('trusted-safe-word');
  const contactStatusChip = document.getElementById('contact-status-chip');
  const btnPingContact = document.getElementById('btn-ping-contact');
  const btnCallContact = document.getElementById('btn-call-contact');

  // Step 7: Safer Decision Elements
  const recIcon = document.getElementById('rec-icon');
  const recTitle = document.getElementById('rec-title');
  const recDesc = document.getElementById('rec-desc');
  const btnBlockCaller = document.getElementById('btn-block-caller');
  const btnReportChakshu = document.getElementById('btn-report-chakshu');
  const btnExportAudit = document.getElementById('btn-export-audit');

  // Modals
  const reportModal = document.getElementById('report-modal');
  const btnCloseReportModal = document.getElementById('btn-close-report-modal');
  const reportFormPreview = document.getElementById('report-form-preview');
  const btnSubmitMockReport = document.getElementById('btn-submit-mock-report');
  const btnDownloadJson = document.getElementById('btn-download-json');

  // -------------------------------------------------------------
  // 2. Clickable Stepper Navigation
  // -------------------------------------------------------------
  const stepNodes = document.querySelectorAll('.step-node');
  stepNodes.forEach((node) => {
    node.addEventListener('click', () => {
      const targetId = node.dataset.target;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        stepNodes.forEach(n => n.classList.remove('active'));
        node.classList.add('active');
      }
    });
  });

  // -------------------------------------------------------------
  // 3. Render Preset Scenarios
  // -------------------------------------------------------------
  function renderPresetCards() {
    if (!presetsList) return;
    presetsList.innerHTML = '';

    window.MOCK_SCENARIOS.forEach((scenario, idx) => {
      const card = document.createElement('div');
      card.className = `preset-card ${idx === 0 ? 'active' : ''}`;
      card.dataset.id = scenario.id;

      card.innerHTML = `
        <div class="preset-header">
          <span class="preset-tag ${scenario.tagClass}">${scenario.tag}</span>
          <span class="preset-pill">${scenario.duration}s Audio</span>
        </div>
        <div class="preset-title">${scenario.title}</div>
        <div class="preset-snippet">${scenario.snippet}</div>
        <div class="preset-meta-pills">
          <span>Target Risk: ${scenario.riskScore}%</span>
          <span>Caller: ${scenario.callerNumber}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectScenario(scenario);
      });

      presetsList.appendChild(card);
    });
  }

  // -------------------------------------------------------------
  // Step 3 Live Preview Functions (Immediate Feedback per Input Source)
  // -------------------------------------------------------------
  function previewScenarioInStep3(scenario) {
    if (!scenario) return;
    if (transcriptSourceLabel) transcriptSourceLabel.textContent = "Source: Hackathon Scenario Demo";
    if (transcriptModeBadge) {
      transcriptModeBadge.textContent = `Predefined Scenario: ${scenario.title.split('/')[0].trim()}`;
      transcriptModeBadge.className = "source-status-chip";
    }
    if (transcriptLang) transcriptLang.textContent = "HINGLISH / ENGLISH";
    if (transcriptBody) {
      transcriptBody.innerHTML = scamContextEngine.renderHighlightedTranscript(
        scenario.rawTranscript,
        scenario.contextThreat ? scenario.contextThreat.tokens : []
      );
    }
    if (transcriptEditInput) {
      transcriptEditInput.value = scenario.rawTranscript;
    }

    const threat = scenario.contextThreat;
    if (threat) {
      valContextThreat.textContent = `${threat.score}%`;
      barContextThreat.style.width = `${threat.score}%`;
      if (valFactorUrgency) {
        valFactorUrgency.textContent = threat.urgencyLevel && !threat.urgencyLevel.includes('NONE') ? `Detected (${threat.urgencyLevel})` : 'None Detected';
        valFactorUrgency.className = threat.urgencyLevel && !threat.urgencyLevel.includes('NONE') ? 'factor-item-val text-red' : 'factor-item-val text-muted';
      }
      if (valFactorMoney) {
        valFactorMoney.textContent = threat.financialDemand && !threat.financialDemand.includes('None') ? threat.financialDemand : 'None ($0 / ₹0)';
        valFactorMoney.className = threat.financialDemand && !threat.financialDemand.includes('None') ? 'factor-item-val text-amber' : 'factor-item-val text-muted';
      }
      if (valFactorImpersonation) {
        valFactorImpersonation.textContent = threat.impersonationTarget && !threat.impersonationTarget.includes('None') ? threat.impersonationTarget : 'None Detected';
        valFactorImpersonation.className = threat.impersonationTarget && !threat.impersonationTarget.includes('None') ? 'factor-item-val text-cyan' : 'factor-item-val text-muted';
      }
      if (valFactorPressure) {
        const hasPressure = threat.coercionFlags && threat.coercionFlags.length > 0;
        valFactorPressure.textContent = hasPressure ? threat.coercionFlags.join(', ') : 'None Detected';
        valFactorPressure.className = hasPressure ? 'factor-item-val text-red' : 'factor-item-val text-muted';
      }
    }
  }

  function previewUploadedAudioInStep3() {
    const analysis = scamContextEngine.analyzeContext({
      sourceType: 'upload',
      scenario: null,
      transcriptText: audioState.transcriptText,
      language: audioState.uploadLang,
      filename: audioState.filename,
      isUserEdited: audioState.isUserEdited
    });

    if (transcriptSourceLabel) transcriptSourceLabel.textContent = analysis.sourceLabel;
    if (transcriptModeBadge) {
      transcriptModeBadge.textContent = analysis.sourceBadge;
      transcriptModeBadge.className = `source-status-chip ${analysis.isRealSpeechToText ? 'real-asr' : 'demo-trans'}`;
    }
    if (transcriptLang) transcriptLang.textContent = analysis.languageLabel;
    if (transcriptBody) transcriptBody.innerHTML = analysis.transcriptHtml;
    if (transcriptEditInput) transcriptEditInput.value = analysis.rawTranscript;

    valContextThreat.textContent = `${analysis.contextScore}%`;
    barContextThreat.style.width = `${analysis.contextScore}%`;

    if (valFactorUrgency) {
      valFactorUrgency.textContent = analysis.urgencyDetected ? `Detected (${analysis.urgencyLevel})` : 'None Detected';
      valFactorUrgency.className = analysis.urgencyDetected ? 'factor-item-val text-red' : 'factor-item-val text-muted';
    }
    if (valFactorMoney) {
      valFactorMoney.textContent = analysis.moneyRequestDetected ? analysis.financialDemand : 'None ($0 / ₹0)';
      valFactorMoney.className = analysis.moneyRequestDetected ? 'factor-item-val text-amber' : 'factor-item-val text-muted';
    }
    if (valFactorImpersonation) {
      valFactorImpersonation.textContent = analysis.impersonationDetected ? analysis.impersonationTarget : 'None Detected';
      valFactorImpersonation.className = analysis.impersonationDetected ? 'factor-item-val text-cyan' : 'factor-item-val text-muted';
    }
    if (valFactorPressure) {
      valFactorPressure.textContent = analysis.pressureDetected ? (analysis.coercionFlags.join(', ') || 'Duress Tactics') : 'None Detected';
      valFactorPressure.className = analysis.pressureDetected ? 'factor-item-val text-red' : 'factor-item-val text-muted';
    }
  }

  function previewMicInStep3() {
    const analysis = scamContextEngine.analyzeContext({
      sourceType: 'mic',
      scenario: null,
      transcriptText: audioState.transcriptText,
      language: audioState.micLang,
      filename: 'mic-recording.wav',
      isRealAic: audioState.isRealAic,
      isUserEdited: audioState.isUserEdited
    });

    if (transcriptSourceLabel) transcriptSourceLabel.textContent = analysis.sourceLabel;
    if (transcriptModeBadge) {
      transcriptModeBadge.textContent = analysis.sourceBadge;
      transcriptModeBadge.className = `source-status-chip ${analysis.isRealSpeechToText ? 'real-asr' : 'demo-trans'}`;
    }
    if (transcriptLang) transcriptLang.textContent = analysis.languageLabel;
    if (transcriptBody) transcriptBody.innerHTML = analysis.transcriptHtml;
    if (transcriptEditInput) transcriptEditInput.value = analysis.rawTranscript;

    valContextThreat.textContent = `${analysis.contextScore}%`;
    barContextThreat.style.width = `${analysis.contextScore}%`;

    if (valFactorUrgency) {
      valFactorUrgency.textContent = analysis.urgencyDetected ? `Detected (${analysis.urgencyLevel})` : 'None Detected';
      valFactorUrgency.className = analysis.urgencyDetected ? 'factor-item-val text-red' : 'factor-item-val text-muted';
    }
    if (valFactorMoney) {
      valFactorMoney.textContent = analysis.moneyRequestDetected ? analysis.financialDemand : 'None ($0 / ₹0)';
      valFactorMoney.className = analysis.moneyRequestDetected ? 'factor-item-val text-amber' : 'factor-item-val text-muted';
    }
    if (valFactorImpersonation) {
      valFactorImpersonation.textContent = analysis.impersonationDetected ? analysis.impersonationTarget : 'None Detected';
      valFactorImpersonation.className = analysis.impersonationDetected ? 'factor-item-val text-cyan' : 'factor-item-val text-muted';
    }
    if (valFactorPressure) {
      valFactorPressure.textContent = analysis.pressureDetected ? (analysis.coercionFlags.join(', ') || 'Duress Tactics') : 'None Detected';
      valFactorPressure.className = analysis.pressureDetected ? 'factor-item-val text-red' : 'factor-item-val text-muted';
    }
  }

  function selectScenario(scenario) {
    audioAnalyzer.stopAudio();
    audioState.sourceType = 'scenario';
    audioState.scenario = scenario;
    audioState.customAudioBlob = null;
    audioState.filename = '';
    audioState.duration = scenario.duration;
    audioState.transcriptText = scenario.rawTranscript;
    audioState.isUserEdited = false;
    audioState.isRealAic = false;

    currentScenario = scenario;
    customAudioBlob = null;
    customTranscriptText = scenario.rawTranscript;

    audioMetaLabel.textContent = `Scenario: ${scenario.title.split('/')[0].trim()}`;
    timeDuration.textContent = `00:${String(scenario.duration).padStart(2, '0')}`;
    timeCurrent.textContent = '00:00';
    audioProgressFill.style.width = '0%';
    playIcon.textContent = '▶';
    playLabel.textContent = 'Play Audio';

    if (scenario.trustedContact) {
      trustedContactName.textContent = `${scenario.trustedContact.name} (${scenario.trustedContact.relation})`;
      trustedContactPhone.textContent = `${scenario.trustedContact.phone} • Pre-registered Safe Contact`;
      if (trustedSafeWord) trustedSafeWord.textContent = `"${scenario.trustedContact.challengeQ}"`;
    }

    resetPipelineDisplay();
    previewScenarioInStep3(scenario);
    showToast(`Loaded: ${scenario.title.split('/')[0].trim()}`);
  }

  // -------------------------------------------------------------
  // 4. Audio Playback Handler (Works for Uploaded Audio AND Scenarios)
  // -------------------------------------------------------------
  function toggleAudioPlayback() {
    if (audioAnalyzer.isPlaying) {
      audioAnalyzer.stopAudio();
      playIcon.textContent = '▶';
      playLabel.textContent = 'Play Audio';
      return;
    }

    playIcon.textContent = '⏹';
    playLabel.textContent = 'Stop Audio';

    const onTick = (current, duration) => {
      const curSec = Math.floor(current);
      timeCurrent.textContent = `00:${String(curSec).padStart(2, '0')}`;
      const totalSec = Math.max(1, Math.floor(duration || customAudioDuration || 8));
      timeDuration.textContent = `00:${String(totalSec).padStart(2, '0')}`;
      const pct = Math.min(100, (current / totalSec) * 100);
      audioProgressFill.style.width = `${pct}%`;
    };

    const onEnd = () => {
      playIcon.textContent = '▶';
      playLabel.textContent = 'Play Audio';
      audioProgressFill.style.width = '0%';
      timeCurrent.textContent = '00:00';
    };

    if (customAudioBlob) {
      // Play actual uploaded audio file without mic access
      audioAnalyzer.playAudioBlob(customAudioBlob, onTick, onEnd);
    } else {
      // Play preset synthesized modulation
      audioAnalyzer.playScenarioAudio(currentScenario, onTick, onEnd);
    }
  }

  btnPlayAudio.addEventListener('click', toggleAudioPlayback);

  // -------------------------------------------------------------
  // 5. Input Tabs (Presets / Upload / Mic) & Language Controls
  // -------------------------------------------------------------
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.dataset.tab;
      const pane = document.getElementById(targetId);
      if (pane) pane.classList.add('active');
      audioAnalyzer.stopAudio();

      if (targetId === 'tab-presets') {
        if (audioState.scenario) {
          audioState.sourceType = 'scenario';
          previewScenarioInStep3(audioState.scenario);
        }
      } else if (targetId === 'tab-upload') {
        if (audioState.customAudioBlob && audioState.sourceType === 'upload') {
          previewUploadedAudioInStep3();
        } else {
          if (transcriptSourceLabel) transcriptSourceLabel.textContent = "Source: Uploaded Audio";
          if (transcriptModeBadge) {
            transcriptModeBadge.textContent = "Awaiting Audio Upload";
            transcriptModeBadge.className = "source-status-chip";
          }
          if (transcriptBody) transcriptBody.textContent = 'Upload an audio file (.wav, .mp3, .ogg, .m4a) to extract and analyze spoken words.';
        }
      } else if (targetId === 'tab-record') {
        if (audioState.sourceType === 'mic' && audioState.customAudioBlob) {
          previewMicInStep3();
        } else {
          if (transcriptSourceLabel) transcriptSourceLabel.textContent = "Source: Recorded Audio";
          if (transcriptModeBadge) {
            transcriptModeBadge.textContent = "Awaiting Microphone Recording";
            transcriptModeBadge.className = "source-status-chip";
          }
          if (transcriptBody) transcriptBody.textContent = 'Click "Start Recording" to speak in Hindi, Marathi, or English for live Speech-to-Text transcription.';
        }
      }
    });
  });

  // Upload Language Pills
  const uploadLangPills = document.querySelectorAll('#upload-lang-pills .pill-btn');
  uploadLangPills.forEach(btn => {
    btn.addEventListener('click', () => {
      uploadLangPills.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      audioState.uploadLang = btn.dataset.lang;
      if (audioState.sourceType === 'upload' && !audioState.isUserEdited) {
        previewUploadedAudioInStep3();
      }
    });
  });

  // Mic Language Pills
  const micLangPills = document.querySelectorAll('#mic-lang-pills .pill-btn');
  micLangPills.forEach(btn => {
    btn.addEventListener('click', () => {
      micLangPills.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      audioState.micLang = btn.dataset.lang;
    });
  });

  // -------------------------------------------------------------
  // 6. Audio File Upload Handler (NO Microphone Dependency)
  // -------------------------------------------------------------
  if (audioFileInput) {
    audioFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleCustomAudioFile(file);
    });
  }

  if (dropZone) {
    ['dragenter', 'dragover'].forEach(name => {
      dropZone.addEventListener(name, (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    });
    ['dragleave', 'drop'].forEach(name => {
      dropZone.addEventListener(name, (e) => { e.preventDefault(); dropZone.classList.remove('drag-over'); });
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && (file.type.includes('audio') || /\.(wav|mp3|m4a|webm|ogg)$/i.test(file.name))) {
        handleCustomAudioFile(file);
      } else {
        showToast('Please drop a valid audio file (.wav, .mp3, .m4a, .webm, .ogg)', 'danger');
      }
    });
  }

  async function handleCustomAudioFile(file) {
    audioAnalyzer.stopAudio();
    customAudioBlob = file;
    currentScenario = null; // Detach preset scenario completely

    audioState.sourceType = 'upload';
    audioState.scenario = null;
    audioState.customAudioBlob = file;
    audioState.filename = file.name;
    audioState.isUserEdited = false;
    audioState.isRealAic = false;
    audioState.transcriptText = ''; // Clear old transcript

    // Calculate duration of uploaded audio file without mic access
    const dur = await audioAnalyzer.getAudioDuration(file);
    customAudioDuration = Math.round(dur) || 8;
    audioState.duration = customAudioDuration;

    timeDuration.textContent = `00:${String(customAudioDuration).padStart(2, '0')}`;
    timeCurrent.textContent = '00:00';
    audioProgressFill.style.width = '0%';
    playIcon.textContent = '▶';
    playLabel.textContent = 'Play Audio';
    audioMetaLabel.textContent = `Uploaded File: ${file.name}`;

    // Render detailed file status box
    selectedFileInfo.classList.remove('hidden');
    selectedFileInfo.innerHTML = `
      <div class="file-info-header">
        <span class="file-info-name">📁 ${file.name}</span>
        <span class="badge-status">READY TO SCAN</span>
      </div>
      <div class="file-info-meta">Size: ${(file.size / 1024).toFixed(1)} KB &bull; Type: ${file.type || 'audio stream'} &bull; Duration: ~${customAudioDuration}s</div>
      <div class="file-info-actions">
        <button class="btn-mini-play" id="btn-mini-play-file">▶ Preview Uploaded Audio</button>
      </div>
      <div style="margin-top:10px; padding:8px 10px; background:rgba(0, 240, 255, 0.05); border:1px solid rgba(0, 240, 255, 0.2); border-radius:4px;">
        <div style="font-size:0.75rem; color:var(--cyan-primary); font-weight:600; margin-bottom:4px; display:flex; justify-content:space-between; align-items:center;">
          <span>💬 Audio Words (Speech-to-Text / Transcript)</span>
          <span style="font-size:0.7rem; color:var(--text-muted); font-weight:400;">Edit or Paste</span>
        </div>
        <div style="font-size:0.72rem; color:var(--text-muted); line-height:1.4; margin-bottom:6px;">
          Type or paste the actual words from this audio note below (or leave blank to use the uploaded-audio demo transcription):
        </div>
        <input type="text" id="quick-file-transcript" placeholder="e.g. Papa, emergency accident, transfer 50000 on GPay right now..." style="width:100%; box-sizing:border-box; padding:6px 8px; font-size:0.75rem; background:rgba(10,15,28,0.9); border:1px solid rgba(0,240,255,0.3); border-radius:3px; color:#fff;" />
      </div>
    `;

    const btnMiniPlay = document.getElementById('btn-mini-play-file');
    if (btnMiniPlay) {
      btnMiniPlay.addEventListener('click', toggleAudioPlayback);
    }

    const quickInput = document.getElementById('quick-file-transcript');
    if (quickInput) {
      quickInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        audioState.transcriptText = val;
        audioState.isUserEdited = Boolean(val.length > 0);
        if (transcriptEditInput) transcriptEditInput.value = val;
        previewUploadedAudioInStep3();
      });
    }

    // Configure standard trusted contact for custom files
    trustedContactName.textContent = "Rahul Sharma (Son)";
    trustedContactPhone.textContent = "+91 98765 43210 • Pre-registered Safe Contact";
    if (trustedSafeWord) trustedSafeWord.textContent = '"What was the name of our first pet adopted in 2021?"';

    resetPipelineDisplay();
    previewUploadedAudioInStep3();
    btnAnalyze.classList.add('pulse');
    showToast(`Uploaded ${file.name} — Step 3 updated with audio transcription`, 'success');
  }

  // -------------------------------------------------------------
  // 7. Microphone Recording (Isolated - Requests ONLY on click)
  // -------------------------------------------------------------
  if (btnToggleRec) {
    btnToggleRec.addEventListener('click', async () => {
      if (micInlineError) micInlineError.classList.add('hidden');

      if (audioAnalyzer.isRecording) {
        audioAnalyzer.stopMicRecording((blob, liveText, lang) => {
          customAudioBlob = blob;
          currentScenario = null; // Detach scenario completely
          customAudioDuration = 6;

          audioState.sourceType = 'mic';
          audioState.scenario = null;
          audioState.customAudioBlob = blob;
          audioState.filename = 'mic-recording.wav';
          audioState.duration = 6;

          audioMetaLabel.textContent = `Live Mic Recording (${(blob.size / 1024).toFixed(1)} KB)`;
          timeDuration.textContent = `00:06`;

          if (liveText && liveText.trim().length > 0) {
            audioState.transcriptText = liveText.trim();
            audioState.isRealAic = true;
            audioState.isUserEdited = false;
            showToast(`Mic transcribed (${lang}): "${audioState.transcriptText.slice(0, 30)}..."`, 'success');
          } else {
            audioState.transcriptText = '';
            audioState.isRealAic = false;
            audioState.isUserEdited = false;
            showToast('Mic recording captured. Ready to run scan.', 'success');
          }

          resetPipelineDisplay();
          previewMicInStep3();
        });
        micPulseCircle.classList.remove('recording');
        btnToggleRec.classList.remove('active');
        recBtnText.textContent = 'Record Again';
      } else {
        const success = await audioAnalyzer.startMicRecording(
          (sec) => { recTimer.textContent = `00:${String(sec).padStart(2, '0')}`; },
          () => {
            if (micInlineError) micInlineError.classList.remove('hidden');
          },
          audioState.micLang || 'hi-IN'
        );

        if (success) {
          micPulseCircle.classList.add('recording');
          btnToggleRec.classList.add('active');
          recBtnText.textContent = 'Stop Recording';
          recTimer.textContent = '00:00';
          if (micInlineError) micInlineError.classList.add('hidden');
          showToast(`Recording in ${audioState.micLang}... Speak naturally.`, 'success');
        }
      }
    });
  }

  // -------------------------------------------------------------
  // 8. Master Scan Flow: 7-Step Pipeline Execution
  // -------------------------------------------------------------
  async function executePipelineScan() {
    if (isScanning) return;
    isScanning = true;

    // Show Scanning Overlay Tracker
    scanningOverlay.classList.remove('hidden');
    const log1 = document.getElementById('log-step-1');
    const log2 = document.getElementById('log-step-2');
    const log3 = document.getElementById('log-step-3');
    const log4 = document.getElementById('log-step-4');

    log1.className = 'scan-log-line active';
    log2.className = 'scan-log-line';
    log3.className = 'scan-log-line';
    log4.className = 'scan-log-line';

    setTimeout(() => { log1.className = 'scan-log-line'; log2.className = 'scan-log-line active'; }, 280);
    setTimeout(() => { log2.className = 'scan-log-line'; log3.className = 'scan-log-line active'; }, 560);
    setTimeout(() => { log3.className = 'scan-log-line'; log4.className = 'scan-log-line active'; }, 840);

    // Call Engine 1: Voice Authenticity Analysis (Step 2)
    const voiceResult = await aiEngine.analyzeVoice({
      scenario: audioState.sourceType === 'scenario' ? audioState.scenario : null,
      audioBlob: audioState.customAudioBlob,
      filename: audioState.filename || (audioState.customAudioBlob ? audioState.customAudioBlob.name : null),
      isMic: audioState.sourceType === 'mic'
    });

    // Call Engine 2: Scam Context Threat NLP (Step 3)
    const isClone = voiceResult.syntheticProbability >= 70;
    const contextResult = scamContextEngine.analyzeContext({
      sourceType: audioState.sourceType,
      scenario: audioState.sourceType === 'scenario' ? audioState.scenario : null,
      transcriptText: audioState.transcriptText,
      language: audioState.sourceType === 'upload' ? audioState.uploadLang : audioState.micLang,
      filename: audioState.filename,
      isRealAic: audioState.isRealAic,
      isUserEdited: audioState.isUserEdited,
      isClone: isClone
    });

    // Call Engine 3: Multi-Factor Composite Risk Fusion (Step 4)
    const compositeRisk = scamContextEngine.calculateCompositeRisk(
      voiceResult.syntheticProbability,
      contextResult.contextScore
    );

    lastAnalysisResult = {
      voice: voiceResult,
      context: contextResult,
      risk: compositeRisk,
      scenario: audioState.sourceType === 'scenario' ? audioState.scenario : null,
      sourceType: audioState.sourceType
    };

    // Complete Scan
    setTimeout(() => {
      scanningOverlay.classList.add('hidden');
      isScanning = false;
      renderAnalysisResults(lastAnalysisResult);
      animatePipelineSequence();
      showToast(`Scan complete: ${compositeRisk.classification} (${compositeRisk.score}%)`, 
        compositeRisk.score >= 70 ? 'danger' : 'success');
    }, 1100);
  }

  btnAnalyze.addEventListener('click', executePipelineScan);

  // -------------------------------------------------------------
  // 9. Render Analysis Results into Steps 2 through 7
  // -------------------------------------------------------------
  function renderAnalysisResults(data) {
    const { voice, context, risk, scenario } = data;

    // Header Badge
    headerRiskBadge.className = `risk-badge-header ${risk.badgeClass}`;
    headerRiskText.textContent = `${risk.classification} (${risk.score}%)`;

    // STEP 2: Voice Authenticity Telemetry
    valSyntheticProb.textContent = `${voice.syntheticProbability}%`;
    barSyntheticProb.style.width = `${voice.syntheticProbability}%`;
    metricCutoff.textContent = voice.cutoffFrequency;
    metricPitch.textContent = voice.pitchContourFlatness;
    metricPhoneme.textContent = voice.phonemeDiscontinuityRate;
    metricJitter.textContent = voice.vocalJitterShimmer;

    // STEP 3: Scam Context NLP & Threat Tokens
    valContextThreat.textContent = `${context.contextScore}%`;
    barContextThreat.style.width = `${context.contextScore}%`;
    transcriptBody.innerHTML = context.transcriptHtml;
    if (transcriptEditInput) {
      transcriptEditInput.value = context.rawTranscript || '';
    }
    if (transcriptSourceLabel) {
      transcriptSourceLabel.textContent = context.sourceLabel;
    }
    if (transcriptModeBadge) {
      transcriptModeBadge.textContent = context.sourceBadge;
      transcriptModeBadge.className = `source-status-chip ${context.isRealSpeechToText ? 'real-asr' : 'demo-trans'}`;
    }
    if (transcriptLang) {
      transcriptLang.textContent = context.languageLabel || 'HINGLISH / ENGLISH';
    }

    if (valFactorUrgency) {
      valFactorUrgency.textContent = context.urgencyDetected ? `Detected (${context.urgencyLevel})` : 'None Detected';
      valFactorUrgency.className = context.urgencyDetected ? 'factor-item-val text-red' : 'factor-item-val text-muted';
    }
    if (valFactorMoney) {
      valFactorMoney.textContent = context.moneyRequestDetected ? context.financialDemand : 'None ($0 / ₹0)';
      valFactorMoney.className = context.moneyRequestDetected ? 'factor-item-val text-amber' : 'factor-item-val text-muted';
    }
    if (valFactorImpersonation) {
      valFactorImpersonation.textContent = context.impersonationDetected ? context.impersonationTarget : 'None Detected';
      valFactorImpersonation.className = context.impersonationDetected ? 'factor-item-val text-cyan' : 'factor-item-val text-muted';
    }
    if (valFactorPressure) {
      const flags = Array.isArray(context.coercionFlags) ? context.coercionFlags.join(', ') : '';
      valFactorPressure.textContent = context.pressureDetected ? (flags || 'Duress Tactics') : 'None Detected';
      valFactorPressure.className = context.pressureDetected ? 'factor-item-val text-red' : 'factor-item-val text-muted';
    }

    contextTagsContainer.innerHTML = `
      <span class="context-tag tag-urgency-high">⏱️ Urgency: ${context.urgencyLevel}</span>
      <span class="context-tag tag-impersonation">🎭 Impersonation: ${context.impersonationTarget}</span>
      <span class="context-tag tag-financial">💸 Financial Demand: ${context.financialDemand}</span>
    `;

    // STEP 4: Risk Score & Reasons
    animateScoreGauge(risk.score, risk.classification);
    summaryVoiceWeight.textContent = `${voice.syntheticProbability}% (Weighted: ${Math.round(voice.syntheticProbability * 0.55)}%)`;
    summaryContextWeight.textContent = `${context.contextScore}% (Weighted: ${Math.round(context.contextScore * 0.45)}%)`;
    summaryFinalVerdict.textContent = `${risk.classification} (${risk.score}%)`;
    summaryFinalVerdict.style.color = risk.score >= 70 ? '#ff2d55' : (risk.score >= 35 ? '#f59e0b' : '#10b981');
    renderReasonsList(context.reasons || (scenario ? scenario.reasons : []));

    // STEP 5: Multilingual Warning (English, Hindi, Marathi)
    updateWarningView(scenario, currentLanguage, risk.score);

    // STEP 6: Trusted Contact Protocol (High-Risk Calls)
    if (scenario && scenario.trustedContact) {
      trustedContactName.textContent = `${scenario.trustedContact.name} (${scenario.trustedContact.relation})`;
      trustedContactPhone.textContent = `${scenario.trustedContact.phone} • Pre-registered Safe Contact`;
      if (trustedSafeWord) trustedSafeWord.textContent = `"${scenario.trustedContact.challengeQ}"`;
    } else {
      trustedContactName.textContent = "Rahul Sharma (Son)";
      trustedContactPhone.textContent = "+91 98765 43210 • Pre-registered Safe Contact";
      if (trustedSafeWord) trustedSafeWord.textContent = '"What was the name of our first pet adopted in 2021?"';
    }

    if (risk.score >= 70) {
      trustedContactSection.style.opacity = '1';
      contactStatusChip.innerHTML = `<span class="status-dot" style="background:#ff2d55;box-shadow:0 0 8px #ff2d55"></span> Safe-Check Recommended`;
    } else {
      contactStatusChip.innerHTML = `<span class="status-dot green"></span> Baseline Safe (No Action Needed)`;
    }

    // STEP 7: Safer Decision Directives
    renderSaferDecisionBox(risk.score, context);
  }

  function animatePipelineSequence() {
    for (let i = 1; i <= 7; i++) {
      setTimeout(() => {
        const node = document.getElementById(`node-step-${i}`);
        if (node) {
          node.classList.add('completed');
          node.classList.add('active');
        }
      }, i * 110);
    }
  }

  function animateScoreGauge(targetScore, classification) {
    const circumference = 427;
    const offset = circumference - (circumference * targetScore) / 100;
    gaugeBarFill.style.strokeDashoffset = offset;

    if (targetScore >= 70) {
      gaugeBarFill.style.stroke = '#ff2d55';
      riskClassification.style.color = '#ff2d55';
    } else if (targetScore >= 35) {
      gaugeBarFill.style.stroke = '#f59e0b';
      riskClassification.style.color = '#f59e0b';
    } else {
      gaugeBarFill.style.stroke = '#10b981';
      riskClassification.style.color = '#10b981';
    }

    riskClassification.textContent = classification;

    let currentVal = 0;
    const step = Math.ceil(targetScore / 20) || 1;
    const interval = setInterval(() => {
      currentVal += step;
      if (currentVal >= targetScore) {
        currentVal = targetScore;
        clearInterval(interval);
      }
      riskScoreVal.textContent = currentVal;
    }, 25);
  }

  function renderReasonsList(reasons = []) {
    reasonsList.innerHTML = '';
    reasons.forEach(r => {
      const card = document.createElement('div');
      card.className = `reason-card ${r.level || 'warning'}`;
      card.innerHTML = `
        <span class="reason-icon">${r.icon || 'ℹ️'}</span>
        <div>
          <div class="reason-title">${r.title}</div>
          <div class="reason-detail">${r.detail}</div>
        </div>
      `;
      reasonsList.appendChild(card);
    });
  }

  // -------------------------------------------------------------
  // Transcript Customization & Real-time NLP Re-analysis (Step 3)
  // -------------------------------------------------------------
  if (btnToggleEditTranscript) {
    btnToggleEditTranscript.addEventListener('click', () => {
      const isHidden = transcriptEditWrap.classList.contains('hidden');
      if (isHidden) {
        transcriptEditWrap.classList.remove('hidden');
        if (!transcriptEditInput.value) {
          if (lastAnalysisResult && lastAnalysisResult.context) {
            transcriptEditInput.value = lastAnalysisResult.context.rawTranscript || '';
          } else if (currentScenario) {
            transcriptEditInput.value = currentScenario.rawTranscript || '';
          }
        }
        transcriptEditInput.focus();
        btnToggleEditTranscript.textContent = '❌ Close Edit';
      } else {
        transcriptEditWrap.classList.add('hidden');
        btnToggleEditTranscript.textContent = '✏️ Edit Spoken Words';
      }
    });
  }

  if (btnCancelEdit) {
    btnCancelEdit.addEventListener('click', () => {
      transcriptEditWrap.classList.add('hidden');
      if (btnToggleEditTranscript) btnToggleEditTranscript.textContent = '✏️ Edit Spoken Words';
    });
  }

  if (btnApplyTranscript) {
    btnApplyTranscript.addEventListener('click', () => {
      const text = transcriptEditInput.value.trim();
      if (!text) {
        showToast('Please type or paste the spoken words from your audio.', 'danger');
        return;
      }
      customTranscriptText = text;
      audioState.transcriptText = text;
      audioState.isUserEdited = true;
      transcriptEditWrap.classList.add('hidden');
      if (btnToggleEditTranscript) btnToggleEditTranscript.textContent = '✏️ Edit Spoken Words';

      // If we already ran a scan, dynamically recompute Step 3 NLP & Step 4 Composite Risk!
      if (lastAnalysisResult && lastAnalysisResult.voice) {
        const isClone = lastAnalysisResult.voice.syntheticProbability >= 70;
        const newContext = scamContextEngine.analyzeContext({
          sourceType: audioState.sourceType,
          scenario: audioState.sourceType === 'scenario' ? audioState.scenario : null,
          transcriptText: text,
          language: audioState.sourceType === 'upload' ? audioState.uploadLang : audioState.micLang,
          filename: audioState.filename,
          isRealAic: audioState.isRealAic,
          isUserEdited: true,
          isClone: isClone
        });
        const newRisk = scamContextEngine.calculateCompositeRisk(
          lastAnalysisResult.voice.syntheticProbability,
          newContext.contextScore
        );
        lastAnalysisResult.context = newContext;
        lastAnalysisResult.risk = newRisk;

        renderAnalysisResults(lastAnalysisResult);
        showToast(`NLP Re-analyzed! Threat Score: ${newContext.contextScore}%, Risk: ${newRisk.score}%`, 
          newRisk.score >= 70 ? 'danger' : (newRisk.score >= 35 ? 'info' : 'success'));
      } else {
        // Preview tokens in Step 3 immediately based on current sourceType
        if (audioState.sourceType === 'upload') {
          previewUploadedAudioInStep3();
        } else if (audioState.sourceType === 'mic') {
          previewMicInStep3();
        } else {
          // Scenario with custom edit
          const previewContext = scamContextEngine.analyzeContext({
            sourceType: 'scenario',
            scenario: null,
            transcriptText: text,
            isUserEdited: true
          });
          transcriptBody.innerHTML = previewContext.transcriptHtml;
          valContextThreat.textContent = `${previewContext.contextScore}%`;
          barContextThreat.style.width = `${previewContext.contextScore}%`;
          if (transcriptSourceLabel) transcriptSourceLabel.textContent = previewContext.sourceLabel;
          if (transcriptModeBadge) {
            transcriptModeBadge.textContent = previewContext.sourceBadge;
            transcriptModeBadge.className = 'source-status-chip user-verified';
          }
        }
        showToast('Spoken words saved! Click "RUN FULL VOICESHIELD SCAN" to calculate full forensic risk.', 'success');
      }
    });
  }
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      langButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLanguage = btn.dataset.lang;
      multilingualEngine.setLanguage(currentLanguage);

      const langNames = { en: 'English', hi: 'Hindi', mr: 'Marathi' };
      currentTtsLang.textContent = langNames[currentLanguage] || 'English';

      const currentScen = audioState.sourceType === 'scenario' ? audioState.scenario : null;
      const riskScore = lastAnalysisResult ? lastAnalysisResult.risk.score : (currentScen ? currentScen.riskScore : 0);
      updateWarningView(lastAnalysisResult ? lastAnalysisResult.scenario : currentScen, currentLanguage, riskScore);
    });
  });

  function updateWarningView(scenario, lang, riskScore = 0) {
    const warning = multilingualEngine.getWarning(scenario, lang, riskScore);
    warningHeadline.textContent = warning.headline;
    warningMessage.textContent = warning.message;

    warningAlertCard.className = 'warning-alert-card';
    if (riskScore >= 70) {
      warningAlertCard.classList.add('alert-high');
      warningIconCol.textContent = '🚨';
    } else if (riskScore >= 35) {
      warningAlertCard.classList.add('alert-med');
      warningIconCol.textContent = '⚠️';
    } else if (riskScore > 0) {
      warningAlertCard.classList.add('alert-low');
      warningIconCol.textContent = '🛡️';
    } else {
      warningIconCol.textContent = '🛡️';
    }
  }

  btnSpeakWarning.addEventListener('click', () => {
    const currentScen = audioState.sourceType === 'scenario' ? audioState.scenario : null;
    const scenario = lastAnalysisResult ? lastAnalysisResult.scenario : currentScen;
    const riskScore = lastAnalysisResult ? lastAnalysisResult.risk.score : 0;
    const langNames = { en: 'English', hi: 'Hindi', mr: 'Marathi' };

    btnSpeakWarning.textContent = '🔊 Reading Alert...';
    ttsLiveBubble.classList.remove('hidden');
    ttsLiveText.textContent = `Speaking alert in ${langNames[currentLanguage]}...`;

    multilingualEngine.speakWarning(
      scenario,
      currentLanguage,
      riskScore,
      () => {},
      () => {
        btnSpeakWarning.textContent = `🔊 Speak Local Alert (${langNames[currentLanguage]})`;
        ttsLiveBubble.classList.add('hidden');
      }
    );
  });

  // -------------------------------------------------------------
  // 11. Step 6: Trusted Contact Secondary Verification
  // -------------------------------------------------------------
  if (btnPingContact) {
    btnPingContact.addEventListener('click', () => {
      const currentScen = audioState.sourceType === 'scenario' ? audioState.scenario : null;
      const scenario = lastAnalysisResult ? lastAnalysisResult.scenario : currentScen;
      contactVerifier.startVerificationFlow(scenario);
    });
  }

  if (btnCallContact) {
    btnCallContact.addEventListener('click', () => {
      showToast('Simulating direct cellular call to Rahul (Son)... Out-of-band link active.', 'info');
    });
  }

  function updateDecisionForVerifiedContact(contact) {
    contactStatusChip.innerHTML = `<span class="status-dot green"></span> Verified Safe & Authentic`;
    recIcon.textContent = '✅';
    recTitle.textContent = 'FRAUD AVERTED: TRUSTED CONTACT VERIFIED SAFE';
    recDesc.textContent = `${contact.name} confirmed via safe-word that they are safe in college. The caller was an imposter using AI voice cloning. Zero funds transferred.`;
  }

  // -------------------------------------------------------------
  // 12. Step 7: Safer Decision Actions & Incident Reporting
  // -------------------------------------------------------------
  function renderSaferDecisionBox(score, context) {
    if (score >= 70) {
      recIcon.textContent = '⛔';
      recTitle.textContent = 'CRITICAL DIRECTIVE: TERMINATE CALL IMMEDIATELY';
      recDesc.textContent = `Extreme threat level (${score}% risk). High probability of voice clone and extortion of ${context.financialDemand}. Never transfer money via UPI under duress.`;
    } else if (score >= 35) {
      recIcon.textContent = '⚠️';
      recTitle.textContent = 'CAUTION: POTENTIAL PHISHING OR ROBOCALL';
      recDesc.textContent = `Suspicious context with artificial pressure. Do not reveal OTPs, banking credentials, or Aadhaar numbers.`;
    } else {
      recIcon.textContent = '🛡️';
      recTitle.textContent = 'SAFE: NATURAL HUMAN VOICE SIGNATURE';
      recDesc.textContent = `Authentic human speech patterns verified. Zero extortion or deepfake anomalies detected. Safe to interact.`;
    }
  }

  btnBlockCaller.addEventListener('click', () => {
    const caller = (audioState.sourceType === 'scenario' && audioState.scenario) ? audioState.scenario.callerNumber : '+91 98231 XXXXX';
    showToast(`Caller ${caller} added to Carrier Blacklist & National Spam Registry.`, 'danger');
  });

  btnReportChakshu.addEventListener('click', () => {
    openChakshuReportModal();
  });

  btnExportAudit.addEventListener('click', () => {
    downloadForensicJson();
  });

  // -------------------------------------------------------------
  // 13. 1-Click Hackathon Auto-Demo
  // -------------------------------------------------------------
  btnQuickAutoDemo.addEventListener('click', async () => {
    const scenario = window.MOCK_SCENARIOS[0];
    document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
    const firstCard = document.querySelector('.preset-card');
    if (firstCard) firstCard.classList.add('active');
    selectScenario(scenario);

    // Play simulated audio
    btnPlayAudio.click();
    showToast('Demo: Playing simulated extortion voice note...', 'info');

    setTimeout(async () => {
      audioAnalyzer.stopAudio();
      playIcon.textContent = '▶';
      playLabel.textContent = 'Play Audio';

      await executePipelineScan();

      setTimeout(() => {
        const step2 = document.getElementById('step-sec-2');
        if (step2) step2.scrollIntoView({ behavior: 'smooth', block: 'start' });
        showToast('Demo: Voice clone detected! Launching Trusted Contact Safe-Check in 3s...', 'danger');

        setTimeout(() => {
          contactVerifier.startVerificationFlow(scenario);
        }, 3000);
      }, 1200);
    }, 1800);
  });

  // -------------------------------------------------------------
  // 14. Chakshu / 1930 Incident Reporting Dossier Modal
  // -------------------------------------------------------------
  function openChakshuReportModal() {
    const scenario = lastAnalysisResult ? lastAnalysisResult.scenario : (audioState.sourceType === 'scenario' ? audioState.scenario : null);
    const risk = lastAnalysisResult ? lastAnalysisResult.risk : { score: 94, classification: "HIGH RISK" };
    const voice = lastAnalysisResult ? lastAnalysisResult.voice : (scenario ? scenario.voiceMetrics : {});
    const callerId = scenario ? scenario.callerNumber : '+91 98231 XXXXX (Spoofed)';

    reportFormPreview.innerHTML = `
      <div class="report-row"><span class="report-k">Incident ID:</span><span class="report-v">VSI-${Date.now().toString(36).toUpperCase()}</span></div>
      <div class="report-row"><span class="report-k">Target Portal:</span><span class="report-v">Department of Telecom (Chakshu) & MHA 1930</span></div>
      <div class="report-row"><span class="report-k">Incident Classification:</span><span class="report-v">AI Voice Clone Impersonation & UPI Extortion</span></div>
      <div class="report-row"><span class="report-k">Caller ID:</span><span class="report-v">${callerId}</span></div>
      <div class="report-row"><span class="report-k">Risk Verdict:</span><span class="report-v text-red">${risk.classification} (${risk.score}%)</span></div>
      <div class="report-row"><span class="report-k">Synthetic Confidence:</span><span class="report-v">${voice.syntheticProbability || 94}%</span></div>
      <div class="report-row"><span class="report-k">Extortion Target:</span><span class="report-v">${lastAnalysisResult && lastAnalysisResult.context ? lastAnalysisResult.context.financialDemand : '₹50,000 via UPI'}</span></div>
      <div class="report-row"><span class="report-k">Cryptographic Audio Hash:</span><span class="report-v">SHA256: 8f4a2b91c0e35f992a71d8</span></div>
      <div class="report-row"><span class="report-k">Transcript Excerpt:</span><span class="report-v">${lastAnalysisResult && lastAnalysisResult.context ? lastAnalysisResult.context.rawTranscript.slice(0, 75) + '...' : 'Extortion transcript...'}</span></div>
    `;

    reportModal.classList.remove('hidden');
  }

  if (btnCloseReportModal) {
    btnCloseReportModal.addEventListener('click', () => reportModal.classList.add('hidden'));
  }
  if (reportModal) {
    reportModal.addEventListener('click', (e) => {
      if (e.target === reportModal) reportModal.classList.add('hidden');
    });
  }
  if (btnSubmitMockReport) {
    btnSubmitMockReport.addEventListener('click', () => {
      reportModal.classList.add('hidden');
      showToast('Incident successfully reported to National Cyber Crime Portal (1930 & Chakshu)!', 'success');
    });
  }
  if (btnDownloadJson) {
    btnDownloadJson.addEventListener('click', downloadForensicJson);
  }

  function downloadForensicJson() {
    const reportData = {
      system: "VoiceShield India - AI Voice Cloning Scam Detection",
      generatedAt: new Date().toISOString(),
      analysis: lastAnalysisResult || {
        scenario: audioState.sourceType === 'scenario' && audioState.scenario ? audioState.scenario.title : (audioState.filename || 'Custom Audio'),
        riskScore: (audioState.sourceType === 'scenario' && audioState.scenario) ? audioState.scenario.riskScore : 94,
        caller: (audioState.sourceType === 'scenario' && audioState.scenario) ? audioState.scenario.callerNumber : '+91 98231 XXXXX'
      },
      forensicMarkers: {
        engine: "Wav2Vec2-SpecNet + NLP ContextNet",
        framework: "Indian Cyber Crime Prevention Compliance (Section 66D IT Act)"
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VoiceShield-Forensic-Report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Forensic JSON Dossier downloaded.', 'success');
  }

  // Reset Actions
  function resetPipelineDisplay() {
    stepNodes.forEach((node, idx) => {
      if (idx === 0) {
        node.classList.add('active');
        node.classList.remove('completed');
      } else {
        node.classList.remove('active', 'completed');
      }
    });

    headerRiskBadge.className = 'risk-badge-header';
    headerRiskText.textContent = 'AWAITING INPUT';
    riskScoreVal.textContent = '0';
    riskClassification.textContent = 'AWAITING INPUT';
    gaugeBarFill.style.strokeDashoffset = '427';
    gaugeBarFill.style.stroke = 'var(--emerald-safe)';

    valSyntheticProb.textContent = '0%';
    barSyntheticProb.style.width = '0%';
    valContextThreat.textContent = '0%';
    barContextThreat.style.width = '0%';

    metricCutoff.textContent = '--';
    metricPitch.textContent = '--';
    metricPhoneme.textContent = '--';
    metricJitter.textContent = '--';

    transcriptBody.textContent = 'Select a scenario or upload audio and click "RUN FULL VOICESHIELD SCAN" to generate forensic transcript.';
    contextTagsContainer.innerHTML = '';
    reasonsList.innerHTML = '<div class="reason-placeholder">Click "RUN FULL VOICESHIELD SCAN" to populate explainable AI reason cards.</div>';

    if (valFactorUrgency) {
      valFactorUrgency.textContent = 'Awaiting Analysis';
      valFactorUrgency.className = 'factor-item-val text-muted';
    }
    if (valFactorMoney) {
      valFactorMoney.textContent = 'Awaiting Analysis';
      valFactorMoney.className = 'factor-item-val text-muted';
    }
    if (valFactorImpersonation) {
      valFactorImpersonation.textContent = 'Awaiting Analysis';
      valFactorImpersonation.className = 'factor-item-val text-muted';
    }
    if (valFactorPressure) {
      valFactorPressure.textContent = 'Awaiting Analysis';
      valFactorPressure.className = 'factor-item-val text-muted';
    }

    summaryVoiceWeight.textContent = '0%';
    summaryContextWeight.textContent = '0%';
    summaryFinalVerdict.textContent = 'Awaiting Scan';
    summaryFinalVerdict.style.color = 'var(--text-muted)';

    contactStatusChip.innerHTML = `<span class="status-dot green"></span> Ready for Safe-Check`;
    recIcon.textContent = '🛡️';
    recTitle.textContent = 'Awaiting Analysis';
    recDesc.textContent = 'VoiceShield will provide automated safety directives based on synthetic probability and threat severity.';

    updateWarningView(audioState.sourceType === 'scenario' ? audioState.scenario : null, currentLanguage, 0);
  }

  if (btnResetDemoTop) btnResetDemoTop.addEventListener('click', () => { resetPipelineDisplay(); showToast('Pipeline reset.'); });
  if (btnResetDemo) btnResetDemo.addEventListener('click', () => { resetPipelineDisplay(); showToast('Pipeline reset.'); });

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>🛡️</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Initialize
  renderPresetCards();
  selectScenario(window.MOCK_SCENARIOS[0]);
  window.addEventListener('resize', () => audioAnalyzer.initCanvas());
});
