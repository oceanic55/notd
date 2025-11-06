// Combined About Form Module - Handles Load, API, LLM, and About functionality

const CombinedAboutForm = {
    initialize() {
        // Set up Load button
        const loadBtn = document.getElementById('combined-load-btn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.handleLoadFile());
        }

        // Set up API button
        const apiBtn = document.getElementById('combined-api-btn');
        if (apiBtn) {
            apiBtn.addEventListener('click', () => this.showAPIEntry());
        }

        // Set up SAVE button
        const saveBtn = document.getElementById('combined-save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handleSave());
        }

        // Set up COPY button
        const copyBtn = document.getElementById('combined-copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.handleCopy());
        }

        // Set up API entry close button
        const apiCloseBtn = document.getElementById('api-entry-close-btn');
        if (apiCloseBtn) {
            apiCloseBtn.addEventListener('click', () => this.hideAPIEntry());
        }

        // Set up file input listener to close form after loading
        const loadFileInput = document.getElementById('load-file');
        if (loadFileInput) {
            loadFileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    // File was selected, close the form after a brief delay to allow processing
                    setTimeout(() => {
                        this.closeCombinedAbout();
                    }, 500);
                }
            });
        }

        // Set up API key input
        const apiKeyInput = document.getElementById('combined-api-key-input');
        if (apiKeyInput) {
            apiKeyInput.addEventListener('input', () => this.handleAPIKeyChange());
            apiKeyInput.addEventListener('blur', () => this.saveAPIKey());
        }

        // Close on overlay click
        const overlay = document.getElementById('combined-about-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeCombinedAbout();
                }
            });
        }

        // Prevent form container clicks from bubbling to overlay
        const form = document.getElementById('combined-about-form');
        if (form) {
            form.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const form = document.getElementById('combined-about-form');
                if (form && form.classList.contains('active')) {
                    this.closeCombinedAbout();
                }
            }
        });
    },

    handleLoadFile() {
        const hasEntries = StorageManager.currentEntries.length > 0;
        
        if (hasEntries) {
            // Unload current file
            StorageManager.currentEntries = [];
            StorageManager.currentFileName = null;
            DisplayManager.clearDisplay();
            
            // Clear localStorage
            localStorage.removeItem('diary_entries');
            localStorage.removeItem('diary_filename');
            localStorage.removeItem('diary_timestamp');
            
            // Update the about info
            this.updateAboutInfo();
        }
        
        // Always trigger file load (whether we just unloaded or not)
        const loadFile = document.getElementById('load-file');
        if (loadFile) {
            loadFile.click();
        }
    },

    showAPIEntry() {
        const apiOverlay = document.getElementById('api-entry-overlay');
        const llmSection = document.getElementById('llm-section');
        const aboutSection = document.getElementById('about-section');
        
        if (apiOverlay) {
            apiOverlay.style.display = 'block';
            
            // Hide other sections
            if (llmSection) llmSection.style.display = 'none';
            if (aboutSection) aboutSection.style.display = 'none';
            
            // Load current API key and focus
            const apiKeyInput = document.getElementById('combined-api-key-input');
            if (apiKeyInput) {
                if (window.LLMEntry && window.LLMEntry.apiKey) {
                    const fullKey = window.LLMEntry.apiKey;
                    // Show truncated version for mobile/small screens
                    if (window.innerWidth <= 768 && fullKey.length > 8) {
                        apiKeyInput.value = '...' + fullKey.slice(-4);
                        apiKeyInput.dataset.fullKey = fullKey;
                    } else {
                        apiKeyInput.value = fullKey;
                        apiKeyInput.dataset.fullKey = fullKey;
                    }
                } else {
                    apiKeyInput.value = '';
                }
                setTimeout(() => apiKeyInput.focus(), 100);
            }
        }
    },

    hideAPIEntry() {
        const apiOverlay = document.getElementById('api-entry-overlay');
        const llmSection = document.getElementById('llm-section');
        const aboutSection = document.getElementById('about-section');
        
        if (apiOverlay) {
            apiOverlay.style.display = 'none';
            
            // Show other sections
            if (llmSection) llmSection.style.display = 'block';
            if (aboutSection) aboutSection.style.display = 'block';
        }
    },

    handleSave() {
        // Trigger SAVE functionality
        if (window.StorageManager) {
            StorageManager.saveToFile();
        }
    },

    async handleCopy() {
        // Trigger COPY functionality with proper button reference
        const entries = window.StorageManager ? window.StorageManager.getEntries() : [];

        if (!entries || entries.length === 0) {
            alert('No entries to copy. Please load a file first.');
            return;
        }

        // Convert entries to text format with timestamps
        const entriesText = entries.map(entry => {
            const timestamp = entry.timestamp || '';
            const time = entry.time || '';
            const place = entry.sender || 'Unknown';
            const note = entry.note || '';
            return `${timestamp} ${time} - ${place}: ${note}`;
        }).join('\n');

        try {
            // Copy to clipboard
            await navigator.clipboard.writeText(entriesText);
            
            // Visual feedback on the combined-copy-btn
            const copyBtn = document.getElementById('combined-copy-btn');
            if (copyBtn) {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'COPIED!';
                copyBtn.style.backgroundColor = '#10b981';
                copyBtn.style.borderColor = '#10b981';
                
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.backgroundColor = '';
                    copyBtn.style.borderColor = '';
                }, 1500);
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            alert('Failed to copy to clipboard. Please try again.');
        }
    },



    handleAPIKeyChange() {
        const apiKeyInput = document.getElementById('combined-api-key-input');
        if (apiKeyInput && window.LLMEntry) {
            // If user is editing and it starts with "...", expand to full key for editing
            if (apiKeyInput.value.startsWith('...') && apiKeyInput.dataset.fullKey) {
                apiKeyInput.value = apiKeyInput.dataset.fullKey;
                // Position cursor at the end
                setTimeout(() => {
                    apiKeyInput.setSelectionRange(apiKeyInput.value.length, apiKeyInput.value.length);
                }, 0);
            }
            window.LLMEntry.apiKey = apiKeyInput.value;
        }
    },

    saveAPIKey() {
        const apiKeyInput = document.getElementById('combined-api-key-input');
        if (apiKeyInput && window.LLMEntry) {
            // Always save the full key
            const keyToSave = apiKeyInput.value.startsWith('...') && apiKeyInput.dataset.fullKey 
                ? apiKeyInput.dataset.fullKey 
                : apiKeyInput.value;
            
            window.LLMEntry.apiKey = keyToSave;
            localStorage.setItem('llm_api_key', keyToSave);
        }
    },

    loadModels() {
        const llmList = document.getElementById('combined-llm-list');
        if (!llmList) return;

        // Clear existing models
        llmList.innerHTML = '';

        // Groq API models as specified
        const groqModels = [
            { id: 'qwen/qwen3-32b', name: 'Qwen 3 32B' },
            { id: 'groq/compound-mini', name: 'Compound Mini' },
            { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' },
            { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile' },
            { id: 'moonshotai/kimi-k2-instruct-0905', name: 'Kimi K2 Instruct' }
        ];
        
        groqModels.forEach(model => {
            const modelItem = document.createElement('div');
            modelItem.className = 'llm-item';
            modelItem.textContent = model.name;
            modelItem.dataset.modelId = model.id;
            
            // Check if this is the selected model
            if (window.LLMEntry && window.LLMEntry.selectedModel === model.id) {
                modelItem.classList.add('selected');
            }
            
            modelItem.addEventListener('click', () => {
                // Remove selected class from all items
                llmList.querySelectorAll('.llm-item').forEach(item => {
                    item.classList.remove('selected');
                });
                
                // Add selected class to clicked item
                modelItem.classList.add('selected');
                
                // Update selected model
                if (window.LLMEntry) {
                    window.LLMEntry.selectedModel = model.id;
                    localStorage.setItem('selected_llm_model', model.id);
                }
            });
            
            llmList.appendChild(modelItem);
        });
    },

    updateAboutInfo() {
        // Update entries count
        const entriesCount = document.getElementById('combined-entries-count');
        if (entriesCount && window.StorageManager) {
            entriesCount.textContent = window.StorageManager.currentEntries.length;
        }

        // Update current filename
        const currentFilename = document.getElementById('combined-current-filename');
        if (currentFilename && window.StorageManager) {
            currentFilename.textContent = window.StorageManager.currentFileName || 'None';
        }

        // Update JSON version (if available in loaded data)
        const jsonVersion = document.getElementById('combined-json-version');
        if (jsonVersion) {
            const version = this.getJSONVersion();
            jsonVersion.textContent = version;
        }

        // Update app version
        const appVersion = document.getElementById('combined-app-version');
        if (appVersion) {
            appVersion.textContent = '4.5.0';
        }
    },

    getJSONVersion() {
        // Check if there's a loaded file
        if (window.StorageManager && window.StorageManager.currentEntries.length > 0) {
            // Get the lastSaved timestamp from localStorage
            const timestamp = localStorage.getItem('diary_timestamp');
            if (timestamp) {
                // Format from "MM-DD-HH-MM" to "MM|DD::HH:MM"
                const parts = timestamp.split('-');
                if (parts.length === 4) {
                    return `${parts[0]}|${parts[1]}::${parts[2]}:${parts[3]}`;
                }
                return timestamp; // Return as-is if format is unexpected
            }
            return 'Not loaded'; // No timestamp available
        }
        return 'Not loaded';
    },

    closeCombinedAbout() {
        const overlay = document.getElementById('combined-about-overlay');
        const form = document.getElementById('combined-about-form');
        
        if (overlay) overlay.classList.remove('active');
        if (form) form.classList.remove('active');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    CombinedAboutForm.initialize();
});

// Export for use in other modules
window.CombinedAboutForm = CombinedAboutForm;