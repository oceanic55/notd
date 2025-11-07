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
 * 5. form.js -> window.EntryForm
 * 6. edit.js -> window.EditMode
 * 7. prompt-config.js -> window.PROMPT_CONFIG
 * 8. system-prompt.js -> window.SYSTEM_PROMPT
 * 9. analysis-prompt.js -> window.ANALYSIS_PROMPT
 * 10. essay-style-examples.js -> window.ESSAY_STYLE_EXAMPLES
 * 11. essay-prompt.js -> window.ESSAY_PROMPT
 * 12. prompt-manager.js -> window.PromptManager
 * 13. llm-api.js -> window.LLMAPI
 * 14. llm.js -> window.LLMEntry
 * 15. llm-settings.js -> window.LLMSettings
 * 16. about.js -> window.AboutInfo
 * 17. combined-about.js -> window.CombinedAboutForm
 * 18. essay.js -> window.EssayGenerator
 * 19. swipe-delete.js -> window.SwipeEditHandler, window.SwipeDeleteHandler
 * 20. diary.js -> window.StorageManager, window.DisplayManager
 * 
 * Key Dependencies:
 * - Navigation depends on: EntryForm, CombinedAboutForm
 * - EntryForm depends on: LLMEntry, StorageManager
 * - EditMode depends on: LLMEntry, StorageManager, DisplayManager
 * - PromptManager depends on: PROMPT_CONFIG, SYSTEM_PROMPT, ANALYSIS_PROMPT, ESSAY_PROMPT, ESSAY_STYLE_EXAMPLES
 * - LLMAPI provides: Unified API abstraction for multiple providers
 * - LLMEntry depends on: PromptManager, LLMAPI, PROMPT_CONFIG
 * - EssayGenerator depends on: PromptManager, LLMAPI, PROMPT_CONFIG
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
    PROMPT_CONFIG: null,
    SYSTEM_PROMPT: null,
    ANALYSIS_PROMPT: null,
    ESSAY_STYLE_EXAMPLES: null,
    ESSAY_PROMPT: null,
    PromptManager: null,
    LLMAPI: null,
    LLMEntry: null,
    LLMSettings: null,
    AboutInfo: null,
    CombinedAboutForm: null,
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
