/**
 * Fallback Songs Service
 * Provides fallback song recommendations when AI services fail
 */

export const FallbackSongs = (function () {
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
