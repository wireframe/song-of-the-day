#!/usr/bin/env node

require('dotenv').config();
const { program } = require('commander');
const SpotifyAuth = require('./spotify-auth');
const SongFetcher = require('./song-fetcher');
const SongSelector = require('./song-selector');

async function selectSongOfTheDay() {
  try {
    console.log('🎵 Song of the Day Selector\n');
    
    const auth = new SpotifyAuth();
    const spotifyApi = await auth.authenticate();
    
    console.log('✅ Authenticated with Spotify');
    
    const fetcher = new SongFetcher(spotifyApi);
    console.log('📦 Fetching your music library...');
    
    const songs = await fetcher.getAllSongs();
    
    if (songs.length === 0) {
      console.log('❌ No songs found in your library. Make sure you have saved songs or playlists.');
      return;
    }
    
    console.log(`📚 Found ${songs.length} songs in your library`);
    
    const selector = new SongSelector();
    const selectedSong = selector.selectRandomSong(songs);
    
    console.log('\n🎯 Your Song of the Day:\n');
    console.log(`🎵 Song: ${selectedSong.name}`);
    console.log(`👤 Artist: ${selectedSong.artist}`);
    console.log(`💿 Album: ${selectedSong.album}`);
    console.log(`🔗 Spotify URL: ${selectedSong.url}`);
    console.log(`📱 Source: ${selectedSong.source}`);
    
    if (selectedSong.preview_url) {
      console.log(`🎧 Preview: ${selectedSong.preview_url}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function showHistory() {
  try {
    const selector = new SongSelector();
    const stats = selector.getHistoryStats();
    
    console.log('\n📊 Song History Stats:');
    console.log(`Total songs played: ${stats.totalPlayed}`);
    console.log(`Last 10 played: ${stats.lastPlayed.length} songs`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function clearHistory() {
  try {
    const selector = new SongSelector();
    selector.clearHistory();
    console.log('✅ Song history cleared');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function logout() {
  try {
    const fs = require('fs');
    const path = require('path');
    const tokenFile = path.join(__dirname, '.spotify-tokens.json');
    
    if (fs.existsSync(tokenFile)) {
      fs.unlinkSync(tokenFile);
      console.log('✅ Logged out successfully - tokens removed');
    } else {
      console.log('ℹ️ No active session found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

program
  .name('song-of-the-day')
  .description('CLI tool to select a random song of the day from your Spotify library')
  .version('1.0.0');

program
  .command('select')
  .description('Select a random song of the day')
  .action(selectSongOfTheDay);

program
  .command('history')
  .description('Show song history statistics')
  .action(showHistory);

program
  .command('clear-history')
  .description('Clear song history')
  .action(clearHistory);

program
  .command('logout')
  .description('Logout and remove stored authentication tokens')
  .action(logout);

program.parse();

if (process.argv.length === 2) {
  selectSongOfTheDay();
}