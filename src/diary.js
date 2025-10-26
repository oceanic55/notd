// Data Models

/**
 * DiaryEntry represents a single diary entry
 * @typedef {Object} DiaryEntry
 * @property {string} timestamp - Date field (e.g., "10/21/16")
 * @property {string} time - Time field (e.g., "14:30")
 * @property {string} sender - Place field (e.g., "Nate", "Virgil")
 * @property {string} note - Note content
 */

// Storage Manager Module
const StorageManager = {
  currentFileName: null,
  currentEntries: [],

  /**
   * Add a new entry to current session
   * @param {DiaryEntry} entry - The diary entry to save
   */
  saveEntry(entry) {
    this.currentEntries.push(entry);
    console.log('Entry added to session. Total entries:', this.currentEntries.length);
  },

  /**
   * Load entries from a JSON file
   * @param {File} file - The JSON file to load
   * @returns {DiaryEntry[]} Array of diary entries
   */
  async loadFromFile(file) {
    try {
      const text = await file.text();
      const entries = JSON.parse(text);

      if (!Array.isArray(entries)) {
        throw new Error('Invalid JSON format');
      }

      this.currentFileName = file.name;
      this.currentEntries = entries;
      console.log(`Loaded ${entries.length} entries from ${file.name}`);
      return entries;
    } catch (e) {
      console.error('Error loading file:', e);
      alert('Failed to load file. Please check the file format.');
      return null;
    }
  },

  /**
   * Get current entries
   * @returns {DiaryEntry[]} Array of diary entries
   */
  getEntries() {
    return this.currentEntries;
  },

  /**
   * Save current entries to a JSON file
   */
  async saveToFile() {
    if (this.currentEntries.length === 0) {
      alert('No entries to save.');
      return;
    }

    try {
      const dataStr = JSON.stringify(this.currentEntries, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      // Generate filename with current date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const suggestedName = this.currentFileName || `diary-entries-${dateStr}.json`;

      // Check if File System Access API is supported
      if ('showSaveFilePicker' in window) {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: suggestedName,
          startIn: 'downloads',
          types: [{
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] }
          }]
        });

        const writable = await fileHandle.createWritable();
        await writable.write(dataStr);
        await writable.close();

        console.log(`Saved ${this.currentEntries.length} entries to file`);

        // Visual feedback
        const saveBtn = document.getElementById('save-btn-header');
        if (saveBtn) {
          saveBtn.style.borderColor = '#10b981';
          setTimeout(() => {
            saveBtn.style.borderColor = '';
          }, 1500);
        }
      } else {
        // Fallback to download
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = suggestedName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log(`Downloaded ${this.currentEntries.length} entries`);
      }
    } catch (e) {
      if (e.name === 'AbortError') {
        console.log('Save cancelled by user');
      } else {
        console.error('Error saving file:', e);
        alert('Failed to save file.');
      }
    }
  },


};

// Display Manager Module
const DisplayManager = {
  /**
   * Render all entries to the display
   * @param {DiaryEntry[]} entries - Array of diary entries to render
   */
  renderEntries(entries) {
    this.clearDisplay();
    entries.forEach(entry => this.appendEntry(entry));
  },

  /**
   * Clear all displayed entries
   */
  clearDisplay() {
    const container = document.getElementById('entries-container');
    if (container) {
      container.innerHTML = '';
    }
  },

  /**
   * Append a single entry to the display
   * @param {DiaryEntry} entry - The diary entry to append
   */
  appendEntry(entry) {
    const container = document.getElementById('entries-container');
    if (!container) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';

    // Left column: Date and Sender stacked
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

    // Right column: Time and Note stacked
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

    container.appendChild(messageDiv);
  }
};

