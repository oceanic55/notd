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
     * Load style examples from window global
     */
    async loadStyleExamples() {
        if (this.styleExamples) return this.styleExamples;

        // Get style examples from window global (loaded via script tag)
        if (window.ESSAY_STYLE_EXAMPLES) {
            this.styleExamples = window.ESSAY_STYLE_EXAMPLES;
        } else {
            console.warn('Essay style examples not loaded');
            this.styleExamples = '';
        }
        
        return this.styleExamples;
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

        // Load style examples from external file
        const styleExamples = await this.loadStyleExamples();
        
        // Use full style examples - they're essential for capturing the writing style
        const examplesText = styleExamples || '';

        // ============================================
        // ESSAY PROMPT - Edit src/essay-style-examples.js (window.ESSAY_STYLE_EXAMPLES) to customize style examples
        // ============================================
        const essayPrompt = `You are a skilled essayist. Study this style example carefully to understand the writing voice:

---BEGIN STYLE EXAMPLE---
${examplesText}
---END STYLE EXAMPLE---

Key techniques to emulate from this example:
- Sensory details (sounds, textures, visual imagery)
- Varied sentence rhythm (mix of short and long sentences)
- Concrete, specific imagery (not abstract descriptions)
- Evocative, precise language
- Light irony and dry humor where appropriate
- Building from small details to larger themes
- Direct, immediate language (avoid formulaic openings like "As I..." or "As I wander...")

Now, write **one cohesive paragraph** using **only the provided information**. Your response must adhere strictly to the following requirements:

1. **Structure:** A single paragraph with **no line breaks** or sub-divisions.

2. **Length:** Between **120 and 140 words**

3. **Content Fidelity:** Use **exclusively** the details provided in the analysis. Do **not** add, invent, or extrapolate any information, scenes, objects, or actions beyond what is explicitly stated.

4. **Style Emulation:** Mirror the **tone, rhythm, and sensory richness** of the style example above:
   - Use concrete sensory details (sounds, textures, visuals)
   - Vary sentence length for natural rhythm
   - Build from specific details to broader themes
   - Match the perspective of the source material (don't force first-person)
   - Use evocative, precise language (not flowery or abstract)
   - Include light irony or dry humor where it fits naturally
   - AVOID formulaic openings: NO "As I navigate...", "As I wander...", "As I explore..."
   - Start directly with the content, not with framing phrases

5. **Language:** Rephrase the analysis details stylishly, but **never introduce new ideas** or embellishments. If the analysis mentions "tea in Kyoto," limit your discussion to tea in Kyoto—nothing more.

6. **Originality:** Avoid copying phrases from the style example. Instead, absorb its techniques and voice to craft fresh, equally expressive prose.

7. **Punctuation:** Use standard punctuation (commas, semicolons, colons, parentheses) to maintain flow. Avoid em dashes for asides.

**Goal:** Transform the analysis into a paragraph that reads like the style example—sensory, rhythmic, and evocative—while remaining completely faithful to the source material.`;
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
if (window.NOTD_MODULES) window.NOTD_MODULES.EssayGenerator = EssayGenerator;
