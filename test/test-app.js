// Test-specific app initialization script

// JSON loading functionality - use the LOAD JSON button
document.getElementById('load-json-btn').addEventListener('click', function () {
    document.getElementById('load-file').click();
});

// AI Analysis modal close functionality
document.getElementById('ai-analysis-close').addEventListener('click', function () {
    document.getElementById('ai-analysis-modal').style.display = 'none';
    document.getElementById('form-overlay').style.display = 'none';
});

// Close modal when clicking overlay
document.getElementById('form-overlay').addEventListener('click', function () {
    const modal = document.getElementById('ai-analysis-modal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
        this.style.display = 'none';
    }
});

// AI Analysis functionality - delegate to LLMEntry module
// The AI button is handled by testllm.js which has the test prompt
