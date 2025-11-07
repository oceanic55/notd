/**
 * NOTD* Application Module Registry
 * 
 * This file documents the global module structure and dependencies.
 * All modules are exposed on the window object for cross-module communication.
 * 
 * Module Loading Order (as defined in index.html):
 * 1. utils.js -> window.Utils
 * 2. viewport-fix.js -> window.ViewportFix
 * 3. theme.js -> (no export, self-initializing)
 * 4. navigation.js -> window.Navigation, window.navigationInstance
 * 4. form.js -> window.EntryForm
 * 5. edit.js -> window.EditMode
 * 6. system-prompt.js -> window.SYSTEM_PROMPT
 * 7. analysis-prompt.js -> window.ANALYSIS_PROMPT
 * 8. llm.js -> window.LLMEntry
 * 9. llm-settings.js -> window.LLMSettings
 * 10. about.js -> window.AboutInfo
 * 11. combined-about.js -> window.CombinedAboutForm
 * 12. essay-style-examples.js -> window.ESSAY_STYLE_EXAMPLES
 * 13. essay.js -> window.EssayGenerator
 * 14. swipe-delete.js -> window.SwipeEditHandler, window.SwipeDeleteHandler
 * 15. diary.js -> window.StorageManager, window.DisplayManager
 * 
 * Key Dependencies:
 * - Navigation depends on: EntryForm, CombinedAboutForm
 * - EntryForm depends on: LLMEntry, StorageManager
 * - EditMode depends on: LLMEntry, StorageManager, DisplayManager
 * - LLMEntry depends on: SYSTEM_PROMPT, LLMSettings
 * - EssayGenerator depends on: ESSAY_STYLE_EXAMPLES, ANALYSIS_PROMPT, LLMSettings
 * - CombinedAboutForm depends on: StorageManager, LLMSettings
 * - DisplayManager depends on: EditMode, SwipeEditHandler
 * 
 * Note: This architecture uses global namespace for module communication.
 * For future refactoring, consider migrating to ES6 modules or a module bundler.
 */

// Module registry for runtime verification
window.NOTD_MODULES = {
    Utils: null,
    ViewportFix: null,
    Navigation: null,
    navigationInstance: null,
    EntryForm: null,
    EditMode: null,
    SYSTEM_PROMPT: null,
    ANALYSIS_PROMPT: null,
    LLMEntry: null,
    LLMSettings: null,
    AboutInfo: null,
    CombinedAboutForm: null,
    ESSAY_STYLE_EXAMPLES: null,
    EssayGenerator: null,
    SwipeEditHandler: null,
    SwipeDeleteHandler: null,
    StorageManager: null,
    DisplayManager: null
};

// Helper to verify all modules are loaded
window.verifyModulesLoaded = function() {
    const missing = [];
    for (const [name, value] of Object.entries(window.NOTD_MODULES)) {
        if (!window[name]) {
            missing.push(name);
        }
    }
    
    if (missing.length > 0) {
        console.warn('Missing modules:', missing);
        return false;
    }
    
    console.log('✓ All NOTD* modules loaded successfully');
    return true;
};
