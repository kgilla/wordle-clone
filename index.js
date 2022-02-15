import words from "./data/words.js";

const keyboardButtons = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["enter", "z", "x", "c", "v", "b", "n", "m", "delete"],
];

const gameContainer = document.querySelector("#game-container");
const keyboardContainer = document.querySelector("#keyboard-container");

const wordCount = words.length;

// Game state
let answer = "";
let guess = "";
let guessCount = 1;
let guessHistory = [];

// Cycles through guess to reveal hints on gameboard and keyboard
const revealHints = (currentGuess) => {
  // Remove me
  console.log(answer.join());

  let guessArray = currentGuess.split("");
  let answerCopy = [...answer];

  // Cycles through to find exact matches
  guessArray.forEach((letter, i) => {
    const tile = document.querySelector(`#guess-${guessCount}-tile-${i + 1}`);
    const keyboardKey = document.querySelector(`#${letter}`);
    if (letter === answer[i]) {
      answerCopy.splice(i, 1);
      tile.classList.add("match");
      keyboardKey.classList.add("match");
    }
  });

  // Cycles through the rest to find partials and show wrong guesses
  guessArray.forEach((letter, i) => {
    const tile = document.querySelector(`#guess-${guessCount}-tile-${i + 1}`);
    const keyboardKey = document.querySelector(`#${letter}`);
    if (tile.classList.contains("match")) return;
    if (answerCopy.some((l) => l === letter)) {
      const index = answerCopy.findIndex((l) => l === letter);
      answerCopy.splice(index, 1);
      tile.classList.add("partial");
      if (!keyboardKey.classList.contains("match")) {
        keyboardKey.classList.add("partial");
      }
    } else {
      if (!keyboardKey.classList.contains("match")) {
        keyboardKey.classList.add("no-match");
      }
    }
  });
};

// Handles the click event for all letters
const handleButtonClick = (e) => {
  const letter = e.target.getAttribute("key");
  if (guess.length < 5) {
    const tile = document.querySelector(
      `#guess-${guessCount}-tile-${guess.length + 1}`
    );
    tile.innerText = letter.toUpperCase();
    guess += letter;
  }
};

// Handles click of enter key
const handleEnterClick = () => {
  revealHints(guess);
  guessHistory.push(guess);
  guess = "";
  guessCount++;
};

// Handles click of delete
const handleDeleteClick = () => {
  if (guess.length > 0) {
    const tile = document.querySelector(
      `#guess-${guessCount}-tile-${guess.length}`
    );
    tile.innerText = "";
    guess = guess.slice(0, -1);
  }
};

// Creates game board squares
const gameboardInit = () => {
  for (let y = 1; y < 7; y++) {
    const gameRow = document.createElement("div");
    gameRow.classList.add("game-row");
    gameRow.id = `guess-${y}`;
    for (let x = 1; x < 6; x++) {
      const tile = document.createElement("div");
      tile.classList.add("game-tile");
      tile.id = `guess-${y}-tile-${x}`;
      gameRow.appendChild(tile);
    }
    gameContainer.appendChild(gameRow);
  }
};

// Creates the keyboard buttons
const keyboardInit = () => {
  keyboardButtons.forEach((row) => {
    const keyboardRow = document.createElement("div");
    keyboardRow.classList.add("keyboard-row");
    row.forEach((key) => {
      const button = document.createElement("button");
      button.classList.add("keyboard-button");
      button.id = key;
      button.innerText = key.toUpperCase();
      button.setAttribute("key", key);
      if (key === "enter") {
        button.addEventListener("click", handleEnterClick);
      } else if (key === "delete") {
        button.addEventListener("click", handleDeleteClick);
      } else {
        button.addEventListener("click", handleButtonClick);
      }
      keyboardRow.appendChild(button);
    });
    keyboardContainer.appendChild(keyboardRow);
  });
};

// Picks answer from pool
const generateAnswer = () => {
  answer = words[Math.floor(Math.random() * wordCount)].split("");
};

gameboardInit();
keyboardInit();
generateAnswer();
