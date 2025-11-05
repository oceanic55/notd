// Navigation TypeScript Class
class Navigation {
    activeView= 'full';
    hoverView= null;

    pill;
    fullViewBtn;
    overviewBtn;

    constructor() {
        this.pill = document.getElementById('pill');
        this.fullViewBtn = document.getElementById('fullViewBtn');
        this.overviewBtn = document.getElementById('overviewBtn');

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Click events - toggle dropdown for ENTER button
        this.fullViewBtn.addEventListener('click', (e) => {
            console.log('Full view button clicked!');
            e.preventDefault();
            e.stopPropagation();
            
            // If already active, toggle dropdown immediately
            if (this.activeView === 'full') {
                this.toggleDropdown('dropdownList');
            } else {
                // Set as active and move pill, then toggle dropdown after delay
                this.setActiveView('full');
                setTimeout(() => {
                    this.toggleDropdown('dropdownList');
                }, 300);
            }
        });
        
        this.overviewBtn.addEventListener('click', (e) => {
            console.log('Overview button clicked!');
            e.preventDefault();
            e.stopPropagation();
            
            // If already active, toggle dropdown immediately
            if (this.activeView === 'overview') {
                this.toggleDropdown('overviewDropdownList');
            } else {
                // Set as active and move pill, then toggle dropdown after delay
                this.setActiveView('overview');
                setTimeout(() => {
                    this.toggleDropdown('overviewDropdownList');
                }, 300);
            }
        });

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

        // Keyboard navigation (Arrow keys)
        this.fullViewBtn.addEventListener('keydown', (e) => this.handleKeyboard(e, 'full'));
        this.overviewBtn.addEventListener('keydown', (e) => this.handleKeyboard(e, 'overview'));
    }

    toggleDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        console.log('Toggle dropdown called, dropdown element:', dropdown);
        if (dropdown) {
            const hasShow = dropdown.classList.contains('show');
            console.log('Current show state:', hasShow, 'Toggling to:', !hasShow);
            dropdown.classList.toggle('show');
            console.log('Classes after toggle:', dropdown.className);
        } else {
            console.error('Dropdown element not found!');
        }
    }

    setActiveView(view) {
        this.activeView = view;
        this.updateUI();
    }

    setHoverView(view) {
        console.log('Hover view set to:', view);
        this.hoverView = view;
        this.updateUI();
    }

    handleKeyboard(e, currentButton) {
        // Allow arrow key navigation between buttons
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
            // Close overview dropdown when switching to full view
            const overviewDropdown = document.getElementById('overviewDropdownList');
            if (overviewDropdown) {
                overviewDropdown.classList.remove('show');
            }
        } else {
            this.fullViewBtn.classList.remove('active');
            this.fullViewBtn.classList.add('inactive');
            this.overviewBtn.classList.remove('inactive');
            this.overviewBtn.classList.add('active');
            // Close full view dropdown when switching to overview
            const dropdown = document.getElementById('dropdownList');
            if (dropdown) {
                dropdown.classList.remove('show');
            }
        }
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing navigation...');
    const nav = new Navigation();
    console.log('Navigation initialized:', nav);
});
