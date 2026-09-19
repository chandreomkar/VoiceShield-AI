// VoiceShield India - Master Application Controller
// Orchestrates 4-Screen Flow: Home (Input) -> Analysis -> Risk Result & Reasons -> Trusted Verification
// Built with zero external dependencies for guaranteed demo reliability

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Forensic Engines
  const audioAnalyzer = new window.AudioAnalyzer();
  const aiEngine = new window.VoiceAIEngine();
  const scamContextEngine = new window.ScamContextEngine();
  const multilingualEngine = new window.MultilingualEngine();
  const contactVerifier = new window.TrustedContactVerifier({
    onStateChange: (state) => {
      if (state === 'FLAGGED_SCAM') {
        showToast('🚨 Contact confirmed SCAM! Loss prevented.', 'error');
      } else if (state === 'CONFIRMED_GENUINE') {
        showToast('✅ Contact confirmed GENUINE. Safe to proceed.', 'success');
      }
    }
  });

  // State
  let currentScenario = window.MOCK_SCENARIOS[0];
  let customAudioBlob = null;
  let customAudioDuration = 11;
  let currentLanguage = 'en';
  let isScanning = false;
  let lastVoiceResult = null;
  let lastContextResult = null;
  let lastCompositeScore = 94;

  const audioState = {
    sourceType: 'scenario',
    scenario: window.MOCK_SCENARIOS[0],
    customAudioBlob: null,
    filename: '',
    duration: 11,
    uploadLang: 'hi',
    micLang: 'hi-IN',
    transcriptText: ''
  };

  // -----------------------------------------------------------------
  // Screen Router & Navigation
  // -----------------------------------------------------------------
  const screens = {
    'screen-home': document.getElementById('screen-home'),
    'screen-analysis': document.getElementById('screen-analysis'),
    'screen-result': document.getElementById('screen-result'),
    'screen-verification': document.getElementById('screen-verification')
  };

  const navStepNodes = {
    'screen-home': document.getElementById('nav-step-1'),
    'screen-analysis': document.getElementById('nav-step-2'),
    'screen-result': document.getElementById('nav-step-3'),
    'screen-verification': document.getElementById('nav-step-4')
  };

  function navigateToScreen(screenId) {
    // Hide all screens, show target
    Object.keys(screens).forEach(id => {
      if (screens[id]) {
        screens[id].classList.remove('active');
      }
    });

    if (screens[screenId]) {
      screens[screenId].classList.add('active');
    }

    // Update stepper highlights
    Object.keys(navStepNodes).forEach(id => {
      if (navStepNodes[id]) {
        navStepNodes[id].classList.remove('active');
      }
    });
    if (navStepNodes[screenId]) {
      navStepNodes[screenId].classList.add('active');
    }

    // Smooth scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Allow clicking on stepper nodes
  document.querySelectorAll('.step-node').forEach(node => {
    node.addEventListener('click', () => {
      const targetScreen = node.dataset.screen;
      if (targetScreen) {
        navigateToScreen(targetScreen);
      }
    });
  });

  // -----------------------------------------------------------------
  // Screen 1: Home / Input Controls
  // -----------------------------------------------------------------
  const presetsList = document.getElementById('presets-list');
  const btnAnalyze = document.getElementById('btn-analyze');
  const btnQuickAutoDemo = document.getElementById('btn-quick-auto-demo');
  const privacyConsentChk = document.getElementById('privacy-consent-chk');

  // Input Tabs
  const inputTabBtns = document.querySelectorAll('.input-tabs .tab-btn');
  const inputPanes = document.querySelectorAll('.tab-pane');

  inputTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      inputTabBtns.forEach(b => b.classList.remove('active'));
      inputPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(btn.dataset.tab);
      if (targetPane) targetPane.classList.add('active');

      if (btn.dataset.tab === 'tab-presets') {
        audioState.sourceType = 'scenario';
        if (!audioState.scenario) audioState.scenario = currentScenario || window.MOCK_SCENARIOS[0];
      } else if (btn.dataset.tab === 'tab-upload') {
        audioState.sourceType = 'upload';
      } else if (btn.dataset.tab === 'tab-record') {
        audioState.sourceType = 'mic';
        checkMicProtocolNotice();
      }
    });
  });

  // Render Preset Scenarios
  function renderPresets() {
    if (!presetsList) return;
    presetsList.innerHTML = '';

    window.MOCK_SCENARIOS.forEach((sc, idx) => {
      const card = document.createElement('div');
      card.className = `preset-card ${idx === 0 ? 'active' : ''}`;
      card.dataset.id = sc.id;

      card.innerHTML = `
        <div class="preset-top-row">
          <span class="preset-tag ${sc.tagClass}">${sc.tag}</span>
          <span class="preset-score-pill">${sc.riskScore}% Risk</span>
        </div>
        <div class="preset-title">${sc.title}</div>
        <div class="preset-snippet">${sc.snippet}</div>
      `;

      card.addEventListener('click', () => {
        document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        currentScenario = sc;
        audioState.sourceType = 'scenario';
        audioState.scenario = sc;
        audioState.duration = sc.duration;

        const metaLabel = document.getElementById('audio-meta-label');
        if (metaLabel) metaLabel.textContent = `Selected: ${sc.title}`;

        const timeDuration = document.getElementById('time-duration');
        if (timeDuration) timeDuration.textContent = `00:${String(sc.duration).padStart(2, '0')}`;

        audioAnalyzer.drawSyntheticWaveform(sc.riskScore >= 70 ? 'clone' : 'genuine');
      });

      presetsList.appendChild(card);
    });
  }

  // Audio Playback Controls
  const btnPlayAudio = document.getElementById('btn-play-audio');
  const playIcon = document.getElementById('play-icon');
  const playLabel = document.getElementById('play-label');
  const timeCurrent = document.getElementById('time-current');
  const audioProgressFill = document.getElementById('audio-progress-fill');
  let isPlaying = false;
  let playInterval = null;
  let playSeconds = 0;

  if (btnPlayAudio) {
    btnPlayAudio.addEventListener('click', () => {
      if (isPlaying) {
        stopPlayback();
      } else {
        startPlayback();
      }
    });
  }

  function startPlayback() {
    isPlaying = true;
    if (playIcon) playIcon.textContent = '⏹';
    if (playLabel) playLabel.textContent = 'Stop Audio';
    playSeconds = 0;

    audioAnalyzer.startOscillatorSimulation(audioState.scenario ? audioState.scenario.riskScore >= 70 : true);

    const totalDur = audioState.duration || 11;
    playInterval = setInterval(() => {
      playSeconds += 0.25;
      if (timeCurrent) {
        const mins = Math.floor(playSeconds / 60);
        const secs = Math.floor(playSeconds % 60);
        timeCurrent.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
      if (audioProgressFill) {
        const percent = Math.min(100, (playSeconds / totalDur) * 100);
        audioProgressFill.style.width = `${percent}%`;
      }
      if (playSeconds >= totalDur) {
        stopPlayback();
      }
    }, 250);
  }

  function stopPlayback() {
    isPlaying = false;
    if (playIcon) playIcon.textContent = '▶';
    if (playLabel) playLabel.textContent = 'Play Audio';
    if (playInterval) {
      clearInterval(playInterval);
      playInterval = null;
    }
    if (audioAnalyzer) {
      try {
        if (typeof audioAnalyzer.stopAudio === 'function') audioAnalyzer.stopAudio();
        else if (typeof audioAnalyzer.stopOscillatorSimulation === 'function') audioAnalyzer.stopOscillatorSimulation();
      } catch (e) {
        console.warn('[VoiceShield] stopAudio notice:', e);
      }
    }
    if (audioProgressFill) audioProgressFill.style.width = '0%';
    if (timeCurrent) timeCurrent.textContent = '00:00';
  }

  // Upload Audio Handling
  const audioFileInput = document.getElementById('audio-file-input');
  const dropZone = document.getElementById('drop-zone');
  const selectedFileInfo = document.getElementById('selected-file-info');

  if (dropZone && audioFileInput) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    });

    audioFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    });
  }

  function handleFileSelect(file) {
    audioState.sourceType = 'upload';
    audioState.scenario = null;
    audioState.customAudioBlob = file;
    audioState.filename = file.name;
    audioState.duration = 10;

    if (selectedFileInfo) {
      selectedFileInfo.classList.remove('hidden');
      selectedFileInfo.innerHTML = `
        <span>📁 <strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)</span>
        <span class="file-ready-tag">READY FOR SCAN</span>
      `;
    }

    const metaLabel = document.getElementById('audio-meta-label');
    if (metaLabel) metaLabel.textContent = `Uploaded File: ${file.name}`;

    audioAnalyzer.drawSyntheticWaveform('clone');
    showToast(`Loaded audio file: ${file.name}`, 'info');
  }

  // Upload Language Selector
  document.querySelectorAll('#upload-lang-pills .pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#upload-lang-pills .pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      audioState.uploadLang = btn.dataset.lang;
    });
  });

  // Microphone Live Recording
  const btnToggleRec = document.getElementById('btn-toggle-rec');
  const recBtnText = document.getElementById('rec-btn-text');
  const recTimer = document.getElementById('rec-timer');
  const micPulseCircle = document.getElementById('mic-pulse-circle');
  const micInlineError = document.getElementById('mic-inline-error');
  let isRecording = false;
  let recInterval = null;
  let recSecs = 0;

  function checkMicProtocolNotice() {
    const isFile = window.location.protocol === 'file:';
    if (!micInlineError) return;

    if (isFile) {
      micInlineError.classList.remove('hidden');
      micInlineError.innerHTML = `
        <strong>⚠️ Browser Security Restriction (file:/// mode):</strong><br>
        Browsers block microphone hardware access when opening HTML files directly from disk.<br>
        To test live microphone capture, run a local web server:<br>
        <code>python -m http.server 5173</code> and open <strong>http://localhost:5173</strong>.<br>
        <em>(Tip: For zero-risk demo on stage, use the <strong>⚡ Hackathon Scenarios</strong> tab above!)</em>
      `;
    } else if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      micInlineError.classList.remove('hidden');
      micInlineError.innerHTML = `
        <strong>⚠️ Media Devices Not Supported:</strong> Your browser does not expose microphone APIs in this context.
      `;
    } else {
      micInlineError.classList.add('hidden');
    }
  }

  if (btnToggleRec) {
    btnToggleRec.addEventListener('click', () => {
      console.log('[VoiceShield] Microphone toggle clicked. Currently recording:', isRecording);
      if (!isRecording) {
        startRecording();
      } else {
        stopRecording();
      }
    });
  }

  async function startRecording() {
    console.log('[VoiceShield] startRecording triggered');
    const isFile = window.location.protocol === 'file:';

    if (isFile) {
      console.warn('[VoiceShield] Microphone cannot be accessed on file:/// protocol');
      if (micInlineError) {
        micInlineError.classList.remove('hidden');
        micInlineError.innerHTML = `
          <strong>⚠️ Browser Security Restriction (file:/// mode):</strong><br>
          Browsers restrict <code>getUserMedia</code> to Secure Contexts (<code>http://localhost</code> or <code>https://</code>).<br>
          To use your live mic, open terminal in project directory and run:<br>
          <code>python -m http.server 5173</code> then open <strong>http://localhost:5173</strong>.<br>
          <em>(Tip: For zero-risk demo on stage, use the <strong>⚡ Hackathon Scenarios</strong> tab above!)</em>
        `;
      }
      showToast('Mic blocked on file:///. Run via http://localhost:5173 or use Scenarios tab.', 'error');
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('[VoiceShield] navigator.mediaDevices.getUserMedia unavailable');
      if (micInlineError) {
        micInlineError.classList.remove('hidden');
        micInlineError.innerHTML = '⚠️ Microphone hardware access is not supported in this browser context.';
      }
      showToast('Microphone access is unavailable.', 'error');
      return;
    }

    try {
      console.log('[VoiceShield] Requesting microphone access via getUserMedia...');
      const success = await audioAnalyzer.startMicRecording(
        (secs) => {
          recSecs = secs;
          const mins = Math.floor(secs / 60);
          const s = secs % 60;
          if (recTimer) recTimer.textContent = `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        },
        (err) => {
          console.error('[VoiceShield] Mic access error callback:', err);
          isRecording = false;
          if (recBtnText) recBtnText.textContent = 'Start Recording';
          if (btnToggleRec) btnToggleRec.classList.remove('recording');
          if (micPulseCircle) micPulseCircle.classList.remove('pulsing');
          if (recInterval) clearInterval(recInterval);

          if (micInlineError) {
            micInlineError.classList.remove('hidden');
            micInlineError.innerHTML = `
              <strong>⚠️ Microphone Error (${err.name}):</strong> ${err.message || 'Permission denied or microphone unavailable.'}<br>
              Please allow microphone access in your browser address bar.
            `;
          }
          showToast(`Mic access denied: ${err.name}`, 'error');
        },
        audioState.micLang || 'hi-IN'
      );

      if (success) {
        isRecording = true;
        recSecs = 0;
        if (recBtnText) recBtnText.textContent = 'Stop Recording';
        if (btnToggleRec) btnToggleRec.classList.add('recording');
        if (micPulseCircle) micPulseCircle.classList.add('pulsing');
        if (micInlineError) micInlineError.classList.add('hidden');

        audioState.sourceType = 'mic';
        audioState.scenario = null;
        console.log('[VoiceShield] Microphone recording started successfully');
        showToast('Microphone recording started — Speak now...', 'info');
      }
    } catch (err) {
      console.error('[VoiceShield] Unexpected error in startRecording:', err);
      showToast('Failed to start microphone: ' + err.message, 'error');
    }
  }

  function stopRecording() {
    console.log('[VoiceShield] stopRecording triggered, recorded seconds:', recSecs);
    isRecording = false;
    if (recBtnText) recBtnText.textContent = 'Start Recording';
    if (btnToggleRec) btnToggleRec.classList.remove('recording');
    if (micPulseCircle) micPulseCircle.classList.remove('pulsing');
    if (recInterval) clearInterval(recInterval);

    audioAnalyzer.stopMicRecording((blob, transcript, lang) => {
      console.log('[VoiceShield] Mic recording finished, blob size:', blob ? blob.size : 0, 'transcript:', transcript);
      audioState.customAudioBlob = blob;
      audioState.transcriptText = transcript || '';
      audioState.duration = Math.max(3, recSecs);
      audioState.sourceType = 'mic';
      audioState.isRealAic = !!transcript;

      const metaLabel = document.getElementById('audio-meta-label');
      if (metaLabel) metaLabel.textContent = `Microphone Voice Capture (${recSecs}s) - Human Baseline`;

      showToast(`Captured ${recSecs}s voice recording! Ready to scan.`, 'success');
    });
  }

  // -----------------------------------------------------------------
  // Scan Execution: Transition Screen 1 -> Screen 2 -> Screen 3
  // -----------------------------------------------------------------
  if (btnAnalyze) {
    btnAnalyze.addEventListener('click', () => {
      console.log('[VoiceShield] btn-analyze clicked! State:', {
        sourceType: audioState.sourceType,
        hasScenario: !!audioState.scenario,
        hasBlob: !!audioState.customAudioBlob,
        consentChecked: privacyConsentChk ? privacyConsentChk.checked : false
      });

      // Check Privacy Consent
      if (privacyConsentChk && !privacyConsentChk.checked) {
        console.warn('[VoiceShield] Consent checkbox is unchecked');
        showToast('Please accept the privacy consent checkbox to proceed.', 'error');
        return;
      }

      // Check selected source
      if (audioState.sourceType === 'upload' && !audioState.customAudioBlob) {
        console.warn('[VoiceShield] Upload mode but no file selected');
        showToast('No audio file uploaded. Please browse a file or select a preset scenario.', 'error');
        return;
      }

      if (audioState.sourceType === 'mic' && !audioState.customAudioBlob && !audioState.duration) {
        console.warn('[VoiceShield] Mic mode but no recording captured');
        showToast('No voice recording captured yet. Click "Start Recording" or choose a scenario.', 'error');
        return;
      }

      // Ensure fallback scenario is assigned if scenario mode
      if (audioState.sourceType === 'scenario' && !audioState.scenario) {
        audioState.scenario = currentScenario || window.MOCK_SCENARIOS[0];
      }

      runForensicScan();
    });
  }

  if (btnQuickAutoDemo) {
    btnQuickAutoDemo.addEventListener('click', () => {
      console.log('[VoiceShield] Quick Auto Demo clicked');
      // Select High Risk Scenario 1 by default
      currentScenario = window.MOCK_SCENARIOS[0];
      audioState.sourceType = 'scenario';
      audioState.scenario = currentScenario;
      audioState.duration = currentScenario.duration;

      document.querySelectorAll('.preset-card').forEach((c, idx) => {
        if (idx === 0) c.classList.add('active');
        else c.classList.remove('active');
      });

      if (privacyConsentChk) privacyConsentChk.checked = true;
      showToast('⚡ Running 1-Click Hackathon Demo...', 'info');
      runForensicScan();
    });
  }

  async function runForensicScan() {
    if (isScanning) {
      console.warn('[VoiceShield] Scan already in progress, ignoring duplicate click');
      return;
    }
    isScanning = true;
    console.log('[VoiceShield] runForensicScan starting for sourceType:', audioState.sourceType);

    try {
      stopPlayback();
    } catch (e) {
      console.warn('[VoiceShield] Error in stopPlayback:', e);
    }

    // Immediately navigate to Screen 2 (Analysis)
    try {
      navigateToScreen('screen-analysis');
      console.log('[VoiceShield] Navigated to screen-analysis');
    } catch (navErr) {
      console.error('[VoiceShield] Failed to navigate to screen-analysis:', navErr);
    }

    try {
      // Reset Analysis Sub-Steps
      resetAnalysisSteps();

      // 1. Sub-step 1: Preprocessing
      await updateAnalysisStep(1, 20, 'Applying noise suppression & 16kHz normalization...', 350);

      // 2. Sub-step 2: Voice Characteristics
      await updateAnalysisStep(2, 45, 'Extracting Mel-spectrogram & fundamental pitch contour...', 350);

      // 3. Sub-step 3: Synthetic Voice Patterns (Wav2Vec2 + ASVspoof-style)
      await updateAnalysisStep(3, 70, 'Running Wav2Vec2 classifier & ASVspoof-style spectral checks...', 400);

      // Execute Voice AI Engine
      lastVoiceResult = await aiEngine.analyzeVoice({
        scenario: audioState.sourceType === 'scenario' ? audioState.scenario : null,
        audioBlob: audioState.customAudioBlob,
        filename: audioState.filename,
        isMic: audioState.sourceType === 'mic'
      });
      console.log('[VoiceShield] Voice AI result:', lastVoiceResult);

      // 4. Sub-step 4: Conversation Context (NLP intent)
      await updateAnalysisStep(4, 88, 'Parsing speech-to-text transcript semantics (Hindi/Marathi/English)...', 350);

      // Execute Scam Context Engine
      lastContextResult = scamContextEngine.analyzeContext({
        sourceType: audioState.sourceType,
        scenario: audioState.scenario,
        language: audioState.uploadLang,
        filename: audioState.filename
      });
      console.log('[VoiceShield] Scam Context result:', lastContextResult);

      // 5. Sub-step 5: Urgency & Payment Intent
      await updateAnalysisStep(5, 100, 'Computing composite multi-factor risk matrix...', 350);

      // Calculate Composite Risk
      const syntheticProb = lastVoiceResult.syntheticProbability;
      const scamContextScore = lastContextResult.scamContextScore;
      const paymentUrgencyScore = lastContextResult.paymentUrgencyScore;

      const riskCalc = scamContextEngine.calculateCompositeRisk(syntheticProb, scamContextScore, paymentUrgencyScore);
      lastCompositeScore = riskCalc.score;
      console.log('[VoiceShield] Composite risk score:', riskCalc);

      // Small delay to admire 100% completion before navigating to Screen 3
      await new Promise(r => setTimeout(r, 400));

      // Populate and navigate to Screen 3 (Risk Result)
      renderRiskResultScreen(lastVoiceResult, lastContextResult, riskCalc, audioState.scenario);
      navigateToScreen('screen-result');
      console.log('[VoiceShield] Navigated to screen-result successfully');
    } catch (scanErr) {
      console.error('[VoiceShield] Error during scan pipeline:', scanErr);
      showToast('Scan pipeline error: ' + scanErr.message, 'error');
    } finally {
      isScanning = false;
    }
  }

  function resetAnalysisSteps() {
    const barFill = document.getElementById('analysis-bar-fill');
    const percentEl = document.getElementById('analysis-percent');
    const labelEl = document.getElementById('analysis-step-label');

    if (barFill) barFill.style.width = '0%';
    if (percentEl) percentEl.textContent = '0%';
    if (labelEl) labelEl.textContent = 'Initializing forensic analysis...';

    for (let i = 1; i <= 5; i++) {
      const stepEl = document.getElementById(`analysis-substep-${i}`);
      if (stepEl) {
        stepEl.className = 'analysis-step-item';
        const icon = stepEl.querySelector('.step-status-icon');
        const badge = stepEl.querySelector('.step-badge-state');
        if (icon) icon.textContent = '⏳';
        if (badge) badge.textContent = 'Waiting';
      }
    }
  }

  async function updateAnalysisStep(stepNum, percent, labelText, delayMs) {
    const barFill = document.getElementById('analysis-bar-fill');
    const percentEl = document.getElementById('analysis-percent');
    const labelEl = document.getElementById('analysis-step-label');
    const stepEl = document.getElementById(`analysis-substep-${stepNum}`);

    if (barFill) barFill.style.width = `${percent}%`;
    if (percentEl) percentEl.textContent = `${percent}%`;
    if (labelEl) labelEl.textContent = labelText;

    if (stepEl) {
      stepEl.className = 'analysis-step-item active';
      const icon = stepEl.querySelector('.step-status-icon');
      const badge = stepEl.querySelector('.step-badge-state');
      if (icon) icon.textContent = '⚡';
      if (badge) badge.textContent = 'Running';
    }

    await new Promise(r => setTimeout(r, delayMs));

    if (stepEl) {
      stepEl.className = 'analysis-step-item completed';
      const icon = stepEl.querySelector('.step-status-icon');
      const badge = stepEl.querySelector('.step-badge-state');
      if (icon) icon.textContent = '✓';
      if (badge) badge.textContent = 'Done';
    }
  }

  // -----------------------------------------------------------------
  // Screen 3: Risk Result & Explainability (Priority 1)
  // -----------------------------------------------------------------
  function renderRiskResultScreen(voiceRes, contextRes, riskCalc, scenario) {
    const score = riskCalc.score;
    const isHigh = score >= 70;
    const isMed = score >= 35 && score < 70;

    // 1. Large Unmissable Risk Badge
    const badgeBanner = document.getElementById('result-risk-badge');
    const badgeIcon = document.getElementById('result-badge-icon');
    const badgeTitle = document.getElementById('result-badge-title');
    const badgeSub = document.getElementById('result-badge-sub');

    if (badgeBanner) {
      badgeBanner.className = `result-risk-badge-banner ${isHigh ? 'risk-high' : (isMed ? 'risk-medium' : 'risk-low')}`;
    }
    if (badgeIcon) {
      badgeIcon.textContent = isHigh ? '🚨' : (isMed ? '⚠️' : '✅');
    }
    if (badgeTitle) {
      badgeTitle.textContent = `${riskCalc.classification} ${score}/100`;
    }
    if (badgeSub) {
      badgeSub.textContent = isHigh
        ? 'Critical AI Voice Clone Extortion Threat Detected'
        : (isMed ? 'Suspicious Urgency & Potential Robocall Tactics Detected' : 'Authentic Biological Human Voice — Clean Baseline');
    }

    // 2. "Why was this flagged?" Section (Itemized Plain Language Reasons)
    const reasonsContainer = document.getElementById('result-reasons-list');
    if (reasonsContainer) {
      reasonsContainer.innerHTML = '';
      const reasons = contextRes.reasons || (scenario ? scenario.reasons : []);

      if (reasons && reasons.length > 0) {
        reasons.forEach(r => {
          const rCard = document.createElement('div');
          rCard.className = `reason-card ${r.level || 'warning'}`;
          rCard.innerHTML = `
            <span class="reason-icon">${r.icon || '⚠️'}</span>
            <div class="reason-content">
              <div class="reason-title">${r.title}</div>
              <div class="reason-detail">${r.detail}</div>
            </div>
          `;
          reasonsContainer.appendChild(rCard);
        });
      } else {
        reasonsContainer.innerHTML = `
          <div class="reason-card safe">
            <span class="reason-icon">✅</span>
            <div class="reason-content">
              <div class="reason-title">No Threat Signatures Detected</div>
              <div class="reason-detail">Voice acoustics exhibit natural human shimmer/jitter with zero urgent financial extortion cues.</div>
            </div>
          </div>
        `;
      }
    }

    // 3. 3-Factor Breakdown Grid (Voice Authenticity / Scam Context / Payment Urgency)
    // Factor 1: Voice Authenticity
    const scoreFactorVoice = document.getElementById('score-factor-voice');
    const concernFactorVoice = document.getElementById('concern-factor-voice');
    const descFactorVoice = document.getElementById('desc-factor-voice');

    const synthProb = voiceRes.syntheticProbability;
    if (scoreFactorVoice) scoreFactorVoice.textContent = `${synthProb}%`;
    if (concernFactorVoice) {
      const concern = voiceRes.concernLevel || (synthProb >= 75 ? 'Critical' : (synthProb >= 40 ? 'Moderate' : 'Low'));
      concernFactorVoice.textContent = concern;
      concernFactorVoice.className = `concern-pill pill-${concern.toLowerCase()}`;
    }
    if (descFactorVoice) {
      descFactorVoice.textContent = synthProb >= 70
        ? `High-frequency vocoder cutoff (${voiceRes.cutoffFrequency}) and unnatural pitch flatness (${voiceRes.pitchContourFlatness}).`
        : `Organic biological vocal tract resonance (${voiceRes.cutoffFrequency}) with natural emotional cadence.`;
    }

    // Factor 2: Scam Context
    const scoreFactorContext = document.getElementById('score-factor-context');
    const concernFactorContext = document.getElementById('concern-factor-context');
    const descFactorContext = document.getElementById('desc-factor-context');

    const scamScore = contextRes.scamContextScore;
    if (scoreFactorContext) scoreFactorContext.textContent = `${scamScore}%`;
    if (concernFactorContext) {
      const concern = contextRes.scamContextConcern || 'Moderate';
      concernFactorContext.textContent = concern;
      concernFactorContext.className = `concern-pill pill-${concern.toLowerCase()}`;
    }
    if (descFactorContext) {
      descFactorContext.textContent = `${contextRes.impersonationTarget} combined with ${contextRes.urgencyLevel} pressure tactics.`;
    }

    // Factor 3: Payment Urgency
    const scoreFactorPayment = document.getElementById('score-factor-payment');
    const concernFactorPayment = document.getElementById('concern-factor-payment');
    const descFactorPayment = document.getElementById('desc-factor-payment');

    const paymentScore = contextRes.paymentUrgencyScore;
    if (scoreFactorPayment) scoreFactorPayment.textContent = `${paymentScore}%`;
    if (concernFactorPayment) {
      const concern = contextRes.paymentUrgencyConcern || 'Moderate';
      concernFactorPayment.textContent = concern;
      concernFactorPayment.className = `concern-pill pill-${concern.toLowerCase()}`;
    }
    if (descFactorPayment) {
      descFactorPayment.textContent = paymentScore >= 50
        ? `Direct financial demand (${contextRes.financialDemand}) paired with secrecy coercion.`
        : 'Zero extortion demands or immediate UPI transfer requests identified.';
    }

    // 4. Recommended Action Box
    updateRecommendedActionText(score, currentLanguage);

    // 5. Multilingual Alert & Warning Copy
    updateMultilingualAlertCopy(scenario, currentLanguage, score);

    // 6. Transcript Preview
    const transcriptBody = document.getElementById('transcript-body');
    const transcriptLang = document.getElementById('transcript-lang');
    if (transcriptBody) {
      transcriptBody.innerHTML = contextRes.transcriptHtml || contextRes.rawTranscript;
    }
    if (transcriptLang) {
      transcriptLang.textContent = contextRes.languageLabel || 'HINDI / HINGLISH';
    }

    // 7. Configure Primary Verification CTA
    const btnGoVerify = document.getElementById('btn-go-verify');
    if (btnGoVerify) {
      if (score >= 35) {
        btnGoVerify.style.display = 'flex';
      } else {
        btnGoVerify.style.display = 'none';
      }
    }
  }

  function updateRecommendedActionText(score, lang) {
    const actionTextEl = document.getElementById('result-action-text');
    if (!actionTextEl) return;
    actionTextEl.textContent = multilingualEngine.getRecommendedAction(score, lang);
  }

  function updateMultilingualAlertCopy(scenario, lang, score) {
    const headlineEl = document.getElementById('warning-headline');
    const messageEl = document.getElementById('warning-message');
    const currentTtsLang = document.getElementById('current-tts-lang');

    const warning = multilingualEngine.getWarning(scenario, lang, score);
    if (headlineEl) headlineEl.textContent = warning.headline;
    if (messageEl) messageEl.textContent = warning.message;

    const langNames = { en: 'English', hi: 'हिंदी', mr: 'मराठी' };
    if (currentTtsLang) currentTtsLang.textContent = langNames[lang] || 'English';
  }

  // Multilingual Switcher Pills on Screen 3 (Priority 4)
  document.querySelectorAll('#result-lang-pills .pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#result-lang-pills .pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentLanguage = btn.dataset.lang;
      multilingualEngine.setLanguage(currentLanguage);

      updateRecommendedActionText(lastCompositeScore, currentLanguage);
      updateMultilingualAlertCopy(audioState.scenario, currentLanguage, lastCompositeScore);
    });
  });

  // Non-blocking TTS Audio Trigger (Priority 4)
  const btnSpeakWarning = document.getElementById('btn-speak-warning');
  const ttsLiveBubble = document.getElementById('tts-live-bubble');

  if (btnSpeakWarning) {
    btnSpeakWarning.addEventListener('click', () => {
      if (ttsLiveBubble) ttsLiveBubble.classList.remove('hidden');

      multilingualEngine.speakWarning(
        audioState.scenario,
        currentLanguage,
        lastCompositeScore,
        () => {
          // On speech start
          if (btnSpeakWarning) btnSpeakWarning.disabled = true;
        },
        (success) => {
          // On speech complete or error fallback
          if (ttsLiveBubble) ttsLiveBubble.classList.add('hidden');
          if (btnSpeakWarning) btnSpeakWarning.disabled = false;
          if (!success) {
            showToast('Note: Indic TTS voice unavailable on this browser. Displayed text alert above is active.', 'info');
          }
        }
      );
    });
  }

  // Human-in-the-Loop Decision Buttons on Screen 3
  const btnGoVerify = document.getElementById('btn-go-verify');
  const btnDismissResult = document.getElementById('btn-dismiss-result');
  const btnReportResult = document.getElementById('btn-report-result');
  const btnRescan = document.getElementById('btn-rescan');

  if (btnGoVerify) {
    btnGoVerify.addEventListener('click', () => {
      // Transition to Screen 4 (Trusted Contact Verification)
      contactVerifier.initVerification(audioState.scenario, {
        score: lastCompositeScore,
        level: lastCompositeScore >= 70 ? 'HIGH' : 'MEDIUM',
        reasons: lastContextResult ? lastContextResult.reasons : []
      });
      navigateToScreen('screen-verification');
    });
  }

  if (btnDismissResult) {
    btnDismissResult.addEventListener('click', () => {
      showToast('Call dismissed as safe by user decision.', 'info');
      navigateToScreen('screen-home');
    });
  }

  if (btnReportResult) {
    btnReportResult.addEventListener('click', () => {
      openReportModal();
    });
  }

  if (btnRescan) {
    btnRescan.addEventListener('click', () => {
      navigateToScreen('screen-home');
    });
  }

  // -----------------------------------------------------------------
  // Screen 4: Trusted Contact Verification Controls (Priority 2)
  // -----------------------------------------------------------------
  const btnSimGenuine = document.getElementById('btn-sim-genuine');
  const btnSimScam = document.getElementById('btn-sim-scam');
  const btnCallContactDirect = document.getElementById('btn-call-contact-direct');
  const btnCancelVerification = document.getElementById('btn-cancel-verification');
  const btnVerificationToHome = document.getElementById('btn-verification-to-home');
  const btnSwitchContact = document.getElementById('btn-switch-contact');

  if (btnSimGenuine) {
    btnSimGenuine.addEventListener('click', () => {
      contactVerifier.handleSimulatedResponse('genuine');
    });
  }

  if (btnSimScam) {
    btnSimScam.addEventListener('click', () => {
      contactVerifier.handleSimulatedResponse('scam');
    });
  }

  if (btnCallContactDirect) {
    btnCallContactDirect.addEventListener('click', () => {
      const contact = window.FamilyCircle.getPrimaryContact();
      showToast(`Initiating direct cellular call to ${contact.name} (${contact.phone})...`, 'info');
    });
  }

  if (btnCancelVerification) {
    btnCancelVerification.addEventListener('click', () => {
      contactVerifier.cancelRequest();
      showToast('Verification challenge cancelled by user.', 'info');
    });
  }

  if (btnVerificationToHome) {
    btnVerificationToHome.addEventListener('click', () => {
      navigateToScreen('screen-home');
    });
  }

  if (btnSwitchContact) {
    btnSwitchContact.addEventListener('click', () => {
      openFamilyCircleModal();
    });
  }

  // -----------------------------------------------------------------
  // Family Circle Management (Priority 3)
  // -----------------------------------------------------------------
  const familyModal = document.getElementById('family-circle-modal');
  const btnOpenFamilyCircle = document.getElementById('btn-open-family-circle');
  const btnCloseFamilyModal = document.getElementById('btn-close-family-modal');
  const btnDoneContacts = document.getElementById('btn-done-contacts');
  const btnResetContacts = document.getElementById('btn-reset-contacts');
  const familyContactsList = document.getElementById('family-contacts-list');
  const btnSaveContact = document.getElementById('btn-save-contact');
  const topFamilyCount = document.getElementById('top-family-count');

  if (btnOpenFamilyCircle) {
    btnOpenFamilyCircle.addEventListener('click', () => openFamilyCircleModal());
  }
  if (btnCloseFamilyModal) {
    btnCloseFamilyModal.addEventListener('click', () => closeFamilyCircleModal());
  }
  if (btnDoneContacts) {
    btnDoneContacts.addEventListener('click', () => closeFamilyCircleModal());
  }
  if (btnResetContacts) {
    btnResetContacts.addEventListener('click', () => {
      window.FamilyCircle.resetToDefaults();
      renderFamilyContactsList();
      showToast('Family Circle reset to default sample contacts', 'info');
    });
  }

  function openFamilyCircleModal() {
    renderFamilyContactsList();
    if (familyModal) familyModal.classList.remove('hidden');
  }

  function closeFamilyCircleModal() {
    if (familyModal) familyModal.classList.add('hidden');
  }

  function renderFamilyContactsList() {
    if (!familyContactsList) return;
    const contacts = window.FamilyCircle.getContacts();

    if (topFamilyCount) {
      topFamilyCount.textContent = contacts.length;
    }

    familyContactsList.innerHTML = '';
    contacts.forEach(c => {
      const row = document.createElement('div');
      row.className = `family-contact-item ${c.isPrimary ? 'is-primary' : ''}`;
      row.innerHTML = `
        <div class="contact-left">
          <span class="contact-avatar-icon">${c.avatar || '🛡️'}</span>
          <div class="contact-details">
            <div class="contact-name-row">
              <span class="contact-name-text">${c.name}</span>
              ${c.isPrimary ? '<span class="primary-badge">PRIMARY</span>' : ''}
            </div>
            <div class="contact-phone-sub">${c.relation} &bull; ${c.phone}</div>
          </div>
        </div>
        <div class="contact-actions">
          ${!c.isPrimary ? `<button class="btn-make-primary" data-id="${c.id}">Set Primary</button>` : ''}
          ${contacts.length > 1 ? `<button class="btn-del-contact" data-id="${c.id}">✕</button>` : ''}
        </div>
      `;

      // Set Primary Handler
      const makePrimaryBtn = row.querySelector('.btn-make-primary');
      if (makePrimaryBtn) {
        makePrimaryBtn.addEventListener('click', () => {
          window.FamilyCircle.setPrimary(c.id);
          renderFamilyContactsList();
          // Update Screen 4 if open
          if (screens['screen-verification'] && screens['screen-verification'].classList.contains('active')) {
            contactVerifier.initVerification(audioState.scenario, {
              score: lastCompositeScore,
              level: lastCompositeScore >= 70 ? 'HIGH' : 'MEDIUM'
            });
          }
          showToast(`${c.name} set as primary contact for verification`, 'success');
        });
      }

      // Delete Handler
      const delBtn = row.querySelector('.btn-del-contact');
      if (delBtn) {
        delBtn.addEventListener('click', () => {
          window.FamilyCircle.deleteContact(c.id);
          renderFamilyContactsList();
          showToast(`Deleted ${c.name} from Family Circle`, 'info');
        });
      }

      familyContactsList.appendChild(row);
    });
  }

  // Add Contact
  if (btnSaveContact) {
    btnSaveContact.addEventListener('click', () => {
      const nameInput = document.getElementById('add-contact-name');
      const relationInput = document.getElementById('add-contact-relation');
      const phoneInput = document.getElementById('add-contact-phone');

      const name = (nameInput && nameInput.value) ? nameInput.value.trim() : '';
      const relation = (relationInput && relationInput.value) ? relationInput.value.trim() : 'Family';
      const phone = (phoneInput && phoneInput.value) ? phoneInput.value.trim() : '';

      if (!name || !phone) {
        showToast('Please enter both name and phone number.', 'error');
        return;
      }

      window.FamilyCircle.addContact(name, relation, phone);
      if (nameInput) nameInput.value = '';
      if (phoneInput) phoneInput.value = '';

      renderFamilyContactsList();
      showToast(`Added ${name} (${relation}) to Family Circle!`, 'success');
    });
  }

  // Update top count initially
  if (topFamilyCount && window.FamilyCircle) {
    topFamilyCount.textContent = window.FamilyCircle.getContacts().length;
  }

  // -----------------------------------------------------------------
  // Report Modal (1930 / Chakshu Incident Dossier)
  // -----------------------------------------------------------------
  const reportModal = document.getElementById('report-modal');
  const btnCloseReportModal = document.getElementById('btn-close-report-modal');
  const btnCloseReportBtn = document.getElementById('btn-close-report-btn');
  const reportFormPreview = document.getElementById('report-form-preview');

  if (btnCloseReportModal) {
    btnCloseReportModal.addEventListener('click', () => closeReportModal());
  }
  if (btnCloseReportBtn) {
    btnCloseReportBtn.addEventListener('click', () => closeReportModal());
  }

  function openReportModal() {
    if (!reportFormPreview) return;
    const now = new Date().toLocaleString('en-IN');
    const sc = audioState.scenario;

    reportFormPreview.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px;font-size:12.5px;">
        <div><strong>Incident Timestamp:</strong> ${now}</div>
        <div><strong>Assessed Risk Level:</strong> <span class="text-red">${lastCompositeScore}/100 (HIGH RISK)</span></div>
        <div><strong>Incident Type:</strong> Section 66D IT Act (Cheating by Personation Using Voice Clone)</div>
        <div><strong>Extortion Demand:</strong> ${sc ? sc.contextThreat.financialDemand : '₹50,000 via UPI'}</div>
        <div><strong>Primary Contact:</strong> ${window.FamilyCircle.getPrimaryContact().name} (${window.FamilyCircle.getPrimaryContact().phone})</div>
        <div><strong>Helpline Reference:</strong> National Cybercrime Reporting Portal &bull; Toll-Free 1930</div>
        <div><strong>DoT Chakshu:</strong> Pre-packaged telecom fraud dossier with SHA-256 acoustic hash</div>
      </div>
    `;

    if (reportModal) reportModal.classList.remove('hidden');
  }

  function closeReportModal() {
    if (reportModal) reportModal.classList.add('hidden');
  }

  // -----------------------------------------------------------------
  // Toast Helper
  // -----------------------------------------------------------------
  function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-pill ${type}`;
    toast.textContent = msg;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // -----------------------------------------------------------------
  // Initialization
  // -----------------------------------------------------------------
  try {
    renderPresets();
    if (audioAnalyzer) {
      if (typeof audioAnalyzer.initVisualizer === 'function') audioAnalyzer.initVisualizer();
      else if (typeof audioAnalyzer.drawIdleWaveform === 'function') audioAnalyzer.drawIdleWaveform();
    }
    // Start on Screen 1 (Home)
    navigateToScreen('screen-home');
    checkMicProtocolNotice();
    console.log('[VoiceShield] Application initialized successfully on screen-home');
  } catch (err) {
    console.error('[VoiceShield] Initialization error:', err);
  }
});
