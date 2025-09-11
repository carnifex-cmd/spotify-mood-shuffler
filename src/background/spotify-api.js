
// Spotify API
export default function SpotifyApi() {
	async function searchTrack(artist, title, accessToken) {
		try {
			const query = encodeURIComponent(`artist:${artist} track:${title}`);
			const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`, {
				headers: { 'Authorization': `Bearer ${accessToken}` }
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

	async function getActiveDevice(accessToken) {
		try {
			console.log('Fetching Spotify devices...');
			const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
				headers: { 'Authorization': `Bearer ${accessToken}` }
			});
			console.log('Devices API response status:', response.status);
			if (!response.ok) {
				const errorText = await response.text();
				console.error('Spotify devices API error:', errorText);
				throw new Error(`Spotify devices error: ${response.status} - ${errorText}`);
			}
			const data = await response.json();
			console.log('Available devices:', data.devices);
			const activeDevice = data.devices.find((device) => device.is_active);
			const fallbackDevice = data.devices[0];
			console.log('Active device:', activeDevice);
			console.log('Fallback device:', fallbackDevice);
			return activeDevice || fallbackDevice || null;
		} catch (error) {
			console.error('Get devices error details:', error);
			return null;
		}
	}

	async function playTracks(trackUris, accessToken) {
		try {
			console.log('Starting playback for tracks:', trackUris);
			const device = await getActiveDevice(accessToken);
			if (!device) {
				throw new Error('No active Spotify device found. Please open Spotify on any device and start playing something first.');
			}
			console.log('Using device for playback:', device);

			const stateResponse = await fetch('https://api.spotify.com/v1/me/player', {
				headers: { 'Authorization': `Bearer ${accessToken}` }
			});
			console.log('Current playback state response:', stateResponse.status);
			if (stateResponse.status === 200) {
				const stateData = await stateResponse.json();
				console.log('Current playback state:', stateData);
			}

			const playbackBody = { uris: trackUris };
			const playUrl = device ? `https://api.spotify.com/v1/me/player/play?device_id=${device.id}` : 'https://api.spotify.com/v1/me/player/play';
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

	return { searchTrack, getActiveDevice, playTracks };
}
