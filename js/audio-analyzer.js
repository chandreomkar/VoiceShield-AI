// VoiceShield India - Web Audio API Analyzer & Synthesizer
// Handles real-time canvas waveform visualization, custom audio playback, and microphone recording

class AudioAnalyzer {
  constructor() {
    this.canvas = document.getElementById('waveform-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.audioContext = null;
    this.analyser = null;
    this.mediaStream = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isPlaying = false;
    this.isRecording = false;
    this.currentSource = null;
    this.currentAudioElement = null;
    this.animationFrameId = null;
    this.playbackTimer = null;
    this.currentTime = 0;
    this.duration = 8;

    this.initCanvas();
    this.drawIdleWaveform();
  }

  getAudioContext() {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  initCanvas() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    if (this.ctx) this.ctx.scale(dpr, dpr);
  }

  initVisualizer() {
    this.initCanvas();
    this.drawIdleWaveform();
  }

  drawSyntheticWaveform(type = 'clone') {
    this.drawIdleWaveform();
  }

  stopOscillatorSimulation() {
    this.stopAudio();
  }

  startOscillatorSimulation(isSynthetic = true) {
    this.playScenarioAudio({ duration: this.duration || 8, riskScore: isSynthetic ? 90 : 15 });
  }

  startMicAnalysis(onTick, onError, lang) {
    return this.startMicRecording(onTick, onError, lang);
  }

  stopMicAnalysis(onComplete) {
    this.stopMicRecording(onComplete);
  }

  // Draw cyber-themed idle wave pattern
  drawIdleWaveform() {
    if (!this.ctx || !this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    this.ctx.clearRect(0, 0, width, height);

    // Baseline
    this.ctx.strokeStyle = 'rgba(30, 45, 74, 0.7)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, height / 2);
    this.ctx.lineTo(width, height / 2);
    this.ctx.stroke();

    // Idle sine pulse
    const time = Date.now() * 0.002;
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    this.ctx.lineWidth = 1.5;

    for (let x = 0; x < width; x += 3) {
      const y = height / 2 + Math.sin(x * 0.03 + time) * 6 * Math.sin(x / width * Math.PI);
      if (x === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();
  }

  // Real-time animation loop when audio/mic is active
  startVisualizer(analyserNode) {
    if (!this.ctx || !analyserNode) return;
    analyserNode.fftSize = 256;
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      this.animationFrameId = requestAnimationFrame(render);
      analyserNode.getByteFrequencyData(dataArray);

      const rect = this.canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      this.ctx.fillStyle = 'rgba(9, 14, 26, 0.3)';
      this.ctx.fillRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (height * 0.85);

        const gradient = this.ctx.createLinearGradient(0, height - barHeight, 0, height);
        if (i < bufferLength * 0.4) {
          gradient.addColorStop(0, '#00f0ff');
          gradient.addColorStop(1, 'rgba(0, 240, 255, 0.1)');
        } else if (i < bufferLength * 0.75) {
          gradient.addColorStop(0, '#a855f7');
          gradient.addColorStop(1, 'rgba(168, 85, 247, 0.1)');
        } else {
          gradient.addColorStop(0, '#ff2d55');
          gradient.addColorStop(1, 'rgba(255, 45, 85, 0.1)');
        }

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    };

    render();
  }

  stopVisualizer() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.drawIdleWaveform();
  }

  // Read actual duration of an uploaded audio file
  async getAudioDuration(blob) {
    return new Promise((resolve) => {
      try {
        const audio = new Audio();
        audio.preload = 'metadata';
        audio.src = URL.createObjectURL(blob);
        audio.onloadedmetadata = () => {
          const duration = audio.duration;
          URL.revokeObjectURL(audio.src);
          resolve(isFinite(duration) && duration > 0 ? duration : 8);
        };
        audio.onerror = () => {
          resolve(8);
        };
      } catch (e) {
        resolve(8);
      }
    });
  }

  // Play an uploaded audio file (Blob / File) without needing microphone
  playAudioBlob(blob, onTimeUpdate, onEnded) {
    this.stopAudio();
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    this.analyser = ctx.createAnalyser();

    const audioEl = new Audio();
    const blobUrl = URL.createObjectURL(blob);
    audioEl.src = blobUrl;
    audioEl.crossOrigin = 'anonymous';
    this.currentAudioElement = audioEl;
    this.currentBlobUrl = blobUrl;

    // Connect audio element to Web Audio analyser for real-time visualization
    try {
      const source = ctx.createMediaElementSource(audioEl);
      source.connect(this.analyser);
      this.analyser.connect(ctx.destination);
    } catch (e) {
      // If already connected or cross-origin restriction, direct playback still functions
      console.log('MediaElementSource note:', e.message);
    }

    audioEl.onloadedmetadata = () => {
      this.duration = isFinite(audioEl.duration) && audioEl.duration > 0 ? audioEl.duration : 8;
      if (onTimeUpdate) onTimeUpdate(0, this.duration);
    };

    audioEl.ontimeupdate = () => {
      this.currentTime = audioEl.currentTime;
      if (onTimeUpdate) {
        onTimeUpdate(this.currentTime, this.duration || audioEl.duration || 8);
      }
    };

    audioEl.onended = () => {
      this.stopAudio();
      if (onEnded) onEnded();
    };

    audioEl.play().then(() => {
      this.isPlaying = true;
      this.startVisualizer(this.analyser);
    }).catch(err => {
      console.warn("Direct play failed, falling back to simulated synthesized playback:", err);
      this.playScenarioAudio({ duration: 8, riskScore: 85 }, onTimeUpdate, onEnded);
    });

    this.currentSource = {
      stop: () => {
        try {
          audioEl.pause();
          audioEl.currentTime = 0;
        } catch (e) {}
      }
    };
  }

  // Play synthetic tone modulation for preset scenarios
  playScenarioAudio(scenario, onTimeUpdate, onEnded) {
    this.stopAudio();
    const ctx = this.getAudioContext();
    this.duration = (scenario && scenario.duration) ? scenario.duration : 8;
    this.currentTime = 0;

    this.analyser = ctx.createAnalyser();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.3, ctx.currentTime);

    const isSynthetic = (scenario && scenario.riskScore) ? scenario.riskScore > 70 : true;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const noise = ctx.createBufferSource();
    
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * (isSynthetic ? 0.015 : 0.005);
    }
    noise.buffer = noiseBuffer;
    noise.loop = true;

    if (isSynthetic) {
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(190, ctx.currentTime);
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(240, ctx.currentTime);
    } else {
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(220, ctx.currentTime);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(440, ctx.currentTime);
    }

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isSynthetic ? 7400 : 14000, ctx.currentTime);

