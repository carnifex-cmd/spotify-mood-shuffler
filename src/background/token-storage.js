export default function TokenStorage() {
	async function setToken(token) {
		await chrome.storage.local.set({
			spotifyAccessToken: token,
			tokenTimestamp: Date.now()
		});
	}

	function getToken() {
		return new Promise((resolve) => {
			chrome.storage.local.get(['spotifyAccessToken'], (result) => {
				resolve(result.spotifyAccessToken);
			});
		});
	}

	return { setToken, getToken };
}
