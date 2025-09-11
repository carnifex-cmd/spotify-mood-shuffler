import React, { useState, useEffect } from 'react';

// Icon components as SVGs for premium feel
const SpotifyIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DB954">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
);

const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
    </svg>
);

const LoadingIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
        <path d="M21 12a9 9 0 11-6.219-8.56"/>
    </svg>
);

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
    </svg>
);

const Popup = () => {
    const [status, setStatus] = useState('Checking connection...');
    const [accessToken, setAccessToken] = useState(null);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Check for existing token on component mount
    useEffect(() => {
        chrome.runtime.sendMessage({ action: 'checkToken' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Runtime error:', chrome.runtime.lastError);
                setStatus('Error checking connection');
                return;
            }
            
            if (response && response.success && response.hasToken) {
                setAccessToken(response.token);
                setStatus('Spotify connected!');
            } else {
                setStatus('Not connected');
            }
        });
    }, []);

    const connectSpotify = async () => {
        setStatus('Connecting to Spotify...');
        
        chrome.runtime.sendMessage({ action: 'spotifyAuth' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Runtime error:', chrome.runtime.lastError);
                setStatus('Connection error occurred');
                return;
            }
            
            if (response && response.success) {
                setAccessToken(response.token);
                setStatus('Spotify connected!');
            } else {
                console.error('Auth failed:', response?.error);
                setStatus(`Authorization failed: ${response?.error || 'Unknown error'}`);
            }
        });
    };

    const handleSearch = async () => {
        if (!input.trim()) {
            setStatus('Please enter a song or mood');
            return;
        }

        if (!accessToken) {
            setStatus('Please connect to Spotify first');
            return;
        }

        setIsLoading(true);
        setStatus('Fetching songs...');

        chrome.runtime.sendMessage({ 
            action: 'searchAndPlay', 
            query: input.trim(),
            accessToken: accessToken 
        }, (response) => {
            setIsLoading(false);
            
            if (chrome.runtime.lastError) {
                console.error('Runtime error:', chrome.runtime.lastError);
                setStatus('Connection error occurred');
                return;
            }
            
            if (response && response.success) {
                setStatus(response.message || 'Songs are playing!');
                setInput(''); // Clear input after successful search
            } else {
                console.error('Search failed:', response?.error);
                setStatus(`Error: ${response?.error || 'Unknown error'}`);
            }
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSearch();
        }
    };

    // Premium dark theme palette
    const colors = {
        primary: '#ffffff',      // Pure white for premium contrast
        secondary: '#f8f9fa',    // Light gray for hover states
        accent: '#1DB954',       // Spotify green (signature color)
        surface: '#0a0a0a',      // Deep black background
        surfaceSecondary: '#1a1a1a', // Elevated dark surface
        surfaceTertiary: '#2a2a2a',  // Higher elevation surface
        border: '#333333',       // Subtle dark border
        text: '#ffffff',         // Pure white text
        textSecondary: '#b3b3b3', // Muted light gray
        textTertiary: '#666666'   // Darker gray for subtle elements
    };

    const styles = {
        container: {
            width: '380px',
            minHeight: '280px',
            background: colors.surface,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: '14px',
            lineHeight: '1.5',
            color: colors.text,
            overflow: 'hidden',
            borderRadius: '16px'
        },
        header: {
            padding: '32px 32px 24px',
            borderBottom: `1px solid ${colors.border}`,
            textAlign: 'center'
        },
        title: {
            margin: 0,
            fontSize: '18px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: colors.primary
        },
        content: {
            padding: '24px 32px 32px'
        },
        connectButton: {
            width: '100%',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: accessToken ? colors.surfaceSecondary : colors.primary,
            color: accessToken ? colors.textSecondary : colors.surface,
            border: `1px solid ${accessToken ? colors.border : colors.primary}`,
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '24px',
            opacity: isLoading ? 0.6 : 1
        },
        searchContainer: {
            marginBottom: '24px'
        },
        inputWrapper: {
            position: 'relative',
            marginBottom: '16px'
        },
        input: {
            width: '100%',
            height: '48px',
            padding: '0 16px',
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            fontSize: '14px',
            backgroundColor: colors.surfaceSecondary,
            color: colors.text,
            boxSizing: 'border-box',
            transition: 'border-color 0.2s ease',
            outline: 'none'
        },
        inputFocus: {
            borderColor: colors.primary
        },
        searchButton: {
            width: '100%',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: colors.primary,
            color: colors.surface,
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: isLoading || !input.trim() ? 0.4 : 1
        },
        statusContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 20px',
            backgroundColor: colors.surfaceTertiary,
            borderRadius: '12px',
            fontSize: '13px',
            color: colors.textSecondary
        },
        statusDot: {
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: accessToken ? colors.accent : colors.textTertiary,
            flexShrink: 0
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Mood Shuffler</h1>
            </div>
            
            <div style={styles.content}>
                <button 
                    onClick={connectSpotify} 
                    style={styles.connectButton}
                    disabled={isLoading}
                    onMouseEnter={(e) => {
                        if (!isLoading && !accessToken) {
                            e.target.style.backgroundColor = colors.surfaceTertiary;
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!accessToken) {
                            e.target.style.backgroundColor = colors.primary;
                        }
                    }}
                >
                    <SpotifyIcon />
                    {accessToken ? 'Connected to Spotify' : 'Connect to Spotify'}
                    {accessToken && <CheckIcon />}
                </button>

                {accessToken && (
                    <div style={styles.searchContainer}>
                        <div style={styles.inputWrapper}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Describe your mood or search for music..."
                                style={styles.input}
                                onFocus={(e) => {
                                    e.target.style.borderColor = colors.primary;
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = colors.border;
                                }}
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            style={styles.searchButton}
                            disabled={isLoading || !input.trim()}
                            onMouseEnter={(e) => {
                                if (!isLoading && input.trim()) {
                                    e.target.style.backgroundColor = colors.surfaceTertiary;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isLoading && input.trim()) {
                                    e.target.style.backgroundColor = colors.primary;
                                }
                            }}
                        >
                            {isLoading ? <LoadingIcon /> : <SearchIcon />}
                            {isLoading ? 'Finding music...' : 'Find & Play'}
                        </button>
                    </div>
                )}

                <div style={styles.statusContainer}>
                    <div style={styles.statusDot}></div>
                    <span>{status}</span>
                </div>
            </div>
        </div>
    );
};

export default Popup;
