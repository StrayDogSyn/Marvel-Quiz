/**
 * Marvel Quiz Application
 * A modern, interactive quiz application using the SuperHero API
 * Migrated from Marvel API (deprecated October 29, 2025)
 * @version 3.0.3
 * @updated 2025-11-10 - Enhanced image loading with multi-layer fallbacks
 */

// ===========================
// Configuration & Constants
// ===========================
const CONFIG = {
  // API endpoint - uses serverless function to fetch SuperHero API data
  // Must use full Vercel URL when hosted on GitHub Pages
  API_ENDPOINT: window.location.hostname === 'straydogsyn.github.io' 
    ? 'https://marvel-quiz-project-ihuxs5kyp-eric-hunter-petross-projects.vercel.app/api/superhero-characters'
    : '/api/superhero-characters',
  
  // Quiz settings
  DEFAULT_QUESTION_COUNT: 5,
  ANSWER_DELAY: 1500, // Delay before showing next question (ms)
  
  // Question types
  QUESTION_TYPES: {
    NAME: 'name',
    DESCRIPTION: 'description',
    SERIES: 'series',
    COMICS: 'comics'
  }
};

// ===========================
// State Management
// ===========================
class QuizState {
  constructor() {
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.totalQuestions = CONFIG.DEFAULT_QUESTION_COUNT;
    this.characters = [];
    this.isAnswered = false;
  }

  reset() {
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.isAnswered = false;
    this.questions = [];
  }

  incrementScore() {
    this.score++;
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    this.isAnswered = false;
  }

  isQuizComplete() {
    return this.currentQuestionIndex >= this.totalQuestions;
  }

  getCurrentQuestion() {
    return this.questions[this.currentQuestionIndex];
  }
}

// ===========================
// SuperHero API Service with Fallback
// ===========================
class MarvelAPIService {
  /**
   * Fetch Marvel characters using serverless SuperHero API proxy
   * Supports difficulty levels and automatic fallback
   */
  static async fetchCharacters(limit = 30, difficulty = null) {
    const params = new URLSearchParams({
      count: limit
    });

    // Add difficulty parameter if specified
    if (difficulty) {
      params.append('difficulty', difficulty);
    }

    const url = `${CONFIG.API_ENDPOINT}?${params}`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Check if using fallback data
      if (data.source === 'fallback') {
        console.info('📦 Using fallback data source');
        UIController.showNotification('Using offline character data', 'info');
      } else {
        console.info('🌐 Using SuperHero API data');
      }

      // Filter and enhance characters with additional computed data
      const validCharacters = data.data.results.filter(char => 
        char.name && 
        char.description && 
        char.description.length > 10 &&
        char.thumbnail &&
        char.thumbnail.path
      ).map(char => ({
        ...char,
        // Add computed fields for enhanced quiz questions
        hasHighIntelligence: char.powerstats?.intelligence > 80,
        hasHighStrength: char.powerstats?.strength > 80,
        isBalanced: MarvelAPIService.isBalancedCharacter(char.powerstats),
        dominantStat: MarvelAPIService.getDominantStat(char.powerstats),
        powerLevel: MarvelAPIService.calculatePowerLevel(char.powerstats)
      }));

      if (validCharacters.length === 0) {
        throw new Error('No valid characters found');
      }

      return validCharacters;
    } catch (error) {
      console.error('Error fetching Marvel data:', error);
      
      // Try fallback explicitly
      try {
        console.warn('Attempting explicit fallback...');
        const fallbackUrl = `${CONFIG.API_ENDPOINT}?count=${limit}&fallback=true${difficulty ? `&difficulty=${difficulty}` : ''}`;
        const fallbackResponse = await fetch(fallbackUrl);
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          UIController.showNotification('Using offline character data', 'warning');
          return fallbackData.data.results;
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
      
      throw error;
    }
  }

  /**
   * Calculate if character has balanced stats
   */
  static isBalancedCharacter(powerstats) {
    if (!powerstats) return false;
    const stats = Object.values(powerstats)
      .filter(v => v !== 'null' && !isNaN(parseInt(v)))
      .map(v => parseInt(v));
    
    if (stats.length === 0) return false;
    
    const avg = stats.reduce((sum, val) => sum + val, 0) / stats.length;
    const variance = stats.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / stats.length;
    
    return Math.sqrt(variance) < 20; // Low variance = balanced
  }

