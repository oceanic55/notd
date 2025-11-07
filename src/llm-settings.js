// LLM Settings Module - Placeholder for future settings functionality
// Currently, LLM settings are managed through the combined-about form

const LLMSettings = {
    initialize() {
        // Reserved for future LLM-specific settings
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    LLMSettings.initialize();
});

// Export for use in other modules
window.LLMSettings = LLMSettings;
if (window.NOTD_MODULES) window.NOTD_MODULES.LLMSettings = LLMSettings;
