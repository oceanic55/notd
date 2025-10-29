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

    // Set up AI ANALYZE button
    const aiAnalyzeBtn = document.getElementById('ai-analyze-btn');
    if (aiAnalyzeBtn) {
      aiAnalyzeBtn.addEventListener('click', () => this.handleAIAnalyze());
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
        const aiModal = document.getElementById('ai-analysis-modal');
        if (aiForm && aiForm.style.display === 'block') {
          this.resetAIForm();
        }
        if (aiModal && aiModal.style.display === 'block') {
          this.closeAnalysisModal();
        }
      });
    }

    // Set up AI analysis close button
    const aiAnalysisClose = document.getElementById('ai-analysis-close');
    if (aiAnalysisClose) {
      aiAnalysisClose.addEventListener('click', () => this.closeAnalysisModal());
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
            content: 'Your Task: Given a user\'s message, produce a structured note with the following format:\n\nOutput Format (always exactly this):\n{"place": "<city name>", "note": "<rephrased note>"}\n\n**Rules for Determining the Place:**\n\n1. If a city is directly mentioned, use that city exactly (e.g., "Paris" → "Paris")\n\n2. Use the nearest practical/logistical city relevant to the location. For landmarks, regions, mountains, venues, or corporate HQs, convert to the base/access city:\n\n**Mountains (use base/access town):**\n   - Mount Everest → Kathmandu\n   - K2 → Skardu\n   - Kilimanjaro → Moshi\n   - Mont Blanc → Chamonix\n   - Denali → Talkeetna\n   - Matterhorn → Zermatt\n   - Aconcagua → Mendoza\n   - Fuji → Fujiyoshida\n\n**Landmarks:**\n   - Eiffel Tower → Paris\n   - Statue of Liberty → New York\n   - Golden Gate Bridge → San Francisco\n   - Big Ben → London\n   - Colosseum → Rome\n   - Taj Mahal → Agra\n   - Machu Picchu → Cusco\n   - Great Wall → Beijing\n\n**Corporate HQs:**\n   - Apple HQ → Cupertino\n   - Nike → Beaverton\n   - Microsoft → Redmond\n   - Google → Mountain View\n   - Amazon → Seattle\n   - Meta/Facebook → Menlo Park\n   - Tesla → Austin\n\n3. Output ONLY the city name, with NO country/state/region\n\n4. If the location is ambiguous (e.g., "Springfield"), respond with:\n   {"place": "CLARIFY", "note": "Which city do you mean by Springfield?"}\n\n5. If the location cannot be determined, respond with:\n   {"place": "CLARIFY", "note": "I couldn\'t determine the city. Please clarify."}\n\n**Rules for Writing the Note:**\n\n1. Rephrase the user\'s message into a clear, natural sentence (or two if necessary)\n\n2. PRESERVE THE EMOTIONAL TONE AND URGENCY:\n   - If the user sounds exhausted, determined, stressed, excited, etc., KEEP THAT TONE\n   - NEVER soften intensity or change meaning\n   - "gotta sleep" → "completely exhausted and need to sleep now" NOT "need to get some rest"\n   - "hard" → "extremely difficult" NOT "challenging"\n\n3. Do NOT add new details that were not stated\n\n4. Do NOT remove key information\n\n5. Keep the note concise, direct, and human-sounding, NOT clinical or polished\n\n6. Do NOT repeat the location in the note if it\'s already in the place field\n\n7. Correct voice transcription errors intelligently (e.g., "fall spell PHO" → "pho (spelled PHO)")\n\n**URL Handling Rules:**\n\n1. Do not follow, interpret, summarize, or describe any URL\n\n2. The model must not open the link, analyze its content, or guess what it points to\n\n3. Preserve URLs exactly as they appear in the user\'s input\n\n4. Keep the full link intact and unchanged, character-for-character\n\n5. If the URL is part of the note context, include it in the Note section exactly as written\n\n6. Do NOT reformat, shorten, expand, paraphrase, or explain the link\n\n7. Do NOT replace URLs with descriptions of their destination. For example, do not change https://example.com to "the company website"\n\n8. If the user references a URL indirectly (e.g., "this link"), keep the wording and do not attempt to resolve what link is being referenced\n\n**Examples:**\n\nInput: "Mount Everest. Climbing without canister and hard. Camp 2 now, gotta sleep."\nOutput: {"place": "Kathmandu", "note": "At Camp 2 on Everest, climbing without oxygen is extremely difficult. Completely exhausted and need to sleep now."}\n\nInput: "Lunch at Nike. Find out what city they are in."\nOutput: {"place": "Beaverton", "note": "Having lunch at Nike HQ."}\n\nInput: "Meeting planned in Springfield tomorrow."\nOutput: {"place": "CLARIFY", "note": "Which city do you mean by Springfield?"}\n\nInput: "I am in Paris at four I\'m going to Montpelier and I will have a baguette right now I\'m eating croissants"\nOutput: {"place": "Paris", "note": "At 4:00. Eating croissants right now. Going to Montpellier. Will have a baguette."}\n\nInput: "having soup the soup is called fall spell PHO"\nOutput: {"place": "CLARIFY", "note": "Having soup called pho (spelled PHO). I couldn\'t determine the city. Please clarify."}\n\nInput: "I mean Osaka I just bought a bottle of mirin I don\'t know what to do with it"\nOutput: {"place": "Osaka", "note": "Just bought a bottle of mirin. Unsure what to do with it."}'
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
  },

  /**
   * Handle AI Analysis button click
   */
  async handleAIAnalyze() {
    // Check for API key
    if (!this.apiKey) {
      const hasKey = this.promptForApiKey();
      if (!hasKey) return;
    }

    // Get current entries from StorageManager
    const entries = window.StorageManager ? window.StorageManager.getEntries() : [];

    if (!entries || entries.length === 0) {
      alert('No entries to analyze. Please add some entries first.');
      return;
    }
    const aiBtn = document.getElementById('ai-analyze-btn');
    const originalText = aiBtn ? aiBtn.textContent : 'AI';

    if (aiBtn) {
      aiBtn.textContent = 'ANALYZING...';
      aiBtn.disabled = true;
    }

    try {
      const analysis = await this.analyzeEntries(entries);
      this.showAnalysisModal(analysis);
    } catch (error) {
      console.error('AI analysis error:', error);
      alert(`Error: ${error.message}\n\nPlease check your API key and try again.`);

      if (error.message.includes('API') || error.message.includes('401')) {
        this.promptForApiKey(true);
      }
    } finally {
      if (aiBtn) {
        aiBtn.textContent = originalText;
        aiBtn.disabled = false;
      }
    }
  },

  /**
   * Analyze entries with Groq API
   */
  async analyzeEntries(entries) {
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
            content: 'CRITICAL CHARACTER LIMIT: Your COMPLETE response must be EXACTLY 600-700 characters total. Count every character including spaces, punctuation, and the labels "Idea:", "Trend:", "Core:". If you exceed 700 characters, your response will be rejected. This is a hard limit.\n\nYou will receive a JSON array with MULTIPLE entries of VARYING LENGTHS. You MUST read and analyze THE ENTIRE DATASET from first to last entry. DO NOT let long, verbose entries dominate your analysis. SHORT ENTRIES ARE EQUALLY IMPORTANT and often contain the most significant signals.\n\nREADING INSTRUCTIONS:\n- Process the COMPLETE array from beginning to end\n- Give EQUAL WEIGHT to short and long entries - brief notes often reveal key trends\n- DO NOT let lengthy entries overshadow short ones in your analysis\n- Short entries like "bought mirin" or "meeting at 3pm" are just as valuable as long descriptions\n- Look for patterns across ALL entry types: brief notes, detailed descriptions, everything in between\n- Identify how things change from early entries to later entries\n- Note recurring themes across DIFFERENT time periods and locations\n- Find connections between entries that are far apart in the sequence\n- Pay special attention to what SHORT entries reveal about routine, priorities, and shifts\n\nFOCUS ON:\n- Emerging patterns across the FULL timeline and all locations (including from brief entries)\n- Shifts in focus, intensity, or direction over time\n- Connections between disparate activities throughout the dataset\n- What\'s accelerating, what\'s fading, what\'s new across the entire span\n- Tensions or contrasts visible when viewing the complete picture\n- The trajectory implied by the FULL sequence of events\n- What the MIX of detailed and brief entries reveals about changing patterns\n\nAVOID:\n- DO NOT describe the person ("This person values...", "Their world is...", "They are...")\n- DO NOT list obvious content already visible in entries ("Locations include...", "with activities like...", "Recurring elements include...")\n- DO NOT use filler phrases like "The juxtaposition of", "reveals a", "suggests that", "indicates a"\n- DO NOT simply enumerate what\'s there - extract what it means directionally\n- DO NOT fixate on only the first entry or first few entries\n- DO NOT let verbose entries dominate - scan for patterns across ALL entries regardless of length\n\nWRITING STYLE:\n- Direct, analytical observations about patterns and trends\n- Focus on movement, direction, and evolution across the complete dataset\n- Name specific elements only when illustrating a non-obvious pattern\n- Use active language about what\'s happening in the data\n- Get straight to the insight\n- BE CONCISE - you have a 700 character maximum for the entire output\n\nOutput Format (TOTAL OUTPUT MUST BE 600-700 CHARACTERS):\n\nIdea: [2-3 sentences identifying the most significant pattern or insight across ALL entries (short and long). What\'s the key thing happening? What non-obvious connection emerges when viewing the complete timeline?]\n\nTrend: [2-3 sentences about directional movement across the FULL dataset. What\'s intensifying? What\'s shifting? What trajectory is visible from start to finish? Include insights from brief entries.]\n\nCore: [1-2 sentences about the underlying theme or tension visible across ALL the data. What\'s the deeper pattern that ties the complete dataset together?]\n\nGood example: "Technical work intensifying around UI and product launches while geographic mobility remains constant. Shift from exploration to execution visible in meeting frequency and decision-making notes."\nBad example: "Locations include Paris, Seattle, and Portland with activities like meetings and product launches. This person values innovation and travel."'
          },
          {
            role: 'user',
            content: JSON.stringify(entries)
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    const analysis = data.choices[0]?.message?.content;

    if (!analysis) {
      throw new Error('No response from API');
    }

    return analysis;
  },

  /**
   * Show analysis modal
   */
  showAnalysisModal(analysis) {
    const modal = document.getElementById('ai-analysis-modal');
    const content = document.getElementById('ai-analysis-content');
    const overlay = document.getElementById('form-overlay');

    if (content) content.textContent = analysis;
    if (modal) modal.style.display = 'block';
    if (overlay) overlay.style.display = 'block';
  },

  /**
   * Close analysis modal
   */
  closeAnalysisModal() {
    const modal = document.getElementById('ai-analysis-modal');
    const overlay = document.getElementById('form-overlay');

    if (modal) modal.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  LLMEntry.initialize();
});

// Export for use in main app
window.LLMEntry = LLMEntry;
