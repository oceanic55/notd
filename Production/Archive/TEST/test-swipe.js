// Test data (will be replaced when loading JSON)
let testEntries = [
    {
        timestamp: "10/28/25",
        time: "14:30",
        sender: "Coffee Shop",
        note: "Had a great latte and worked on the project"
    },
    {
        timestamp: "10/28/25",
        time: "16:45",
        sender: "Office",
        note: "Meeting with the team about Q4 goals"
    },
    {
        timestamp: "10/28/25",
        time: "19:20",
        sender: "Home",
        note: "Dinner with family, discussed weekend plans"
    },
    {
        timestamp: "10/27/25",
        time: "10:15",
        sender: "Gym",
        note: "Morning workout session - felt energized"
    },
    {
        timestamp: "10/27/25",
        time: "13:00",
        sender: "Restaurant",
        note: "Lunch with Sarah, talked about the new design system"
    }
];

let currentFileName = null;

// Swipe handler class
class SwipeHandler {
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
    }

    handleTouchStart(e) {
        const message = e.target.closest('.message');
        if (!message) return;

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
}

// Render entries
function renderEntries() {
    const container = document.getElementById('entries-container');
    if (!container) return;

    container.innerHTML = '';

    testEntries.forEach((entry, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper';
        wrapper.dataset.index = index;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';

        // Left column
        const leftColumn = document.createElement('div');
        leftColumn.className = 'message-left';

        const timestampSpan = document.createElement('span');
        timestampSpan.className = 'timestamp';
        timestampSpan.textContent = entry.timestamp;

        const senderSpan = document.createElement('span');
        senderSpan.className = 'sender';
        senderSpan.textContent = entry.sender;

        leftColumn.appendChild(timestampSpan);
        leftColumn.appendChild(senderSpan);

        // Right column
        const rightColumn = document.createElement('div');
        rightColumn.className = 'message-right';

        const timeSpan = document.createElement('span');
        timeSpan.className = 'time';
        timeSpan.textContent = entry.time || '';

        const noteSpan = document.createElement('span');
        noteSpan.className = 'note';
        noteSpan.textContent = entry.note;

        rightColumn.appendChild(timeSpan);
        rightColumn.appendChild(noteSpan);

        messageDiv.appendChild(leftColumn);
        messageDiv.appendChild(rightColumn);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-button';
        deleteBtn.textContent = 'DELETE';
        deleteBtn.addEventListener('click', () => handleDelete(index));

        wrapper.appendChild(messageDiv);
        wrapper.appendChild(deleteBtn);
        container.appendChild(wrapper);
    });
}

// Handle delete
function handleDelete(index) {
    const wrapper = document.querySelector(`.message-wrapper[data-index="${index}"]`);
    if (!wrapper) return;

    // Animate out
    wrapper.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    wrapper.style.opacity = '0';
    wrapper.style.transform = 'translateX(-100%)';

    setTimeout(() => {
        testEntries.splice(index, 1);
        renderEntries();
        console.log(`Deleted entry at index ${index}. Remaining entries:`, testEntries.length);
    }, 300);
}

// Load JSON file
async function loadJsonFile(file) {
    try {
        const text = await file.text();
        const data = JSON.parse(text);

        let entries;

        // Check if data has new format with lastSaved timestamp
        if (data.entries && Array.isArray(data.entries)) {
            entries = data.entries;
        } else if (Array.isArray(data)) {
            // Legacy format - just an array of entries
            entries = data;
        } else {
            throw new Error('Invalid JSON format');
        }

        testEntries = entries;
        currentFileName = file.name;

        // Update file info
        const fileInfo = document.getElementById('file-info');
        if (fileInfo) {
            fileInfo.textContent = `Loaded: ${file.name} (${entries.length} entries)`;
        }

        renderEntries();
        console.log(`Loaded ${entries.length} entries from ${file.name}`);

        // Visual feedback
        const loadBtn = document.getElementById('load-btn');
        if (loadBtn) {
            loadBtn.style.borderColor = '#10b981';
            setTimeout(() => {
                loadBtn.style.borderColor = '#777';
            }, 1500);
        }
    } catch (e) {
        console.error('Error loading file:', e);
        alert('Failed to load file. Please check the file format.');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderEntries();
    const swipeHandler = new SwipeHandler();
    swipeHandler.init();
    console.log('Swipe delete test initialized with', testEntries.length, 'entries');

    // Set up load button
    const loadBtn = document.getElementById('load-btn');
    const loadFile = document.getElementById('load-file');
    
    if (loadBtn && loadFile) {
        loadBtn.addEventListener('click', () => loadFile.click());
        loadFile.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await loadJsonFile(file);
                loadFile.value = ''; // Reset file input
            }
        });
    }
});
