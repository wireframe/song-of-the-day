# Song of the Day

A command line application that selects a random song of the day from your Spotify library.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create Spotify App:**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Add `http://127.0.0.1:3000/callback` as a redirect URI

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Spotify credentials:
   ```
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/callback
   ```

## Usage

### Basic Usage
```bash
node index.js
```

### Commands
```bash
# Select a random song of the day
node index.js select

# Show history statistics
node index.js history

# Clear song history
node index.js clear-history
```

### Install Globally
```bash
npm install -g .
song-of-the-day
```

## Features

- **Random Selection**: Picks a random song from your Spotify library
- **History Tracking**: Avoids repeating recently played songs
- **Multiple Sources**: Pulls from both saved tracks and your playlists
- **Preview URLs**: Shows preview links when available
- **CLI Interface**: Easy-to-use command line interface

## Authentication

On first run, you'll be prompted to authenticate with Spotify. The app will:
1. Open your browser to Spotify's authorization page
2. After you authorize, it will redirect to a local callback
3. Save your tokens for future use

Tokens are automatically refreshed when they expire.

## File Structure

- `index.js` - Main CLI application
- `spotify-auth.js` - Handles Spotify authentication
- `song-fetcher.js` - Fetches songs from Spotify API
- `song-selector.js` - Random selection with history tracking
- `.spotify-tokens.json` - Stored authentication tokens (created automatically)
- `.song-history.json` - Song selection history (created automatically)