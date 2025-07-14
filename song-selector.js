const fs = require('fs');
const path = require('path');
const CONFIG = require('./config');
const { SpotifyError } = require('./errors');

class SongSelector {
  constructor() {
    this.historyFile = path.join(__dirname, CONFIG.HISTORY_FILE);
    this.maxHistorySize = CONFIG.HISTORY_SIZE;
  }

  selectRandomSong(songs) {
    if (songs.length === 0) {
      throw new SpotifyError('No songs available for selection');
    }

    try {
      const history = this.loadHistory();
      const availableSongs = songs.filter(song => !history.includes(song.id));
      
      let selectedSong;
      if (availableSongs.length === 0) {
        console.log('All songs have been played recently, clearing history...');
        this.clearHistory();
        selectedSong = songs[Math.floor(Math.random() * songs.length)];
      } else {
        selectedSong = availableSongs[Math.floor(Math.random() * availableSongs.length)];
      }

      this.addToHistory(selectedSong.id);
      return selectedSong;
    } catch (error) {
      throw new SpotifyError(`Failed to select random song: ${error.message}`);
    }
  }

  loadHistory() {
    try {
      if (fs.existsSync(this.historyFile)) {
        const history = JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
        return history.played || [];
      }
    } catch (error) {
      console.error('Error loading history:', error.message);
    }
    return [];
  }

  addToHistory(songId) {
    try {
      const history = this.loadHistory();
      history.push(songId);
      
      if (history.length > this.maxHistorySize) {
        history.splice(0, history.length - this.maxHistorySize);
      }

      fs.writeFileSync(this.historyFile, JSON.stringify({ played: history }, null, 2));
    } catch (error) {
      throw new SpotifyError(`Failed to save song history: ${error.message}`);
    }
  }

  clearHistory() {
    try {
      if (fs.existsSync(this.historyFile)) {
        fs.unlinkSync(this.historyFile);
      }
    } catch (error) {
      throw new SpotifyError(`Failed to clear song history: ${error.message}`);
    }
  }

  getHistoryStats() {
    try {
      const history = this.loadHistory();
      return {
        totalPlayed: history.length,
        lastPlayed: history.slice(-10)
      };
    } catch (error) {
      throw new SpotifyError(`Failed to get history stats: ${error.message}`);
    }
  }
}

module.exports = SongSelector;