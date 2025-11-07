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
    const container = document.getElementById('entries-container');

    if (this.isActive) {
      if (container) {
        container.classList.add('edit-mode');
      }
    } else {
      if (container) container.classList.remove('edit-mode');
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
    const overlay = document.getElementById('edit-form-overlay');

    if (!form || !overlay) return;

    // Populate form fields
    const dateInput = document.getElementById('edit-date-input');
    const timeInput = document.getElementById('edit-time-input');
    const placeInput = document.getElementById('edit-place-input');
    const noteInput = document.getElementById('edit-note-input');

    if (dateInput) {
      dateInput.value = this.currentEntryData.timestamp || '';
      dateInput.style.height = '24px';
    }
    if (timeInput) {
      timeInput.value = this.currentEntryData.time || '';
      timeInput.style.height = '24px';
    }
    if (placeInput) {
      placeInput.value = this.currentEntryData.sender || '';
      placeInput.style.height = '24px';
    }
    if (noteInput) {
      noteInput.value = this.currentEntryData.note || '';
      // Auto-expand textarea using the shared utility
      setTimeout(() => {
        if (window.Utils) {
          window.Utils.autoExpandTextarea(noteInput, 210);
        }
      }, 0);
    }

    // Set up button event listeners using event delegation on the form
    const self = this;
    
    // Remove any existing form click listener
    const formElement = form.querySelector('form');
    if (formElement) {
      // Clone to remove all listeners
      const newForm = formElement.cloneNode(true);
      formElement.parentNode.replaceChild(newForm, formElement);
      
      // Add event delegation listener for buttons
      newForm.addEventListener('click', function(e) {
        if (e.target.id === 'edit-llm-reprocess-btn' || e.target.closest('#edit-llm-reprocess-btn')) {
          e.preventDefault();
          e.stopPropagation();
          self.handleLLMReprocess();
        } else if (e.target.id === 'edit-delete-btn' || e.target.closest('#edit-delete-btn')) {
          e.preventDefault();
          e.stopPropagation();
          self.handleDelete();
        } else if (e.target.id === 'edit-save-btn' || e.target.closest('#edit-save-btn')) {
          e.preventDefault();
          e.stopPropagation();
          self.handleSave();
        } else if (e.target.id === 'edit-close-btn' || e.target.closest('#edit-close-btn')) {
          e.preventDefault();
          e.stopPropagation();
          self.closeEditDialog();
        }
      });
      
      // Set up auto-expand for the note textarea
      const editNoteInput = newForm.querySelector('#edit-note-input');
      if (editNoteInput && window.Utils) {
        editNoteInput.addEventListener('input', function() {
          window.Utils.autoExpandTextarea(editNoteInput, 210);
        });
      }
    }

    // Close any other open forms first
    this.closeOtherForms();
    
    // Show form with new styling
    overlay.classList.add('active');
    form.classList.add('active');

    // Focus on date input
    setTimeout(() => {
      if (dateInput) dateInput.focus();
    }, 100);
  },

  /**
   * Handle LLM reprocess button
   */
  async handleLLMReprocess() {
    const noteInput = document.getElementById('edit-note-input');
    const placeInput = document.getElementById('edit-place-input');
    
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
      reprocessBtn.style.setProperty('background-color', '#00ff00', 'important');
      reprocessBtn.disabled = true;
    }

    try {
      // Combine note and existing place/sender information for processing
      let textToProcess = noteInput.value;
      
      // If there's existing place/sender information, include it in the processing
      if (placeInput && placeInput.value.trim()) {
        textToProcess = `Location: ${placeInput.value.trim()}\n\n${noteInput.value}`;
      }

      const result = await window.LLMEntry.processWithLLM(textToProcess, true);  // true = isReprocess

      // Update form fields with LLM result
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
        reprocessBtn.style.removeProperty('background-color');
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

    // Close dialog (this will also exit edit mode)
    this.closeEditDialog();
  },

  /**
   * Delete the currently edited entry
   */
  handleDelete() {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    // Remove entry from storage
    const entries = StorageManager.getEntries();
    if (this.editingIndex !== null && this.editingIndex >= 0 && this.editingIndex < entries.length) {
      entries.splice(this.editingIndex, 1);
      StorageManager.saveToLocalStorage();
      DisplayManager.renderEntries(entries);
      
      console.log(`Deleted entry at index ${this.editingIndex}. Remaining entries:`, entries.length);
      
      // Entry deleted - auto-saved to localStorage
    }

    // Close dialog (this will also exit edit mode)
    this.closeEditDialog();
  },

  /**
   * Close other forms before opening edit form
   */
  closeOtherForms() {
    // Close entry form
    const entryOverlay = document.getElementById('form-overlay');
    const entryForm = document.getElementById('entry-form');
    if (entryOverlay) entryOverlay.classList.remove('active');
    if (entryForm) entryForm.classList.remove('active');
    if (window.EntryForm) window.EntryForm.isOpen = false;

    // Close ABOUT form
    const aboutOverlay = document.getElementById('combined-about-overlay');
    const aboutForm = document.getElementById('combined-about-form');
    if (aboutOverlay) aboutOverlay.classList.remove('active');
    if (aboutForm) aboutForm.classList.remove('active');

    // Close AI analysis modal
    const aiOverlay = document.getElementById('ai-analysis-modal-overlay');
    const aiModal = document.getElementById('ai-analysis-modal');
    if (aiOverlay) aiOverlay.classList.remove('active');
    if (aiModal) aiModal.classList.remove('active');
  },

  /**
   * Close edit dialog and exit edit mode
   */
  closeEditDialog() {
    const form = document.getElementById('edit-entry-form');
    const overlay = document.getElementById('edit-form-overlay');

    if (form) form.classList.remove('active');
    if (overlay) overlay.classList.remove('active');

    this.editingIndex = null;
    this.currentEntryData = null;
    
    // Exit edit mode when closing the dialog
    if (this.isActive) {
      this.toggle();
    }
  },


};

