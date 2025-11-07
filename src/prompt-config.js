// Prompt Configuration Module
// Centralized configuration for all prompt-related parameters

window.PROMPT_CONFIG = {
  // Essay generation settings
  essay: {
    wordMin: 120,
    wordMax: 140,
    mode: 'strict', // 'strict' | 'creative'
    temperature: 0.7,
    maxTokens: 500
  },
  
  // Analysis settings
  analysis: {
    temperature: 0.7,
    maxTokens: 250,
    maxCharacters: 700
  },
  
  // System prompt settings
  system: {
    temperature: 0.2,
    maxTokens: 300,
    reprocessTemperature: 0.5,
    reprocessMaxTokens: 500
  },
  
  // Validation settings
  validation: {
    enableFallbacks: true,
    logWarnings: true
  }
};

// Export for module registry
if (window.NOTD_MODULES) window.NOTD_MODULES.PROMPT_CONFIG = window.PROMPT_CONFIG;
