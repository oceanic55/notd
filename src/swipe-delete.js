// Swipe-to-delete functionality
// Version: 1.0.0

class SwipeDeleteHandler {
    constructor() {
        this.startX = 0;
        this.currentX = 0;
        this.isDragging = false;
        this.currentElement = null;
        this.deleteThreshold = -80; // Swipe distance to show delete
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

        // Handle delete button clicks
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-button')) {
                const wrapper = e.target.closest('.message-wrapper');
                if (wrapper) {
                    const index = parseInt(wrapper.dataset.index);
                    this.handleDelete(index);
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
            const translateX = Math.max(deltaX, this.deleteThreshold);
            this.currentElement.style.transform = `translateX(${translateX}px)`;

            // Show delete button when swiped enough
            const deleteBtn = this.currentElement.parentElement.querySelector('.delete-button');
            if (deleteBtn) {
                if (translateX <= this.deleteThreshold) {
                    deleteBtn.classList.add('visible');
                } else {
                    deleteBtn.classList.remove('visible');
                }
            }
        }
    }

    handleTouchEnd(e) {
        if (!this.isDragging || !this.currentElement) return;

        const deltaX = this.currentX - this.startX;
        this.currentElement.classList.remove('swiping');

        if (deltaX <= this.deleteThreshold) {
            // Keep it swiped open
            this.currentElement.style.transform = `translateX(${this.deleteThreshold}px)`;
        } else {
            // Snap back
            this.currentElement.style.transform = 'translateX(0)';
            const deleteBtn = this.currentElement.parentElement.querySelector('.delete-button');
            if (deleteBtn) {
                deleteBtn.classList.remove('visible');
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
            const translateX = Math.max(deltaX, this.deleteThreshold);
            this.currentElement.style.transform = `translateX(${translateX}px)`;

            // Show delete button when swiped enough
            const deleteBtn = this.currentElement.parentElement.querySelector('.delete-button');
            if (deleteBtn) {
                if (translateX <= this.deleteThreshold) {
                    deleteBtn.classList.add('visible');
                } else {
                    deleteBtn.classList.remove('visible');
                }
            }
        }
    }

    handleMouseEnd(e) {
        if (!this.isDragging || !this.currentElement) return;

        const deltaX = this.currentX - this.startX;
        this.currentElement.classList.remove('swiping');

        if (deltaX <= this.deleteThreshold) {
            // Keep it swiped open
            this.currentElement.style.transform = `translateX(${this.deleteThreshold}px)`;
        } else {
            // Snap back
            this.currentElement.style.transform = 'translateX(0)';
            const deleteBtn = this.currentElement.parentElement.querySelector('.delete-button');
            if (deleteBtn) {
                deleteBtn.classList.remove('visible');
            }
        }

        this.isDragging = false;
        this.currentElement = null;
    }

    resetSwipe(message) {
        if (message) {
            message.style.transform = 'translateX(0)';
            const deleteBtn = message.parentElement.querySelector('.delete-button');
            if (deleteBtn) {
                deleteBtn.classList.remove('visible');
            }
        }
    }

    handleDelete(index) {
        const wrapper = document.querySelector(`.message-wrapper[data-index="${index}"]`);
        if (!wrapper) return;

        // Animate out
        wrapper.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        wrapper.style.opacity = '0';
        wrapper.style.transform = 'translateX(-100%)';

        setTimeout(() => {
            // Remove from StorageManager
            StorageManager.currentEntries.splice(index, 1);
            
            // Save to localStorage (changes persist in session)
            StorageManager.saveToLocalStorage();
            
            // Re-render all entries
            DisplayManager.renderEntries(StorageManager.getEntries());
            
            console.log(`Deleted entry at index ${index}. Remaining entries:`, StorageManager.currentEntries.length);
            
            // Visual feedback - remind user to save
            const saveBtn = document.getElementById('save-btn-header');
            if (saveBtn) {
                saveBtn.style.borderColor = '#FF5100';
                setTimeout(() => {
                    saveBtn.style.borderColor = '';
                }, 2000);
            }
        }, 300);
    }
}

// Initialize swipe handler
window.SwipeDeleteHandler = SwipeDeleteHandler;
