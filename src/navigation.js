// Navigation functionality for NOTD*
// Adapted from menu/navigation.js with app-specific actions

class Navigation {
    constructor() {
        this.activeView = 'full';
        this.hoverView = null;
        
        this.pill = document.getElementById('pill');
        this.fullViewBtn = document.getElementById('fullViewBtn');
        this.aboutBtn = document.getElementById('aboutBtn');
        this.logoBtn = document.getElementById('logo-btn');
        

        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Logo button - opens entry form
        if (this.logoBtn) {
            this.logoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleLogoClick(e);
            });
            
            // Also handle clicks on the image inside the button
            const logoImg = this.logoBtn.querySelector('img');
            if (logoImg) {
                logoImg.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleLogoClick(e);
                });
            }
            
            // Additional touch event for mobile devices
            if ('ontouchstart' in window) {
                this.logoBtn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleLogoClick(e);
                });
            }
        }

        // LLM button - toggle AI analysis modal
        this.fullViewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Check if the AI modal is currently open
            const aiOverlay = document.getElementById('ai-analysis-modal-overlay');
            const isAIOpen = aiOverlay && aiOverlay.classList.contains('active');
            
            if (isAIOpen) {
                // Close the AI modal
                if (window.LLMEntry) {
                    window.LLMEntry.closeAnalysisModal();
                }
            } else {
                // Open/trigger AI analysis
                if (this.activeView === 'full') {
                    this.handleLLMClick();
                } else {
                    this.closeAllForms();
                    this.setActiveView('full');
                    setTimeout(() => {
                        this.handleLLMClick();
                    }, 300);
                }
            }
        });
        
        // About button - toggle combined about form
        this.aboutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Check if the about form is currently open
            const aboutOverlay = document.getElementById('combined-about-overlay');
            const isAboutOpen = aboutOverlay && aboutOverlay.classList.contains('active');
            
            if (isAboutOpen) {
                // Close the about form
                this.closeCombinedAbout();
            } else {
                // Open the about form
                if (this.activeView === 'overview') {
                    this.openCombinedAbout();
                } else {
                    this.setActiveView('overview');
                    setTimeout(() => {
                        this.openCombinedAbout();
                    }, 300);
                }
            }
        });



        // Hover events - only on non-touch devices
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (!isTouchDevice) {
            this.fullViewBtn.addEventListener('mouseenter', () => this.setHoverView('full'));
            this.fullViewBtn.addEventListener('mouseleave', () => this.setHoverView(null));
            this.aboutBtn.addEventListener('mouseenter', () => this.setHoverView('overview'));
            this.aboutBtn.addEventListener('mouseleave', () => this.setHoverView(null));
        }

        // Keyboard navigation
        this.fullViewBtn.addEventListener('keydown', (e) => this.handleKeyboard(e, 'full'));
        this.aboutBtn.addEventListener('keydown', (e) => this.handleKeyboard(e, 'overview'));
    }

    handleLogoClick(event) {
        // Logo button opens the entry form
        // The EntryForm.openForm() method will handle closing other forms
        this.openEntryForm(event);
    }

    handleLLMClick() {
        // Close any open forms before executing action
        this.closeAllForms();
        
        // Trigger AI ANALYZE functionality
        if (window.LLMEntry) {
            LLMEntry.handleAIAnalyze();
        }
    }

    openEntryForm(event) {
        // Use the EntryForm module (should be available since we waited for it during initialization)
        if (window.EntryForm) {
            window.EntryForm.openForm(event);
        } else {
            console.error('EntryForm module not available! This should not happen.');
            alert('Error: Entry form module not loaded. Please refresh the page.');
        }
    }

    openCombinedAbout() {
        // Close any other open forms first
        this.closeAllForms();
        
        const overlay = document.getElementById('combined-about-overlay');
        const form = document.getElementById('combined-about-form');
        
        if (overlay && form) {
            overlay.classList.add('active');
            form.classList.add('active');
            
            // Initialize the combined form content
            this.initializeCombinedAboutForm();
        }
    }

    closeCombinedAbout() {
        const overlay = document.getElementById('combined-about-overlay');
        const form = document.getElementById('combined-about-form');
        
        if (overlay) overlay.classList.remove('active');
        if (form) form.classList.remove('active');
    }

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
        } else {
            // Trigger file load
            const loadFile = document.getElementById('load-file');
            if (loadFile) {
                loadFile.click();
            }
        }
    }

    initializeCombinedAboutForm() {
        // Load LLM models
        if (window.CombinedAboutForm) {
            window.CombinedAboutForm.loadModels();
        }
        
        // Update About information
        if (window.CombinedAboutForm) {
            window.CombinedAboutForm.updateAboutInfo();
        }
    }

    setActiveView(view) {
        this.activeView = view;
        this.updateUI();
    }

    setHoverView(view) {
        this.hoverView = view;
        this.updateUI();
    }

    handleKeyboard(e, currentButton) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            // Close any open forms when navigating with keyboard
            this.closeAllForms();
            const targetView = currentButton === 'full' ? 'overview' : 'full';
            const targetBtn = currentButton === 'full' ? this.aboutBtn : this.fullViewBtn;
            this.setActiveView(targetView);
            targetBtn.focus();
        }
    }

    closeAllForms() {
        // Close entry form
        const entryOverlay = document.getElementById('form-overlay');
        const entryForm = document.getElementById('entry-form');
        if (entryOverlay) entryOverlay.classList.remove('active');
        if (entryForm) entryForm.classList.remove('active');
        if (window.EntryForm) window.EntryForm.isOpen = false;

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
    }

    updateUI() {
        const currentView = this.hoverView || this.activeView;

        // Update pill position
        this.pill.className = `sliding-pill ${currentView}`;

        // Update button states
        if (currentView === 'full') {
            this.fullViewBtn.classList.remove('inactive');
            this.fullViewBtn.classList.add('active');
            this.aboutBtn.classList.remove('active');
            this.aboutBtn.classList.add('inactive');
        } else {
            this.fullViewBtn.classList.remove('active');
            this.fullViewBtn.classList.add('inactive');
            this.aboutBtn.classList.remove('inactive');
            this.aboutBtn.classList.add('active');
        }
    }
}

// Function to wait for EntryForm to be available
function waitForEntryForm(callback, maxAttempts = 50) {
    let attempts = 0;
    const checkInterval = setInterval(() => {
        attempts++;
        if (window.EntryForm) {
            clearInterval(checkInterval);
            callback();
        } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            console.error('EntryForm module not found after', maxAttempts, 'attempts');
            callback(); // Initialize anyway, but with warning
        }
    }, 10); // Check every 10ms
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for EntryForm to be available before initializing
    waitForEntryForm(() => {
        window.navigationInstance = new Navigation();
    });
});

// Export for use in other modules
window.Navigation = Navigation;