// Application Controller
const App = {
  /**
   * Show load prompt on startup
   */
  showLoadPrompt() {
    const container = document.getElementById('entries-container');
    if (container) {
      container.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #aaa;">
          <div style="font-size: 18px; margin-bottom: 20px;">NOTD* 1.0.2</div>
          <div style="font-size: 14px; margin-bottom: 30px;">LOAD to open</div>
          <div style="font-size: 12px; color: #666;">
            changes to memory unless to json<br>
            switch/load alternative at will 
          </div>
        </div>
      `;
    }
  },

  /**
   * Initialize the application
   */
  async initialize() {
    // Show load prompt on startup
    this.showLoadPrompt();

    // Set up event listeners
    const loadBtn = document.getElementById('load-btn');
    const loadFile = document.getElementById('load-file');
    if (loadBtn && loadFile) {
      loadBtn.addEventListener('click', () => loadFile.click());
      loadFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          const entries = await StorageManager.loadFromFile(file);
          if (entries) {
            DisplayManager.renderEntries(entries);
            // Visual feedback
            loadBtn.style.borderColor = '#10b981';
            setTimeout(() => {
              loadBtn.style.borderColor = '';
            }, 1500);
          }
          loadFile.value = ''; // Reset file input
        }
      });
    }

    const enterBtn = document.getElementById('enter-btn');
    if (enterBtn) {
      enterBtn.addEventListener('click', () => this.handleEnterClick());
    }

    const saveBtnHeader = document.getElementById('save-btn-header');
    if (saveBtnHeader) {
      saveBtnHeader.addEventListener('click', () => StorageManager.saveToFile());
    }

    // Set up sequential field prompting
    const placeInput = document.getElementById('place-input');
    const noteInput = document.getElementById('note-input');

    if (placeInput) {
      placeInput.addEventListener('keydown', (e) => this.handlePlaceKeydown(e));
      placeInput.addEventListener('input', () => this.handlePlaceInput());
    }

    if (noteInput) {
      noteInput.addEventListener('input', () => this.handleNoteInput());
      noteInput.addEventListener('keydown', (e) => this.handleNoteKeydown(e));
    }

    // Set up ESC key handler
    document.addEventListener('keydown', (e) => this.handleEscapeKey(e));

    // Set up overlay click to cancel
    const overlay = document.getElementById('form-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => this.resetForm());
    }

    // Set up search functionality
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }
    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        this.handleSearch('');
      });
    }
  },

  /**
   * Handle ENTER button click
   */
  handleEnterClick() {
    const form = document.getElementById('entry-form');
    const overlay = document.getElementById('form-overlay');
    if (form && overlay) {
      form.style.display = 'block';
      overlay.style.display = 'block';

      // Auto-populate date and time
      const now = new Date();
      const dateInput = document.getElementById('date-input');
      const timeInput = document.getElementById('time-input');

      if (dateInput) {
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const year = String(now.getFullYear()).slice(-2);
        dateInput.value = `${month}/${day}/${year}`;
        dateInput.classList.add('completed');
      }

      if (timeInput) {
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeInput.value = `${hours}:${minutes}`;
        timeInput.classList.add('completed');
      }

      // Show time group and focus on place input
      const timeGroup = document.getElementById('time-group');
      const placeGroup = document.getElementById('place-group');

      if (timeGroup) {
        timeGroup.style.display = 'block';
      }
      if (placeGroup) {
        placeGroup.style.display = 'block';
      }

      const placeInput = document.getElementById('place-input');
      if (placeInput) {
        placeInput.focus();
      }
    }
  },

  /**
   * Handle place keydown events
   */
  handlePlaceKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const placeInput = document.getElementById('place-input');
      if (placeInput && placeInput.value.trim()) {
        const noteGroup = document.getElementById('note-group');
        if (noteGroup) {
          noteGroup.style.display = 'block';
          const noteInput = document.getElementById('note-input');
          if (noteInput) {
            noteInput.focus();
          }
        }
      }
    }
  },

  /**
   * Handle place input changes
   */
  handlePlaceInput() {
    const placeInput = document.getElementById('place-input');

    if (placeInput && placeInput.value.trim()) {
      placeInput.classList.add('completed');
    } else if (placeInput && !placeInput.value.trim()) {
      placeInput.classList.remove('completed');
    }
  },

  /**
   * Handle note input changes
   */
  handleNoteInput() {
    const noteInput = document.getElementById('note-input');

    if (noteInput && noteInput.value.trim()) {
      noteInput.classList.add('completed');
    } else if (noteInput && !noteInput.value.trim()) {
      noteInput.classList.remove('completed');
    }
  },

  /**
   * Handle note keydown events
   */
  handleNoteKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const noteInput = document.getElementById('note-input');
      if (noteInput && noteInput.value.trim()) {
        this.handleSaveClick();
      }
    }
  },

  /**
   * Handle SAVE button click (form save button)
   */
  handleSaveClick() {
    const dateInput = document.getElementById('date-input');
    const timeInput = document.getElementById('time-input');
    const placeInput = document.getElementById('place-input');
    const noteInput = document.getElementById('note-input');

    if (!dateInput || !timeInput || !placeInput || !noteInput) return;

    const entry = {
      timestamp: dateInput.value.trim(),
      time: timeInput.value.trim(),
      sender: placeInput.value.trim(),
      note: noteInput.value.trim()
    };

    // Validate fields
    if (!entry.timestamp || !entry.time || !entry.sender || !entry.note) {
      alert('Please fill in all fields');
      return;
    }

    // Save and display entry
    StorageManager.saveEntry(entry);
    DisplayManager.appendEntry(entry);

    // Reset form
    this.resetForm();
  },

  /**
   * Reset and hide the entry form
   */
  resetForm() {
    const dateInput = document.getElementById('date-input');
    const timeInput = document.getElementById('time-input');
    const placeInput = document.getElementById('place-input');
    const noteInput = document.getElementById('note-input');
    const form = document.getElementById('entry-form');
    const overlay = document.getElementById('form-overlay');

    if (dateInput) {
      dateInput.value = '';
      dateInput.classList.remove('completed');
    }
    if (timeInput) {
      timeInput.value = '';
      timeInput.classList.remove('completed');
    }
    if (placeInput) {
      placeInput.value = '';
      placeInput.classList.remove('completed');
    }
    if (noteInput) {
      noteInput.value = '';
      noteInput.classList.remove('completed');
    }

    if (form) form.style.display = 'none';
    if (overlay) overlay.style.display = 'none';

    // Reset field visibility
    const timeGroup = document.getElementById('time-group');
    const placeGroup = document.getElementById('place-group');
    const noteGroup = document.getElementById('note-group');

    if (timeGroup) timeGroup.style.display = 'none';
    if (placeGroup) placeGroup.style.display = 'none';
    if (noteGroup) noteGroup.style.display = 'none';
  },

  /**
   * Handle ESC key to cancel form
   */
  handleEscapeKey(e) {
    if (e.key === 'Escape') {
      const form = document.getElementById('entry-form');
      if (form && form.style.display === 'block') {
        this.resetForm();
      }
    }
  },

  /**
   * Handle search input
   */
  handleSearch(query) {
    const searchClear = document.getElementById('search-clear');
    const searchResults = document.getElementById('search-results');
    const messages = document.querySelectorAll('.message');

    // Show/hide clear button
    if (searchClear) {
      searchClear.style.display = query.trim() ? 'block' : 'none';
    }

    if (!query.trim()) {
      // Clear search - show all entries
      messages.forEach(msg => {
        msg.classList.remove('highlight');
        msg.style.display = 'flex';
        // Remove search highlights
        const note = msg.querySelector('.note');
        if (note && note.dataset.originalText) {
          note.textContent = note.dataset.originalText;
          delete note.dataset.originalText;
        }
      });
      if (searchResults) searchResults.textContent = '';
      return;
    }

    const lowerQuery = query.toLowerCase();
    let matchCount = 0;

    messages.forEach(msg => {
      const timestamp = msg.querySelector('.timestamp')?.textContent || '';
      const sender = msg.querySelector('.sender')?.textContent || '';
      const time = msg.querySelector('.time')?.textContent || '';
      const noteEl = msg.querySelector('.note');
      const note = noteEl?.textContent || '';

      // Store original text if not already stored
      if (noteEl && !noteEl.dataset.originalText) {
        noteEl.dataset.originalText = note;
      }

      const searchText = `${timestamp} ${sender} ${time} ${note}`.toLowerCase();

      if (searchText.includes(lowerQuery)) {
        msg.style.display = 'flex';
        msg.classList.add('highlight');
        matchCount++;

        // Highlight matching text in note
        if (noteEl && note.toLowerCase().includes(lowerQuery)) {
          const regex = new RegExp(`(${query})`, 'gi');
          const highlighted = note.replace(regex, '<span class="search-match">$1</span>');
          noteEl.innerHTML = highlighted;
        }
      } else {
        msg.style.display = 'none';
        msg.classList.remove('highlight');
        // Restore original text
        if (noteEl && noteEl.dataset.originalText) {
          noteEl.textContent = noteEl.dataset.originalText;
        }
      }
    });

    if (searchResults) {
      searchResults.textContent = matchCount === 0
        ? 'No matches found'
        : `${matchCount} ${matchCount === 1 ? 'entry' : 'entries'} found`;
    }
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.initialize();
});
