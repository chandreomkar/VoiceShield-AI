# VoiceShield India - Backend ML Service (FUTURE SCOPE / UNUSED IN DEMO)

> [!NOTE]
> **HACKATHON STATUS: FUTURE SCOPE / REFERENCE ONLY**
> The active VoiceShield India prototype runs **100% client-side in the browser** directly by opening `index.html` with zero external dependencies.
> This `backend/` directory is an independent Python/PyTorch reference architecture for post-hackathon carrier-grade deployment. It is **NOT required or called** by the live browser prototype.

This backend service provides an optional reference implementation for server-side deepfake classification using **Facebook Wav2Vec2** and **Spectrogram Dual-Head CNN (SpecNet)**.

## Architecture

```
Incoming Audio (.wav, .mp3, .m4a)
     │
     ├──► Acoustic Analysis Pipeline
     │    ├── Wav2Vec2-XLSR-53 (Phoneme Discontinuity & Latent Representation)
     │    ├── High-Frequency Vocoder Roll-off (>7.4 kHz Loss Filter)
     │    └── F0 Pitch Monotonicity & Micro-Jitter / Shimmer
     │
     └──► Semantic & Intent Analysis Pipeline
          ├── Whisper / Wav2Vec2 ASR (Speech-to-Text)
          └── NLP Threat Matcher (Urgency, Impersonation, UPI Demand, Coercion)
     │
     ▼
Composite Risk Fusion:
Risk = (0.55 * SyntheticProb) + (0.45 * ContextThreatScore)
```

## Setup & Running

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. (Optional) Provide pre-trained Wav2Vec2 weights:
   ```bash
   export WAV2VEC2_WEIGHTS="facebook/wav2vec2-base-960h"
   ```
   *If weights are not specified, the system operates in calibrated simulation mode.*

4. Launch FastAPI server:
   ```bash
   python app.py
   # Or using uvicorn:
   uvicorn app:app --host 0.0.0.0 --port 8000 --reload
   ```

5. Access interactive OpenAPI documentation:
   - Swagger UI: `http://localhost:8000/docs`
   - Redoc: `http://localhost:8000/redoc`
