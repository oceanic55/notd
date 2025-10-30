#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const versionPath = path.join(__dirname, 'Production', 'version.txt');
const indexPath = path.join(__dirname, 'index.html');
const readmePath = path.join(__dirname, 'README.md');

// Function to generate changelog from git changes
function generateChangelog() {
    try {
        // Get list of modified files since last commit
        const modifiedFiles = execSync('git diff --name-only HEAD', { encoding: 'utf8' })
            .split('\n')
            .filter(file => file.trim() !== '');
        
        // Get list of staged files
        const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
            .split('\n')
            .filter(file => file.trim() !== '');
        
        // Combine and deduplicate
        const allFiles = [...new Set([...modifiedFiles, ...stagedFiles])];
        
        // Filter out irrelevant files
        const relevantFiles = allFiles.filter(file => {
            const irrelevant = [
                'Production/version.txt',
                'README.md',
                '.DS_Store',
                '.gitignore',
                'node_modules/',
                '.git/',
                '.vscode/'
            ];
            return !irrelevant.some(pattern => file.includes(pattern));
        });
        
        if (relevantFiles.length === 0) {
            return 'Minor updates';
        }
        
        // Store changes by file type, then by file name
        const fileChanges = {
            CSS: {},
            JS: {},
            HTML: {},
            SVG: {}
        };
        
        for (const file of relevantFiles) {
            try {
                // Get diff for this file
                const diff = execSync(`git diff HEAD "${file}"`, { encoding: 'utf8' });
                const stagedDiff = execSync(`git diff --cached "${file}"`, { encoding: 'utf8' });
                const fullDiff = diff + stagedDiff;
                
                const fileName = path.basename(file, path.extname(file));
                const fileNameDisplay = fileName.replace(/-/g, ' ');
                
                // Analyze CSS changes
                if (file.endsWith('.css')) {
                    const changes = [];
                    if (fullDiff.includes('border-radius')) changes.push('rounded corners');
                    if (fullDiff.includes('width') || fullDiff.includes('max-width')) changes.push('width');
                    if (fullDiff.includes('padding')) changes.push('padding');
                    if (fullDiff.includes('mobile') || fullDiff.includes('@media')) changes.push('mobile layout');
                    if (fullDiff.includes('color') || fullDiff.includes('background')) changes.push('colors');
                    
                    if (changes.length > 0) {
                        fileChanges.CSS[fileNameDisplay] = changes;
                    }
                }
                
                // Analyze JS changes - be selective, avoid detecting same changes in update.js
                if (file.endsWith('.js') && !file.includes('update.js')) {
                    const changes = [];
                    if (fullDiff.includes('rate limit') || fullDiff.includes('429')) changes.push('rate limit handling');
                    if (fullDiff.includes('max_tokens')) changes.push('token limits');
                    if (fullDiff.includes('showAnalysisModal') && fullDiff.includes('error')) changes.push('error display in modal');
                    
                    if (changes.length > 0) {
                        fileChanges.JS[fileNameDisplay] = changes;
                    }
                }
                
                // Analyze HTML changes
                if (file.endsWith('.html')) {
                    const changes = [];
                    
                    // Look for added buttons
                    const buttonMatches = fullDiff.match(/\+[^\n]*<button[^>]*>([^<]+)<\/button>/g);
                    if (buttonMatches) {
                        buttonMatches.forEach(match => {
                            const textMatch = match.match(/>([^<]+)</);
                            if (textMatch) {
                                const buttonText = textMatch[1].trim().toLowerCase();
                                if (buttonText && !buttonText.startsWith('+')) {
                                    changes.push(`${buttonText} button`);
                                }
                            }
                        });
                    }
                    
                    // Look for added divs with IDs
                    const divMatches = fullDiff.match(/\+[^\n]*<div[^>]*id="([^"]+)"/g);
                    if (divMatches) {
                        divMatches.forEach(match => {
                            const idMatch = match.match(/id="([^"]+)"/);
                            if (idMatch) {
                                const sectionName = idMatch[1].replace(/-/g, ' ');
                                changes.push(`${sectionName} section`);
                            }
                        });
                    }
                    
                    if (changes.length > 0) {
                        fileChanges.HTML[fileNameDisplay] = changes;
                    }
                }
                
                // Analyze SVG changes
                if (file.endsWith('.svg')) {
                    fileChanges.SVG[fileNameDisplay] = ['icon update'];
                }
            } catch (diffError) {
                // Skip files that error
                continue;
            }
        }
        
        // Build summary lines with 200 char limit
        const lines = [];
        
        // CSS line
        if (Object.keys(fileChanges.CSS).length > 0) {
            const cssEntries = Object.entries(fileChanges.CSS).map(([file, changes]) => 
                `${file}: ${changes.join(', ')}`
            );
            lines.push(`CSS: ${cssEntries.join('; ')}`);
        }
        
        // JS line
        if (Object.keys(fileChanges.JS).length > 0) {
            const jsEntries = Object.entries(fileChanges.JS).map(([file, changes]) => 
                `${file}: ${changes.join(', ')}`
            );
            lines.push(`JS: ${jsEntries.join('; ')}`);
        }
        
        // HTML line - remove duplicates
        if (Object.keys(fileChanges.HTML).length > 0) {
            const allHtmlChanges = [];
            Object.values(fileChanges.HTML).forEach(changes => {
                allHtmlChanges.push(...changes);
            });
            const uniqueHtmlChanges = [...new Set(allHtmlChanges)];
            lines.push(`HTML: ${uniqueHtmlChanges.join(', ')}`);
        }
        
        // SVG line
        if (Object.keys(fileChanges.SVG).length > 0) {
            const svgFiles = Object.keys(fileChanges.SVG).join(', ');
            lines.push(`SVG: ${svgFiles} icons`);
        }
        
        if (lines.length === 0) {
            return 'Minor updates';
        }
        
        // Join with newlines and ensure under 200 chars per line
        const formattedLines = lines.map(line => {
            if (line.length > 200) {
                return line.substring(0, 197) + '...';
            }
            return line;
        });
        
        return formattedLines.join('\n');
    } catch (error) {
        console.warn('Warning: Could not generate changelog from git. Using default message.');
        return 'Updates and improvements';
    }
}

