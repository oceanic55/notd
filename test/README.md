# Test Environment

This folder contains an isolated test environment for experimenting with prompt modifications without affecting production files.

## Files

- **test.html** - Test version of the main HTML file
- **testllm.js** - Test version of the LLM module (modify the analysis prompt here)
- **test-styles.css** - Minimal test-specific styles
- **test-edit.js** - Copy of edit functionality
- **test-swipe-delete.js** - Copy of swipe-delete functionality
- **test-diary.js** - Copy of diary core functionality
- **test-app.js** - Test-specific app initialization

## How to Use

1. Open `test.html` in your browser
2. Load a JSON file with test data
3. Click the "AI" button to test the analysis prompt
4. Modify the prompt in `testllm.js` (line ~450 in the `analyzeEntries` method)
5. Reload the page and test again

## Modifying the Analysis Prompt

The analysis prompt is located in `testllm.js` in the `analyzeEntries()` method:

```javascript
content: '**TEST PROMPT - MODIFY THIS TO EXPERIMENT**\n\nAnalyze the provided entries...'
```

Edit this prompt to experiment with different analysis approaches. The test environment is completely isolated from production files.

## Notes

- Changes here do NOT affect production files in `/src` or `/index.html`
- The test environment uses localStorage with key `diaryEntries` (different from production)
- All test files are prefixed with `test-` for easy identification
