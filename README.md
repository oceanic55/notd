# NOTD*

# WE
# SERVE
# NOTES*



## Changelog

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
essay.js into a separate src/essay-style-examples.txt file. Added a loadStyleExamples() method that fetches and caches the content, with preloading on initialization. This lets you maintain a long reference text for the LLM without cluttering the code.
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