try {
    // Read version from version.txt (only first line)
    const versionFileContent = fs.readFileSync(versionPath, 'utf8');
    const newVersion = versionFileContent.split('\n')[0].trim();
    
    // Validate version format (X.X.X)
    if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
        console.error('Error: Version must be in format X.X.X (e.g., 2.1.4)');
        console.error(`Found: "${newVersion}"`);
        process.exit(1);
    }
    
    console.log(`\nUpdating to version ${newVersion}...`);
    
    // Generate changelog automatically from git changes
    const changelog = generateChangelog();
    console.log('\nGenerated changelog:');
    console.log(changelog);

    // Update index.html
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    const indexRegex = /(NOTD\*<\/a>\s*<span[^>]*>(?:&nbsp;)*)\d+\.\d+\.\d+/;
    
    if (indexRegex.test(indexContent)) {
        indexContent = indexContent.replace(indexRegex, `$1${newVersion}`);
        fs.writeFileSync(indexPath, indexContent, 'utf8');
        console.log(`\n✓ Updated index.html to version ${newVersion}`);
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
    let readmeLines = readmeContent.split('\n');
    
    // Find and update version line
    const versionIndex = readmeLines.findIndex(line => /NOTD\* \d+\.\d+\.\d+/.test(line));
    
    if (versionIndex !== -1) {
        // Get old version before updating
        const oldVersionMatch = readmeLines[versionIndex].match(/\d+\.\d+\.\d+/);
        const oldVersion = oldVersionMatch ? oldVersionMatch[0] : null;
        
        // Update version line
        readmeLines[versionIndex] = `NOTD* ${newVersion}`;
        
        // Find where the existing changelog starts (after version line and empty line)
        const changelogStartIndex = versionIndex + 2;
        
        // Add version label to old changelog if it doesn't have one
        if (oldVersion && changelogStartIndex < readmeLines.length) {
            // Check if next non-empty line after version already has a version label
            let nextContentIndex = changelogStartIndex;
            while (nextContentIndex < readmeLines.length && readmeLines[nextContentIndex].trim() === '') {
                nextContentIndex++;
            }
            
            // If the old changelog exists and doesn't start with 'v', add version label
            if (nextContentIndex < readmeLines.length && 
                readmeLines[nextContentIndex].trim() !== '' && 
                !readmeLines[nextContentIndex].startsWith('v')) {
                readmeLines[nextContentIndex] = `v${oldVersion}\n${readmeLines[nextContentIndex]}`;
            }
        }
        
        // Prepend new changelog entry above existing content
        const newEntry = [
            '',
            changelog,
            '',
            timestamp,
            ''
        ];
        
        // Insert new entry after version line
        readmeLines.splice(changelogStartIndex, 0, ...newEntry);
        
        console.log(`✓ Added changelog to README.md`);
        
        readmeContent = readmeLines.join('\n');
        fs.writeFileSync(readmePath, readmeContent, 'utf8');
        console.log(`✓ Updated README.md to version ${newVersion}`);
        console.log(`✓ Updated timestamp to ${timestamp}`);
    } else {
        console.error('Error: Could not find version pattern in README.md');
    }

    console.log(`\n✓ Successfully updated to version ${newVersion}`);
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
