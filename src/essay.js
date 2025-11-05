// Essay generation functionality for AI analysis

const EssayGenerator = {
    styleExamples: null, // Cache for loaded style examples

    /**
     * Initialize essay generator
     */
    initialize() {
        const aiEssayBtn = document.getElementById('ai-essay-btn');
        if (aiEssayBtn) {
            aiEssayBtn.addEventListener('click', () => this.handleEssayGeneration());
        }
        // Preload style examples
        this.loadStyleExamples();
    },

    /**
     * Load style examples from external file
     */
    async loadStyleExamples() {
        if (this.styleExamples) return this.styleExamples;

        try {
            const response = await fetch('src/essay-style-examples.txt');
            if (!response.ok) throw new Error('Failed to load style examples');
            this.styleExamples = await response.text();
            return this.styleExamples;
        } catch (error) {
            // Silently fallback to empty string if file can't be loaded (e.g., CORS when running from file://)
            this.styleExamples = '';
            return this.styleExamples;
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

                // Display essay with token info
                const statusLine = `Tokens used: ${essay.usage.totalTokens}<br>Model: ${window.LLMEntry.selectedModel}`;
                content.innerHTML = `${essay.text}\n\n<span style="color: #FF5100;">${statusLine}</span>`;
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

        // Load style examples from external file
        const styleExamples = await this.loadStyleExamples();

        // ============================================
        // ESSAY PROMPT - Edit src/essay-style-examples.txt to customize style examples
        // ============================================
        const essayPrompt = `Write **one cohesive paragraph** using **only the provided information**. Your response must adhere strictly to the following requirements:

- **Structure:** A single paragraph with **no line breaks** or sub-divisions.
- **Length:** Between **120 and 140 words** 
- **Content:** Use **exclusively** the details provided. Do **not** add, invent, or extrapolate any information, scenes, objects, or actions beyond what is explicitly stated.
- **Style:** Emulate the **tone, wit, and vividness** of the provided examples. Prioritize clarity, evocative phrasing, and dry humor, but avoid em dashes for asides or interruptions. Use standard punctuation (commas, semicolons, colons, parentheses) to maintain flow and coherence.
- **Language:** Rephrase the original details stylishly, but **never introduce new ideas** or embellishments. If the source mentions "tea in Kyoto," limit your discussion to tea in Kyoto—nothing more.
- **Originality:** Avoid repeating phrasing from the examples (e.g., "As I navigated the realms of"). Instead, assimilate the tone to craft fresh, equally expressive prose.

- adopt the following style for generating content:

1. **Narrative Voice**: Write in first-person perspective, as if recounting personal experiences or observations. Be conversational,
like chatting with a friend over a beer.

2. **Tone and Humor**: Infuse light-hearted humor through irony, exaggeration, and self-deprecation. Avoid heavy-handed jokes; let
absurdity shine through naturally. Balance humor with reflective insights.

3. **Structure**: Use episodic, anecdotal structure. Start with a hook (e.g., a vivid scene or ironic situation), digress into related
thoughts or stories, and tie back to the main point. Include cultural or historical context where relevant.

4. **Language**: Use vivid, descriptive language. Mix colloquialisms with precise terms. Vary sentence length for rhythm. Include
occasional strong language if it fits the tone, but keep it tasteful.

5. **Themes**: Explore contrasts (e.g., Western vs. island life), human quirks, and universal truths. End with a witty or poignant
observation.

6. **Length and Depth**: Aim for engaging, readable essays that entertain while informing. Avoid dryness; make it fun and insightful.

**Goal:** Deliver a paragraph that is **concise, expressive, and faithful** to the source material, while mirroring the stylistic flair of the examples.`;
        // ============================================

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.LLMEntry.apiKey}`
            },
            body: JSON.stringify({
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
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error?.message || 'API request failed';

            if (response.status === 429 || errorMessage.toLowerCase().includes('rate limit')) {
                throw new Error(`Rate limit reached for model "${window.LLMEntry.selectedModel}". Please try again later or switch to a different model.`);
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();
        const choice = data.choices[0];
        const essayText = choice?.message?.content;

        if (!essayText) {
            throw new Error('No response from API');
        }

        const usage = data.usage || {};

        return {
            text: essayText,
            usage: {
                promptTokens: usage.prompt_tokens || 0,
                completionTokens: usage.completion_tokens || 0,
                totalTokens: usage.total_tokens || 0
            }
        };
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    EssayGenerator.initialize();
});

// Export for use in main app
window.EssayGenerator = EssayGenerator;
