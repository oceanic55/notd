// Swipe-to-edit functionality
// Version: 2.0.0 - Changed from delete to edit functionality

class SwipeEditHandler {
    constructor() {
        this.startX = 0;
        this.currentX = 0;
        this.isDragging = false;
        this.currentElement = null;
        this.editThreshold = -80; // Swipe distance to trigger edit
    }

    init() {
        const container = document.getElementById('entries-container');
        if (!container) return;

        // Use event delegation
        container.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        container.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        container.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Mouse events for desktop testing
        container.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        container.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        container.addEventListener('mouseup', (e) => this.handleMouseEnd(e));
        container.addEventListener('mouseleave', (e) => this.handleMouseEnd(e));

        // Handle edit button clicks
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-button')) {
                const wrapper = e.target.closest('.message-wrapper');
                if (wrapper) {
                    const index = parseInt(wrapper.dataset.index);
                    this.handleEdit(index);
                }
            }
        });
    }

    handleTouchStart(e) {
        const message = e.target.closest('.message');
        if (!message) return;

        // Don't allow swipe in edit mode
        if (EditMode && EditMode.isActive) return;

        this.startX = e.touches[0].clientX;
        this.currentX = this.startX;
        this.isDragging = true;
        this.currentElement = message;
        message.classList.add('swiping');
    }

    handleTouchMove(e) {
        if (!this.isDragging || !this.currentElement) return;

        this.currentX = e.touches[0].clientX;
        const deltaX = this.currentX - this.startX;

        // Only allow left swipe
        if (deltaX < 0) {
            e.preventDefault();
            const translateX = Math.max(deltaX, this.editThreshold);
            this.currentElement.style.transform = `translateX(${translateX}px)`;

            // Show edit button when swiped enough
            const editBtn = this.currentElement.parentElement.querySelector('.delete-button');
            if (editBtn) {
                if (translateX <= this.editThreshold) {
                    editBtn.classList.add('visible');
                } else {
                    editBtn.classList.remove('visible');
                }
            }
        }
    }

    handleTouchEnd(e) {
        if (!this.isDragging || !this.currentElement) return;

        const deltaX = this.currentX - this.startX;
        this.currentElement.classList.remove('swiping');

        if (deltaX <= this.editThreshold) {
            // Launch edit mode directly instead of keeping swiped open
            const wrapper = this.currentElement.parentElement;
            if (wrapper) {
                const index = parseInt(wrapper.dataset.index);
                this.handleEdit(index);
            }
            // Reset position
            this.currentElement.style.transform = 'translateX(0)';
            const editBtn = this.currentElement.parentElement.querySelector('.delete-button');
            if (editBtn) {
                editBtn.classList.remove('visible');
            }
        } else {
            // Snap back
            this.currentElement.style.transform = 'translateX(0)';
            const editBtn = this.currentElement.parentElement.querySelector('.delete-button');
            if (editBtn) {
                editBtn.classList.remove('visible');
            }
        }

        this.isDragging = false;
        this.currentElement = null;
    }

    // Mouse handlers for desktop testing
    handleMouseDown(e) {
        const message = e.target.closest('.message');
        if (!message) return;

        // Don't allow swipe in edit mode
        if (EditMode && EditMode.isActive) return;

        // Don't start drag if clicking on a link
        if (e.target.classList.contains('note-link')) return;

        this.startX = e.clientX;
        this.currentX = this.startX;
        this.isDragging = true;
        this.currentElement = message;
        message.classList.add('swiping');
        e.preventDefault();
    }

    handleMouseMove(e) {
        if (!this.isDragging || !this.currentElement) return;

        this.currentX = e.clientX;
        const deltaX = this.currentX - this.startX;

        // Only allow left swipe
        if (deltaX < 0) {
            const translateX = Math.max(deltaX, this.editThreshold);
            this.currentElement.style.transform = `translateX(${translateX}px)`;

            // Show edit button when swiped enough
            const editBtn = this.currentElement.parentElement.querySelector('.delete-button');
            if (editBtn) {
                if (translateX <= this.editThreshold) {
                    editBtn.classList.add('visible');
                } else {
                    editBtn.classList.remove('visible');
                }
            }
        }
    }

    handleMouseEnd(e) {
        if (!this.isDragging || !this.currentElement) return;

        const deltaX = this.currentX - this.startX;
        this.currentElement.classList.remove('swiping');

        if (deltaX <= this.editThreshold) {
            // Launch edit mode directly instead of keeping swiped open
            const wrapper = this.currentElement.parentElement;
            if (wrapper) {
                const index = parseInt(wrapper.dataset.index);
                this.handleEdit(index);
            }
            // Reset position
            this.currentElement.style.transform = 'translateX(0)';
            const editBtn = this.currentElement.parentElement.querySelector('.delete-button');
            if (editBtn) {
                editBtn.classList.remove('visible');
            }
        } else {
            // Snap back
            this.currentElement.style.transform = 'translateX(0)';
            const editBtn = this.currentElement.parentElement.querySelector('.delete-button');
            if (editBtn) {
                editBtn.classList.remove('visible');
            }
        }

        this.isDragging = false;
        this.currentElement = null;
    }

    resetSwipe(message) {
        if (message) {
            message.style.transform = 'translateX(0)';
            const editBtn = message.parentElement.querySelector('.delete-button');
            if (editBtn) {
                editBtn.classList.remove('visible');
            }
        }
    }

    handleEdit(index) {
        // Enable edit mode if not already active
        if (window.EditMode && !EditMode.isActive) {
            EditMode.toggle();
        }
        
        // Launch edit dialog for the specific entry
        if (window.EditMode) {
            EditMode.handleEntryClick(index);
        }
    }
}

// Initialize swipe handler
window.SwipeEditHandler = SwipeEditHandler;
// Keep old name for backward compatibility
window.SwipeDeleteHandler = SwipeEditHandler;
if (window.NOTD_MODULES) {
    window.NOTD_MODULES.SwipeEditHandler = SwipeEditHandler;
    window.NOTD_MODULES.SwipeDeleteHandler = SwipeEditHandler;
}
