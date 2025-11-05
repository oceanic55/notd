// Navigation functionality for NOTD*
// Adapted from menu/navigation.js with app-specific actions

class Navigation {
    constructor() {
        this.activeView = 'full';
        this.hoverView = null;
        
        this.pill = document.getElementById('pill');
        this.fullViewBtn = document.getElementById('fullViewBtn');
        this.overviewBtn = document.getElementById('overviewBtn');
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
            
            // Additional touch event for mobile devices
            if ('ontouchstart' in window) {
                this.logoBtn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleLogoClick(e);
                });
            }
        }

        // ENTER button - toggle dropdown
        this.fullViewBtn.addEventListener('click', (e) => {
            // Don't toggle if clicking on a dropdown item
            if (e.target.closest('li')) {
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            
            if (this.activeView === 'full') {
                this.toggleDropdown('dropdownList');
            } else {
                this.setActiveView('full');
                setTimeout(() => {
                    this.toggleDropdown('dropdownList');
                }, 300);
            }
        });
        
        // Overview button - toggle dropdown
        this.overviewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (this.activeView === 'overview') {
                this.toggleDropdown('overviewDropdownList');
            } else {
                this.setActiveView('overview');
                setTimeout(() => {
                    this.toggleDropdown('overviewDropdownList');
                }, 300);
            }
        });

        // Dropdown item clicks for ENTER dropdown
        const dropdownList = document.getElementById('dropdownList');
        if (dropdownList) {
            dropdownList.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const li = e.target.closest('li');
                if (li) {
                    const action = li.dataset.action;
                    // Close dropdown with ease-out transition
                    dropdownList.classList.remove('show');
                    // Execute action after a brief delay to allow dropdown to start closing
                    setTimeout(() => {
                        this.handleDropdownAction(action);
                        // Reset to initial state after action
                        setTimeout(() => {
                            this.setActiveView('full');
                        }, 100);
                    }, 50);
                }
            });
        }

        // Dropdown item clicks for Overview dropdown
        const overviewDropdownList = document.getElementById('overviewDropdownList');
        if (overviewDropdownList) {
            overviewDropdownList.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const li = e.target.closest('li');
                if (li) {
                    const action = li.dataset.action;
                    // Close dropdown with ease-out transition
                    overviewDropdownList.classList.remove('show');
                    // Execute action after a brief delay
                    setTimeout(() => {
                        this.handleOverviewAction(action);
                        // Reset to initial state after action
                        setTimeout(() => {
                            this.setActiveView('full');
                        }, 100);
                    }, 50);
                }
            });
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('dropdownList');
            const overviewDropdown = document.getElementById('overviewDropdownList');
            
            if (dropdown && !this.fullViewBtn.contains(e.target)) {
                dropdown.classList.remove('show');
            }
            if (overviewDropdown && !this.overviewBtn.contains(e.target)) {
                overviewDropdown.classList.remove('show');
            }
        });

        // Hover events - only on non-touch devices
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (!isTouchDevice) {
            this.fullViewBtn.addEventListener('mouseenter', () => this.setHoverView('full'));
            this.fullViewBtn.addEventListener('mouseleave', () => this.setHoverView(null));
            this.overviewBtn.addEventListener('mouseenter', () => this.setHoverView('overview'));
            this.overviewBtn.addEventListener('mouseleave', () => this.setHoverView(null));
        }

        // Keyboard navigation
        this.fullViewBtn.addEventListener('keydown', (e) => this.handleKeyboard(e, 'full'));
        this.overviewBtn.addEventListener('keydown', (e) => this.handleKeyboard(e, 'overview'));
    }

    handleLogoClick(event) {
        // Logo button opens the entry form
        this.openEntryForm(event);
    }

    handleDropdownAction(action) {
        switch (action) {
            case 'save':
                // Trigger SAVE functionality
                if (window.StorageManager) {
                    StorageManager.saveToFile();
                }
                break;
            case 'edit':
                // Enable EDIT mode
                if (window.EditMode) {
                    if (!EditMode.isActive) {
                        EditMode.toggle();
                    }
                }
                break;
            case 'copy':
                // Trigger COPY functionality
                if (window.App) {
                    App.handleCopyClick();
                }
                break;
            case 'ai-analyze':
                // Trigger AI ANALYZE functionality
                if (window.LLMEntry) {
                    LLMEntry.handleAIAnalyze();
                }
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    openEntryForm(event) {
        // Use the EntryForm module
        if (window.EntryForm) {
            window.EntryForm.openForm(event);
        }
    }

    handleOverviewAction(action) {
        switch (action) {
            case 'load':
                // Trigger file load (same as old NOTD* button)
                this.handleLoadFile();
                break;
            case 'api':
                // Open API settings form
                this.openAPISettings();
                break;
            case 'llm':
                // Open LLM selection form
                this.openLLMSelection();
                break;
            case 'about':
                // Open About form
                this.openAbout();
                break;
            default:
                console.log('Unknown overview action:', action);
        }
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
            
            // Clear footer timestamp
            StorageManager.clearFooterTimestamp();
        } else {
            // Trigger file load
            const loadFile = document.getElementById('load-file');
            if (loadFile) {
                loadFile.click();
            }
        }
    }

    openAPISettings() {
        const overlay = document.getElementById('api-settings-overlay');
        const form = document.getElementById('api-settings-form');
        
        if (overlay && form) {
            overlay.classList.add('active');
            form.classList.add('active');
            
            // Load current API key
            const apiKeyInput = document.getElementById('api-key-input');
            if (apiKeyInput && window.LLMEntry) {
                apiKeyInput.value = window.LLMEntry.apiKey || '';
                setTimeout(() => apiKeyInput.focus(), 100);
            }
        }
    }

    openLLMSelection() {
        const overlay = document.getElementById('llm-selection-overlay');
        const form = document.getElementById('llm-selection-form');
        
        if (overlay && form) {
            overlay.classList.add('active');
            form.classList.add('active');
            
            // Load LLM models
            if (window.LLMSettings) {
                window.LLMSettings.loadModels();
            }
        }
    }

    openAbout() {
        const overlay = document.getElementById('about-overlay');
        const form = document.getElementById('about-form');
        
        if (overlay && form) {
            overlay.classList.add('active');
            form.classList.add('active');
            
            // Update About information
            if (window.AboutInfo) {
                window.AboutInfo.updateInfo();
            }
        }
    }

    toggleDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            dropdown.classList.toggle('show');
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
            const targetView = currentButton === 'full' ? 'overview' : 'full';
            const targetBtn = currentButton === 'full' ? this.overviewBtn : this.fullViewBtn;
            this.setActiveView(targetView);
            targetBtn.focus();
        }
    }

    updateUI() {
        const currentView = this.hoverView || this.activeView;

        // Update pill position
        this.pill.className = `sliding-pill ${currentView}`;

        // Update button states
        if (currentView === 'full') {
            this.fullViewBtn.classList.remove('inactive');
            this.fullViewBtn.classList.add('active');
            this.overviewBtn.classList.remove('active');
            this.overviewBtn.classList.add('inactive');
            
            const overviewDropdown = document.getElementById('overviewDropdownList');
            if (overviewDropdown) {
                overviewDropdown.classList.remove('show');
            }
        } else {
            this.fullViewBtn.classList.remove('active');
            this.fullViewBtn.classList.add('inactive');
            this.overviewBtn.classList.remove('inactive');
            this.overviewBtn.classList.add('active');
            
            const dropdown = document.getElementById('dropdownList');
            if (dropdown) {
                dropdown.classList.remove('show');
            }
        }
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigationInstance = new Navigation();
});

// Export for use in other modules
window.Navigation = Navigation;
