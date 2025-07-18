const SpotifyWebApi = require('spotify-web-api-node');
const https = require('https');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const CONFIG = require('./config');
const { AuthenticationError, TokenExpiredError, ConfigurationError } = require('./errors');

class SpotifyAuth {
  constructor() {
    this.validateConfig();
    this.spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI
    });
    
    this.tokenFile = path.join(__dirname, CONFIG.TOKEN_FILE);
  }

  validateConfig() {
    const required = ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET', 'SPOTIFY_REDIRECT_URI'];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
      throw new ConfigurationError(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  async authenticate() {
    try {
      if (this.loadTokens()) {
        return this.spotifyApi;
      }
      
      return this.performAuthFlow();
    } catch (error) {
      throw new AuthenticationError(`Authentication failed: ${error.message}`);
    }
  }

  loadTokens() {
    try {
      if (fs.existsSync(this.tokenFile)) {
        const tokens = JSON.parse(fs.readFileSync(this.tokenFile, 'utf8'));
        this.spotifyApi.setAccessToken(tokens.access_token);
        this.spotifyApi.setRefreshToken(tokens.refresh_token);
        
        if (tokens.expires_at && Date.now() < tokens.expires_at) {
          return true;
        }
        
        return this.refreshTokens();
      }
    } catch (error) {
      console.error('Error loading tokens:', error.message);
    }
    return false;
  }

  async refreshTokens() {
    try {
      const data = await this.spotifyApi.refreshAccessToken();
      const tokens = {
        access_token: data.body.access_token,
        refresh_token: this.spotifyApi.getRefreshToken(),
        expires_at: Date.now() + (data.body.expires_in * 1000)
      };
      
      fs.writeFileSync(this.tokenFile, JSON.stringify(tokens, null, 2));
      this.spotifyApi.setAccessToken(tokens.access_token);
      return true;
    } catch (error) {
      throw new TokenExpiredError(`Failed to refresh access token: ${error.message}`);
    }
  }

  async handleTokenRefresh() {
    console.log('🔄 Token expired, attempting refresh...');
    try {
      await this.refreshTokens();
      console.log('✅ Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('❌ Token refresh failed:', error.message);
      return false;
    }
  }

  async performAuthFlow() {
    const scopes = ['user-read-private', 'user-library-read', 'playlist-read-private', 'user-follow-read'];
    const authorizeURL = this.spotifyApi.createAuthorizeURL(scopes);
    
    console.log('Please visit this URL to authorize the application:');
    console.log(authorizeURL);
    
    return new Promise((resolve, reject) => {
      const isHttps = process.env.SPOTIFY_REDIRECT_URI.startsWith('https://');
      const createServer = isHttps ? https.createServer : http.createServer;
      
      const server = createServer(async (req, res) => {
        const query = url.parse(req.url, true).query;
        
        if (query.code) {
          try {
            const data = await this.spotifyApi.authorizationCodeGrant(query.code);
            const tokens = {
              access_token: data.body.access_token,
              refresh_token: data.body.refresh_token,
              expires_at: Date.now() + (data.body.expires_in * 1000)
            };
            
            fs.writeFileSync(this.tokenFile, JSON.stringify(tokens, null, 2));
            this.spotifyApi.setAccessToken(tokens.access_token);
            this.spotifyApi.setRefreshToken(tokens.refresh_token);
            
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<h1>Authentication successful!</h1><p>You can close this window.</p>');
            
            server.close();
            resolve(this.spotifyApi);
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end('<h1>Authentication failed!</h1>');
            server.close();
            reject(new AuthenticationError(`Authorization failed: ${error.message}`));
          }
        } else if (query.error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end('<h1>Authentication cancelled!</h1>');
          server.close();
          reject(new AuthenticationError('Authentication cancelled by user'));
        }
      });
      
      const port = process.env.SPOTIFY_REDIRECT_URI.match(/:(\d+)/)?.[1] || 3000;
      server.listen(port, () => {
        console.log('Waiting for authentication...');
      });
    });
  }
}

module.exports = SpotifyAuth;