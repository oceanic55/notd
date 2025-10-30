# Prompt Testing Guide

## Quick Start

1. Open `test/test.html` in your browser
2. Click "LOAD JSON" and select your test data file
3. Click the "AI" button to run the analysis with the current prompt
4. Review the results

## Modifying the Analysis Prompt

The analysis prompt is in `testllm.js` at approximately line 450 in the `analyzeEntries()` method.

### Current Test Prompt

```javascript
content: '**TEST PROMPT - MODIFY THIS TO EXPERIMENT**\n\nAnalyze the provided entries and extract trends, concepts, and ideas in a concise manner, maximum 60 words. Format as: "Trends: [brief list]. Concepts: [brief list]. Ideas: [brief list]." Do not include thinking process, full reports, or extraneous content.'
```

### Prompt Modification Tips

1. **Be specific about format** - Tell the model exactly how to structure output
2. **Set character/word limits** - Prevents overly verbose responses
3. **Give examples** - Show the model what good output looks like
4. **Specify what to avoid** - Tell it what NOT to do
5. **Test iteratively** - Make small changes and test each one

### Example Improvements to Try

**Option 1: More structured output**
```
Analyze these diary entries and provide:
1. Top 3 trends (one line each)
2. Key concepts (comma-separated list)
3. One actionable insight

Keep total response under 100 words.
```

**Option 2: Focus on patterns**
```
Identify patterns across these entries:
- What activities are recurring?
- What locations appear most?
- What themes emerge?

Format: "Patterns: [list]. Themes: [list]." Max 50 words.
```

**Option 3: Temporal analysis**
```
Analyze the timeline of these entries:
- What's changing over time?
- What's consistent?
- What's emerging?

One paragraph, max 75 words.
```

## Testing Workflow

1. Edit the prompt in `testllm.js`
2. Save the file
3. Reload `test.html` in browser (Cmd+R / Ctrl+R)
4. Load your test JSON data
5. Click "AI" button
6. Review results
7. Iterate

## When You Find a Good Prompt

Once you've tested and refined a prompt that gives good results:

1. Document the prompt and why it works
2. Test it with multiple different datasets
3. When satisfied, update the production `src/llm.js` file
4. Test in production environment
5. Deploy

## Notes

- The test environment is completely isolated from production
- You can experiment freely without breaking anything
- Keep notes on what works and what doesn't
- Test with diverse datasets (short entries, long entries, different topics)
