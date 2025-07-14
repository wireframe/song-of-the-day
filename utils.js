const CONFIG = require('./config');
const { RetryableError } = require('./errors');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff(fn, maxAttempts = CONFIG.RETRY.MAX_ATTEMPTS) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        throw new RetryableError(
          `Failed after ${maxAttempts} attempts: ${error.message}`,
          error
        );
      }
      
      const delay = CONFIG.RETRY.INITIAL_DELAY * Math.pow(CONFIG.RETRY.BACKOFF_MULTIPLIER, attempt - 1);
      console.log(`⏳ Retry attempt ${attempt + 1}/${maxAttempts} in ${delay}ms...`);
      await sleep(delay);
    }
  }
}

module.exports = {
  sleep,
  retryWithBackoff
};