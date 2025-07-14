class SpotifyError extends Error {
  constructor(message, code = 'SPOTIFY_ERROR') {
    super(message);
    this.name = 'SpotifyError';
    this.code = code;
  }
}

class AuthenticationError extends SpotifyError {
  constructor(message = 'Authentication failed') {
    super(message, 'AUTH_ERROR');
    this.name = 'AuthenticationError';
  }
}

class TokenExpiredError extends SpotifyError {
  constructor(message = 'Access token expired') {
    super(message, 'TOKEN_EXPIRED');
    this.name = 'TokenExpiredError';
  }
}

class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigurationError';
    this.code = 'CONFIG_ERROR';
  }
}

class RetryableError extends SpotifyError {
  constructor(message, originalError) {
    super(message, 'RETRYABLE_ERROR');
    this.name = 'RetryableError';
    this.originalError = originalError;
  }
}

module.exports = {
  SpotifyError,
  AuthenticationError,
  TokenExpiredError,
  ConfigurationError,
  RetryableError
};