  /**
   * Get character's dominant stat
   */
  static getDominantStat(powerstats) {
    if (!powerstats) return null;
    
    let maxStat = 0;
    let dominant = null;
    
    Object.entries(powerstats).forEach(([stat, value]) => {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue > maxStat) {
        maxStat = numValue;
        dominant = stat;
      }
    });
    
    return dominant;
  }

  /**
   * Calculate overall power level
   */
  static calculatePowerLevel(powerstats) {
    if (!powerstats) return 0;
    
    const stats = Object.values(powerstats)
      .filter(v => v !== 'null' && !isNaN(parseInt(v)))
      .map(v => parseInt(v));
    
    if (stats.length === 0) return 0;
    
    return Math.round(stats.reduce((sum, val) => sum + val, 0) / stats.length);
  }
}

// ===========================
// Question Generator
// ===========================
class QuestionGenerator {
  /**
   * Create a diverse set of quiz questions
   */
  static createQuestions(characters, count) {
    if (characters.length < 4) {
      throw new Error('Not enough characters to create quiz');
    }

    const questions = [];
    const usedCharacters = new Set();

    while (questions.length < count && usedCharacters.size < characters.length) {
      const character = this.getRandomCharacter(characters, usedCharacters);
      usedCharacters.add(character.id);

      const questionTypes = [
        this.createNameQuestion,
        this.createDescriptionQuestion,
      ];

      const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      const question = questionType.call(this, character, characters);

      if (question) {
        questions.push(question);
      }
    }

    return questions;
  }

  /**
   * Get a random character not yet used
   */
  static getRandomCharacter(characters, usedCharacters) {
    let attempts = 0;
    let character;
    
    do {
      character = characters[Math.floor(Math.random() * characters.length)];
      attempts++;
    } while (usedCharacters.has(character.id) && attempts < 100);

    return character;
  }

  /**
   * Create "Who is this character?" question with image
   */
  static createNameQuestion(character, allCharacters) {
    const wrongAnswers = this.getRandomCharacters(allCharacters, 3, character.id);
    const answers = this.shuffleArray([
      this.cleanCharacterName(character.name),
      ...wrongAnswers.map(c => this.cleanCharacterName(c.name))
    ]);

    // Get image URL - simplified approach
    const imageUrl = this.getCharacterImageUrl(character);

    return {
      type: 'name',
      question: 'Who is this character?',
      image: imageUrl,
      characterName: character.name,
      answers: answers,
      correctAnswer: this.cleanCharacterName(character.name),
      explanation: character.description || `${character.name} is a Marvel character.`
    };
  }

  /**
   * Get image URL for character with reliable fallback
   */
  static getCharacterImageUrl(character) {
    console.log('Getting image for character:', character.name);
    console.log('Thumbnail data:', character.thumbnail);
    
    // Try direct path from SuperHero API
    if (character.thumbnail?.path) {
      const url = character.thumbnail.path;
      console.log('Using thumbnail path:', url);
      
      // Validate it's actually a URL
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
      }
      
      console.warn('Invalid thumbnail path, using placeholder');
    }
    
