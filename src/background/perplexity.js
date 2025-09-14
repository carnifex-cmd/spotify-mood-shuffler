// Perplexity
import { FallbackSongs } from './fallback-songs.js';

export default function PerplexityService() {
	async function getSongs(query) {
		try {
			const requestBody = {
				model: PERPLEXITY_MODEL,
				messages: [
					{
						role: 'user',
						content: `I need exactly ${PERPLEXITY_SONGS_COUNT} song recommendations based on: "${query}". Please format your response as a simple numbered list with each song on a new line in the format: "Artist - Song Title". Only provide the song list, no other text.`
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

			const songs = parseSongs(songText);
			console.log('Parsed songs:', songs);
			return songs.slice(0, PERPLEXITY_SONGS_COUNT);
		} catch (error) {
			console.error('Perplexity API error details:', error);
			console.log('Using fallback songs due to API error');
			return FallbackSongs.get(query);
		}
	}

	function parseSongs(songText) {
		return songText
			.split('\n')
			.filter((line) => line.trim() && line.includes(' - '))
			.map((line) => {
				const cleanLine = line.trim().replace(/^\d+[\.\)]\s*/, '');
				const parts = cleanLine.split(' - ');
				const artist = parts[0] ? parts[0].trim() : '';
				const title = parts.slice(1).join(' - ').trim();
				return { artist, title };
			})
			.filter((song) => song.artist && song.title);
	}

	return { getSongs };
}

