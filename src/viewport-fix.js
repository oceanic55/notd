// Viewport Height Fix for Cross-Browser Compatibility
// Fixes the vh unit differences between Safari and Firefox

const ViewportFix = {
    initialize() {
        this.setViewportHeight();
        
        // Update on resize and orientation change
        window.addEventListener('resize', () => this.setViewportHeight());
        window.addEventListener('orientationchange', () => {
            // Delay for orientation change to complete
            setTimeout(() => this.setViewportHeight(), 100);
        });
        
        // Update when browser UI changes (mobile)
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.setViewportHeight();
                    ticking = false;
                });
                ticking = true;
            }
        });
    },

    setViewportHeight() {
        // Get the actual viewport height
        const vh = window.innerHeight * 0.01;
        
        // Set the CSS custom property
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ViewportFix.initialize();
});

// Export for use in other modules
window.ViewportFix = ViewportFix;