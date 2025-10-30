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

        // ============================================
        // ESSAY PROMPT - Edit this section to customize essay generation
        // ============================================
        const essayPrompt = `Write ONE SINGLE PARAGRAPH ONLY using STRICTLY AND EXCLUSIVELY the information provided. Your response must be exactly one paragraph with NO line breaks, NO multiple paragraphs, and a maximum of 600 characters.

CRITICAL REQUIREMENTS:
- ONE PARAGRAPH ONLY (no line breaks or paragraph breaks)
- Maximum 600 characters total
- Use ONLY the exact information provided - DO NOT ADD ANY NEW DETAILS
- DO NOT invent people, objects, actions, or scenes not explicitly mentioned
- DO NOT extrapolate, embellish, or imagine beyond what is given
- DO NOT add descriptive details that were not in the original content
- If the content says "tea in Kyoto" - write ONLY about tea in Kyoto, NOT about businessmen, noodles, or anything else not mentioned
- STICK TO THE FACTS GIVEN - rephrase them with style, but add NOTHING new

Maintain the same tone, language choices, style, and attitude as the following examples. Your answer should be personal and evocative, marked by vivid observations and dry wit. Organize the details clearly, preserve the original perspective, and ensure the paragraph is concise yet expressive in the manner shown here:

"One day, I moved with my girlfriend Sylvia to an atoll in the Equatorial Pacific. The atoll was called Tarawa, and should a devout believer in a flat earth ever alight upon its meager shore, he (or she) would have to accept that he (or she) had reached the end of the world. Even cartographers relegate Tarawa either to the abyss of the crease or to the far periphery of the map, assigning to the island a kindly dot that still manages to greatly exaggerate its size. At the time, I could think of no better destination than this heat-blasted sliver of coral. Tarawa was the end of the world, and for two years it became the center of mine."

and,

"The thing about flying from a place like Washington, D.C., to an island like Tarawa is that, despite the interminable tedium of the journey, there really isn't sufficient time to make a smooth transition. And I am a transition person. I need those interludes of adjustment. I need coffee, a transition mechanism, to help me adjust from the comatose to, if nothing more, consciousness. I need Pennsylvania, a transition state, to adjust from the Mid-Atlantic to New England. But flying from the heart of the free world to the end of the world offers no satisfying transitional process."

and

"We were expected to arrive at the airport two hours before our flight, which seemed inexplicable to me. It isn't as if Majuro International Airport receives a lot of air traffic requiring complex organizational procedures to ensure that passengers and baggage arrive and depart as intended. It has one runway built upon a reef. It has one single-story dilapidated building that contains customs and immigration and a hole in the wall for baggage to be tossed through."

and

"Being a data-entry clerk, even though I was very, very good, just didn't compare to being an incompetent war correspondent. In Washington, I never quite knew what my ambitions were. I sensed that I should move on from waiting tables and housepainting and temping and clerking, but the idea of working in an office and doing office-type work in a committed fashion seemed like a quiet little death to me."

Try not to repeat previously digested phrases such as "As I navigated the realms of" but instead assimilate the tone in order to generate new ways to express. Use this model closely for tone, structure, and style.

REMEMBER: ONE PARAGRAPH ONLY, maximum 600 characters.`;
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
