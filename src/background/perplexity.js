// Perplexity
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

// Fallback
const FallbackSongs = (function () {
	const fallbackSongs = {
		happy: [
			{ artist: 'Pharrell Williams', title: 'Happy' },
			{ artist: 'Justin Timberlake', title: "Can't Stop the Feeling!" },
			{ artist: 'Katrina and the Waves', title: 'Walking on Sunshine' },
			{ artist: 'Bob Marley', title: 'Three Little Birds' },
			{ artist: 'The Beatles', title: 'Here Comes the Sun' }
		],
		sad: [
			{ artist: 'Adele', title: 'Someone Like You' },
			{ artist: 'Sam Smith', title: 'Stay With Me' },
			{ artist: 'Simon & Garfunkel', title: 'The Sound of Silence' },
			{ artist: 'Johnny Cash', title: 'Hurt' },
			{ artist: 'Gary Jules', title: 'Mad World' }
		],
		energetic: [
			{ artist: 'The Weeknd', title: 'Blinding Lights' },
			{ artist: 'Dua Lipa', title: "Don't Start Now" },
			{ artist: 'Queen', title: "Don't Stop Me Now" },
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

	function get(query) {
		const queryLower = (query || '').toLowerCase();
		for (const mood in fallbackSongs) {
			if (Object.prototype.hasOwnProperty.call(fallbackSongs, mood)) {
				if (queryLower.includes(mood)) {
					return fallbackSongs[mood];
				}
			}
		}
		return fallbackSongs.happy;
	}

	return { get };
})();