    // Return SVG placeholder as reliable fallback
    console.log('Using SVG placeholder for:', character.name);
    return this.createPlaceholderSVG(character.name || 'Marvel Hero');
  }

  /**
   * Create SVG placeholder for character
   */
  static createPlaceholderSVG(characterName = 'Marvel Hero') {
    // Clean the name to avoid XML/encoding issues
    const cleanName = (characterName || 'Marvel Hero')
      .replace(/[<>&'"]/g, '')
      .substring(0, 30);
    
    const uniqueId = Math.random().toString(36).substring(7);
    
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
<defs>
<linearGradient id="grad${uniqueId}" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:#ed1d24;stop-opacity:1"/>
<stop offset="100%" style="stop-color:#c41e3a;stop-opacity:1"/>
</linearGradient>
</defs>
<rect fill="url(#grad${uniqueId})" width="300" height="400" rx="15"/>
<text x="150" y="170" font-family="Arial,sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">MARVEL</text>
<text x="150" y="210" font-family="Arial,sans-serif" font-size="18" fill="rgba(255,255,255,0.9)" text-anchor="middle">${cleanName}</text>
</svg>`;
    
    try {
      return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    } catch (e) {
      // If btoa fails, use percent encoding
      return 'data:image/svg+xml,' + encodeURIComponent(svg);
    }
  }

  /**
   * Create description-based question
   */
  static createDescriptionQuestion(character, allCharacters) {
    const wrongAnswers = this.getRandomCharacters(allCharacters, 3, character.id);
    const answers = this.shuffleArray([
      this.cleanCharacterName(character.name),
      ...wrongAnswers.map(c => this.cleanCharacterName(c.name))
    ]);

    // Clean and format the description
    let description = character.description || 'A superhero from the Marvel universe.';
    
    // Remove trailing periods before truncating
    description = description.replace(/\.\s*$/, '');
    
    // Truncate if too long
    if (description.length > 150) {
      description = description.substring(0, 150).trim();
      // Clean up incomplete sentences
      const lastPeriod = description.lastIndexOf('.');
      if (lastPeriod > 50) {
        description = description.substring(0, lastPeriod);
      }
      description += '...';
    }

    return {
      type: 'description',
      question: `Which character matches this description? "${description}"`,
      answers: answers,
      correctAnswer: this.cleanCharacterName(character.name),
      explanation: character.description
    };
  }

  /**
   * Get random characters excluding the current one
   */
  static getRandomCharacters(characters, count, excludeId) {
    const filtered = characters.filter(c => c.id !== excludeId);
    return this.shuffleArray(filtered).slice(0, count);
  }

  /**
   * Clean character name by removing parenthetical hints
   * Example: "Yellowjacket (Hank Pym)" becomes "Yellowjacket"
   */
  static cleanCharacterName(name) {
    // Remove anything in parentheses and trim whitespace
    return name.replace(/\s*\([^)]*\)/g, '').trim();
  }

  /**
   * Fisher-Yates shuffle algorithm
   */
  static shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// ===========================
// UI Controller
// ===========================
class UIController {
  constructor() {
    this.screens = {
      welcome: document.getElementById('welcome-screen'),
      loading: document.getElementById('loading-screen'),
      quiz: document.getElementById('quiz-screen'),
      results: document.getElementById('results-screen'),
      error: document.getElementById('error-screen')
    };

    this.elements = {
      startBtn: document.getElementById('start-btn'),
      restartBtn: document.getElementById('restart-btn'),
      retryBtn: document.getElementById('retry-btn'),
      shareBtn: document.getElementById('share-btn'),
      questionText: document.getElementById('question'),
      answersContainer: document.getElementById('answers'),
      characterImage: document.getElementById('character-image'),
      feedback: document.getElementById('feedback'),
      currentQuestion: document.getElementById('current-question'),
      totalQuestions: document.getElementById('total-questions'),
      currentScore: document.getElementById('current-score'),
      progressBar: document.getElementById('progress-bar'),
      finalScore: document.getElementById('final-score'),
      finalTotal: document.getElementById('final-total'),
      resultsIcon: document.getElementById('results-icon'),
      resultsTitle: document.getElementById('results-title'),
      resultsMessage: document.getElementById('results-message'),
      errorMessage: document.getElementById('error-message')
    };
  }

  /**
   * Show specific screen, hide others
   */
  showScreen(screenName) {
    Object.values(this.screens).forEach(screen => {
      screen.classList.add('d-none');
    });
    
    if (this.screens[screenName]) {
      this.screens[screenName].classList.remove('d-none');
    }
  }

  /**
   * Display current question
   */
  displayQuestion(question, questionNumber, total) {
    // Update progress
    this.elements.currentQuestion.textContent = questionNumber;
    this.elements.totalQuestions.textContent = total;
    
    const progressPercent = ((questionNumber - 1) / total) * 100;
    this.elements.progressBar.style.width = `${progressPercent}%`;

    // Display question
    this.elements.questionText.textContent = question.question;

    // Display character image - simplified and reliable
    if (question.image) {
      this.displayCharacterImage(question.image, question.characterName);
    } else {
      this.elements.characterImage.innerHTML = '';
    }

    // Clear previous answers and feedback
    this.elements.answersContainer.innerHTML = '';
    this.hideFeedback();

    // Create answer buttons
    question.answers.forEach((answer, index) => {
      const button = document.createElement('button');
      button.className = 'answer-btn';
      button.textContent = answer;
      button.dataset.answer = answer;
      this.elements.answersContainer.appendChild(button);
    });
  }

  /**
   * Display character image with simple, reliable loading
   */
  displayCharacterImage(imageUrl, characterName = 'Marvel Hero') {
    // If no URL provided, use placeholder immediately
    if (!imageUrl) {
      this.showPlaceholder(characterName);
      return;
    }

    // For data URIs (SVG placeholders), display directly
    if (imageUrl.startsWith('data:')) {
      this.elements.characterImage.innerHTML = `
        <div class="character-image-wrapper">
          <img src="${imageUrl}" alt="${characterName}" class="character-img" />
        </div>
      `;
      return;
    }

    // For external URLs, create img element with error handling
    const img = new Image();
    const wrapper = document.createElement('div');
    wrapper.className = 'character-image-wrapper';
    
    img.className = 'character-img';
    img.alt = characterName;
    
    img.onload = () => {
      wrapper.innerHTML = '';
      wrapper.appendChild(img);
      this.elements.characterImage.innerHTML = '';
      this.elements.characterImage.appendChild(wrapper);
    };
    
    img.onerror = () => {
      console.warn(`Failed to load image: ${imageUrl}`);
      this.showPlaceholder(characterName);
    };
    
    // Show loading state
    this.elements.characterImage.innerHTML = `
      <div class="character-image-wrapper">
        <div class="spinner-border text-danger" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;
    
    // Start loading
    img.src = imageUrl;
    
    // Timeout fallback
    setTimeout(() => {
      if (!img.complete) {
        console.warn(`Image load timeout: ${imageUrl}`);
        this.showPlaceholder(characterName);
      }
    }, 5000);
  }

  /**
   * Show placeholder graphic
   */
  showPlaceholder(characterName) {
    const svg = QuestionGenerator.createPlaceholderSVG(characterName);
    this.elements.characterImage.innerHTML = `
      <div class="character-image-wrapper">
        <img src="${svg}" alt="${characterName}" class="character-img" />
      </div>
    `;
  }

  /**
   * Update score display
   */
  updateScore(score) {
    this.elements.currentScore.textContent = score;
  }

  /**
   * Show feedback for answer
   */
  showFeedback(isCorrect, explanation = '') {
    this.elements.feedback.classList.remove('d-none', 'alert-success', 'alert-danger');
    
    if (isCorrect) {
      this.elements.feedback.classList.add('alert-success');
      this.elements.feedback.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        <strong>Correct!</strong> ${explanation}
      `;
    } else {
      this.elements.feedback.classList.add('alert-danger');
      this.elements.feedback.innerHTML = `
        <i class="fas fa-times-circle me-2"></i>
        <strong>Incorrect.</strong> ${explanation}
      `;
    }
  }

  /**
   * Hide feedback message
   */
  hideFeedback() {
    this.elements.feedback.classList.add('d-none');
  }

  /**
   * Mark answer button as correct or incorrect
   */
  markAnswer(button, isCorrect) {
    if (isCorrect) {
      button.classList.add('correct');
    } else {
      button.classList.add('incorrect');
    }
  }

  /**
   * Disable all answer buttons
   */
  disableAnswers() {
    const buttons = this.elements.answersContainer.querySelectorAll('.answer-btn');
    buttons.forEach(btn => btn.disabled = true);
  }

  /**
   * Display final results
   */
  displayResults(score, total) {
    this.elements.finalScore.textContent = score;
    this.elements.finalTotal.textContent = total;

    const percentage = (score / total) * 100;
    let icon, title, message;

    if (percentage === 100) {
      icon = '<i class="fas fa-trophy text-warning"></i>';
      title = 'Perfect Score! 🎉';
      message = 'You are a true Marvel expert! Excelsior!';
    } else if (percentage >= 80) {
      icon = '<i class="fas fa-medal text-success"></i>';
      title = 'Excellent Work!';
      message = 'You really know your Marvel heroes!';
    } else if (percentage >= 60) {
      icon = '<i class="fas fa-star text-primary"></i>';
      title = 'Good Job!';
      message = 'Not bad! Keep learning about the Marvel Universe.';
    } else if (percentage >= 40) {
      icon = '<i class="fas fa-thumbs-up text-info"></i>';
      title = 'Nice Try!';
      message = 'There\'s always room to grow. Try again!';
    } else {
      icon = '<i class="fas fa-redo text-secondary"></i>';
      title = 'Keep Practicing!';
      message = 'Every hero starts somewhere. Give it another shot!';
    }

    this.elements.resultsIcon.innerHTML = icon;
    this.elements.resultsTitle.textContent = title;
    this.elements.resultsMessage.textContent = message;

    this.showScreen('results');
  }

  /**
   * Show error message
   */
  showError(message) {
    this.elements.errorMessage.textContent = message;
    this.showScreen('error');
  }

  /**
   * Show notification toast
   */
  static showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.id = 'notification-container';
      notificationContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 350px;
      `;
      document.body.appendChild(notificationContainer);
    }

    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.style.cssText = `
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      animation: slideIn 0.3s ease-out;
    `;
    
    const icons = {
      info: 'fa-info-circle',
      warning: 'fa-exclamation-triangle',
      success: 'fa-check-circle',
      danger: 'fa-times-circle'
    };

    notification.innerHTML = `
      <i class="fas ${icons[type] || icons.info} me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    notificationContainer.appendChild(notification);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  /**
   * Get selected difficulty
   */
  getSelectedDifficulty() {
    const selected = document.querySelector('input[name="difficulty"]:checked');
    return selected ? parseInt(selected.value) : CONFIG.DEFAULT_QUESTION_COUNT;
  }
}

// ===========================
// Quiz Controller (Main App)
// ===========================
class QuizController {
  constructor() {
    this.state = new QuizState();
    this.ui = new UIController();
    this.init();
  }

  /**
   * Initialize event listeners
   */
  init() {
    this.ui.elements.startBtn.addEventListener('click', () => this.startQuiz());
    this.ui.elements.restartBtn.addEventListener('click', () => this.restartQuiz());
    this.ui.elements.retryBtn.addEventListener('click', () => this.startQuiz());
    this.ui.elements.shareBtn.addEventListener('click', () => this.shareScore());
    
    // Delegate click events for answer buttons
    this.ui.elements.answersContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('answer-btn') && !this.state.isAnswered) {
        this.handleAnswer(e.target);
      }
    });
  }

  /**
   * Start the quiz
   */
  async startQuiz() {
    try {
      this.state.reset();
      this.state.totalQuestions = this.ui.getSelectedDifficulty();
      
      this.ui.showScreen('loading');

      // Fetch characters from Marvel API
      const characters = await MarvelAPIService.fetchCharacters(50);
      this.state.characters = characters;

      // Generate questions
      this.state.questions = QuestionGenerator.createQuestions(
        characters,
        this.state.totalQuestions
      );

      // Start quiz
      this.ui.showScreen('quiz');
      this.displayCurrentQuestion();

    } catch (error) {
      console.error('Failed to start quiz:', error);
      this.ui.showError(
        'Unable to load quiz data from Marvel API. Please check your internet connection and try again.'
      );
    }
  }

  /**
   * Display the current question
   */
  displayCurrentQuestion() {
    const question = this.state.getCurrentQuestion();
    this.ui.displayQuestion(
      question,
      this.state.currentQuestionIndex + 1,
      this.state.totalQuestions
    );
    this.ui.updateScore(this.state.score);
  }

  /**
   * Handle answer selection
   */
  handleAnswer(button) {
    this.state.isAnswered = true;
    const selectedAnswer = button.dataset.answer;
    const question = this.state.getCurrentQuestion();
    const isCorrect = selectedAnswer === question.correctAnswer;

    // Update UI
    this.ui.markAnswer(button, isCorrect);
    this.ui.disableAnswers();

    // Highlight correct answer if user was wrong
    if (!isCorrect) {
      const buttons = this.ui.elements.answersContainer.querySelectorAll('.answer-btn');
      buttons.forEach(btn => {
        if (btn.dataset.answer === question.correctAnswer) {
          btn.classList.add('correct');
        }
      });
    }

    // Update score
    if (isCorrect) {
      this.state.incrementScore();
      this.ui.updateScore(this.state.score);
    }

    // Show feedback
    const explanation = isCorrect
      ? question.explanation
      : `The correct answer was ${question.correctAnswer}. ${question.explanation}`;
    
    this.ui.showFeedback(isCorrect, explanation);

    // Move to next question or show results
    setTimeout(() => {
      this.state.nextQuestion();
      
      if (this.state.isQuizComplete()) {
        this.showResults();
      } else {
        this.displayCurrentQuestion();
      }
    }, CONFIG.ANSWER_DELAY);
  }

  /**
   * Show final results
   */
  showResults() {
    this.ui.displayResults(this.state.score, this.state.totalQuestions);
  }

  /**
   * Restart the quiz
   */
  restartQuiz() {
    this.ui.showScreen('welcome');
  }

  /**
   * Share score on social media
   */
  shareScore() {
    const percentage = ((this.state.score / this.state.totalQuestions) * 100).toFixed(0);
    const text = `I scored ${this.state.score}/${this.state.totalQuestions} (${percentage}%) on the Marvel Quiz! Can you beat my score?`;
    const url = window.location.href;

    // Try Web Share API first (mobile-friendly)
    if (navigator.share) {
      navigator.share({
        title: 'Marvel Quiz Results',
        text: text,
        url: url
      }).catch(err => console.log('Share cancelled or failed:', err));
    } else {
      // Fallback: Copy to clipboard
      const shareText = `${text}\n${url}`;
      navigator.clipboard.writeText(shareText)
        .then(() => {
          alert('Score copied to clipboard! Share it with your friends!');
        })
        .catch(() => {
          alert(`${text}\n\nShare this with your friends!`);
        });
    }
  }
}

// ===========================
// Debug Functions (Global)
// ===========================
window.runDebugTests = async function() {
  const output = document.getElementById('debug-output');
  const log = document.getElementById('debug-log');
  output.style.display = 'block';
  log.textContent = '';
  
  function addLog(msg) {
    log.textContent += msg + '\n';
  }
  
  addLog('🔍 Starting Debug Tests...\n');
  
  // Test 1: SVG Placeholder
  addLog('Test 1: SVG Placeholder Generation');
  try {
    const svg = QuestionGenerator.createPlaceholderSVG('Spider-Man');
    addLog(svg.startsWith('data:image/svg+xml') ? '✅ SVG generated successfully' : '❌ Invalid SVG format');
  } catch (e) {
    addLog('❌ SVG generation failed: ' + e.message);
  }
  
  // Test 2: API Call
  addLog('\nTest 2: API Response Check');
  try {
    const response = await fetch('/api/superhero-characters?count=2');
    addLog('Response status: ' + response.status);
    const data = await response.json();
    addLog('API source: ' + data.source);
    addLog('Characters received: ' + data.data?.results?.length);
    
    if (data.data?.results?.length > 0) {
      const char = data.data.results[0];
      addLog('\n📊 First Character Data:');
      addLog('  Name: ' + char.name);
      addLog('  Thumbnail object: ' + JSON.stringify(char.thumbnail));
      addLog('  Thumbnail.path: ' + char.thumbnail?.path);
      
      // Test 3: Image URL extraction
      addLog('\nTest 3: Image URL Extraction');
      const imageUrl = QuestionGenerator.getCharacterImageUrl(char);
      addLog('  Extracted URL: ' + imageUrl.substring(0, 100) + '...');
      addLog('  URL type: ' + (imageUrl.startsWith('data:') ? 'SVG Placeholder' : 'External URL'));
      
      // Test 4: Image Loading
      addLog('\nTest 4: Image Loading Test');
      if (imageUrl.startsWith('http')) {
        const img = new Image();
        img.onload = () => addLog('✅ Image loaded successfully!');
        img.onerror = () => addLog('❌ Image failed to load');
        img.src = imageUrl;
        setTimeout(() => {
          if (!img.complete) addLog('⚠️ Image still loading after 3s...');
        }, 3000);
      } else {
        addLog('ℹ️ Using SVG placeholder (expected if no external URL)');
      }
    }
    
    addLog('\n✅ All tests completed!');
  } catch (e) {
    addLog('❌ API test failed: ' + e.message);
  }
};

// ===========================
// Initialize Application
// ===========================
// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new QuizController();
  });
} else {
  new QuizController();
}
