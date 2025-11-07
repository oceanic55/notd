// Prompt Manager Module
// Centralized loading, validation, and management for all prompts

const PromptManager = {
  // Prompts state
  prompts: {
    system: null,
    analysis: null,
    essay: null,
    styleExamples: null
  },
  
  // Configuration
  config: null,
  
  // Initialization flag
  isInitialized: false,
  
  /**
   * Initialize prompt manager - load all prompts and validate
   */
  initialize() {
    // 1. Load configuration
    this.config = window.PROMPT_CONFIG || this.getDefaultConfig();
    
    // 2. Load prompts in dependency order
    // Style examples must load before essay prompt
    this.prompts.styleExamples = window.ESSAY_STYLE_EXAMPLES || '';
    this.prompts.system = window.SYSTEM_PROMPT || '';
    this.prompts.analysis = window.ANALYSIS_PROMPT || '';
    this.prompts.essay = window.ESSAY_PROMPT || '';
    
    // 3. Validate all prompts
    const validation = this.validatePrompts();
    
    // 4. Log warnings if enabled
    if (this.config.validation.logWarnings && validation.warnings.length > 0) {
      console.warn('Prompt Manager warnings:', validation.warnings);
    }
    
    // 5. Apply fallbacks if enabled
    if (this.config.validation.enableFallbacks && validation.missing.length > 0) {
      this.applyFallbacks(validation.missing);
    }
    
    this.isInitialized = true;
    console.log('✓ Prompt Manager initialized');
  },
  
  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      essay: {
        wordMin: 120,
        wordMax: 140,
        mode: 'strict',
        temperature: 0.7,
        maxTokens: 500
      },
      analysis: {
        temperature: 0.7,
        maxTokens: 250,
        maxCharacters: 700
      },
      system: {
        temperature: 0.2,
        maxTokens: 300,
        reprocessTemperature: 0.5,
        reprocessMaxTokens: 500
      },
      validation: {
        enableFallbacks: true,
        logWarnings: true
      }
    };
  },
  
  /**
   * Validate all prompts
   * @returns {Object} Validation result with isValid, missing, and warnings arrays
   */
  validatePrompts() {
    const missing = [];
    const warnings = [];
    
    // Check each required prompt
    if (!this.prompts.system || this.prompts.system.trim() === '') {
      missing.push('system');
    }
    if (!this.prompts.analysis || this.prompts.analysis.trim() === '') {
      missing.push('analysis');
    }
    if (!this.prompts.essay || this.prompts.essay.trim() === '') {
      missing.push('essay');
    }
    
    // Check optional dependencies
    if (!this.prompts.styleExamples || this.prompts.styleExamples.trim() === '') {
      warnings.push('Style examples not loaded - essay quality may be reduced');
    }
    
    return {
      isValid: missing.length === 0,
      missing,
      warnings
    };
  },
  
  /**
   * Get fallback system prompt
   */
  getFallbackSystemPrompt() {
    return `Your Task: Given a user's message, produce a structured note with the following format:

Output Format (always exactly this):
{"place": "<city name>", "note": "<rephrased note>"}

Parse the user message and return JSON with the place (city name or "PENDING" if unknown) and a clear, rephrased note.`;
  },
  
  /**
   * Get fallback analysis prompt
   */
  getFallbackAnalysisPrompt() {
    return `Analyze the notes and identify patterns, motivations, and sensory experiences. Keep response under 700 characters. Use plain text only, no markdown formatting.`;
  },
  
  /**
   * Get fallback essay prompt
   */
  getFallbackEssayPrompt() {
    return `Write a cohesive paragraph (120-140 words) based on the analysis provided. Use sensory details, varied sentence rhythm, and concrete imagery. Stay faithful to the source material without adding new information.`;
  },
  
  /**
   * Get fallback style examples
   */
  getFallbackStyleExamples() {
    return `Use sensory details, varied sentence rhythm, and concrete imagery. Build from specific details to broader themes.`;
  },
  
  /**
   * Apply fallback prompts for missing items
   * @param {Array} missing - Array of missing prompt names
   */
  applyFallbacks(missing) {
    missing.forEach(promptName => {
      switch (promptName) {
        case 'system':
          this.prompts.system = this.getFallbackSystemPrompt();
          console.warn('Applied fallback system prompt');
          break;
        case 'analysis':
          this.prompts.analysis = this.getFallbackAnalysisPrompt();
          console.warn('Applied fallback analysis prompt');
          break;
        case 'essay':
          this.prompts.essay = this.getFallbackEssayPrompt();
          console.warn('Applied fallback essay prompt');
          break;
      }
    });
    
    // Apply fallback for style examples if empty
    if (!this.prompts.styleExamples || this.prompts.styleExamples.trim() === '') {
      this.prompts.styleExamples = this.getFallbackStyleExamples();
      console.warn('Applied fallback style examples');
    }
  },
  
  /**
   * Get system prompt (with fallback)
   * @returns {string} System prompt
   */
  getSystemPrompt() {
    return this.prompts.system || this.getFallbackSystemPrompt();
  },
  
  /**
   * Get analysis prompt (with fallback)
   * @returns {string} Analysis prompt
   */
  getAnalysisPrompt() {
    return this.prompts.analysis || this.getFallbackAnalysisPrompt();
  },
  
  /**
   * Get essay prompt (with fallback)
   * @returns {string} Essay prompt
   */
  getEssayPrompt() {
    return this.prompts.essay || this.getFallbackEssayPrompt();
  },
  
  /**
   * Get style examples (with fallback)
   * @returns {string} Style examples
   */
  getStyleExamples() {
    return this.prompts.styleExamples || this.getFallbackStyleExamples();
  },
  
  /**
   * Interpolate essay prompt with configuration values and style examples
   * @returns {string} Interpolated essay prompt
   */
  interpolateEssayPrompt() {
    let prompt = this.getEssayPrompt();
    
    // Replace configuration placeholders
    prompt = prompt.replace(/\$\{WORD_MIN\}/g, this.config.essay.wordMin);
    prompt = prompt.replace(/\$\{WORD_MAX\}/g, this.config.essay.wordMax);
    
    // Replace style examples
    prompt = prompt.replace(/\$\{ESSAY_STYLE_EXAMPLES\}/g, this.getStyleExamples());
    
    // Add mode-specific instructions
    if (this.config.essay.mode === 'creative') {
      prompt += '\n\nCreative mode: You may add slight embellishments and sensory details that naturally extend from the provided information, while staying true to the core content.';
    }
    
    return prompt;
  }
};

// Export for use in other modules
window.PromptManager = PromptManager;
if (window.NOTD_MODULES) window.NOTD_MODULES.PromptManager = PromptManager;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  PromptManager.initialize();
});
