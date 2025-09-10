const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const SCOPES = 'user-modify-playback-state user-read-playback-state streaming user-read-private user-read-email';

function base64urlencode(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return base64urlencode(digest);
}

function generateCodeVerifier() {
    const array = new Uint8Array(32); // 32 bytes = 256 bits
    crypto.getRandomValues(array);
    return base64urlencode(array);
}

// Handle OAuth flow in background
async function handleSpotifyAuth() {
    try {
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);

        const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

        return new Promise((resolve, reject) => {
            chrome.identity.launchWebAuthFlow(
                { url: authUrl, interactive: true },
                async (redirectUrl) => {
                    if (chrome.runtime.lastError) {
                        console.error('Auth error:', chrome.runtime.lastError.message);
                        reject(new Error(chrome.runtime.lastError.message));
                        return;
                    }

                    try {
                        const params = new URL(redirectUrl).searchParams;
                        const code = params.get('code');

                        if (!code) {
                            console.error('Authorization code not found in redirect URL.');
                            reject(new Error('Authorization code missing'));
                            return;
                        }

                        // Exchange code for access token
                        const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: new URLSearchParams({
                                client_id: CLIENT_ID,
                                grant_type: 'authorization_code',
                                code: code,
                                redirect_uri: REDIRECT_URI,
                                code_verifier: codeVerifier
                            })
                        });

                        const tokenData = await tokenRes.json();

                        if (tokenData.access_token) {
                            // Store token in chrome storage
                            await chrome.storage.local.set({ 
                                spotifyAccessToken: tokenData.access_token,
                                tokenTimestamp: Date.now()
                            });
                            resolve(tokenData.access_token);
                        } else {
                            console.error('Failed to get access token:', tokenData);
                            reject(new Error('Failed to get access token'));
                        }
                    } catch (error) {
                        console.error('Token exchange error:', error);
                        reject(error);
                    }
                }
            );
        });
    } catch (error) {
        console.error('OAuth flow error:', error);
        throw error;
    }
}

// Perplexity API integration
async function getPerplexitySongs(query) {
    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY; // Replace with your API key
    
    try {
        const requestBody = {
            model: process.env.PERPLEXITY_MODEL,
            messages: [
                {
                    role: 'user',
                    content: `I need exactly ${process.env.PERPLEXITY_SONGS_COUNT} song recommendations based on: "${query}". Please format your response as a simple numbered list with each song on a new line in the format: "Artist - Song Title". Only provide the song list, no other text.`
                }
            ],
            max_tokens: 500,
            temperature: 0.3,
            stream: false
        };

        console.log('Sending request to Perplexity API:', JSON.stringify(requestBody, null, 2));

        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Perplexity API response status:', response.status);
        console.log('Perplexity API response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Perplexity API error response:', errorText);
            throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Perplexity API response data:', data);
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response format from Perplexity API');
        }

        const songText = data.choices[0].message.content;
        console.log('Song recommendations text:', songText);
        
        // Parse the response into individual songs
        const songs = songText.split('\n')
            .filter(line => line.trim() && line.includes(' - '))
            .map(line => {
                // Remove numbers and dots from the beginning (e.g., "1. " or "1) ")
                const cleanLine = line.trim().replace(/^\d+[\.\)]\s*/, '');
                const [artist, title] = cleanLine.split(' - ');
                return { artist: artist?.trim(), title: title?.trim() };
            })
            .filter(song => song.artist && song.title);

        console.log('Parsed songs:', songs);
        return songs.slice(0, 10); // Ensure we only return 10 songs
    } catch (error) {
        console.error('Perplexity API error details:', error);
        
        // Fallback to hardcoded songs if API fails
        console.log('Using fallback songs due to API error');
        return getFallbackSongs(query);
    }
}

// Fallback song recommendations when Perplexity API fails
function getFallbackSongs(query) {
    const fallbackSongs = {
        happy: [
            { artist: 'Pharrell Williams', title: 'Happy' },
            { artist: 'Justin Timberlake', title: 'Can\'t Stop the Feeling!' },
            { artist: 'Katrina and the Waves', title: 'Walking on Sunshine' },
            { artist: 'Bob Marley', title: 'Three Little Birds' },
            { artist: 'The Beatles', title: 'Here Comes the Sun' }
        ],
        sad: [
            { artist: 'Adele', title: 'Someone Like You' },
            { artist: 'Sam Smith', title: 'Stay With Me' },
            { artist: 'The Sound of Silence', title: 'Simon & Garfunkel' },
            { artist: 'Johnny Cash', title: 'Hurt' },
            { artist: 'Mad World', title: 'Gary Jules' }
        ],
        energetic: [
            { artist: 'The Weeknd', title: 'Blinding Lights' },
            { artist: 'Dua Lipa', title: 'Don\'t Start Now' },
            { artist: 'Queen', title: 'Don\'t Stop Me Now' },
            { artist: 'Survivor', title: 'Eye of the Tiger' },
            { artist: 'AC/DC', title: 'Thunderstruck' }
        ],
        chill: [
            { artist: 'Billie Eilish', title: 'Ocean Eyes' },
            { artist: 'Lorde', title: 'Ribs' },
            { artist: 'The XX', title: 'Intro' },
            { artist: 'Bon Iver', title: 'Skinny Love' },
            { artist: 'Norah Jones', title: 'Come Away With Me' }
        ]
    };

    const queryLower = query.toLowerCase();
    
    // Try to match query with mood categories
    for (const [mood, songs] of Object.entries(fallbackSongs)) {
        if (queryLower.includes(mood)) {
            return songs;
        }
    }
    
    // Default to happy songs if no match
    return fallbackSongs.happy;
}

