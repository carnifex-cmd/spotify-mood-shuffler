
// Utils
const Utils = (function () {
	function base64urlencode(buffer) {
		return btoa(String.fromCharCode(...new Uint8Array(buffer)))
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '');
	}

	async function generateCodeChallenge(codeVerifier) {
		const encoder = new TextEncoder();
		const data = encoder.encode(codeVerifier);
		const digest = await crypto.subtle.digest('SHA-256', data);
		return base64urlencode(digest);
	}

	function generateCodeVerifier() {
		const array = new Uint8Array(32);
		crypto.getRandomValues(array);
		return base64urlencode(array);
	}

	return {
		base64urlencode,
		generateCodeChallenge,
		generateCodeVerifier
	};
})();


// Auth
export default function AuthService(storage) {
	async function authenticate() {
		try {
			const codeVerifier = Utils.generateCodeVerifier();
			const codeChallenge = await Utils.generateCodeChallenge(codeVerifier);

			const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

			return await new Promise((resolve, reject) => {
				chrome.identity.launchWebAuthFlow(
					{ url: authUrl, interactive: true },
					async (redirectUrl) => {
						if (chrome.runtime.lastError) {
							console.error('Auth error:', chrome.runtime.lastError.message);
							reject(new Error(chrome.runtime.lastError.message));
							return;
						}

						try {
							const params = new URL(redirectUrl).searchParams;
							const code = params.get('code');

							if (!code) {
								console.error('Authorization code not found in redirect URL.');
								reject(new Error('Authorization code missing'));
								return;
							}

							const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
								method: 'POST',
								headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
								body: new URLSearchParams({
									client_id: CLIENT_ID,
									grant_type: 'authorization_code',
									code: code,
									redirect_uri: REDIRECT_URI,
									code_verifier: codeVerifier
								})
							});

							const tokenData = await tokenRes.json();

							if (tokenData.access_token) {
								await storage.setToken(tokenData.access_token);
								resolve(tokenData.access_token);
							} else {
								console.error('Failed to get access token:', tokenData);
								reject(new Error('Failed to get access token'));
							}
						} catch (error) {
							console.error('Token exchange error:', error);
							reject(error);
						}
					}
				);
			});
		} catch (error) {
			console.error('OAuth flow error:', error);
			throw error;
		}
	}

	return { authenticate };
}