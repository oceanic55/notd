# NOTD*

# WE
# SERVE
# NOTES*

NOTD* 1.1.4

## Features

- **LOAD**: Load diary entries from JSON file
- **ENTER**: Manual entry with sequential field prompting
- **AI ENTER**: AI-powered entry using natural language (Groq API)
- **SAVE**: Save entries to JSON file
- **EDIT**: Inline editing mode for existing entries
- **Search**: Real-time search with highlighting

## AI-Powered Entry

The AI ENTER feature uses Groq's LLM API to extract structured data from natural language:

1. Click **AI ENTER** button
2. On first use, you'll be prompted for your Groq API key (get one free at https://console.groq.com/keys)
3. Enter your text in natural language:
   - **Type**: Enter text manually
   - **Voice**: Click the 🎤 button to use voice input (Chrome, Edge, Safari)
4. Click **Process with AI** or press Ctrl+Enter
5. Review the extracted Place and Note
6. Click **Save Entry** to add to your diary

### Voice Input
- Click the 🎤 microphone button to start voice recording
- Speak naturally - the text will appear in real-time
- Click the button again (now red) to stop recording
- Works in Chrome, Edge, and Safari (requires microphone permission)

The API key is stored in your browser's localStorage for future use. Click the 🔑 button to update or clear your API key.