// Spotify search functionality
async function searchSpotifyTrack(artist, title, accessToken) {
    try {
        const query = encodeURIComponent(`artist:${artist} track:${title}`);
        const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Spotify search error: ${response.status}`);
        }

        const data = await response.json();
        return data.tracks.items[0]?.uri || null;
    } catch (error) {
        console.error('Spotify search error:', error);
        return null;
    }
}

// Get user's active Spotify device
async function getActiveDevice(accessToken) {
    try {
        console.log('Fetching Spotify devices...');
        const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        console.log('Devices API response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Spotify devices API error:', errorText);
            throw new Error(`Spotify devices error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Available devices:', data.devices);
        
        const activeDevice = data.devices.find(device => device.is_active);
        const fallbackDevice = data.devices[0];
        
        console.log('Active device:', activeDevice);
        console.log('Fallback device:', fallbackDevice);
        
        return activeDevice || fallbackDevice || null;
    } catch (error) {
        console.error('Get devices error details:', error);
        return null;
    }
}

// Play songs on Spotify
async function playSpotifyTracks(trackUris, accessToken) {
    try {
        console.log('Starting playback for tracks:', trackUris);
        
        const device = await getActiveDevice(accessToken);
        
        if (!device) {
            throw new Error('No active Spotify device found. Please open Spotify on any device and start playing something first.');
        }

        console.log('Using device for playback:', device);

        // First, try to get current playback state
        const stateResponse = await fetch('https://api.spotify.com/v1/me/player', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        console.log('Current playback state response:', stateResponse.status);
        
        if (stateResponse.status === 200) {
            const stateData = await stateResponse.json();
            console.log('Current playback state:', stateData);
        }

        // Prepare playback request
        const playbackBody = {
            uris: trackUris
        };

        // Add device_id if we have a device
        const playUrl = device ? 
            `https://api.spotify.com/v1/me/player/play?device_id=${device.id}` : 
            'https://api.spotify.com/v1/me/player/play';

        console.log('Playback URL:', playUrl);
        console.log('Playback body:', JSON.stringify(playbackBody, null, 2));

        const response = await fetch(playUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(playbackBody)
        });

        console.log('Playback response status:', response.status);
        console.log('Playback response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Spotify playback error response:', errorText);
            
            // Handle specific error cases
            if (response.status === 403) {
                if (errorText.includes('PREMIUM_REQUIRED')) {
                    throw new Error('Spotify Premium is required for playback control');
                } else if (errorText.includes('NO_ACTIVE_DEVICE')) {
                    throw new Error('No active device found. Please start playing music on Spotify first');
                } else {
                    throw new Error(`Playback forbidden: ${errorText}. Make sure Spotify is open and playing.`);
                }
            } else if (response.status === 404) {
                throw new Error('Device not found. Please refresh and try again');
            } else {
                throw new Error(`Spotify playback error: ${response.status} - ${errorText}`);
            }
        }

        console.log('Playback started successfully');
        return true;
    } catch (error) {
        console.error('Spotify playback error details:', error);
        throw error;
    }
}

// Main search and play function
async function searchAndPlay(query, accessToken) {
    try {
        console.log('=== Starting search and play process ===');
        console.log('Query:', query);
        
        // Get song recommendations from Perplexity
        console.log('Step 1: Getting recommendations from Perplexity...');
        const songs = await getPerplexitySongs(query);
        
        if (!songs || songs.length === 0) {
            throw new Error('No song recommendations found');
        }

        console.log(`Step 2: Found ${songs.length} song recommendations`);

        // Search for tracks on Spotify
        console.log('Step 3: Searching for tracks on Spotify...');
        const trackUris = [];
        for (const song of songs) {
            console.log(`Searching for: ${song.artist} - ${song.title}`);
            const trackUri = await searchSpotifyTrack(song.artist, song.title, accessToken);
            if (trackUri) {
                console.log(`Found: ${trackUri}`);
                trackUris.push(trackUri);
            } else {
                console.log(`Not found on Spotify: ${song.artist} - ${song.title}`);
            }
        }

        if (trackUris.length === 0) {
            throw new Error('No songs found on Spotify. Try a different search term.');
        }

        console.log(`Step 4: Found ${trackUris.length} tracks on Spotify`);
        console.log('Step 5: Starting playback...');

        // Play the tracks
        await playSpotifyTracks(trackUris, accessToken);
        
        console.log('=== Playback successful ===');
        
        return {
            success: true,
            message: `Playing ${trackUris.length} songs based on "${query}"`,
            songsFound: trackUris.length,
            totalRecommendations: songs.length
        };
    } catch (error) {
        console.error('Search and play error:', error);
        throw error;
    }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Always return true to keep the message channel open for async responses
    
    if (request.action === 'spotifyAuth') {
        (async () => {
            try {
                const token = await handleSpotifyAuth();
                sendResponse({ success: true, token });
            } catch (error) {
                console.error('Spotify auth error:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }
    
    if (request.action === 'checkToken') {
        chrome.storage.local.get(['spotifyAccessToken'], (result) => {
            try {
                sendResponse({ 
                    success: true, 
                    hasToken: !!result.spotifyAccessToken,
                    token: result.spotifyAccessToken 
                });
            } catch (error) {
                console.error('Check token error:', error);
                sendResponse({ success: false, error: 'Failed to check token' });
            }
        });
        return true;
    }

    if (request.action === 'searchAndPlay') {
        (async () => {
            try {
                // Send immediate acknowledgment
                console.log('Starting search and play for:', request.query);
                
                const result = await searchAndPlay(request.query, request.accessToken);
                sendResponse({ success: true, message: result.message });
            } catch (error) {
                console.error('Search and play error:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    // If no matching action, send a response to prevent port closure
    sendResponse({ success: false, error: 'Unknown action' });
    return false;
});
