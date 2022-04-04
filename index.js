import words from "./data/words.js";
import allowedGuesses from "./data/allowedGuesses.js";

const keyboardButtons = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["enter", "z", "x", "c", "v", "b", "n", "m", "delete"],
];

const settingsItems = [
  {
    state: "hardmode",
    header: "Hard Mode",
    subtext: "Any revealed hints must be used in subsequent guesses",
  },
];

const documentBody = document.querySelector("body");
const gameContainer = document.querySelector("#game-container");
const keyboardContainer = document.querySelector("#keyboard-container");
const deleteIcon = document.querySelector("#delete-icon");
const overlay = document.querySelector("#overlay");
const closeSettings = document.querySelector("#close-settings");
const settingsToggle = document.querySelector("#settings-toggle");
const helpButton = document.querySelector("#help-button");
const scoreButton = document.querySelector("#score-button");
const menuHeading = document.querySelector("#menu-heading");
const menuContent = document.querySelector("#menu-content");

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

const settingsState = {
  hardmode: false,
};

const warnings = {
  tooShort: "Not enough letters",
  notWord: "Not in word list",
};

const winMessages = {
  1: "Genius!",
  2: "Amazing",
  3: "Great Work",
  4: "Pretty Good",
  5: "Close One",
  6: "Phew.",
};

const createMessage = (message, isWarning) => {
  const row = document.querySelector(`#guess-${guessCount}`);
  const messageEl = document.createElement("div");
  messageEl.classList.add("message");
  messageEl.innerText = message;
  gameContainer.appendChild(messageEl);
  if (isWarning) row.classList.add("shake");
  setTimeout(() => {
    messageEl.remove();
    if (isWarning) row.classList.remove("shake");
  }, 1500);
};

const handleGameOver = () => {};

const verifyGuess = () => {
  if (guess.length < 5) {
    createMessage(warnings.tooShort, true);
    return false;
  } else if (![...allowedGuesses, ...words].some((word) => word === guess)) {
    createMessage(warnings.notWord, true);
    return false;
  } else {
    return true;
  }
};

// Cycles through guess to reveal hints on gameboard and keyboard
const revealHints = (currentGuess) => {
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
      keyboardKey.classList.remove("partial");
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
        button.classList.add("larger-button");
        button.addEventListener("click", handleEnterClick);
      } else if (key === "delete") {
        button.classList.add("larger-button");
        button.addEventListener("click", handleDeleteClick);
      } else {
        button.addEventListener("click", handleButtonClick);
      }
      keyboardRow.appendChild(button);
    });
    keyboardContainer.appendChild(keyboardRow);
  });
};

// Creates modal for win/loss info
const createModal = () => {
  const modalOverlay = document.createElement("div");
  modalOverlay.classList.add("modal-overlay");
  documentBody.appendChild(modalOverlay);

  const modal = document.createElement("div");
  modal.classList.add("main-modal");
  modalOverlay.appendChild(modal);

  const modalClose = document.createElement("button");
  modalClose.classList.add("modal-close-button");
  modalClose.innerText = "X";
  modal.appendChild(modalClose);

  modalClose.addEventListener("click", () => {
    modalOverlay.remove();
  });
};

// Picks answer from pool
const generateAnswer = () => {
  answer = words[Math.floor(Math.random() * wordCount)].split("");
};

// Resets game state and chooses new word
const resetGame = () => {
  gameContainer.innerHTML = "";
  keyboardContainer.innerHTML = "";
  answer = "";
  guess = "";
  guessCount = 1;
  gameboardInit();
  keyboardInit();
  generateAnswer();
};

// Creates settings menu
const renderSettings = () => {
  const settingsList = document.createElement("ul");
  settingsList.classList.add("settings-menu");

  settingsItems.forEach((item) => {
    const settingsItem = document.createElement("li");
    settingsItem.classList.add("menu-item");

    const textContainer = document.createElement("div");
    textContainer.classList.add("menu-item-text-container");

    const textHeader = document.createElement("div");
    textHeader.classList.add("menu-item-header");
    textHeader.textContent = item.header;

    const textSubtext = document.createElement("div");
    textSubtext.classList.add("menu-item-subtext");
    textSubtext.textContent = item.subtext;

    const menuButton = document.createElement("button");
    menuButton.classList.add("menu-item-button");
    menuButton.classList.add(
      settingsState[item.state] ? "toggle-active" : "toggle-inactive"
    );
    menuButton.addEventListener("click", () => {
      menuButton.classList.toggle("toggle-inactive");
      menuButton.classList.toggle("toggle-active");
      settingsState[item.state] = !settingsState[item.state];
    });

    const menuSwitch = document.createElement("span");
    menuSwitch.classList.add("menu-switch");
    menuButton.appendChild(menuSwitch);

    textContainer.appendChild(textHeader);
    textContainer.appendChild(textSubtext);
    settingsItem.appendChild(textContainer);
    settingsItem.appendChild(menuButton);
    settingsList.appendChild(settingsItem);
  });

  menuContent.appendChild(settingsList);
};

// Event listeners
settingsToggle.addEventListener("click", () => {
  overlay.classList.remove("hide-settings");
  menuHeading.textContent = "Settings";
  renderSettings();
  overlay.classList.add("show-settings");
});

closeSettings.addEventListener("click", () => {
  overlay.classList.remove("show-settings");
  overlay.classList.add("hide-settings");
  setTimeout(() => {
    menuContent.innerHTML = "";
  }, 300);
});

helpButton.addEventListener("click", createModal);
scoreButton.addEventListener("click", resetGame);

gameboardInit();
keyboardInit();
generateAnswer();
