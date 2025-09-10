#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Read the background.js file
const backgroundPath = path.join(__dirname, 'background.js');
let backgroundContent = fs.readFileSync(backgroundPath, 'utf8');

// Define the replacements from environment variables using placeholders
const replacements = {
    '__SPOTIFY_CLIENT_ID__': process.env.VITE_SPOTIFY_CLIENT_ID || 'YOUR_SPOTIFY_CLIENT_ID_HERE',
    '__SPOTIFY_REDIRECT_URI__': process.env.VITE_SPOTIFY_REDIRECT_URI || 'YOUR_SPOTIFY_REDIRECT_URI_HERE',
    '__PERPLEXITY_API_KEY__': process.env.VITE_PERPLEXITY_API_KEY || 'YOUR_PERPLEXITY_API_KEY_HERE',
    '__PERPLEXITY_MODEL__': process.env.VITE_PERPLEXITY_MODEL || 'sonar',
    '__PERPLEXITY_SONGS_COUNT__': process.env.VITE_PERPLEXITY_SONGS_COUNT || '10',
    '__SPOTIFY_SCOPES__': process.env.VITE_SPOTIFY_SCOPES || 'user-modify-playback-state user-read-playback-state streaming user-read-private user-read-email'
};

// Apply replacements
for (const [placeholder, value] of Object.entries(replacements)) {
    // Handle string values (wrap in quotes)
    if (placeholder === '__PERPLEXITY_SONGS_COUNT__') {
        // Numbers don't need quotes
        backgroundContent = backgroundContent.replace(placeholder, value);
    } else {
        // Strings need quotes
        backgroundContent = backgroundContent.replace(`'${placeholder}'`, `'${value}'`);
    }
}

// Write the updated background.js to dist directory
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

fs.writeFileSync(path.join(distDir, 'background.js'), backgroundContent);
console.log('✅ Background script configured with environment variables');
