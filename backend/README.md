# VoiceShield India - Backend ML Service

This backend service implements real-time audio deepfake classification using **Facebook Wav2Vec2** and **Spectrogram Dual-Head CNN (SpecNet)** paired with **NLP Context Threat Parsing**.

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
