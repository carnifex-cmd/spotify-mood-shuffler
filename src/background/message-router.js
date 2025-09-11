
// Message routing
export default function MessageRouter(services) {
	function handleMessage(request, sender, sendResponse) {
		if (request.action === 'spotifyAuth') {
			(async () => {
				try {
					const token = await services.auth.authenticate();
					sendResponse({ success: true, token });
				} catch (error) {
					console.error('Spotify auth error:', error);
					sendResponse({ success: false, error: error.message });
				}
			})();
			return true;
		}

		if (request.action === 'checkToken') {
			(async () => {
				try {
					const token = await services.storage.getToken();
					sendResponse({ success: true, hasToken: !!token, token });
				} catch (error) {
					console.error('Check token error:', error);
					sendResponse({ success: false, error: 'Failed to check token' });
				}
			})();
			return true;
		}

		if (request.action === 'searchAndPlay') {
			(async () => {
				try {
					console.log('Starting search and play for:', request.query);
					const result = await services.searchAndPlay.execute(request.query, request.accessToken);
					sendResponse({ success: true, message: result.message });
				} catch (error) {
					console.error('Search and play error:', error);
					sendResponse({ success: false, error: error.message });
				}
			})();
			return true;
		}

		sendResponse({ success: false, error: 'Unknown action' });
		return false;
	}

	return { handleMessage };
}
