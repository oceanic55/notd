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

        llmList.innerHTML = '<div class="llm-item">Loading models...</div>';

        try {
            const response = await fetch('https://api.groq.com/openai/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${window.LLMEntry?.apiKey || ''}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch models');
            }

            const data = await response.json();
            const models = data.data || [];

            llmList.innerHTML = '';

            if (models.length === 0) {
                llmList.innerHTML = '<div class="llm-item">No models available</div>';
                return;
            }

            // Sort models by ID
            models.sort((a, b) => a.id.localeCompare(b.id));

            // Display models as list items
            models.forEach(model => {
                const item = document.createElement('div');
                item.className = 'llm-item';
                item.textContent = model.id;
                item.dataset.modelId = model.id;

                // Highlight current model
                if (window.LLMEntry && model.id === window.LLMEntry.selectedModel) {
                    item.classList.add('selected');
                }

                // Click to select
                item.addEventListener('click', () => {
                    this.selectModel(model.id);
                });

                llmList.appendChild(item);
            });

        } catch (error) {
            console.error('Error loading models:', error);
            llmList.innerHTML = '<div class="llm-item">Error loading models. Check API key.</div>';
        }
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
