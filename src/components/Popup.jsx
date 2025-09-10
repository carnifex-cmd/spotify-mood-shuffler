import React, { useState, useEffect } from 'react';
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

    return (
        <div style={{ padding: '20px', width: '320px' }}>
            <h2>Spotify Mood Shuffler</h2>
            
            <button 
                onClick={connectSpotify} 
                style={{ 
                    width: '100%', 
                    padding: '10px', 
                    marginBottom: '15px',
                    backgroundColor: '#1db954',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
                disabled={isLoading}
            >
                Connect to Spotify
            </button>

            {accessToken && (
                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter a song or mood (e.g., 'happy', 'sad songs', 'upbeat pop')"
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            marginBottom: '10px',
                            boxSizing: 'border-box'
                        }}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSearch}
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: '#1db954',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.6 : 1
                        }}
                        disabled={isLoading || !input.trim()}
                    >
                        {isLoading ? 'Searching...' : 'Find & Play Songs'}
                    </button>
                </div>
            )}

            <div style={{ marginTop: '10px' }}>
                <strong>Status:</strong> {status}
            </div>
        </div>
    );
};

export default Popup;
