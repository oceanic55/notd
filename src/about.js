// About Module - Display app and file information

const AboutInfo = {
    initialize() {
        // Set up About close button
        const aboutCloseBtn = document.getElementById('about-close-btn');
        if (aboutCloseBtn) {
            aboutCloseBtn.addEventListener('click', () => this.closeAbout());
        }

        // Close on overlay click
        const aboutOverlay = document.getElementById('about-overlay');
        if (aboutOverlay) {
            aboutOverlay.addEventListener('click', (e) => {
                if (e.target === aboutOverlay) {
                    this.closeAbout();
                }
            });
        }

        // Prevent form container clicks from bubbling to overlay
        const aboutForm = document.getElementById('about-form');
        if (aboutForm) {
            aboutForm.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const aboutForm = document.getElementById('about-form');
                if (aboutForm && aboutForm.classList.contains('active')) {
                    this.closeAbout();
                }
            }
        });
    },

    updateInfo() {
        // Update entries count
        const entriesCount = document.getElementById('entries-count');
        if (entriesCount && window.StorageManager) {
            entriesCount.textContent = window.StorageManager.currentEntries.length;
        }

        // Update current filename
        const currentFilename = document.getElementById('current-filename');
        if (currentFilename && window.StorageManager) {
            currentFilename.textContent = window.StorageManager.currentFileName || 'None';
        }

        // Update JSON version (if available in loaded data)
        const jsonVersion = document.getElementById('json-version');
        if (jsonVersion) {
            const version = this.getJSONVersion();
            jsonVersion.textContent = version;
        }

        // Update app version from package.json or hardcoded
        const appVersion = document.getElementById('app-version');
        if (appVersion) {
            appVersion.textContent = '4.0.1';
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

    closeAbout() {
        const overlay = document.getElementById('about-overlay');
        const form = document.getElementById('about-form');
        
        if (overlay) overlay.classList.remove('active');
        if (form) form.classList.remove('active');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AboutInfo.initialize();
});

// Export for use in other modules
window.AboutInfo = AboutInfo;
