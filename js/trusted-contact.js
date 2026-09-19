// VoiceShield India - Trusted Contact Challenge-Back Verification Engine
// Implements out-of-band secondary verification without asking caller personal questions

class TrustedContactVerifier {
  constructor(options = {}) {
    this.onStateChange = options.onStateChange || null;
    this.currentState = 'IDLE'; // IDLE | PENDING | CONFIRMED_GENUINE | FLAGGED_SCAM | CANCELLED
    this.activeScenario = null;
    this.activeRisk = null;
    this.activeContact = null;

    // Auto-sync with Family Circle updates
    if (typeof window !== 'undefined') {
      window.addEventListener('voiceshield:contacts-updated', () => {
        if (window.FamilyCircle) {
          this.activeContact = window.FamilyCircle.getPrimaryContact();
          if (this.currentState !== 'IDLE' && document.getElementById('screen-verification') && document.getElementById('screen-verification').classList.contains('active')) {
            this.renderScreen();
          }
        }
      });
    }
  }

  initVerification(scenario, riskData) {
    this.activeScenario = scenario || window.MOCK_SCENARIOS[0];
    this.activeRisk = riskData || {
      score: this.activeScenario.riskScore || 94,
      level: this.activeScenario.riskLevel || 'HIGH',
      reasons: this.activeScenario.reasons || []
    };
    
    // Dynamically pull primary contact from Family Circle
    if (window.FamilyCircle) {
      this.activeContact = window.FamilyCircle.getPrimaryContact();
    } else {
      this.activeContact = {
        name: "Rahul Sharma",
        relation: "Son",
        phone: "+91 98765 43210",
        avatar: "👨‍🎓"
      };
    }

    this.currentState = 'PENDING';
    this.renderScreen();
  }

  renderScreen() {
    const contact = this.activeContact;
    const scenario = this.activeScenario;
    const risk = this.activeRisk;

    // Contact Card details
    const nameEl = document.getElementById('tc-contact-name');
    const relationEl = document.getElementById('tc-contact-relation');
    const phoneEl = document.getElementById('tc-contact-phone');
    const avatarEl = document.getElementById('tc-contact-avatar');

    if (nameEl) nameEl.textContent = contact.name;
    if (relationEl) relationEl.textContent = contact.relation + " (Primary Trusted Contact)";
    if (phoneEl) phoneEl.textContent = contact.phone;
    if (avatarEl) avatarEl.textContent = contact.avatar || '🛡️';

    // Request Details
    const reasonEl = document.getElementById('tc-request-reason');
    const riskLevelEl = document.getElementById('tc-request-risk');
    const langEl = document.getElementById('tc-request-lang');
    const actionEl = document.getElementById('tc-request-action');

    const mainReason = (risk.reasons && risk.reasons.length > 0)
      ? risk.reasons[0].title
      : (scenario.snippet || "Suspicious urgency & financial demand detected");

    if (reasonEl) reasonEl.textContent = mainReason;
    if (riskLevelEl) {
      riskLevelEl.textContent = `${risk.level || 'HIGH'} RISK (${risk.score || 94}/100)`;
      riskLevelEl.className = `tc-detail-val ${risk.score >= 70 ? 'text-red' : (risk.score >= 35 ? 'text-amber' : 'text-emerald')}`;
    }
    if (langEl) langEl.textContent = scenario.languageLabel || 'Hindi / Hinglish';
    if (actionEl) actionEl.textContent = "Out-of-band secondary verification (SMS/WhatsApp)";

    // Simulated Handset message text
    const phoneMsgEl = document.getElementById('tc-simulated-msg-text');
    if (phoneMsgEl) {
      phoneMsgEl.innerHTML = `
        <strong>🛡️ VoiceShield Emergency Verification Alert</strong><br>
        Dad's phone received a high-urgency voice note claiming you are in an emergency/accident and demanding ₹50,000 via UPI.<br>
        <span style="color:#f59e0b;font-size:11.5px;display:inline-block;margin-top:4px;">
          ⚠️ Did you make this call or request money?
        </span>
      `;
    }

    // Update status badge according to state
    this.updateStatusBadge();
  }

