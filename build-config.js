#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Read the bundled background.js file from dist directory
const backgroundPath = path.join(__dirname, 'dist', 'background.js');
let backgroundContent = fs.readFileSync(backgroundPath, 'utf8');

// Define the replacements from environment variables using placeholders
const replacements = {
    '__SPOTIFY_CLIENT_ID__': { value: process.env.VITE_SPOTIFY_CLIENT_ID || 'YOUR_SPOTIFY_CLIENT_ID_HERE', templateVar: 'CLIENT_ID' },
    '__SPOTIFY_REDIRECT_URI__': { value: process.env.VITE_SPOTIFY_REDIRECT_URI || 'YOUR_SPOTIFY_REDIRECT_URI_HERE', templateVar: 'REDIRECT_URI' },
    '__PERPLEXITY_API_KEY__': { value: process.env.VITE_PERPLEXITY_API_KEY || 'YOUR_PERPLEXITY_API_KEY_HERE', templateVar: 'PERPLEXITY_API_KEY' },
    '__PERPLEXITY_MODEL__': { value: process.env.VITE_PERPLEXITY_MODEL || 'sonar', templateVar: 'PERPLEXITY_MODEL' },
    '__PERPLEXITY_SONGS_COUNT__': { value: process.env.VITE_PERPLEXITY_SONGS_COUNT || '10', templateVar: 'PERPLEXITY_SONGS_COUNT' },
    '__SPOTIFY_SCOPES__': { value: process.env.VITE_SPOTIFY_SCOPES || 'user-modify-playback-state user-read-playback-state streaming user-read-private user-read-email', templateVar: 'SCOPES' }
};

// Apply replacements
for (const [placeholder, config] of Object.entries(replacements)) {
    // Handle string values (wrap in quotes) and template literals
    if (placeholder === '__PERPLEXITY_SONGS_COUNT__') {
        // Numbers don't need quotes - handle quoted strings, template literals, and function arguments
        backgroundContent = backgroundContent.replace(new RegExp(`'${placeholder}'`, 'g'), config.value);
        backgroundContent = backgroundContent.replace(new RegExp(`\\$\\{${config.templateVar}\\}`, 'g'), config.value);
        backgroundContent = backgroundContent.replace(new RegExp(`\\b${config.templateVar}\\b`, 'g'), config.value);
    } else {
        // Handle different contexts differently
        
        // 1. Quoted placeholders should remain quoted
        backgroundContent = backgroundContent.replace(new RegExp(`'${placeholder}'`, 'g'), `'${config.value}'`);
        
        // 2. Template literals should use raw values (no quotes needed)
        backgroundContent = backgroundContent.replace(new RegExp(`\\$\\{${config.templateVar}\\}`, 'g'), config.value);
        
        // 3. Function arguments and object values need quotes for strings
        backgroundContent = backgroundContent.replace(new RegExp(`\\b${config.templateVar}\\b`, 'g'), `"${config.value}"`);
    }
}

// Write the updated background.js back to dist directory
fs.writeFileSync(backgroundPath, backgroundContent);
console.log('Background script configured with environment variables... all good.');
