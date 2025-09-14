import TokenStorage from './src/background/token-storage.js';
import AuthService from './src/background/auth.js';
import SpotifyApi from './src/background/spotify-api.js';
import SearchAndPlayService from './src/background/searchandplay.js';
import MessageRouter from './src/background/message-router.js';
import AIServiceRegistry from './src/background/ai-service-registry.js';

// Configuration - These placeholders will be replaced during build with actual values from .env
const CLIENT_ID = '__SPOTIFY_CLIENT_ID__';
const REDIRECT_URI = '__SPOTIFY_REDIRECT_URI__';
const PERPLEXITY_API_KEY = '__PERPLEXITY_API_KEY__';
const PERPLEXITY_MODEL = '__PERPLEXITY_MODEL__';
const PERPLEXITY_SONGS_COUNT = '__PERPLEXITY_SONGS_COUNT__';
const GEMINI_API_KEY = '__GEMINI_API_KEY__';
const GEMINI_SONGS_COUNT = '__GEMINI_SONGS_COUNT__';
const GEMINI_MODEL = '__GEMINI_MODEL__';
const AI_SERVICE = '__AI_SERVICE__';
const SCOPES = '__SPOTIFY_SCOPES__';



// Bootstrap singletons and wiring
(function bootstrap() {
	const storage = TokenStorage();
	const auth = AuthService(storage);
	
	// Initialize AI service registry and get the configured service
	const aiRegistry = AIServiceRegistry();
	const aiService = aiRegistry.createService(AI_SERVICE);
	console.log(`Using AI service: ${AI_SERVICE}`);
	
	const spotifyApi = SpotifyApi();
	const searchAndPlay = SearchAndPlayService(aiService, spotifyApi);
	const router = MessageRouter({ auth, storage, searchAndPlay });

	chrome.runtime.onMessage.addListener(router.handleMessage);
})();
