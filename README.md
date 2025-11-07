# NOTD*

# WE
# SERVE
# NOTES*



## Changelog



### Latest: v4.9.0 (2025-11-07)
**Prompt System Refactoring & Architecture Improvements**

- Created centralized prompt configuration system (src/prompt-config.js) with adjustable parameters for word counts, temperatures, and modes
- Extracted essay prompt from inline code to dedicated file (src/essay-prompt.js) for easier editing
- Implemented PromptManager module with validation, fallback mechanisms, and dynamic prompt interpolation
- Added LLM API abstraction layer (src/llm-api.js) supporting multiple providers (Groq, OpenAI, Anthropic)
- Enhanced JSON parsing with automatic repair logic for malformed API responses
- Restructured system prompt with clear section headers (Task Overview, Processing Modes, Location Detection, Note Writing, URL Handling)
- Updated module loading order and registry to support new architecture
- Maintained full backward compatibility with existing features

### Previous: v4.8.0 (2024-11-07)

v4.8.0
- Migrated prompt files from data/ to src/ directory (system-prompt.js, analysis-prompt.js)
- Updated index.html to reference prompts from src/ instead of data/
- Removed legacy prompt files (old prompt.txt, new prompt.txt, new prompt 2.txt)
- Deleted unused test files (test-forms.html, mobile-focus-test.html, forms.txt, NOTD.md)
- Fixed essay generator to eliminate formulaic "As I..." opening patterns
- Added explicit prohibition against clichéd first-person constructions in essay prompt
- Cleaned up data/ directory structure in both current and target workspaces

11.07::14:26

v4.7.0
- Removed 9 unused files (~15% codebase reduction)
- Created shared utility module (src/utils.js)
- Consolidated duplicate code
- Added input validation utilities
- Improved essay generation with full style examples
- Created module registry system
- Standardized button IDs to kebab-case
- Fixed missing DOM element references
- Enhanced documentation

11.07::13:09

v4.6.0
Externalized prompts
PENDING flag system
Literary style enhancements
Content fidelity rules
Model selection fix
Button color change
Dual temperature system with JSON repair

11.07::13:09

v4.5.0
- Streamlined changelog management process to prompt for version number instead of extracting from git
- Updated guidelines to new 4-step process: prompt version, review history, write changelog, update app
- Removed automatic version extraction from git commit messages
- Removed automatic system time retrieval requirements
- Simplified changelog workflow for faster updates

11.06::17:38

v4.4.1
- Updated changelog management process to retrieve version from git commit messages
- Added automatic system time retrieval using date command for accurate timestamps
- Removed manual version number prompting from changelog workflow
- Added "Common Issues" section to guidelines documenting system time and version retrieval
- Enhanced guidelines with specific commands for version and timestamp extraction

11.06::16:26

v4.4.0
- Added SAVE button to About form for saving current diary data to JSON file
- Added COPY button to About form for copying all diary entries to clipboard
- Modified LLM prompt in llm.js for improved analysis output
- Reorganized development guidelines from DEVELOPMENT.md to data/guidelines.md
- Updated changelog format requirements to use bullet lists (5-10 bullets minimum/maximum)
- Created structured guidelines for changelog management in data/guidelines.md

11.06::16:24

v4.3.0
- Added 50% opacity orange backgrounds for mobile form buttons (form.css)
- Fixed edit form button positioning using flexbox instead of absolute positioning
- Enhanced navigation.js with closeAllForms() method for better state management
- Added keyboard navigation support (ArrowLeft/ArrowRight) for toggle buttons
- Improved logo button click handling with touch event support

11.06::14:45

v4.2.0
Major UI/UX improvements to the About form and cross-browser compatibility enhancements:

Redesigned About form with LOAD/API/CLOSE buttons and dedicated API overlay. Added mobile touch feedback with orange backgrounds. Fixed NOTE field expansion in edit mode using flexbox. Improved cross-browser viewport compatibility with viewport-fix.js.

01.06::12:10

v4.0.1
Fixed click-outside-to-close for all forms. Enhanced mobile text field focus with multiple fallback mechanisms.

11.05::17:30


v4.0.0
New UI.

11.05::16:25


v3.1.1
Fixed light mode text visibility in LLM dialogue box (was white on light background). SVG icon colors now properly invert based on theme (dark icons in light mode, light icons in dark mode). Theme variables now apply globally to all modals and UI elements.

11.01::15:48


v3.1.0
Added light/dark theme switcher with persistent preference storage. New toggle button positioned next to the NOTD* title uses SVG icons (light.svg/dark.svg) and switches between comprehensive light and dark color schemes. Theme preference is saved to localStorage and automatically restored on page load. All UI elements including buttons, inputs, modals, and text adapt seamlessly to the selected theme through CSS custom properties.

11.01::15:35


Externalized the essay style examples from 
essay.js into a separate src/essay-style-examples.js file. The style examples are loaded via a script tag and exposed as a window global, avoiding CORS issues when running from file:// protocol. This lets you maintain a long reference text for the LLM without cluttering the code.
New Prompt.

10.31::09:50


v3.0.0
Added essay generation feature: new LLM button in AI analysis modal (REPLY WIN) generates one-paragraph essays (max 600 chars) from analysis output. Uses strict prompt to prevent creative invention beyond source content. Styled consistently with existing modal buttons.

10.30::17:24


v2.9.0
Added dialog-based editing to index.html, allowing users to edit existing entries manually or reprocess them through AI.

Changes
index.html

Added centered edit dialog with Date, Time, Place, Note fields
Two buttons: "REPROCESS WITH LLM" and "SAVE"
src/edit.js

Added entry selection handler (handleEntryClick)
Added dialog display with populated data (showEditDialog)
Added LLM reprocessing (handleLLMReprocess)
Added save and close functionality
src/diary.js

Wired up edit dialog event handlers
Added ESC key and overlay click support
src/llm.js

Fixed copy button to exclude tokens/model metadata

10.30::16:58


v2.8.9
JS: llm: rate limit handling, token limits, error display in modal
HTML: process button, save button, form overlay section, ai analysis modal section, ai analysis header section, ai analysis content section, ai entry form section, ai preview section

10.30::13:45

