import TokenStorage from './src/background/token-storage.js';
import AuthService from './src/background/auth.js';
import PerplexityService from './src/background/perplexity.js';
import SpotifyApi from './src/background/spotify-api.js';
import SearchAndPlayService from './src/background/searchandplay.js';
import MessageRouter from './src/background/message-router.js';
import GeminiFlashService from './src/background/gemini-flash.js';

// Configuration - These placeholders will be replaced during build with actual values from .env
const CLIENT_ID = '__SPOTIFY_CLIENT_ID__';
const REDIRECT_URI = '__SPOTIFY_REDIRECT_URI__';
const PERPLEXITY_API_KEY = '__PERPLEXITY_API_KEY__';
const PERPLEXITY_MODEL = '__PERPLEXITY_MODEL__';
const PERPLEXITY_SONGS_COUNT = '__PERPLEXITY_SONGS_COUNT__';
const GEMINI_API_KEY = '__GEMINI_API_KEY__';
const GEMINI_SONGS_COUNT = '__GEMINI_SONGS_COUNT__';
const GEMINI_MODEL = '__GEMINI_MODEL__';
const SCOPES = '__SPOTIFY_SCOPES__';



// Bootstrap singletons and wiring
(function bootstrap() {
	const storage = TokenStorage();
	const auth = AuthService(storage);
	// const perplexity = PerplexityService();
	const gemini = GeminiFlashService();
	const spotifyApi = SpotifyApi();
	const searchAndPlay = SearchAndPlayService(gemini, spotifyApi);
	const router = MessageRouter({ auth, storage, searchAndPlay });

	chrome.runtime.onMessage.addListener(router.handleMessage);
})();
