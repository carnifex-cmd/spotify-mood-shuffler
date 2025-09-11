
// Orchestration
export default function SearchAndPlayService(perplexityService, spotifyApi) {
	async function execute(query, accessToken) {
		try {
			console.log('=== Starting search and play process ===');
			console.log('Query:', query);
			console.log('Step 1: Getting recommendations from Perplexity...');
			const songs = await perplexityService.getSongs(query);
			if (!songs || songs.length === 0) {
				throw new Error('No song recommendations found');
			}
			console.log(`Step 2: Found ${songs.length} song recommendations`);
			console.log('Step 3: Searching for tracks on Spotify...');
			const trackUris = [];
			for (const song of songs) {
				console.log(`Searching for: ${song.artist} - ${song.title}`);
				const trackUri = await spotifyApi.searchTrack(song.artist, song.title, accessToken);
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
			await spotifyApi.playTracks(trackUris, accessToken);
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

	return { execute };
}