    const modGain = ctx.createGain();
    modGain.gain.setValueAtTime(0.2, ctx.currentTime);

    osc1.connect(modGain);
    osc2.connect(modGain);
    noise.connect(modGain);
    modGain.connect(filter);
    filter.connect(this.analyser);
    this.analyser.connect(masterGain);
    masterGain.connect(ctx.destination);

    const startTime = ctx.currentTime;
    osc1.start(startTime);
    osc2.start(startTime);
    noise.start(startTime);

    this.isPlaying = true;
    this.startVisualizer(this.analyser);

    this.playbackTimer = setInterval(() => {
      this.currentTime += 0.1;
      if (onTimeUpdate) {
        onTimeUpdate(this.currentTime, this.duration);
      }

      if (this.currentTime >= this.duration) {
        this.stopAudio();
        if (onEnded) onEnded();
      }
    }, 100);

    this.currentSource = {
      stop: () => {
        try {
          osc1.stop();
          osc2.stop();
          noise.stop();
        } catch (e) {}
      }
    };
  }

  stopAudio() {
    this.isPlaying = false;
    if (this.playbackTimer) {
      clearInterval(this.playbackTimer);
      this.playbackTimer = null;
    }
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch (e) {}
      this.currentAudioElement = null;
    }
    if (this.currentBlobUrl) {
      try {
        URL.revokeObjectURL(this.currentBlobUrl);
      } catch (e) {}
      this.currentBlobUrl = null;
    }
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (e) {}
      this.currentSource = null;
    }
    this.stopVisualizer();
  }

  // Handle Microphone Recording (Requested ONLY upon user click)
  async startMicRecording(onTick, onError, lang = 'hi-IN', onSpeech = null) {
    try {
      this.currentMicLang = lang || 'hi-IN';
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaStream = stream;
      const ctx = this.getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const micSource = ctx.createMediaStreamSource(stream);
      this.analyser = ctx.createAnalyser();
      micSource.connect(this.analyser);

      this.audioChunks = [];
      const mimeOptions = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4'
      ];
      let selectedMime = '';
      for (const m of mimeOptions) {
        if (typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      this.mediaRecorder = selectedMime ? new MediaRecorder(stream, { mimeType: selectedMime }) : new MediaRecorder(stream);
      this.recordedMimeType = selectedMime || 'audio/webm';

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) this.audioChunks.push(e.data);
      };

      this.mediaRecorder.start(250);
      this.isRecording = true;
      this.startVisualizer(this.analyser);

      // Start live speech-to-text recognition if supported by browser
      this.liveSpeechText = '';
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          this.speechRecognizer = new SpeechRecognition();
          this.speechRecognizer.continuous = true;
          this.speechRecognizer.interimResults = true;
          this.speechRecognizer.lang = this.currentMicLang;
          this.speechRecognizer.onresult = (event) => {
            let fullText = '';
            for (let i = 0; i < event.results.length; i++) {
              fullText += event.results[i][0].transcript + ' ';
            }
            this.liveSpeechText = fullText.trim();
            if (onSpeech) onSpeech(this.liveSpeechText);
          };
          this.speechRecognizer.start();
        } catch (e) {
          console.log('Speech recognition note:', e.message);
        }
      }

      let seconds = 0;
      this.recInterval = setInterval(() => {
        seconds++;
        if (onTick) onTick(seconds);
      }, 1000);

      return true;
    } catch (err) {
      console.warn('Microphone access not granted or unavailable:', err);
      if (onError) onError(err);
      return false;
    }
  }

  stopMicRecording(onComplete) {
    this.isRecording = false;
    if (this.recInterval) {
      clearInterval(this.recInterval);
      this.recInterval = null;
    }
    if (this.speechRecognizer) {
      try { this.speechRecognizer.stop(); } catch (e) {}
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.onstop = () => {
        const mime = this.recordedMimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mime });
        if (onComplete) onComplete(audioBlob, this.liveSpeechText, this.currentMicLang || 'hi-IN');
      };
      this.mediaRecorder.stop();
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.stopVisualizer();
  }
}

window.AudioAnalyzer = AudioAnalyzer;
