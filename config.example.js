/**
 * Configuration template for Marvel Quiz
 * 
 * For production deployment:
 * 1. Copy this file to 'config.local.js'
 * 2. Add your own Marvel API keys
 * 3. Update script.js to import from config.local.js
 * 4. Make sure config.local.js is in .gitignore
 */

const CONFIG = {
  // Marvel API Configuration
  // Get your keys at: https://developer.marvel.com/
  MARVEL_PUBLIC_KEY: 'your_public_key_here',
  MARVEL_PRIVATE_KEY: 'your_private_key_here',
  MARVEL_API_BASE: 'https://gateway.marvel.com/v1/public',
  
  // Quiz Settings
  DEFAULT_QUESTION_COUNT: 5,
  ANSWER_DELAY: 1500, // milliseconds
  MAX_CHARACTERS_TO_FETCH: 50,
  
  // Question Types
  QUESTION_TYPES: {
    NAME: 'name',
    DESCRIPTION: 'description',
    SERIES: 'series',
    COMICS: 'comics'
  },
  
  // UI Settings
  ANIMATIONS_ENABLED: true,
  SHOW_CHARACTER_IMAGES: true,
  
  // Performance Settings
  ENABLE_CACHING: false, // Enable for production
  CACHE_DURATION: 3600000, // 1 hour in milliseconds
  
  // Feature Flags
  FEATURES: {
    SOCIAL_SHARING: true,
    DIFFICULTY_SELECTION: true,
    TIMER_MODE: false, // Future feature
    MULTIPLAYER: false // Future feature
  },
  
  // Analytics (Optional)
  ANALYTICS_ENABLED: false,
  GOOGLE_ANALYTICS_ID: '', // Your GA4 ID
  
  // Error Handling
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000 // milliseconds
};

// Export for use in application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
