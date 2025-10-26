/**
 * Marvel Quiz Application
 * A modern, interactive quiz application using the Marvel API
 * @version 2.0.0
 */

// ===========================
// Configuration & Constants
// ===========================
const CONFIG = {
  // Marvel API credentials (Public key only - safe for client-side)
  // Note: For production, consider using environment variables or a backend proxy
  MARVEL_PUBLIC_KEY: 'e68a214d78db55dc7ce56b8f9fd573f4',
  MARVEL_PRIVATE_KEY: 'ee923f3a51654f13f4b0c5d1b99c85581b9ab754',
  MARVEL_API_BASE: 'https://gateway.marvel.com/v1/public',
  
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
// Marvel API Service
// ===========================
class MarvelAPIService {
  /**
   * Generate authentication parameters for Marvel API
   */
  static generateAuthParams() {
    const ts = new Date().getTime().toString();
    const hash = CryptoJS.MD5(
      ts + CONFIG.MARVEL_PRIVATE_KEY + CONFIG.MARVEL_PUBLIC_KEY
    ).toString();

    return { ts, apikey: CONFIG.MARVEL_PUBLIC_KEY, hash };
  }

  /**
   * Fetch Marvel characters with enhanced filtering
   */
  static async fetchCharacters(limit = 50) {
    const authParams = this.generateAuthParams();
    const params = new URLSearchParams({
      ...authParams,
      limit: limit,
      offset: Math.floor(Math.random() * 100), // Random offset for variety
      orderBy: '-modified' // Get recently updated characters
    });

    const url = `${CONFIG.MARVEL_API_BASE}/characters?${params}`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Marvel API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Filter characters with sufficient data for quiz questions
      const validCharacters = data.data.results.filter(char => 
        char.name && 
        char.description && 
        char.description.length > 20 &&
        char.thumbnail &&
        char.thumbnail.path &&
        !char.thumbnail.path.includes('image_not_available')
      );

      if (validCharacters.length === 0) {
        throw new Error('No valid characters found');
      }

      return validCharacters;
    } catch (error) {
      console.error('Error fetching Marvel data:', error);
      throw error;
    }
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

    return {
      type: 'name',
      question: 'Who is this character?',
      image: `${character.thumbnail.path}.${character.thumbnail.extension}`,
      answers: answers,
      correctAnswer: this.cleanCharacterName(character.name),
      explanation: character.description || `${character.name} is a Marvel character.`
    };
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

    // Truncate description for better UX
    const description = character.description.length > 150
      ? character.description.substring(0, 150) + '...'
      : character.description;

    return {
      type: 'description',
      question: `Which character matches this description?\n\n"${description}"`,
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

    // Display character image if available
    if (question.image) {
      this.elements.characterImage.innerHTML = `
        <img src="${question.image}" alt="Marvel Character" class="img-fluid">
      `;
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
