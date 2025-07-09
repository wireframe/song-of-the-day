class SongFetcher {
  constructor(spotifyApi) {
    this.spotifyApi = spotifyApi;
  }

  async getAllSongs() {
    try {
      const songs = [];
      
      const savedTracks = await this.getSavedTracks();
      songs.push(...savedTracks);
      
      const playlistTracks = await this.getPlaylistTracks();
      songs.push(...playlistTracks);
      
      return this.removeDuplicates(songs);
    } catch (error) {
      console.error('Error fetching songs:', error.message);
      return [];
    }
  }

  async getSavedTracks() {
    const tracks = [];
    let offset = 0;
    const limit = 50;
    
    try {
      while (true) {
        const response = await this.spotifyApi.getMySavedTracks({
          limit,
          offset
        });
        
        if (response.body.items.length === 0) break;
        
        response.body.items.forEach(item => {
          if (item.track && item.track.preview_url) {
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
    } catch (error) {
      console.error('Error fetching saved tracks:', error.message);
    }
    
    return tracks;
  }

  async getPlaylistTracks() {
    const tracks = [];
    
    try {
      const playlists = await this.spotifyApi.getUserPlaylists();
      
      for (const playlist of playlists.body.items) {
        if (playlist.owner.id === (await this.spotifyApi.getMe()).body.id) {
          const playlistTracks = await this.getTracksFromPlaylist(playlist.id);
          tracks.push(...playlistTracks);
        }
      }
    } catch (error) {
      console.error('Error fetching playlist tracks:', error.message);
    }
    
    return tracks;
  }

  async getTracksFromPlaylist(playlistId) {
    const tracks = [];
    let offset = 0;
    const limit = 100;
    
    try {
      while (true) {
        const response = await this.spotifyApi.getPlaylistTracks(playlistId, {
          offset,
          limit
        });
        
        if (response.body.items.length === 0) break;
        
        response.body.items.forEach(item => {
          if (item.track && item.track.preview_url) {
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
    } catch (error) {
      console.error('Error fetching playlist tracks:', error.message);
    }
    
    return tracks;
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