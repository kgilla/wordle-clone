import words from "./data/words.js";
import allowedGuesses from "./data/allowedGuesses.js";

const keyboardButtons = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["enter", "z", "x", "c", "v", "b", "n", "m", "delete"],
];

const gameContainer = document.querySelector("#game-container");
const keyboardContainer = document.querySelector("#keyboard-container");
const deleteIcon = document.querySelector("#delete-icon");
const overlay = document.querySelector("#overlay");
const closeSettings = document.querySelector("#close-settings");
const settingsToggle = document.querySelector("#settings-toggle");

settingsToggle.addEventListener("click", () => {
  overlay.classList.toggle("show-settings");
});

closeSettings.addEventListener("click", () => {
  overlay.classList.toggle("show-settings");
});

const wordCount = words.length;

/* TO DO
add win/loss conditions
add modal popup for help and win/loss conditions
fix style
make responsive / mobile friendly
*/

// Game state
let answer = "";
let guess = "";
let guessCount = 1;

const warnings = {
  tooShort: "Not enough letters",
  notWord: "Not in word list",
};

const createMessage = (message) => {
  const row = document.querySelector(`#guess-${guessCount}`);
  console.log(row);
  const messageEl = document.createElement("div");
  messageEl.classList.add("message");
  messageEl.innerText = message;
  gameContainer.appendChild(messageEl);
  row.classList.add("shake");
  setTimeout(() => {
    messageEl.remove();
    row.classList.remove("shake");
  }, 1500);
};

const verifyGuess = () => {
  if (guess.length < 5) {
    createMessage(warnings.tooShort);
    return false;
  } else if (![...allowedGuesses, ...words].some((word) => word === guess)) {
    createMessage(warnings.notWord);
    return false;
  } else {
    return true;
  }
};

// Cycles through guess to reveal hints on gameboard and keyboard
const revealHints = (currentGuess) => {
  // Remove me
  console.log(answer.join());

  let guessCopy = currentGuess.split("");
  let answerCopy = [...answer];

  // Cycles through to find exact matches
  guessCopy.forEach((letter, i) => {
    const tile = document.querySelector(`#guess-${guessCount}-tile-${i + 1}`);
    const keyboardKey = document.querySelector(`#${letter}`);
    if (letter === answer[i]) {
      answerCopy[i] = "";
      guessCopy[i] = "";
      tile.classList.add("match");
      keyboardKey.classList.add("match");
      tile.classList.remove("active");
    }
  });

  // Cycles through the rest to find partials and show wrong guesses
  guessCopy.forEach((letter, i) => {
    if (letter === "") return;
    const tile = document.querySelector(`#guess-${guessCount}-tile-${i + 1}`);
    const keyboardKey = document.querySelector(`#${letter}`);
    const index = answerCopy.findIndex((l) => l === letter);
    if (index !== -1) {
      answerCopy[index] = "";
      guessCopy[i] = "";
      tile.classList.add("partial");
      tile.classList.remove("active");
      keyboardKey.classList.add("partial");
    } else {
      keyboardKey.classList.add("no-match");
      tile.classList.add("no-match");
      tile.classList.remove("active");
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
    tile.innerText = letter;
    tile.classList.add("active");
    guess += letter;
  }
};

// Handles click of enter key
const handleEnterClick = () => {
  const valid = verifyGuess();
  if (valid) {
    revealHints(guess);
    guess = "";
    guessCount++;
  }
};

// Handles click of delete
const handleDeleteClick = () => {
  if (guess.length > 0) {
    const tile = document.querySelector(
      `#guess-${guessCount}-tile-${guess.length}`
    );
    tile.innerText = "";
    tile.classList.remove("active");
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
      if (key === "delete") {
        button.appendChild(deleteIcon);
      } else {
        button.innerText = key;
      }
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
