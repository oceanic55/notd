// Dedicated edit functionality - completely isolated from ENTER mode

const EditMode = {
  isActive: false,
  editingIndex: null,
  currentEntryData: null,

  /**
   * Toggle edit mode on/off
   */
  toggle() {
    this.isActive = !this.isActive;
    const editBtn = document.getElementById('edit-btn');
    const container = document.getElementById('entries-container');

    if (this.isActive) {
      editBtn.classList.add('active');
      container.classList.add('edit-mode');
    } else {
      editBtn.classList.remove('active');
      container.classList.remove('edit-mode');
      this.editingIndex = null;
      this.currentEntryData = null;
    }
  },

  /**
   * Handle entry click in edit mode
   */
  handleEntryClick(index) {
    if (!this.isActive) return;

    const entries = StorageManager.getEntries();
    if (index < 0 || index >= entries.length) return;

    this.editingIndex = index;
    this.currentEntryData = { ...entries[index] };
    this.showEditDialog();
  },

  /**
   * Show edit dialog with entry data
   */
  showEditDialog() {
    const form = document.getElementById('edit-entry-form');
    const overlay = document.getElementById('form-overlay');

    if (!form || !overlay) return;

    // Populate form fields
    const dateInput = document.getElementById('edit-date-input');
    const timeInput = document.getElementById('edit-time-input');
    const placeInput = document.getElementById('edit-place-input');
    const noteInput = document.getElementById('edit-note-input');

    if (dateInput) dateInput.value = this.currentEntryData.timestamp || '';
    if (timeInput) timeInput.value = this.currentEntryData.time || '';
    if (placeInput) placeInput.value = this.currentEntryData.sender || '';
    if (noteInput) noteInput.value = this.currentEntryData.note || '';

    // Show form
    form.style.display = 'block';
    overlay.style.display = 'block';

    // Focus on place input
    if (placeInput) placeInput.focus();
  },

  /**
   * Handle LLM reprocess button
   */
  async handleLLMReprocess() {
    const noteInput = document.getElementById('edit-note-input');
    if (!noteInput || !noteInput.value.trim()) {
      alert('Please enter text to reprocess');
      return;
    }

    // Check if LLMEntry is available and has API key
    if (!window.LLMEntry || !window.LLMEntry.apiKey) {
      if (window.LLMEntry) {
        const hasKey = window.LLMEntry.promptForApiKey();
        if (!hasKey) return;
      } else {
        alert('LLM functionality not available');
        return;
      }
    }

    const reprocessBtn = document.getElementById('edit-llm-reprocess-btn');
    if (reprocessBtn) {
      reprocessBtn.textContent = 'PROCESSING...';
      reprocessBtn.disabled = true;
    }

    try {
      const result = await window.LLMEntry.processWithLLM(noteInput.value);

      // Update form fields with LLM result
      const placeInput = document.getElementById('edit-place-input');
      if (placeInput) placeInput.value = result.place;
      if (noteInput) noteInput.value = result.note;

      // Update current entry data
      this.currentEntryData.sender = result.place;
      this.currentEntryData.note = result.note;

    } catch (error) {
      console.error('LLM reprocessing error:', error);
      alert(`Error: ${error.message}\n\nPlease check your API key and try again.`);
    } finally {
      if (reprocessBtn) {
        reprocessBtn.textContent = 'REPROCESS WITH LLM';
        reprocessBtn.disabled = false;
      }
    }
  },

  /**
   * Save edited entry
   */
  handleSave() {
    const dateInput = document.getElementById('edit-date-input');
    const timeInput = document.getElementById('edit-time-input');
    const placeInput = document.getElementById('edit-place-input');
    const noteInput = document.getElementById('edit-note-input');

    if (!dateInput || !timeInput || !placeInput || !noteInput) return;

    const updatedEntry = {
      timestamp: dateInput.value.trim(),
      time: timeInput.value.trim(),
      sender: placeInput.value.trim(),
      note: noteInput.value.trim()
    };

    // Validate fields
    if (!updatedEntry.timestamp || !updatedEntry.time || !updatedEntry.sender || !updatedEntry.note) {
      alert('Please fill in all fields');
      return;
    }

    // Update entry in storage
    const entries = StorageManager.getEntries();
    if (this.editingIndex !== null && this.editingIndex >= 0 && this.editingIndex < entries.length) {
      entries[this.editingIndex] = updatedEntry;
      StorageManager.saveToLocalStorage();
      DisplayManager.renderEntries(entries);
    }

    // Close dialog and disable edit mode
    this.closeEditDialog();
    this.toggle(); // Disable edit mode
  },

  /**
   * Close edit dialog
   */
  closeEditDialog() {
    const form = document.getElementById('edit-entry-form');
    const overlay = document.getElementById('form-overlay');

    if (form) form.style.display = 'none';
    if (overlay) overlay.style.display = 'none';

    this.editingIndex = null;
    this.currentEntryData = null;
  },

  /**
   * Handle inline editing of a field
   */
  startEdit(element) {
    if (element.contentEditable === 'true') return; // Already editing

    const index = parseInt(element.dataset.index);
    const field = element.dataset.field;
    const originalText = element.textContent;

    // Make element editable
    element.contentEditable = 'true';
    element.classList.add('editing-active');
    
    // Force maintain the exact same layout properties via inline styles
    element.style.whiteSpace = 'normal';
    element.style.wordWrap = 'break-word';
    element.style.overflowWrap = 'break-word';
    
    // For note fields, ensure block display and full width
    if (field === 'note') {
      element.style.display = 'block';
      element.style.width = '100%';
    }
    
    // Focus and select text
    element.focus();
    
    // Select all text
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    // Save function
    const save = () => {
      element.contentEditable = 'false';
      element.classList.remove('editing-active');
      
      const newValue = element.textContent.trim();

      if (newValue && newValue !== originalText) {
        // Update the entry in storage
        const entries = StorageManager.getEntries();
        if (index >= 0 && index < entries.length) {
          const fieldMap = {
            'timestamp': 'timestamp',
            'sender': 'sender',
            'time': 'time',
            'note': 'note'
          };
          entries[index][fieldMap[field]] = newValue;
          
          // Save to localStorage after edit
          if (window.StorageManager) {
            StorageManager.saveToLocalStorage();
          }
        }
        
        // For note field, re-linkify URLs after saving
        if (field === 'note' && window.DisplayManager) {
          element.innerHTML = DisplayManager.linkifyUrls(newValue);
        } else {
          element.textContent = newValue;
        }
      } else {
        // Restore original - re-linkify if note field
        if (field === 'note' && window.DisplayManager) {
          element.innerHTML = DisplayManager.linkifyUrls(originalText);
        } else {
          element.textContent = originalText;
        }
      }
      
      // Clean up
      element.removeEventListener('blur', save);
      element.removeEventListener('keydown', handleKey);
    };

    // Key handler
    const handleKey = (e) => {
      if (e.key === 'Enter') {
        // Enter saves for all fields
        e.preventDefault();
        element.blur();
      } else if (e.key === 'Escape') {
        // Escape cancels
        e.preventDefault();
        element.textContent = originalText;
        element.contentEditable = 'false';
        element.classList.remove('editing-active');
      }
    };

    element.addEventListener('blur', save);
    element.addEventListener('keydown', handleKey);
  }
};

// Export for use in main app
window.EditMode = EditMode;
