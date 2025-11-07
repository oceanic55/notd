// iOS Dynamic Type Support
// Detects and responds to iOS text size changes

const DynamicType = {
    initialize() {
        this.detectTextSize();
        this.setupListeners();
    },

    detectTextSize() {
        // Detect if user has large text enabled via media query
        const largeSizeQuery = window.matchMedia('(min-width: 0px) and (-webkit-min-device-pixel-ratio: 0)');
        
        // Try to detect iOS text size setting
        if (this.isIOS()) {
            // Create a test element to measure actual rendered size
            const testEl = document.createElement('div');
            testEl.style.cssText = 'position:absolute;left:-9999px;font:17px -apple-system-body;';
            testEl.textContent = 'Test';
            document.body.appendChild(testEl);
            
            const computedSize = parseFloat(window.getComputedStyle(testEl).fontSize);
            document.body.removeChild(testEl);
            
            // Apply size class based on detected size
            if (computedSize >= 28) {
                document.body.classList.add('text-size-xxxl');
            } else if (computedSize >= 22) {
                document.body.classList.add('text-size-xxl');
            } else if (computedSize >= 19) {
                document.body.classList.add('text-size-xl');
            }
        }
    },

    setupListeners() {
        // Listen for text size changes (iOS will trigger resize events)
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.detectTextSize();
            }, 300);
        });
        
        // Listen for accessibility preference changes
        if (window.matchMedia) {
            const prefersLargeText = window.matchMedia('(prefers-reduced-motion: no-preference)');
            if (prefersLargeText.addEventListener) {
                prefersLargeText.addEventListener('change', () => {
                    this.detectTextSize();
                });
            }
        }
    },

    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    DynamicType.initialize();
});

// Export for use in other modules
window.DynamicType = DynamicType;
if (window.NOTD_MODULES) window.NOTD_MODULES.DynamicType = DynamicType;
