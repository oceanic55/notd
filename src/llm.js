// LLM-powered data entry using Groq API

const LLMEntry = {
  apiKey: null,
  isProcessing: false,
  selectedModel: 'llama-3.3-70b-versatile',

  /**
   * Initialize LLM module - check for API key
   */
  initialize() {
    this.apiKey = localStorage.getItem('groq_api_key');
    this.selectedModel = localStorage.getItem('groq_model') || 'llama-3.3-70b-versatile';

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

    // Set up AI modal buttons
    const aiCopyBtn = document.getElementById('ai-copy-btn');
    if (aiCopyBtn) {
      aiCopyBtn.addEventListener('click', () => this.copyAnalysisToClipboard());
    }

    const aiCloseBtn = document.getElementById('ai-close-btn');
    if (aiCloseBtn) {
      aiCloseBtn.addEventListener('click', () => this.closeAnalysisModal());
    }

    // Set up overlay click to close modal
    const aiModalOverlay = document.getElementById('ai-analysis-modal-overlay');
    if (aiModalOverlay) {
      aiModalOverlay.addEventListener('click', (e) => {
        if (e.target === aiModalOverlay) {
          this.closeAnalysisModal();
        }
      });
    }

    // Prevent AI modal container clicks from bubbling to overlay
    const aiModal = document.getElementById('ai-analysis-modal');
    if (aiModal) {
      aiModal.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Set up ESC key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('ai-analysis-modal-overlay');
        if (modal && modal.classList.contains('active')) {
          this.closeAnalysisModal();
        }
      }
    });

    // Set up API settings link
    const apiSettingsLink = document.getElementById('api-settings-link');
    if (apiSettingsLink) {
      apiSettingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.promptForApiKey(true);
      });
    }

    // Set up model selector
    const modelSelector = document.getElementById('model-selector');
    if (modelSelector) {
      modelSelector.value = this.selectedModel;
      modelSelector.addEventListener('change', (e) => {
        this.selectedModel = e.target.value;
        localStorage.setItem('groq_model', this.selectedModel);
      });

      // Fetch available models from Groq API
      this.loadAvailableModels(modelSelector);
    }
  },

  /**
   * Load available models from Groq API
   */
  async loadAvailableModels(selectElement) {
    // Clear existing options and show loading
    selectElement.innerHTML = '<option>Loading models...</option>';

    try {
      // Fetch models from Groq API
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey || ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();
      const models = data.data || [];

      // Clear loading message
      selectElement.innerHTML = '';

      if (models.length === 0) {
        selectElement.innerHTML = '<option>No models available</option>';
        return;
      }

      // Sort models by ID for consistent ordering
      models.sort((a, b) => a.id.localeCompare(b.id));

      // Add models to dropdown
      models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.id;
        // Display only the part after "/" or full name if no "/"
        const displayName = model.id.includes('/') ? model.id.split('/')[1] : model.id;
        option.textContent = displayName;
        selectElement.appendChild(option);
      });

      // Restore selected model or default to first option
      const modelIds = models.map(m => m.id);
      if (this.selectedModel && modelIds.includes(this.selectedModel)) {
        selectElement.value = this.selectedModel;
      } else {
        selectElement.value = models[0].id;
        this.selectedModel = models[0].id;
        localStorage.setItem('groq_model', this.selectedModel);
      }
    } catch (error) {
      console.error('Error loading models:', error);
      
      // Fallback to default models list
      const fallbackModels = [
        'qwen/qwen3-32b',
        'groq/compound-mini',
        'llama-3.1-8b-instant',
        'llama-3.3-70b-versatile',
        'moonshotai/kimi-k2-instruct-0905'
      ];

      selectElement.innerHTML = '';
      fallbackModels.forEach(modelId => {
        const option = document.createElement('option');
        option.value = modelId;
        const displayName = modelId.includes('/') ? modelId.split('/')[1] : modelId;
        option.textContent = displayName;
        selectElement.appendChild(option);
      });

      // Restore selected model or default to first option
      if (this.selectedModel && fallbackModels.includes(this.selectedModel)) {
        selectElement.value = this.selectedModel;
      } else {
        selectElement.value = fallbackModels[0];
        this.selectedModel = fallbackModels[0];
        localStorage.setItem('groq_model', this.selectedModel);
      }
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
      const trimmedKey = key.trim();
      
      // Validate API key format using Utils if available
      if (window.Utils) {
        const validation = window.Utils.validateAPIKey(trimmedKey);
        if (!validation.isValid) {
          alert(`Invalid API key: ${validation.error}\n\nPlease check your key and try again.`);
          return false;
        }
      }
      
      this.apiKey = trimmedKey;
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
   * @param {string} text - Text to process
   * @param {boolean} isReprocess - Whether this is a reprocess (edit mode)
   */
  async processWithLLM(text, isReprocess = false) {
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
        model: this.selectedModel,
        messages: [
          {
            role: 'system',
            content: window.SYSTEM_PROMPT || 'Error: System prompt not loaded'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: isReprocess ? 0.5 : 0.2,  // Higher temp for reprocessing to allow more variation
        max_tokens: isReprocess ? 500 : 300    // More tokens for reprocessing
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
      // Try to repair common JSON errors
      let repairedContent = content.trim();
      
      // Remove trailing text after closing brace
      const lastBrace = repairedContent.lastIndexOf('}');
      if (lastBrace !== -1) {
        repairedContent = repairedContent.substring(0, lastBrace + 1);
      }
      
      // Try parsing again
      try {
        const parsed = JSON.parse(repairedContent);
        console.log('JSON repaired successfully');
        return {
          place: parsed.place || '',
          note: parsed.note || ''
        };
      } catch (e2) {
        console.error('JSON parse error. Original:', content);
        console.error('Attempted repair:', repairedContent);
        throw new Error('Invalid response format from API');
      }
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
      const result = await this.analyzeEntries(entries);
      this.showAnalysisModal(result);
    } catch (error) {
      console.error('AI analysis error:', error);
      
      // Show error in reply window instead of popup
      this.showAnalysisModal({
        analysis: `Error: ${error.message}`,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        finishReason: 'error',
        isComplete: false
      });

      // Only prompt for API key if it's an auth issue
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
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

    // Convert entries to natural language format
    const entriesText = entries.map(entry => {
      const place = entry.sender || 'Unknown';
      const note = entry.note || '';
      return `${place}: ${note}`;
    }).join('\n');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.selectedModel,
        messages: [
          {
            role: 'system',
            content: window.ANALYSIS_PROMPT || 'Error: Analysis prompt not loaded'
          },
          {
            role: 'user',
            content: entriesText
          }
        ],
        temperature: 0.7,
        max_tokens: 250
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error?.message || 'API request failed';
      
      // Check for rate limit error
      if (response.status === 429 || errorMessage.toLowerCase().includes('rate limit')) {
        throw new Error(`Rate limit reached for model "${this.selectedModel}". Please try again later or switch to a different model.`);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const choice = data.choices[0];
    const analysis = choice?.message?.content;

    if (!analysis) {
      throw new Error('No response from API');
    }

    // Get token usage and completion status
    const usage = data.usage || {};
    const finishReason = choice?.finish_reason || 'unknown';
    const isComplete = finishReason === 'stop';
    
    // Check if response was truncated
    if (finishReason === 'length') {
      console.warn('Response was truncated due to max_tokens limit');
    }

    return {
      analysis,
      usage: {
        promptTokens: usage.prompt_tokens || 0,
        completionTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0
      },
      finishReason,
      isComplete
    };
  },

  /**
   * Close other forms before opening AI modal
   */
  closeOtherForms() {
    // Close entry form
    const entryOverlay = document.getElementById('form-overlay');
    const entryForm = document.getElementById('entry-form');
    if (entryOverlay) entryOverlay.classList.remove('active');
    if (entryForm) entryForm.classList.remove('active');
    if (window.EntryForm) window.EntryForm.isOpen = false;

    // Close ABOUT form
    const aboutOverlay = document.getElementById('combined-about-overlay');
    const aboutForm = document.getElementById('combined-about-form');
    if (aboutOverlay) aboutOverlay.classList.remove('active');
    if (aboutForm) aboutForm.classList.remove('active');

    // Close edit form
    const editOverlay = document.getElementById('edit-form-overlay');
    const editForm = document.getElementById('edit-entry-form');
    if (editOverlay) editOverlay.classList.remove('active');
    if (editForm) editForm.classList.remove('active');
  },

  /**
   * Show AI Analysis modal (full-screen below navigation)
   */
  showAnalysisModal(result) {
    // Close any other open forms first
    this.closeOtherForms();
    
    const modalOverlay = document.getElementById('ai-analysis-modal-overlay');
    const modal = document.getElementById('ai-analysis-modal');
    const content = document.getElementById('ai-analysis-content');

    if (content) {
      // Store only the analysis text for copying (without tokens/model info)
      this.currentAnalysis = result.analysis;
      
      // Display analysis text only (no token usage or model info)
      content.textContent = result.analysis;
    }
    
    if (modalOverlay) modalOverlay.classList.add('active');
    if (modal) modal.classList.add('active');
  },

  /**
   * Copy analysis to clipboard
   */
  copyAnalysisToClipboard() {
    if (!this.currentAnalysis) return;
    
    navigator.clipboard.writeText(this.currentAnalysis).then(() => {
      // Visual feedback - could add a toast notification here
      const copyBtn = document.getElementById('ai-copy-btn');
      if (copyBtn) {
        const originalOpacity = copyBtn.style.opacity;
        copyBtn.style.opacity = '1';
        setTimeout(() => {
          copyBtn.style.opacity = originalOpacity;
        }, 200);
      }
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    });
  },

  /**
   * Close AI Analysis modal
   */
  closeAnalysisModal() {
    const modalOverlay = document.getElementById('ai-analysis-modal-overlay');
    const modal = document.getElementById('ai-analysis-modal');

    if (modalOverlay) modalOverlay.classList.remove('active');
    if (modal) modal.classList.remove('active');
    this.currentAnalysis = null;
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  LLMEntry.initialize();
});

// Export for use in main app
window.LLMEntry = LLMEntry;
if (window.NOTD_MODULES) window.NOTD_MODULES.LLMEntry = LLMEntry;
