#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
const readmePath = path.join(__dirname, 'README.md');

try {
    // Read README.md to get the latest version
    const readmeContent = fs.readFileSync(readmePath, 'utf8');
    
    // Find the Changelog section and get the first version (vX.X.X)
    const changelogMatch = readmeContent.match(/## Changelog\s+v(\d+\.\d+\.\d+)/);
    
    if (!changelogMatch) {
        console.error('Error: Could not find version in README.md changelog');
        console.error('Expected format: ## Changelog followed by vX.X.X');
        process.exit(1);
    }
    
    const version = changelogMatch[1];
    console.log(`\nFound version ${version} in README.md changelog`);
    
    // Update index.html
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    const indexRegex = /(NOTD\*<\/a>\s*<span[^>]*>(?:&nbsp;)*)\d+\.\d+\.\d+/;
    
    if (indexRegex.test(indexContent)) {
        indexContent = indexContent.replace(indexRegex, `$1${version}`);
        fs.writeFileSync(indexPath, indexContent, 'utf8');
        console.log(`✓ Updated index.html to version ${version}`);
    } else {
        console.error('Error: Could not find version pattern in index.html');
        process.exit(1);
    }

    console.log(`\n✓ Successfully synced version ${version} to index.html`);
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
