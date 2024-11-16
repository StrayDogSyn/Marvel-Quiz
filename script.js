const MARVEL_API_KEY = "e68a214d78db55dc7ce56b8f9fd573f4";
const MARVEL_PRIVATE_KEY = "ee923f3a51654f13f4b0c5d1b99c85581b9ab754";
const SPOTIFY_CLIENT_ID = "aa6ce2d4f91148baa2bbadc81b66b973";
const SPOTIFY_CLIENT_SECRET = "432c22ba30cc498686dcf5c09ab7de21";

// ... (Fetch functions for Marvel API and Spotify API)
async function fetchMarvelData() {
  const ts = new Date().getTime();
  const hash = CryptoJS.MD5(
    ts +
      "ee923f3a51654f13f4b0c5d1b99c85581b9ab754" +
      "e68a214d78db55dc7ce56b8f9fd573f4"
  ).toString();

  const url = `https://gateway.marvel.com/v1/public/characters?ts=${ts}&apikey=e68a214d78db55dc7ce56b8f9fd573f4&hash=${hash}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.data.results;
  } catch (error) {
    console.error("Error fetching Marvel data:", error);
    return [];
  }
}
async function fetchSpotifyPlaylist(playlistId, accessToken) {
  const url = `https://api.spotify.com/v1/playlists/${playlistId}`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  try {
    const response = await fetch(url, { headers });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Spotify playlist:", error);
    return null;
  }
}
const characters = await fetchMarvelData();
const quizQuestions = createQuizQuestions(characters);

// ... (quiz logic)

// Play a sound effect from Spotify
const soundEffectUrl = "https://p.scdn.co/mp3/your_sound_effect_url";
const audio = new Audio(soundEffectUrl);
audio.play();
// ... (Quiz logic)
async function fetchMarvelData() {
  const response = await fetch(
    `https://gateway.marvel.com/v1/public/characters?ts=1&apikey=${MARVEL_API_KEY}&hash=md5(ts+ee923f3a51654f13f4b0c5d1b99c85581b9ab754)`
  );
  const data = await response.json();
  return data.data.results;
}
function createQuizQuestions(characters) {
  const questions = [];
  characters.forEach((character) => {
    const question = {
      question: `Who is ${character.name}?`,
      answers: [
        character.description,
        // Other incorrect options
      ],
      correctAnswer: 0, // Index of the correct answer
    };
    questions.push(question);
  });
  return questions;
}
function displayQuestion(question) {
  const questionElement = document.getElementById("question");
  questionElement.textContent = question.question;

  const answersElement = document.getElementById("answers");
  answersElement.innerHTML = "";

  question.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.textContent = answer;
    button.addEventListener("click", () =>
      checkAnswer(index, question.correctAnswer)
    );
    answersElement.appendChild(button);
  });
}
let score = 0;

function checkAnswer(selectedAnswer, correctAnswer) {
  if (selectedAnswer === correctAnswer) {
    score++;
    // Play a correct answer sound effect from Spotify
  } else {
    // Play an incorrect answer sound effect from Spotify
  }

  // Display the result and the next question
  displayResult(selectedAnswer === correctAnswer);
  nextQuestion();
}

function displayResult(isCorrect) {
  const resultElement = document.getElementById("result");
  resultElement.textContent = isCorrect ? "Correct!" : "Incorrect.";
}
let currentQuestionIndex = 0;
const questions = createQuizQuestions(fetchedCharacters);

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    displayQuestion(questions[currentQuestionIndex]);
  } else {
    // Quiz is over, display final score
    const resultElement = document.getElementById("result");
    resultElement.textContent = `Quiz Over! Your score is ${score}/${questions.length}`;
  }
}
// Play Spotify music
const music = new Audio(
  "https://p.scdn.co/mp3/1606783149/1584102443/422ac2fee88c4e5141131a3909096fe1/file.mp3"
); // Replace with your desired Spotify track URL
music.play();
