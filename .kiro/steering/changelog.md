# Changelog Guidelines

When the user asks to write a changelog or update the changelog, follow these rules:

## Location
- Always add changelog entries to README.md, NOT a separate CHANGELOG.md file
- Add new entries at the top of the "## Changelog" section

## Format
```
v[VERSION]
[Concise description of changes in 1-2 sentences. Multiple fixes can be combined with proper punctuation.]

[DATE]::[TIME]
```

## Version Number
- Ask the user for the version number if not provided
- Update the version number in index.html footer: `<span>&nbsp;&nbsp;[VERSION]</span>`

## Timestamp
- Always use system time, never hardcode 00:00
- Get timestamp using: `date +"%m.%d::%H:%M"`
- Format: MM.DD::HH:MM (e.g., 11.01::15:48)

## Style
- Keep descriptions concise (1-2 sentences)
- Focus on user-facing changes
- Use present tense ("Fixed", "Added", "Updated")
- Combine related changes into one sentence when possible

## Example
```
v3.1.1
Fixed light mode text visibility in LLM dialogue box (was white on light background). SVG icon colors now properly invert based on theme (dark icons in light mode, light icons in dark mode). Theme variables now apply globally to all modals and UI elements.

11.01::15:48
```
