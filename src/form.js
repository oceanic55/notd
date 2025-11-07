// Entry Form functionality
// Based on form/form.js with NOTD* integration

const EntryForm = {
    isOpen: false,

    initialize() {
        // Set up form overlay click to close
        const overlay = document.getElementById('form-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeForm();
                }
            });
        }

        // Prevent form container clicks from bubbling to overlay
        const form = document.getElementById('entry-form');
        if (form) {
            form.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Set up Process button
        const processBtn = document.getElementById('process-btn');
        if (processBtn) {
            processBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleProcess();
            });
        }

        // Set up Save button
        const saveBtn = document.getElementById('save-entry-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleSave();
            });
        }

        // Set up Close button
        const closeBtn = document.getElementById('entry-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeForm();
            });
        }

        // Set up auto-expand for textareas
        this.setupTextareaAutoExpand();

        // ESC key to close form
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeForm();
            }
        });
    },

    openForm(userEvent = null) {
        // Close any other open forms first
        this.closeOtherForms();
        
        const overlay = document.getElementById('form-overlay');
        const form = document.getElementById('entry-form');
        
        if (overlay && form) {
            overlay.classList.add('active');
            form.classList.add('active');
            this.isOpen = true;
            
            // Clear and reset the entry field
            const entryField = document.getElementById('entry-text-input');
            if (entryField) {
                entryField.value = '';
                entryField.style.height = '24px';
                entryField.style.overflowY = 'hidden';
                
                // Mobile-friendly focus - immediate focus within user event context
                if (userEvent) {
                    // Direct focus within the same event context for mobile compatibility
                    entryField.focus();
                    
                    // Additional mobile-specific triggers
                    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
                        // Multiple approaches for mobile focus
                        entryField.click();
                        entryField.setSelectionRange(0, 0);
                        
                        // Force focus with a synthetic touch event
                        const touchEvent = new TouchEvent('touchstart', {
                            bubbles: true,
                            cancelable: true,
                            touches: []
                        });
                        entryField.dispatchEvent(touchEvent);
                        
                        // Final fallback - ensure focus after a minimal delay
                        requestAnimationFrame(() => {
                            entryField.focus();
                            entryField.click();
                        });
                    }
                } else {
                    // Fallback for programmatic calls
                    entryField.focus();
                    requestAnimationFrame(() => {
                        entryField.focus();
                        setTimeout(() => entryField.focus(), 50);
                    });
                }
            }
            
            // Hide and clear the process field
            const processGroup = document.getElementById('process-group');
            const processField = document.getElementById('process-text-input');
            if (processGroup) {
                processGroup.style.display = 'none';
            }
            if (processField) {
                processField.value = '';
                processField.style.height = '24px';
                processField.style.overflowY = 'hidden';
            }
        }
    },

    closeForm() {
        const overlay = document.getElementById('form-overlay');
        const form = document.getElementById('entry-form');
        
        if (overlay && form) {
            overlay.classList.remove('active');
            form.classList.remove('active');
            this.isOpen = false;
            
            // Clear both textareas
            const entryField = document.getElementById('entry-text-input');
            const processField = document.getElementById('process-text-input');
            const processGroup = document.getElementById('process-group');
            
            if (entryField) {
                entryField.value = '';
                entryField.style.height = '24px';
                entryField.style.overflowY = 'hidden';
            }
            
            if (processField) {
                processField.value = '';
                processField.style.height = '24px';
                processField.style.overflowY = 'hidden';
            }
            
            if (processGroup) {
                processGroup.style.display = 'none';
            }
            
            // Clear stored result
            this.currentResult = null;
        }
    },

    async handleProcess() {
        const entryField = document.getElementById('entry-text-input');
        const message = entryField ? entryField.value : '';
        
        if (!message.trim()) {
            return; // Don't process if empty
        }

        // Check if LLM is available
        if (!window.LLMEntry || !window.LLMEntry.apiKey) {
            if (window.LLMEntry) {
                const hasKey = window.LLMEntry.promptForApiKey();
                if (!hasKey) return;
            } else {
                alert('LLM functionality not available');
                return;
            }
        }

        const processBtn = document.getElementById('process-btn');
        if (processBtn) {
            processBtn.textContent = 'Processing...';
            processBtn.disabled = true;
        }

        try {
            // Use LLM to process the text
            const result = await window.LLMEntry.processWithLLM(message);
            
            // Show the process field group
            const processGroup = document.getElementById('process-group');
            if (processGroup) {
                processGroup.style.display = 'flex';
            }
            
            // Format the processed result
            const processField = document.getElementById('process-text-input');
            if (processField) {
                processField.value = `Place: ${result.place}\nNote: ${result.note}`;
                
                // Auto-expand the process field
                if (window.Utils) {
                    window.Utils.autoExpandTextarea(processField);
                }
            }

            // Store the result for saving
            this.currentResult = result;

        } catch (error) {
            console.error('Processing error:', error);
            alert(`Error: ${error.message}\n\nPlease check your API key and try again.`);
            
            // Offer to re-enter API key if it's an auth issue
            if (error.message.includes('API') || error.message.includes('401')) {
                if (window.LLMEntry) {
                    window.LLMEntry.promptForApiKey(true);
                }
            }
        } finally {
            if (processBtn) {
                processBtn.textContent = 'Process';
                processBtn.disabled = false;
            }
        }
    },

    handleSave() {
        const entryField = document.getElementById('entry-text-input');
        const message = entryField ? entryField.value.trim() : '';
        
        // Check if there's any text to save
        if (!message && !this.currentResult) {
            alert('Please enter some text');
            return;
        }

        // Create entry with current date/time
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const year = String(now.getFullYear()).slice(-2);
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        let entry;
        
        if (this.currentResult) {
            // Save processed entry
            entry = {
                timestamp: `${month}/${day}/${year}`,
                time: `${hours}:${minutes}`,
                sender: this.currentResult.place,
                note: this.currentResult.note
            };
        } else {
            // Save unprocessed entry - use raw text as note, place as "Unknown"
            entry = {
                timestamp: `${month}/${day}/${year}`,
                time: `${hours}:${minutes}`,
                sender: 'Unknown',
                note: message
            };
        }

        // Save entry using StorageManager
        if (window.StorageManager) {
            StorageManager.saveEntry(entry);
        }

        // Display entry using DisplayManager
        if (window.DisplayManager && window.StorageManager) {
            DisplayManager.appendEntry(entry, StorageManager.currentEntries.length - 1);
        }

        // Close form
        this.closeForm();
        this.currentResult = null;
    },

    setupTextareaAutoExpand() {
        const entryField = document.getElementById('entry-text-input');
        const processField = document.getElementById('process-text-input');
        
        if (entryField && window.Utils) {
            entryField.addEventListener('input', () => {
                window.Utils.autoExpandTextarea(entryField);
            });
        }

        if (processField && window.Utils) {
            processField.addEventListener('input', () => {
                window.Utils.autoExpandTextarea(processField);
            });
        }
    },

    closeOtherForms() {
        // Close ABOUT form
        const aboutOverlay = document.getElementById('combined-about-overlay');
        const aboutForm = document.getElementById('combined-about-form');
        if (aboutOverlay) aboutOverlay.classList.remove('active');
        if (aboutForm) aboutForm.classList.remove('active');

        // Close edit form
        const editOverlay = document.getElementById('edit-form-overlay');
        const editForm = document.getElementById('edit-entry-form');
        if (editOverlay) editOverlay.classList.remove('active');
        if (editForm) editForm.classList.remove('active');

        // Close AI analysis modal
        const aiOverlay = document.getElementById('ai-analysis-modal-overlay');
        const aiModal = document.getElementById('ai-analysis-modal');
        if (aiOverlay) aiOverlay.classList.remove('active');
        if (aiModal) aiModal.classList.remove('active');
    },

    // Removed: autoExpandTextarea - now in src/utils.js
};


// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    EntryForm.initialize();
});

// Export for use in other modules
window.EntryForm = EntryForm;
if (window.NOTD_MODULES) window.NOTD_MODULES.EntryForm = EntryForm;
