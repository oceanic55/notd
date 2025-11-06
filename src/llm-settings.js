// LLM Settings Module - API and Model Selection

const LLMSettings = {
    initialize() {
        // Set up API settings form
        const apiSaveBtn = document.getElementById('api-save-btn');
        if (apiSaveBtn) {
            apiSaveBtn.addEventListener('click', () => this.saveAPIKey());
        }

        // Set up LLM close button
        const llmCloseBtn = document.getElementById('llm-close-btn');
        if (llmCloseBtn) {
            llmCloseBtn.addEventListener('click', () => this.closeLLMSelection());
        }

        // Close on overlay click
        const apiOverlay = document.getElementById('api-settings-overlay');
        if (apiOverlay) {
            apiOverlay.addEventListener('click', (e) => {
                if (e.target === apiOverlay) {
                    this.closeAPISettings();
                }
            });
        }

        const llmOverlay = document.getElementById('llm-selection-overlay');
        if (llmOverlay) {
            llmOverlay.addEventListener('click', (e) => {
                if (e.target === llmOverlay) {
                    this.closeLLMSelection();
                }
            });
        }

        // Prevent form container clicks from bubbling to overlay
        const apiForm = document.getElementById('api-settings-form');
        if (apiForm) {
            apiForm.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        const llmForm = document.getElementById('llm-selection-form');
        if (llmForm) {
            llmForm.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const apiForm = document.getElementById('api-settings-form');
                const llmForm = document.getElementById('llm-selection-form');
                
                if (apiForm && apiForm.classList.contains('active')) {
                    this.closeAPISettings();
                } else if (llmForm && llmForm.classList.contains('active')) {
                    this.closeLLMSelection();
                }
            }
        });
    },

    saveAPIKey() {
        const apiKeyInput = document.getElementById('api-key-input');
        const key = apiKeyInput ? apiKeyInput.value.trim() : '';

        if (key) {
            // Save to LLMEntry
            if (window.LLMEntry) {
                window.LLMEntry.apiKey = key;
                localStorage.setItem('groq_api_key', key);
            }
            this.closeAPISettings();
        } else {
            alert('Please enter an API key');
        }
    },

    closeAPISettings() {
        const overlay = document.getElementById('api-settings-overlay');
        const form = document.getElementById('api-settings-form');
        
        if (overlay) overlay.classList.remove('active');
        if (form) form.classList.remove('active');
    },

    async loadModels() {
        const llmList = document.getElementById('llm-list');
        if (!llmList) return;

        // Predefined list of allowed models
        const allowedModels = [
            'qwen/qwen3-32b',
            'groq/compound-mini',
            'llama-3.1-8b-instant',
            'llama-3.3-70b-versatile',
            'moonshotai/kimi-k2-instruct-0905'
        ];

        llmList.innerHTML = '';

        // Display models as list items
        allowedModels.forEach(modelId => {
            const item = document.createElement('div');
            item.className = 'llm-item';
            item.textContent = modelId;
            item.dataset.modelId = modelId;

            // Highlight current model
            if (window.LLMEntry && modelId === window.LLMEntry.selectedModel) {
                item.classList.add('selected');
            }

            // Click to select
            item.addEventListener('click', () => {
                this.selectModel(modelId);
            });

            llmList.appendChild(item);
        });
    },

    selectModel(modelId) {
        // Update LLMEntry
        if (window.LLMEntry) {
            window.LLMEntry.selectedModel = modelId;
            localStorage.setItem('groq_model', modelId);
        }

        // Update UI
        const items = document.querySelectorAll('.llm-item');
        items.forEach(item => {
            if (item.dataset.modelId === modelId) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    },

    closeLLMSelection() {
        const overlay = document.getElementById('llm-selection-overlay');
        const form = document.getElementById('llm-selection-form');
        
        if (overlay) overlay.classList.remove('active');
        if (form) form.classList.remove('active');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    LLMSettings.initialize();
});

// Export for use in other modules
window.LLMSettings = LLMSettings;
