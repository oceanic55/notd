# NOTD*

# WE
# SERVE
# NOTES*

NOTD* 2.9.0


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

