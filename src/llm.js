// LLM-powered data entry using Groq API

const LLMEntry = {
  apiKey: null,
  isProcessing: false,

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

    // Set up API settings link
    const apiSettingsLink = document.getElementById('api-settings-link');
    if (apiSettingsLink) {
      apiSettingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.promptForApiKey(true);
      });
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
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Extract location and activity from the user\'s text. This text may come from voice transcription and could contain errors from accented speech or misheard words.\n\nListen carefully for:\n1. PLACE: The primary location, venue, or place name mentioned (e.g., "Starbucks", "Central Park", "Paris", "Osaka")\n2. NOTE: Carefully review the entire entry and note every activity, event, time, movement, or content that is described, ensuring nothing is missed. Write all details as a flowing sentence with periods separating each concept, covering every action, time, planned travel, intended actions, and current events or activities mentioned in the entry. Extract and note every single detail from the entry, such as times, movements, planned events, and ongoing activities, without omitting any.\n\nIMPORTANT Rules:\n- DO NOT repeat the location in the NOTE if it\'s already captured in PLACE\n- Avoid redundancy: if the place is "Osaka", don\'t write "Currently in Osaka" in the note\n- Focus the NOTE on activities, actions, events, and details - not restating the location\n- Only mention additional locations in NOTE if they are different from PLACE (e.g., travel plans to another city)\n- Use periods to separate different concepts or details, not bullet points\n\nVoice Transcription Corrections:\n- Watch for voice transcription errors, misspellings, or phonetic mistakes from accented speech\n- Correct obvious errors intelligently (e.g., "fall spell PHO" → "pho, spelled PHO")\n- Fix misheard words that don\'t make sense in context\n- Preserve the intended meaning while correcting transcription mistakes\n- Common patterns: homophones, phonetic spellings, missing punctuation\n\nRespond ONLY with valid JSON in this EXACT format:\n{"place": "primary location", "note": "detail 1. detail 2. detail 3."}\n\nExamples:\n- Input: "Had coffee at Starbucks downtown"\n  Output: {"place": "Starbucks downtown", "note": "Had coffee."}\n- Input: "Meeting with Sarah at the office about the new project"\n  Output: {"place": "office", "note": "Meeting with Sarah about the new project."}\n- Input: "I am in Paris at four I\'m going to Montpelier and I will have a baguette right now I\'m eating croissants"\n  Output: {"place": "Paris", "note": "At 4:00. Eating croissants right now. Going to Montpelier. Will have a baguette."}\n- Input: "having soup the soup is called fall spell PHO"\n  Output: {"place": "restaurant", "note": "Having soup. The soup is called pho, spelled PHO."}\n- Input: "I mean Osaka I just bought a bottle of mirin I don\'t know what to do with it"\n  Output: {"place": "Osaka", "note": "Just bought a bottle of mirin. Unsure what to do with it."}'
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
      processBtn.textContent = 'PROCESSING...';
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
        processBtn.textContent = 'PROCESS';
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
    const form = document.getElementById('ai-entry-form');
    const overlay = document.getElementById('form-overlay');
    const textInput = document.getElementById('ai-text-input');
    const preview = document.getElementById('ai-preview');
    const saveBtn = document.getElementById('ai-save-btn');

    // Clear all form data
    if (textInput) textInput.value = '';
    if (preview) {
      preview.style.display = 'none';
      preview.innerHTML = '';
    }
    if (saveBtn) saveBtn.style.display = 'none';
    if (form) form.style.display = 'none';
    if (overlay) overlay.style.display = 'none';

    // Reset state
    this.currentResult = null;
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  LLMEntry.initialize();
});

// Export for use in main app
window.LLMEntry = LLMEntry;
