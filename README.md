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

### Development Setup (Optional)
For local development, you can use `npm link` to create a symbolic link:
```bash
npm link
song-of-the-day
```
This allows you to test changes without reinstalling the package globally.

## Features

- **Random Selection**: Picks a random song from your expanded Spotify library
- **History Tracking**: Avoids repeating recently played songs (last 100 by default)
- **Multiple Music Sources**: 
  - 💖 **Saved Tracks**: Your "Liked Songs" library
  - 📝 **User Playlists**: Songs from playlists you've created
  - 💿 **Saved Albums**: All tracks from albums you've saved to your library
  - 👥 **Followed Artists**: Top tracks from artists you follow
- **Smart Deduplication**: Automatically removes duplicate songs across all sources
- **Source Tracking**: Each song shows where it came from (saved/playlist/album/artist)
- **Preview URLs**: Shows preview links when available
- **CLI Interface**: Easy-to-use command line interface with detailed progress feedback

## Authentication

On first run, you'll be prompted to authenticate with Spotify. The app requires the following permissions:
- `user-read-private` - Access your basic profile information
- `user-library-read` - Access your saved tracks and albums
- `playlist-read-private` - Access your private playlists
- `user-follow-read` - Access artists you follow

The authentication flow:
1. Opens your browser to Spotify's authorization page
2. After you authorize, it redirects to a local callback
3. Saves your tokens for future use

Tokens are automatically refreshed when they expire. If you've used the app before, you'll need to re-authenticate to grant the new `user-follow-read` permission.

## File Structure

- `index.js` - Main CLI application
- `spotify-auth.js` - Handles Spotify authentication
- `song-fetcher.js` - Fetches songs from Spotify API
- `song-selector.js` - Random selection with history tracking
- `.spotify-tokens.json` - Stored authentication tokens (created automatically)
- `.song-history.json` - Song selection history (created automatically)

## Roadmap

### 🔥 High Priority
1. **Smart Selection Algorithms**
   - Weight by play count, recently added, or user preferences
   - Mood-based selection (happy, sad, energetic)
   - Genre-based filtering and selection
   - Source-based weighting (prefer albums vs singles vs followed artists)

2. **Enhanced History Management**
   - View detailed history with dates and ratings
   - Export history to CSV/JSON
   - Configure history size limits

3. **Improved Error Handling**
   - Better messaging for empty libraries
   - Retry logic for API failures
   - Offline mode with cached data

### 🚀 Medium Priority
4. **User Preferences & Configuration**
   - Save preferred genres, artists, or time periods
   - Configure selection criteria (exclude explicit, minimum popularity)
   - Custom weight settings for different sources (saved tracks vs albums vs followed artists)
   - Toggle sources on/off (disable followed artists, focus on saved albums, etc.)

5. **Social Features**
   - Share today's song on social media
   - Export song details with album artwork
   - Create shareable song cards

6. **Scheduling & Automation**
   - Cron job integration for daily selection
   - System notifications for new songs
   - Integration with calendar apps

### 💡 Low Priority
7. **Advanced Analytics**
   - Track listening patterns over time
   - Most played artists/genres statistics
   - Discover music trends in your library

8. **Multiple Selection Modes**
   - Song of the week/month
   - Themed selections (throwback Thursday, new music Friday)
   - Playlist generation from history

9. **Integration Features**
   - Last.fm scrobbling integration
   - Apple Music/YouTube Music support
   - Discord bot integration

10. **Performance Optimizations**
    - Cache song metadata locally
    - Incremental library updates
    - Faster startup times

### 🎯 Future Ideas
11. **Machine Learning**
    - Predict songs you'll like based on history
    - Seasonal recommendations
    - Time-of-day appropriate selections

12. **Web Interface**
    - Simple web dashboard
    - Mobile-responsive design
    - Real-time updates