  updateStatusBadge() {
    const badgeEl = document.getElementById('tc-status-badge');
    const alertBoxEl = document.getElementById('tc-status-alert-box');
    const simulationBox = document.getElementById('tc-simulation-box');

    if (!badgeEl) return;

    if (this.currentState === 'PENDING') {
      badgeEl.className = 'tc-status-badge pending';
      badgeEl.innerHTML = `
        <span class="pulse-dot amber"></span>
        <span>ACTION / PAYMENT PAUSED PENDING VERIFICATION</span>
      `;
      if (alertBoxEl) {
        alertBoxEl.className = 'tc-status-alert-box alert-pending';
        alertBoxEl.innerHTML = `
          <div class="alert-icon">⏸️</div>
          <div class="alert-text">
            <strong>Payment & Action on Hold:</strong> VoiceShield advises pausing all UPI transfers and credential disclosures until ${this.activeContact.name} responds through this isolated secondary channel.
          </div>
        `;
      }
      if (simulationBox) simulationBox.classList.remove('resolved');
    } else if (this.currentState === 'CONFIRMED_GENUINE') {
      badgeEl.className = 'tc-status-badge genuine';
      badgeEl.innerHTML = `
        <span class="pulse-dot green"></span>
        <span>VERIFIED GENUINE BY TRUSTED CONTACT</span>
      `;
      if (alertBoxEl) {
        alertBoxEl.className = 'tc-status-alert-box alert-genuine';
        alertBoxEl.innerHTML = `
          <div class="alert-icon">✅</div>
          <div class="alert-text">
            <strong>Call Confirmed Genuine:</strong> ${this.activeContact.name} (${this.activeContact.relation}) confirmed this situation is real. You may proceed with caution.
          </div>
        `;
      }
      if (simulationBox) simulationBox.classList.add('resolved');
    } else if (this.currentState === 'FLAGGED_SCAM') {
      badgeEl.className = 'tc-status-badge scam';
      badgeEl.innerHTML = `
        <span class="pulse-dot red"></span>
        <span>🚨 SCAM CONFIRMED BY TRUSTED CONTACT — DO NOT SEND MONEY</span>
      `;
      if (alertBoxEl) {
        alertBoxEl.className = 'tc-status-alert-box alert-scam';
        alertBoxEl.innerHTML = `
          <div class="alert-icon">🚫</div>
          <div class="alert-text">
            <strong>Extortion Attempt Prevented!</strong> ${this.activeContact.name} (${this.activeContact.relation}) confirmed they are safe and did NOT make this call. VoiceShield successfully blocked ₹50,000 financial loss.
          </div>
        `;
      }
      if (simulationBox) simulationBox.classList.add('resolved');
    } else if (this.currentState === 'CANCELLED') {
      badgeEl.className = 'tc-status-badge cancelled';
      badgeEl.innerHTML = `
        <span>VERIFICATION REQUEST CANCELLED</span>
      `;
      if (alertBoxEl) {
        alertBoxEl.className = 'tc-status-alert-box alert-cancelled';
        alertBoxEl.innerHTML = `
          <div class="alert-icon">ℹ️</div>
          <div class="alert-text">
            <strong>Request Cancelled:</strong> You cancelled the secondary challenge. Always verify unfamiliar callers independently.
          </div>
        `;
      }
    }

    if (this.onStateChange) {
      this.onStateChange(this.currentState);
    }
  }

  handleSimulatedResponse(action) {
    if (action === 'genuine') {
      this.currentState = 'CONFIRMED_GENUINE';
    } else if (action === 'scam') {
      this.currentState = 'FLAGGED_SCAM';
    }
    this.updateStatusBadge();
  }

  cancelRequest() {
    this.currentState = 'CANCELLED';
    this.updateStatusBadge();
  }
}

window.TrustedContactVerifier = TrustedContactVerifier;
