#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const versionPath = path.join(__dirname, 'version.txt');
const indexPath = path.join(__dirname, '..', 'index.html');
const readmePath = path.join(__dirname, '..', 'README.md');

try {
    // Read version from version.txt
    const newVersion = fs.readFileSync(versionPath, 'utf8').trim();
    
    // Validate version format (X.X.X)
    if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
        console.error('Error: Version must be in format X.X.X (e.g., 2.1.4)');
        process.exit(1);
    }

    // Update index.html
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    const indexRegex = /(NOTD\*<\/a>\s*<span[^>]*>(?:&nbsp;)*)\d+\.\d+\.\d+/;
    
    if (indexRegex.test(indexContent)) {
        indexContent = indexContent.replace(indexRegex, `$1${newVersion}`);
        fs.writeFileSync(indexPath, indexContent, 'utf8');
        console.log(`✓ Updated index.html to version ${newVersion}`);
    } else {
        console.error('Error: Could not find version pattern in index.html');
    }

    // Generate timestamp in format MM.DD::HH:MM
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timestamp = `${month}.${day}::${hours}:${minutes}`;

    // Update README.md
    let readmeContent = fs.readFileSync(readmePath, 'utf8');
    const lines = readmeContent.split('\n');
    
    // Find and update version line
    const versionIndex = lines.findIndex(line => /NOTD\* \d+\.\d+\.\d+/.test(line));
    
    if (versionIndex !== -1) {
        lines[versionIndex] = `NOTD* ${newVersion}`;
        
        // Check if timestamp exists on the next non-empty line
        let timestampIndex = versionIndex + 1;
        while (timestampIndex < lines.length && lines[timestampIndex].trim() === '') {
            timestampIndex++;
        }
        
        if (timestampIndex < lines.length && /\d{2}\.\d{2}::\d{2}:\d{2}/.test(lines[timestampIndex])) {
            // Update existing timestamp
            lines[timestampIndex] = timestamp;
        } else {
            // Add timestamp after version (with blank line)
            lines.splice(versionIndex + 1, 0, '', timestamp);
        }
        
        readmeContent = lines.join('\n');
        fs.writeFileSync(readmePath, readmeContent, 'utf8');
        console.log(`✓ Updated README.md to version ${newVersion}`);
        console.log(`✓ Updated timestamp to ${timestamp}`);
    } else {
        // Pattern not found, add it after "# NOTES*" line
        const notesIndex = lines.findIndex(line => line.includes('# NOTES*'));
        
        if (notesIndex !== -1) {
            lines.splice(notesIndex + 1, 0, '', `NOTD* ${newVersion}`, '', timestamp);
            readmeContent = lines.join('\n');
            fs.writeFileSync(readmePath, readmeContent, 'utf8');
            console.log(`✓ Added version to README.md: ${newVersion}`);
            console.log(`✓ Added timestamp: ${timestamp}`);
        } else {
            console.error('Error: Could not find version pattern or "# NOTES*" in README.md');
        }
    }

    console.log(`\n✓ Successfully updated to version ${newVersion}`);
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
