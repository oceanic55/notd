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
        
        // About button - open combined about form
        this.aboutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (this.activeView === 'overview') {
                this.openCombinedAbout();
            } else {
                this.setActiveView('overview');
                setTimeout(() => {
                    this.openCombinedAbout();
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



        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('dropdownList');
            
            if (dropdown && !this.fullViewBtn.contains(e.target)) {
                dropdown.classList.remove('show');
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

    openCombinedAbout() {
        const overlay = document.getElementById('combined-about-overlay');
        const form = document.getElementById('combined-about-form');
        
        if (overlay && form) {
            overlay.classList.add('active');
            form.classList.add('active');
            
            // Initialize the combined form content
            this.initializeCombinedAboutForm();
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
            const targetBtn = currentButton === 'full' ? this.aboutBtn : this.fullViewBtn;
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
            this.aboutBtn.classList.remove('active');
            this.aboutBtn.classList.add('inactive');
        } else {
            this.fullViewBtn.classList.remove('active');
            this.fullViewBtn.classList.add('inactive');
            this.aboutBtn.classList.remove('inactive');
            this.aboutBtn.classList.add('active');
            
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
