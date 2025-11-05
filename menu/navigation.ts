// Navigation TypeScript Class
class Navigation {
    private activeView: 'full' | 'overview' = 'full';
    private hoverView: 'full' | 'overview' | null = null;

    private pill: HTMLElement;
    private fullViewBtn: HTMLElement;
    private overviewBtn: HTMLElement;

    constructor() {
        this.pill = document.getElementById('pill')!;
        this.fullViewBtn = document.getElementById('fullViewBtn')!;
        this.overviewBtn = document.getElementById('overviewBtn')!;

        this.initializeEventListeners();
    }

    private initializeEventListeners(): void {
        // Click events
        this.fullViewBtn.addEventListener('click', () => this.setActiveView('full'));
        this.overviewBtn.addEventListener('click', () => this.setActiveView('overview'));

        // Hover events
        this.fullViewBtn.addEventListener('mouseenter', () => this.setHoverView('full'));
        this.fullViewBtn.addEventListener('mouseleave', () => this.setHoverView(null));
        this.overviewBtn.addEventListener('mouseenter', () => this.setHoverView('overview'));
        this.overviewBtn.addEventListener('mouseleave', () => this.setHoverView(null));

        // Keyboard navigation (Arrow keys)
        this.fullViewBtn.addEventListener('keydown', (e) => this.handleKeyboard(e, 'full'));
        this.overviewBtn.addEventListener('keydown', (e) => this.handleKeyboard(e, 'overview'));
    }

    private setActiveView(view: 'full' | 'overview'): void {
        this.activeView = view;
        this.updateUI();
    }

    private setHoverView(view: 'full' | 'overview' | null): void {
        this.hoverView = view;
        this.updateUI();
    }

    private handleKeyboard(e: KeyboardEvent, currentButton: 'full' | 'overview'): void {
        // Allow arrow key navigation between buttons
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const targetView = currentButton === 'full' ? 'overview' : 'full';
            const targetBtn = currentButton === 'full' ? this.overviewBtn : this.fullViewBtn;
            this.setActiveView(targetView);
            (targetBtn as HTMLElement).focus();
        }
    }

    private updateUI(): void {
        const currentView = this.hoverView || this.activeView;

        // Update pill position
        this.pill.className = `sliding-pill ${currentView}`;

        // Update button states
        if (currentView === 'full') {
            this.fullViewBtn.className = 'active';
            this.overviewBtn.className = 'inactive';
        } else {
            this.fullViewBtn.className = 'inactive';
            this.overviewBtn.className = 'active';
        }
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Navigation();
});