// Removed: autoExpandTextarea - now in src/utils.js (window.Utils.autoExpandTextarea)

// Initialize edit form overlay handlers
document.addEventListener('DOMContentLoaded', () => {
  // Close edit form when clicking overlay
  const editOverlay = document.getElementById('edit-form-overlay');
  if (editOverlay) {
    editOverlay.addEventListener('click', (e) => {
      if (e.target === editOverlay) {
        EditMode.closeEditDialog();
      }
    });
  }

  // Prevent edit form container clicks from bubbling to overlay
  const editForm = document.getElementById('edit-entry-form');
  if (editForm) {
    editForm.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Click outside entries to cancel edit mode (when no dialog is open)
  document.addEventListener('click', (e) => {
    // Only handle clicks when edit mode is active but no dialog is open
    if (EditMode.isActive) {
      const editDialog = document.getElementById('edit-entry-form');
      const isDialogOpen = editDialog && editDialog.classList.contains('active');
      
      if (!isDialogOpen) {
        const entriesContainer = document.getElementById('entries-container');
        const clickedInsideEntries = entriesContainer && entriesContainer.contains(e.target);
        
        // If clicked outside the entries container, exit edit mode
        if (!clickedInsideEntries) {
          EditMode.toggle();
        }
      }
    }
  });

  // Prevent entries container clicks from bubbling when in edit mode
  const entriesContainer = document.getElementById('entries-container');
  if (entriesContainer) {
    entriesContainer.addEventListener('click', (e) => {
      if (EditMode.isActive) {
        e.stopPropagation();
      }
    });
  }

  // ESC key to close edit form or exit edit mode
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const editForm = document.getElementById('edit-entry-form');
      if (editForm && editForm.classList.contains('active')) {
        // If edit dialog is open, close it
        EditMode.closeEditDialog();
      } else if (EditMode.isActive) {
        // If edit mode is active but no dialog is open, exit edit mode
        EditMode.toggle();
      }
    }
  });
  
  // Set up auto-expand for edit form textareas
  const editNoteInput = document.getElementById('edit-note-input');
  if (editNoteInput && window.Utils) {
    editNoteInput.addEventListener('input', () => {
      window.Utils.autoExpandTextarea(editNoteInput, 210);
    });
  }
});

// Export for use in main app
window.EditMode = EditMode;
if (window.NOTD_MODULES) window.NOTD_MODULES.EditMode = EditMode;
