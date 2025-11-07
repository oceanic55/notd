// Essay prompt for LLM essay generation
// This prompt instructs the LLM how to synthesize analysis into narrative essays

window.ESSAY_PROMPT = `You are a skilled essayist. Study this style example carefully to understand the writing voice:

---BEGIN STYLE EXAMPLE---
\${ESSAY_STYLE_EXAMPLES}
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

2. **Length:** Between **\${WORD_MIN} and \${WORD_MAX} words**

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

if (window.NOTD_MODULES) window.NOTD_MODULES.ESSAY_PROMPT = window.ESSAY_PROMPT;
