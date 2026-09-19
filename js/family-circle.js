// VoiceShield India - Family Circle Management Module
// Handles pre-registered trusted family contacts stored in localStorage

(function() {
  const STORAGE_KEY = 'voiceshield_family_contacts';

  const DEFAULT_CONTACTS = [
    {
      id: 'fc-1',
      name: 'Rahul Sharma',
      relation: 'Son',
      phone: '+91 98765 43210',
      avatar: '👨‍🎓',
      isPrimary: true
    },
    {
      id: 'fc-2',
      name: 'Priya Sharma',
      relation: 'Daughter',
      phone: '+91 98111 22334',
      avatar: '👩‍💼',
      isPrimary: false
    },
    {
      id: 'fc-3',
      name: 'Sunita Sharma',
      relation: 'Spouse',
      phone: '+91 98222 33445',
      avatar: '👩‍🦰',
      isPrimary: false
    }
  ];

  class FamilyCircleManager {
    constructor() {
      this.contacts = this.loadContacts();
    }

    loadContacts() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('[FamilyCircle] Error reading localStorage, using defaults', e);
      }
      this.saveContacts(DEFAULT_CONTACTS);
      return [...DEFAULT_CONTACTS];
    }

    saveContacts(contacts) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
      } catch (e) {
        console.warn('[FamilyCircle] Failed to persist to localStorage', e);
      }
      this.contacts = contacts;
      // Dispatch custom event for UI updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('voiceshield:contacts-updated', { detail: { contacts } }));
      }
    }

    getContacts() {
      return this.contacts;
    }

    getPrimaryContact() {
      const primary = this.contacts.find(c => c.isPrimary);
      return primary || this.contacts[0] || DEFAULT_CONTACTS[0];
    }

    addContact(name, relation, phone) {
      const avatars = {
        'Son': '👨‍🎓',
        'Daughter': '👩‍💼',
        'Spouse': '👩‍🦰',
        'Parent': '👴',
        'Father': '👴',
        'Mother': '👵',
        'Brother': '👨‍🦱',
        'Sister': '👩',
        'Legal Advisor': '⚖️',
        'Other': '🛡️'
      };

      const newContact = {
        id: 'fc-' + Date.now(),
        name: name.trim(),
        relation: relation.trim(),
        phone: phone.trim(),
        avatar: avatars[relation.trim()] || '🛡️',
        isPrimary: this.contacts.length === 0
      };

      const updated = [...this.contacts, newContact];
      this.saveContacts(updated);
      return newContact;
    }

    deleteContact(id) {
      const filtered = this.contacts.filter(c => c.id !== id);
      // If primary was deleted, assign primary to first remaining
      if (filtered.length > 0 && !filtered.some(c => c.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      this.saveContacts(filtered);
    }

    setPrimary(id) {
      const updated = this.contacts.map(c => ({
        ...c,
        isPrimary: c.id === id
      }));
      this.saveContacts(updated);
    }

    resetToDefaults() {
      this.saveContacts(DEFAULT_CONTACTS);
      return DEFAULT_CONTACTS;
    }
  }

  window.FamilyCircle = new FamilyCircleManager();
})();
