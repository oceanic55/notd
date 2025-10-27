// LLM-powered data entry using Groq API

const LLMEntry = {
  apiKey: null,
  isProcessing: false,
  recognition: null,
  isListening: false,

  /**
   * Initialize LLM module - check for API key
   */
  initialize() {
    this.apiKey = localStorage.getItem('groq_api_key');

    // Set up AI ENTER button
    const aiEnterBtn = document.getElementById('ai-enter-btn');
    if (aiEnterBtn) {
      aiEnterBtn.addEventListener('click', () => this.handleAIEnterClick());
    }

    // Set up AI form buttons
    const aiProcessBtn = document.getElementById('ai-process-btn');
    if (aiProcessBtn) {
      aiProcessBtn.addEventListener('click', () => this.handleAIProcess());
    }

    const aiSaveBtn = document.getElementById('ai-save-btn');
    if (aiSaveBtn) {
      aiSaveBtn.addEventListener('click', () => this.handleAISave());
    }

    // Set up overlay click to cancel
    const overlay = document.getElementById('form-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        const aiForm = document.getElementById('ai-entry-form');
        if (aiForm && aiForm.style.display === 'block') {
          this.resetAIForm();
        }
      });
    }

    // Set up Enter key in textarea to process
    const textInput = document.getElementById('ai-text-input');
    if (textInput) {
      textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
          e.preventDefault();
          this.handleAIProcess();
        }
      });
    }

    // Set up voice button
    const voiceBtn = document.getElementById('voice-btn');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => this.toggleVoiceInput());
    }

    // Initialize speech recognition
    this.initSpeechRecognition();
  },

  /**
   * Initialize speech recognition
   */
  initSpeechRecognition() {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    let finalTranscript = '';
    let interimTranscript = '';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.updateVoiceStatus('Listening... (click to stop)');
      const voiceBtn = document.getElementById('voice-btn');
      if (voiceBtn) {
        voiceBtn.style.backgroundColor = '#ef4444';
        voiceBtn.style.borderColor = '#ef4444';
      }
    };

    this.recognition.onresult = (event) => {
      interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const textInput = document.getElementById('ai-text-input');
      if (textInput) {
        textInput.value = finalTranscript + interimTranscript;
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.stopVoiceInput();

      if (event.error === 'not-allowed') {
        this.updateVoiceStatus('Microphone access denied');
      } else if (event.error === 'no-speech') {
        this.updateVoiceStatus('No speech detected');
      } else {
        this.updateVoiceStatus(`Error: ${event.error}`);
      }

      setTimeout(() => this.updateVoiceStatus(''), 3000);
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        // Restart if we're still supposed to be listening
        try {
          this.recognition.start();
        } catch (e) {
          this.stopVoiceInput();
        }
      }
    };
  },

  /**
   * Toggle voice input on/off
   */
  toggleVoiceInput() {
    if (!this.recognition) {
      alert('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (this.isListening) {
      this.stopVoiceInput();
    } else {
      this.startVoiceInput();
    }
  },

  /**
   * Start voice input
   */
  startVoiceInput() {
    if (!this.recognition) return;

    try {
      this.recognition.start();
    } catch (e) {
      console.error('Failed to start recognition:', e);
    }
  },

  /**
   * Stop voice input
   */
  stopVoiceInput() {
    if (!this.recognition) return;

    this.isListening = false;
    try {
      this.recognition.stop();
    } catch (e) {
      console.error('Failed to stop recognition:', e);
    }

    this.updateVoiceStatus('');
    const voiceBtn = document.getElementById('voice-btn');
    if (voiceBtn) {
      voiceBtn.style.backgroundColor = '#444';
      voiceBtn.style.borderColor = '#666';
    }
  },

  /**
   * Update voice status message
   */
  updateVoiceStatus(message) {
    const status = document.getElementById('voice-status');
    if (status) {
      status.textContent = message;
      status.style.color = message.includes('Error') || message.includes('denied') ? '#ef4444' : '#888';
    }
  },

  /**
   * Prompt user for API key
   */
  promptForApiKey(isManual = false) {
    const message = isManual
      ? 'Enter your Groq API key:'
      : 'To use AI-powered entry, please enter your Groq API key.\n\nGet one free at: https://console.groq.com/keys';

    const key = prompt(message, this.apiKey || '');

    if (key && key.trim()) {
      this.apiKey = key.trim();
      localStorage.setItem('groq_api_key', this.apiKey);
      alert('API key saved successfully!');
      return true;
    } else if (isManual && key === '') {
      // User wants to clear the key
      this.apiKey = null;
      localStorage.removeItem('groq_api_key');
      alert('API key cleared.');
      return false;
    }

    return false;
  },

  /**
   * Handle AI ENTER button click
   */
  async handleAIEnterClick() {
    // Check for API key
    if (!this.apiKey) {
      const hasKey = this.promptForApiKey();
      if (!hasKey) return;
    }

    // Show AI input form
    this.showAIInputForm();
  },

  /**
   * Show AI input form
   */
  showAIInputForm() {
    const form = document.getElementById('ai-entry-form');
    const overlay = document.getElementById('form-overlay');

    if (form && overlay) {
      form.style.display = 'block';
      overlay.style.display = 'block';

      // Auto-populate date and time
      const now = new Date();
      const dateInput = document.getElementById('ai-date-input');
      const timeInput = document.getElementById('ai-time-input');

      if (dateInput) {
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const year = String(now.getFullYear()).slice(-2);
        dateInput.value = `${month}/${day}/${year}`;
      }

      if (timeInput) {
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeInput.value = `${hours}:${minutes}`;
      }

      // Focus on text input
      const textInput = document.getElementById('ai-text-input');
      if (textInput) {
        textInput.value = '';
        textInput.focus();
      }

      // Clear preview
      const preview = document.getElementById('ai-preview');
      if (preview) {
        preview.style.display = 'none';
        preview.innerHTML = '';
      }
    }
  },

  /**
   * Process text with Groq LLM
   */
  async processWithLLM(text) {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'Extract location and activity from the user\'s text. This text may come from voice transcription and could contain errors from accented speech or misheard words.\n\nListen carefully for:\n1. PLACE: The primary location, venue, or place name mentioned (e.g., "Starbucks", "Central Park", "Paris", "Osaka")\n2. NOTE: Carefully review the entire entry and note every activity, event, time, movement, or content that is described, ensuring nothing is missed. Note all details in a bulleted list, covering every action, time, planned travel, intended actions, and current events or activities mentioned in the entry. Extract and note every single detail from the entry, such as times, movements, planned events, and ongoing activities, without omitting any.\n\nIMPORTANT Rules:\n- DO NOT repeat the location in the NOTE if it\'s already captured in PLACE\n- Avoid redundancy: if the place is "Osaka", don\'t write "Currently in Osaka" in the note\n- Focus the NOTE on activities, actions, events, and details - not restating the location\n- Only mention additional locations in NOTE if they are different from PLACE (e.g., travel plans to another city)\n\nVoice Transcription Corrections:\n- Watch for voice transcription errors, misspellings, or phonetic mistakes from accented speech\n- Correct obvious errors intelligently (e.g., "fall spell PHO" → "pho, spelled PHO")\n- Fix misheard words that don\'t make sense in context\n- Preserve the intended meaning while correcting transcription mistakes\n- Common patterns: homophones, phonetic spellings, missing punctuation\n\nRespond ONLY with valid JSON in this EXACT format:\n{"place": "primary location", "note": "• detail 1\\n• detail 2\\n• detail 3..."}\n\nExamples:\n- Input: "Had coffee at Starbucks downtown"\n  Output: {"place": "Starbucks downtown", "note": "• Had coffee"}\n- Input: "Meeting with Sarah at the office about the new project"\n  Output: {"place": "office", "note": "• Meeting with Sarah about the new project"}\n- Input: "I am in Paris at four I\'m going to Montpelier and I will have a baguette right now I\'m eating croissants"\n  Output: {"place": "Paris", "note": "• At 4:00\\n• Eating croissants right now\\n• Going to Montpelier\\n• Will have a baguette"}\n- Input: "having soup the soup is called fall spell PHO"\n  Output: {"place": "restaurant", "note": "• Having soup\\n• The soup is called pho, spelled PHO"}\n- Input: "I mean Osaka I just bought a bottle of mirin I don\'t know what to do with it"\n  Output: {"place": "Osaka", "note": "• Just bought a bottle of mirin\\n• Unsure what to do with it"}'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.2,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from API');
    }

    // Parse JSON response
    try {
      const parsed = JSON.parse(content);
      return {
        place: parsed.place || '',
        note: parsed.note || ''
      };
    } catch (e) {
      throw new Error('Invalid response format from API');
    }
  },

  /**
   * Handle AI text processing
   */
  async handleAIProcess() {
    const textInput = document.getElementById('ai-text-input');
    const processBtn = document.getElementById('ai-process-btn');
    const preview = document.getElementById('ai-preview');
    const saveBtn = document.getElementById('ai-save-btn');

    if (!textInput || !textInput.value.trim()) {
      alert('Please enter some text to process');
      return;
    }

    if (this.isProcessing) return;

    this.isProcessing = true;
    if (processBtn) {
      processBtn.textContent = 'Processing...';
      processBtn.disabled = true;
    }

    try {
      const result = await this.processWithLLM(textInput.value);

      // Show preview
      if (preview) {
        preview.innerHTML = `
          <div style="margin-bottom: 10px;">
            <strong style="color: #FF5100;">Place:</strong> <span style="color: white;">${result.place}</span>
          </div>
          <div>
            <strong style="color: #FF5100;">Note:</strong> <span style="color: white;">${result.note}</span>
          </div>
        `;
        preview.style.display = 'block';
      }

      // Store result for saving
      this.currentResult = result;

      // Enable save button
      if (saveBtn) {
        saveBtn.style.display = 'inline-block';
      }

    } catch (error) {
      console.error('LLM processing error:', error);
      alert(`Error: ${error.message}\n\nPlease check your API key and try again.`);

      // Offer to re-enter API key
      if (error.message.includes('API') || error.message.includes('401')) {
        this.promptForApiKey(true);
      }
    } finally {
      this.isProcessing = false;
      if (processBtn) {
        processBtn.textContent = 'Process with AI';
        processBtn.disabled = false;
      }
    }
  },

  /**
   * Save AI-processed entry
   */
  handleAISave() {
    if (!this.currentResult) {
      alert('Please process text first');
      return;
    }

    const dateInput = document.getElementById('ai-date-input');
    const timeInput = document.getElementById('ai-time-input');

    const entry = {
      timestamp: dateInput.value.trim(),
      time: timeInput.value.trim(),
      sender: this.currentResult.place,
      note: this.currentResult.note
    };

    // Save entry
    StorageManager.saveEntry(entry);
    DisplayManager.appendEntry(entry, StorageManager.currentEntries.length - 1);

    // Reset form
    this.resetAIForm();
  },

  /**
   * Reset AI form
   */
  resetAIForm() {
    // Stop voice input if active
    if (this.isListening) {
      this.stopVoiceInput();
    }

    const form = document.getElementById('ai-entry-form');
    const overlay = document.getElementById('form-overlay');
    const textInput = document.getElementById('ai-text-input');
    const preview = document.getElementById('ai-preview');
    const saveBtn = document.getElementById('ai-save-btn');

    if (textInput) textInput.value = '';
    if (preview) {
      preview.style.display = 'none';
      preview.innerHTML = '';
    }
    if (saveBtn) saveBtn.style.display = 'none';
    if (form) form.style.display = 'none';
    if (overlay) overlay.style.display = 'none';

    this.updateVoiceStatus('');
    this.currentResult = null;
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  LLMEntry.initialize();
});

// Export for use in main app
window.LLMEntry = LLMEntry;
