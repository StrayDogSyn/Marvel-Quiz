# Contributing to Marvel Quiz

First off, thank you for considering contributing to Marvel Quiz! It's people like you that make this project better.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:
- Be respectful and inclusive
- Be open to constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if relevant**
- **Note your environment** (browser, OS, screen size)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any alternatives you've considered**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** across different browsers
4. **Update documentation** if needed
5. **Commit your changes** with clear messages
6. **Push to your fork** and submit a pull request

## Development Process

### Setting Up Development Environment

```bash
# Clone your fork
git clone https://github.com/your-username/Marvel-Quiz.git
cd Marvel-Quiz

# Create a branch for your feature
git checkout -b feature/your-feature-name
```

### Coding Standards

#### JavaScript

```javascript
// Use ES6+ features
const variable = 'value';
let mutableVar = 'value';

// Use arrow functions for callbacks
array.map(item => item.value);

// Use template literals
const message = `Hello ${name}`;

// Use async/await for asynchronous code
async function fetchData() {
  try {
    const data = await fetch(url);
    return data;
  } catch (error) {
    console.error(error);
  }
}

// Use descriptive variable names
const userScore = 10; // Good
const x = 10; // Bad

// Add comments for complex logic
/**
 * Calculate percentage score
 * @param {number} score - User's score
 * @param {number} total - Total possible points
 * @returns {number} Percentage (0-100)
 */
function calculatePercentage(score, total) {
  return (score / total) * 100;
}
```

#### CSS

```css
/* Use CSS custom properties */
:root {
  --primary-color: #ed1d24;
}

/* Use BEM naming for complex components */
.quiz-card {}
.quiz-card__header {}
.quiz-card--active {}

/* Group related properties */
.element {
  /* Positioning */
  position: relative;
  top: 0;
  
  /* Display & Box Model */
  display: flex;
  width: 100%;
  padding: 1rem;
  
  /* Typography */
  font-size: 1rem;
  color: white;
  
  /* Visual */
  background: red;
  border: 1px solid black;
  
  /* Animation */
  transition: all 0.3s ease;
}
```

#### HTML

```html
<!-- Use semantic HTML -->
<header>...</header>
<main>...</main>
<footer>...</footer>

<!-- Add ARIA labels for accessibility -->
<button aria-label="Start Quiz">Start</button>

<!-- Use meaningful IDs and classes -->
<div id="quiz-container" class="container">...</div>
```

### Testing Checklist

Before submitting a pull request, ensure:

- [ ] Code works in Chrome, Firefox, Safari, and Edge
- [ ] Responsive design works on mobile, tablet, and desktop
- [ ] No console errors or warnings
- [ ] Accessibility: Can navigate with keyboard only
- [ ] Accessibility: Works with screen readers
- [ ] Code follows project conventions
- [ ] Comments added for complex logic
- [ ] Documentation updated if needed

### Commit Messages

Write clear, meaningful commit messages:

```
Good:
✅ Add difficulty selection feature
✅ Fix progress bar calculation bug
✅ Update README with installation steps
✅ Refactor question generator for better performance

Bad:
❌ Update
❌ Fix stuff
❌ Changes
❌ asdf
```

Use conventional commit format when possible:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

## Project Structure

```
Marvel-Quiz/
├── index.html          # Main HTML structure
├── script.js           # Application logic
│   ├── CONFIG          # Configuration constants
│   ├── QuizState       # State management
│   ├── MarvelAPIService # API integration
│   ├── QuestionGenerator # Question creation
│   ├── UIController    # DOM manipulation
│   └── QuizController  # Main controller
├── style.css           # Styling and animations
├── assets/             # Static assets
└── docs/               # Documentation
```

## Adding New Features

### Adding a New Question Type

1. Add the type to CONFIG.QUESTION_TYPES
2. Create a method in QuestionGenerator class
3. Add it to the question type rotation
4. Test thoroughly

Example:

```javascript
// In QuestionGenerator class
static createComicsQuestion(character, allCharacters) {
  // Question logic here
  return {
    type: 'comics',
    question: `How many comics has ${character.name} appeared in?`,
    answers: ['10-50', '50-100', '100-500', '500+'],
    correctAnswer: determineRange(character.comics.available),
    explanation: `${character.name} has appeared in ${character.comics.available} comics.`
  };
}
```

### Adding a New Screen

1. Add HTML in index.html
2. Register in UIController.screens
3. Create show/hide logic
4. Update QuizController state machine

## Resources

- [Marvel API Documentation](https://developer.marvel.com/docs)
- [Bootstrap Documentation](https://getbootstrap.com/docs/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript Style Guide](https://github.com/airbnb/javascript)

## Questions?

Feel free to open an issue with the `question` label, or reach out to the maintainers.

Thank you for contributing! 🦸‍♂️🦸‍♀️
