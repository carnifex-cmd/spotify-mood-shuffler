# Spotify Mood Shuffler - Chrome Extension

A Chrome extension that uses AI services to recommend and play music on Spotify based on your mood or preferences.

## Features

- 🎵 AI-powered music recommendations
- 🎯 Mood-based song suggestions  
- 🔀 Automatic Spotify playlist creation and playback
- 🤖 Toggle between multiple AI services (Gemini Flash, Perplexity)
- 📱 Simple popup interface

## AI Service Configuration

This extension supports two AI services for music recommendations:

### Available Services

1. **Gemini Flash** (Default)
   - Google's Gemini AI model
   - Fast and efficient recommendations
   - Configurable song count

2. **Perplexity** 
   - Perplexity AI service
   - Alternative recommendation engine
   - Configurable model and song count

### Switching Between AI Services

You can toggle between AI services by setting the `VITE_AI_SERVICE` environment variable:

```bash
# Use Gemini Flash (default)
VITE_AI_SERVICE=gemini

# Use Perplexity
VITE_AI_SERVICE=perplexity
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Spotify Configuration
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=your_redirect_uri
VITE_SPOTIFY_SCOPES=user-modify-playback-state user-read-playback-state streaming user-read-private user-read-email

# AI Service Selection (gemini or perplexity)
VITE_AI_SERVICE=gemini

# Gemini Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GEMINI_MODEL=gemini-1.5-flash
VITE_GEMINI_SONGS_COUNT=5

# Perplexity Configuration  
VITE_PERPLEXITY_API_KEY=your_perplexity_api_key
VITE_PERPLEXITY_MODEL=sonar
VITE_PERPLEXITY_SONGS_COUNT=10
```

### Configuration Options

| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `VITE_AI_SERVICE` | AI service to use | `gemini` | `gemini`, `perplexity` |
| `VITE_GEMINI_SONGS_COUNT` | Number of songs Gemini should recommend | `5` | Any positive integer |
| `VITE_PERPLEXITY_SONGS_COUNT` | Number of songs Perplexity should recommend | `10` | Any positive integer |
| `VITE_PERPLEXITY_MODEL` | Perplexity model to use | `sonar` | Check Perplexity docs |
| `VITE_GEMINI_MODEL` | Gemini model to use | `gemini-1.5-flash` | Check Google AI docs |

## Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spotify-mood-shuffler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env` (if available)
   - Fill in your API keys and configuration

4. **Build the extension**
   ```bash
   npm run build
   ```

5. **Load the extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

## API Keys Setup

### Spotify API
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new application
3. Get your Client ID and set up redirect URIs

### Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add it to your `.env` file

### Perplexity API  
1. Go to [Perplexity API](https://www.perplexity.ai/)
2. Sign up and get an API key
3. Add it to your `.env` file

## Architecture

The extension uses a modular architecture with:

- **AI Service Registry**: Manages switching between different AI services
- **Fallback System**: Provides backup recommendations if AI services fail
- **Service Injection**: Clean dependency injection for testability
- **Environment-based Configuration**: Easy switching between services

### Key Components

- `ai-service-registry.js`: Central registry for AI services
- `gemini-flash.js`: Gemini AI service implementation  
- `perplexity.js`: Perplexity AI service implementation
- `fallback-songs.js`: Backup recommendations system
- `searchandplay.js`: Orchestrates AI recommendations and Spotify playback

## Usage

1. Click the extension icon in Chrome
2. Enter your mood or music preference (e.g., "happy", "energetic", "chill")
3. Click "Search and Play"
4. The extension will:
   - Get recommendations from your configured AI service
   - Search for tracks on Spotify
   - Create and play a playlist

## Development Commands

```bash
# Development build with file watching
npm run dev

# Production build
npm run build

# Lint code
npm run lint

# Run build configuration script
npm run build:config
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with both AI services
5. Submit a pull request

## License

[Add your license information here]

## Troubleshooting

### AI Service Issues
- Verify your API keys are correct
- Check that the `VITE_AI_SERVICE` variable is set correctly
- Look at the browser console for detailed error messages
- Try switching to the other AI service to isolate the issue

### Spotify Issues
- Ensure you have an active Spotify session
- Verify your Spotify API credentials
- Check that the required scopes are configured