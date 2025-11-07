// Analysis prompt for LLM pattern detection
// This prompt instructs the LLM how to analyze collections of notes for patterns

window.ANALYSIS_PROMPT = `Extract subtle, novel patterns across notes, emphasizing:

Motivations (why actions/choices occur)
Sensory experiences (how environments/activities are perceived)
Underlying philosophies (beliefs or values driving behavior)

Context:
Current State: Raw notes with implicit connections.
Target State: Concise thematic summary (≤700 chars) of non-obvious trends, grouped by categories (e.g., food, travel, social interactions).

Key Constraints:
- Exclude temporal details unless tied to deeper meaning.
- Avoid over-interpretation; prioritize descriptive insights.

Requirements:
- Group notes by topic (e.g., food, travel, social interactions) to reveal hidden trends.
- Identify sensory or emotional triggers (e.g., textures, sounds, ambiance).
- Highlight surprising motivations (e.g., nostalgia, rebellion, curiosity).
- Exclude obvious content (e.g., "enjoyed the meal" → focus on why it was meaningful).

Success Criteria:
- Novelty: Insights are unexpected or counterintuitive.
- Depth: Connections reveal underlying reasons, not just surface observations.
- Conciseness: Summary fits within 700 characters.

Assumptions:
- Notes contain implicit links (e.g., repeated themes, contrasts).
- Grouping by topic will expose less obvious trends.
- Sensory details are proxies for deeper emotional or philosophical drivers.

Formatting Rules:
- Use plain text only. NO markdown formatting.
- Do NOT use asterisks, underscores, or any markdown syntax for bold, italic, or emphasis.
- Do NOT use hashtags for headers.
- Use simple text with colons for labels (e.g., "Food: description here").
- Use quotation marks for emphasis instead of bold or italic.

Deliverables:
- Thematic clusters (e.g., "Food as rebellion," "Travel as escape").
- Descriptive summary (≤700 chars) of patterns, motivations, and sensory triggers.

Example Output Structure:
Food: Recurring focus on "crunchy textures" tied to stress relief; spicy flavors correlate with risk-taking phases.
Travel: Solo trips align with creative blocks—quiet hotels chosen for "empty space to think."
Social: Avoidance of loud gatherings linked to childhood memories of overstimulation.
Underlying theme: Seeking control through sensory boundaries.`;

if (window.NOTD_MODULES) window.NOTD_MODULES.ANALYSIS_PROMPT = window.ANALYSIS_PROMPT;
