// Dedicated edit functionality - completely isolated from ENTER mode

const EditMode = {
  isActive: false,

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
    }
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
