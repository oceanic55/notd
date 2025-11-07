// Essay generation functionality for AI analysis

const EssayGenerator = {
    /**
     * Initialize essay generator
     */
    initialize() {
        const aiEssayBtn = document.getElementById('ai-essay-btn');
        if (aiEssayBtn) {
            aiEssayBtn.addEventListener('click', () => this.handleEssayGeneration());
        }
    },

    /**
     * Handle essay generation button click
     */
    async handleEssayGeneration() {
        // Check if LLMEntry is available and has the current analysis
        if (!window.LLMEntry || !window.LLMEntry.currentAnalysis) {
            alert('No analysis available. Please run AI analysis first.');
            return;
        }

        // Check for API key
        if (!window.LLMEntry.apiKey) {
            const hasKey = window.LLMEntry.promptForApiKey();
            if (!hasKey) return;
        }

        const essayBtn = document.getElementById('ai-essay-btn');

        if (essayBtn) {
            essayBtn.disabled = true;
            essayBtn.style.opacity = '0.5';
        }

        try {
            const essay = await this.generateEssay(window.LLMEntry.currentAnalysis);

            // Update the modal content with the essay
            const content = document.getElementById('ai-analysis-content');
            if (content) {
                // Store the essay as the new current analysis for copying
                window.LLMEntry.currentAnalysis = essay.text;

                // Display essay text only (no token info)
                content.textContent = essay.text;
            }
        } catch (error) {
            console.error('Essay generation error:', error);
            alert(`Error generating essay: ${error.message}`);
        } finally {
            if (essayBtn) {
                essayBtn.disabled = false;
                essayBtn.style.opacity = '1';
            }
        }
    },

    /**
     * Generate essay from analysis using Groq API
     */
    async generateEssay(analysisText) {
        if (!window.LLMEntry || !window.LLMEntry.apiKey) {
            throw new Error('API key not set');
        }

        // Get interpolated essay prompt from PromptManager
        const essayPrompt = window.PromptManager?.interpolateEssayPrompt() || window.ESSAY_PROMPT || 'Write a cohesive paragraph based on the analysis.';

        // Get configuration from PromptManager
        const config = window.PromptManager?.config || window.PROMPT_CONFIG;

        // Use LLM API abstraction
        const result = await window.LLMAPI.sendChatRequest({
            provider: 'groq',
            apiKey: window.LLMEntry.apiKey,
            model: window.LLMEntry.selectedModel,
            messages: [
                {
                    role: 'system',
                    content: essayPrompt
                },
                {
                    role: 'user',
                    content: analysisText
                }
            ],
            temperature: config.essay.temperature,
            maxTokens: config.essay.maxTokens
        });

        if (!result.text) {
            throw new Error('No response from API');
        }

        return {
            text: result.text,
            usage: result.usage
        };
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    EssayGenerator.initialize();
});

// Export for use in main app
window.EssayGenerator = EssayGenerator;
if (window.NOTD_MODULES) window.NOTD_MODULES.EssayGenerator = EssayGenerator;
