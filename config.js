const CONFIG = {
  SPOTIFY_LIMITS: {
    SAVED_TRACKS: 50,
    PLAYLIST_TRACKS: 100
  },
  HISTORY_SIZE: 100,
  RETRY: {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY: 1000,
    BACKOFF_MULTIPLIER: 2
  },
  TOKEN_FILE: '.spotify-tokens.json',
  HISTORY_FILE: '.song-history.json'
};

module.exports = CONFIG;