import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey: `${GEMINI_API_KEY}`});

export default function GeminiFlashService() {
	async function getSongs(query) {
		try {
			console.log('Sending request to Gemini Flash API via GoogleGenAI SDK');

			const response = await ai.models.generateContent({
				model: `${GEMINI_MODEL}`,
				contents: `Recommend exactly {GEMINI_SONGS_COUNT} songs based on: "${query}". 
                Format the response as a numbered list like:
                1. Artist - Song Title
                2. Artist - Song Title
                Only include the list, no extra text.`,
            });

			if (!response || !response.text) {
				throw new Error('Invalid response format from Gemini Flash API');
			}

			console.log('Gemini Flash API response text:', response.text);

			const songs = parseSongs(response.text);
			console.log('Parsed songs:', songs);

			return songs.slice(0, GEMINI_SONGS_COUNT || 5);
		} catch (error) {
			console.error('Gemini Flash API error details:', error);
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
				const artist = parts[0].trim();
				const title = parts.slice(1).join(' - ').trim();
				return { artist, title };
			})
			.filter((song) => song.artist && song.title);
	}

	return { getSongs };
}
