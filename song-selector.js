const fs = require('fs');
const path = require('path');

class SongSelector {
  constructor() {
    this.historyFile = path.join(__dirname, '.song-history.json');
    this.maxHistorySize = 100;
  }

  selectRandomSong(songs) {
    if (songs.length === 0) {
      throw new Error('No songs available for selection');
    }

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
    const history = this.loadHistory();
    history.push(songId);
    
    if (history.length > this.maxHistorySize) {
      history.splice(0, history.length - this.maxHistorySize);
    }

    try {
      fs.writeFileSync(this.historyFile, JSON.stringify({ played: history }, null, 2));
    } catch (error) {
      console.error('Error saving history:', error.message);
    }
  }

  clearHistory() {
    try {
      if (fs.existsSync(this.historyFile)) {
        fs.unlinkSync(this.historyFile);
      }
    } catch (error) {
      console.error('Error clearing history:', error.message);
    }
  }

  getHistoryStats() {
    const history = this.loadHistory();
    return {
      totalPlayed: history.length,
      lastPlayed: history.slice(-10)
    };
  }
}

module.exports = SongSelector;