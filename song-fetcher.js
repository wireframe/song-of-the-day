const CONFIG = require('./config');
const { SpotifyError, TokenExpiredError, RetryableError } = require('./errors');
const { retryWithBackoff } = require('./utils');

class SongFetcher {
  constructor(spotifyApi, auth) {
    this.spotifyApi = spotifyApi;
    this.auth = auth;
  }

  async getAllSongs() {
    try {
      const songs = [];
      
      console.log('🔍 Fetching saved tracks...');
      const savedTracks = await this.getSavedTracks();
      console.log(`📱 Found ${savedTracks.length} saved tracks`);
      songs.push(...savedTracks);
      
      console.log('🔍 Fetching playlist tracks...');
      const playlistTracks = await this.getPlaylistTracks();
      console.log(`📝 Found ${playlistTracks.length} playlist tracks`);
      songs.push(...playlistTracks);
      
      const uniqueSongs = this.removeDuplicates(songs);
      console.log(`🎵 Total unique songs: ${uniqueSongs.length}`);
      return uniqueSongs;
    } catch (error) {
      throw new SpotifyError(`Failed to fetch songs: ${error.message}`);
    }
  }

  async getSavedTracks() {
    return await retryWithBackoff(async () => {
      const tracks = [];
      let offset = 0;
      const limit = CONFIG.SPOTIFY_LIMITS.SAVED_TRACKS;
      
      try {
        while (true) {
          const response = await this.spotifyApi.getMySavedTracks({
            limit,
            offset
          });
          
          if (response.body.items.length === 0) break;
          
          response.body.items.forEach(item => {
            if (item.track) {
              tracks.push({
                id: item.track.id,
                name: item.track.name,
                artist: item.track.artists.map(a => a.name).join(', '),
                album: item.track.album.name,
                url: item.track.external_urls.spotify,
                preview_url: item.track.preview_url,
                source: 'saved'
              });
            }
          });
          
          offset += limit;
          if (response.body.items.length < limit) break;
        }
        
        return tracks;
      } catch (error) {
        if (error.message.includes('access token expired')) {
          if (await this.auth.handleTokenRefresh()) {
            throw new TokenExpiredError('Token refreshed, retrying...');
          }
        }
        throw new SpotifyError(`Error fetching saved tracks: ${error.message}`);
      }
    });
  }

  async getPlaylistTracks() {
    return await retryWithBackoff(async () => {
      const tracks = [];
      
      try {
        const playlists = await this.spotifyApi.getUserPlaylists();
        
        for (const playlist of playlists.body.items) {
          if (playlist.owner.id === (await this.spotifyApi.getMe()).body.id) {
            const playlistTracks = await this.getTracksFromPlaylist(playlist.id);
            tracks.push(...playlistTracks);
          }
        }
        
        return tracks;
      } catch (error) {
        if (error.message.includes('access token expired')) {
          if (await this.auth.handleTokenRefresh()) {
            throw new TokenExpiredError('Token refreshed, retrying...');
          }
        }
        throw new SpotifyError(`Error fetching playlist tracks: ${error.message}`);
      }
    });
  }

  async getTracksFromPlaylist(playlistId) {
    return await retryWithBackoff(async () => {
      const tracks = [];
      let offset = 0;
      const limit = CONFIG.SPOTIFY_LIMITS.PLAYLIST_TRACKS;
      
      try {
        while (true) {
          const response = await this.spotifyApi.getPlaylistTracks(playlistId, {
            offset,
            limit
          });
          
          if (response.body.items.length === 0) break;
          
          response.body.items.forEach(item => {
            if (item.track) {
              tracks.push({
                id: item.track.id,
                name: item.track.name,
                artist: item.track.artists.map(a => a.name).join(', '),
                album: item.track.album.name,
                url: item.track.external_urls.spotify,
                preview_url: item.track.preview_url,
                source: 'playlist'
              });
            }
          });
          
          offset += limit;
          if (response.body.items.length < limit) break;
        }
        
        return tracks;
      } catch (error) {
        if (error.message.includes('access token expired')) {
          if (await this.auth.handleTokenRefresh()) {
            throw new TokenExpiredError('Token refreshed, retrying...');
          }
        }
        throw new SpotifyError(`Error fetching tracks from playlist ${playlistId}: ${error.message}`);
      }
    });
  }

  removeDuplicates(songs) {
    const unique = new Map();
    songs.forEach(song => {
      if (!unique.has(song.id)) {
        unique.set(song.id, song);
      }
    });
    return Array.from(unique.values());
  }
}

module.exports = SongFetcher;