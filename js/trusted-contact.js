// VoiceShield India - Trusted Contact Verification Module
// Simulates out-of-band secondary channel authentication & family safe-word challenges

class TrustedContactVerifier {
  constructor(options = {}) {
    this.modal = document.getElementById('contact-modal');
    this.messagesContainer = document.getElementById('chat-messages');
    this.closeBtn = document.getElementById('btn-close-contact-modal');
    this.dismissBtn = document.getElementById('btn-dismiss-chat');
    this.onVerifiedCallback = options.onVerified || null;

    this.initEvents();
  }

  initEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.hideModal());
    }
    if (this.dismissBtn) {
      this.dismissBtn.addEventListener('click', () => this.hideModal());
    }
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.hideModal();
      });
    }
  }

  showModal() {
    if (this.modal) {
      this.modal.classList.remove('hidden');
    }
  }

  hideModal() {
    if (this.modal) {
      this.modal.classList.add('hidden');
    }
  }

  /**
   * Triggers the realistic out-of-band verification chat flow
   * @param {Object} scenario - Current active scenario
   */
  startVerificationFlow(scenario) {
    if (!this.messagesContainer) return;

    const contact = (scenario && scenario.trustedContact) ? scenario.trustedContact : {
      name: "Rahul Sharma (Son)",
      phone: "+91 98765 43210",
      challengeQ: "What was our first pet's name?",
      simulatedReply: "Papa, I am completely safe in my college lecture hall! My phone is with me. That voice note is fake! Do not transfer any money!"
    };

    // Reset container
    this.messagesContainer.innerHTML = '';
    this.showModal();

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Step 1: VoiceShield Automated Outgoing Alert
    const outgoingMsg = document.createElement('div');
    outgoingMsg.className = 'chat-bubble out';
    outgoingMsg.innerHTML = `
      <div><strong>🛡️ VoiceShield Emergency Safe-Check</strong></div>
      <div style="margin-top:4px;">Urgent: Dad received an emergency voice call claiming to be you in an accident and requesting ₹50,000 on GPay. Are you safe? Safe-word verification requested.</div>
      <div class="chat-time">${nowTime} &bull; Sent via Encrypted SMS/WhatsApp &check;&check;</div>
    `;
    this.messagesContainer.appendChild(outgoingMsg);

    // Step 2: Show typing indicator after 800ms
    setTimeout(() => {
      const typing = document.createElement('div');
      typing.className = 'typing-indicator';
      typing.id = 'chat-typing-indicator';
      typing.innerHTML = `
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      `;
      this.messagesContainer.appendChild(typing);
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

      // Step 3: Deliver recipient reply after 2000ms
      setTimeout(() => {
        const typingEl = document.getElementById('chat-typing-indicator');
        if (typingEl) typingEl.remove();

        const replyMsg = document.createElement('div');
        replyMsg.className = 'chat-bubble in';
        replyMsg.innerHTML = `
          <div><strong>${contact.name}</strong></div>
          <div style="margin-top:4px;">${contact.simulatedReply}</div>
          <div class="chat-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; Verified Contact</div>
        `;
        this.messagesContainer.appendChild(replyMsg);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

        if (this.onVerifiedCallback) {
          this.onVerifiedCallback(contact);
        }
      }, 1800);
    }, 800);
  }
}

window.TrustedContactVerifier = TrustedContactVerifier;
