import words from "./data/words.js";
import allowedGuesses from "./data/allowedGuesses.js";
import {
  keyboardButtons,
  validKeys,
  hintKey,
  warnings,
  winMessages,
  freshGameState,
} from "./modules/const.js";

const closeSettings = document.querySelector("#close-settings");
const deleteIcon = document.querySelector("#delete-icon");
const documentBody = document.querySelector("body");
const gameContainer = document.querySelector("#game-container");
const helpButton = document.querySelector("#help-button");
const keyboardContainer = document.querySelector("#keyboard-container");
const menuContent = document.querySelector("#menu-content");
const menuHeading = document.querySelector("#menu-heading");
const overlay = document.querySelector("#overlay");
const settingsToggle = document.querySelector("#settings-toggle");
const scoreButton = document.querySelector("#score-button");

const wordCount = words.length;

const toggleTheme = () => {
  documentBody.classList.toggle("dark-theme");
};

export const settingsItems = [
  {
    state: "hardmode",
    header: "Hard Mode",
    subtext: "Any revealed hints must be used in subsequent guesses",
  },
  {
    state: "darkmode",
    header: "Dark Theme",
    subtext: "",
    function: toggleTheme,
  },
];

/* Things to do
  1) Add how to page
  2) Add stats graph
  3) Save and pull stats in local storage
  4) Add hard mode
*/

// Game State
let gameState = {
  answer: "",
  guess: "",
  guessCount: 1,
  gameover: false,
};

const statistics = {
  winCount: 0,
  gameCount: 0,
  streak: 0,
  guessBreakdown: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  },
};

const settingsState = {
  hardmode: false,
  darkmode: false,
};

// Game Functions

// Updates stats state
const updateStats = (win) => {
  if (win) {
    statistics.winCount += 1;
    statistics.streak += 1;
    statistics.guessBreakdown[gameState.guessCount] += 1;
  } else {
    statistics.streak = 0;
  }
  statistics.gameCount += 1;
};

// Displays final message and pops up modal
const handleGameOver = (win) => {
  gameState.gameover = true;
  updateStats(win);
  createMessage(
    win ? winMessages[gameState.guessCount] : "Better Luck Next Time"
  );
  setTimeout(() => {
    createModal();
  }, 1500);
};

// Validates guess based on current settings
const verifyGuess = () => {
  if (gameState.guess.length < 5) {
    createMessage(warnings.tooShort, true);
    return false;
  } else if (
    ![...allowedGuesses, ...words].some((word) => word === gameState.guess)
  ) {
    createMessage(warnings.notWord, true);
    return false;
  } else {
    return true;
  }
};

// Checks if every letter is correct
const checkWin = (guess) => {
  const isWin = guess.every((el) => el === "");
  if (isWin) handleGameOver(true);
};

// cycles through current guess and finds all exact matches
const findExactMatches = (guessCopy, answerCopy, hints) => {
  guessCopy.forEach((letter, i) => {
    const tile = document.querySelector(
      `#guess-${gameState.guessCount}-tile-${i + 1}`
    );
    const keyboardKey = document.querySelector(`#${letter}`);
    if (letter === gameState.answer[i]) {
      answerCopy[i] = "";
      guessCopy[i] = "";
      hints.push({ index: i, tile, keyboardKey, class: hintKey.match });
    }
  });
  return [guessCopy, answerCopy, hints];
};

// cycles through remaining letters and finds partial matches
const findPartialMatches = (guessCopy, answerCopy, hints) => {
  guessCopy.forEach((letter, i) => {
    if (letter === "") return;
    const tile = document.querySelector(
      `#guess-${gameState.guessCount}-tile-${i + 1}`
    );
    const keyboardKey = document.querySelector(`#${letter}`);
    const index = answerCopy.findIndex((l) => l === letter);
    if (index !== -1) {
      answerCopy[index] = "";
      guessCopy[i] = "";
      hints.push({ index: i, tile, keyboardKey, class: hintKey.partial });
    } else {
      hints.push({ index: i, tile, keyboardKey, class: hintKey.noMatch });
    }
  });
  return [guessCopy, answerCopy, hints];
};

// Cycles through guess to reveal hints on gameboard and keyboard
const generateHints = (currentGuess) => {
  let guessCopy = currentGuess.split("");
  let answerCopy = [...gameState.answer];
  let hints = [];

  [guessCopy, answerCopy, hints] = findExactMatches(
    guessCopy,
    answerCopy,
    hints
  );

  checkWin(guessCopy);

  [guessCopy, answerCopy, hints] = findPartialMatches(
    guessCopy,
    answerCopy,
    hints
  );

  return hints.sort((hintA, hintB) => (hintA.index > hintB.index ? 1 : -1));
};

// Picks answer from pool
const generateAnswer = () => {
  gameState.answer = words[Math.floor(Math.random() * wordCount)].split("");
};

// Animates tiles one at a time and adds hint class
const flipTiles = (hints) => {
  hints.forEach((hint, i) => {
    setTimeout(() => {
      hint.tile.classList.add("flip-in");
    }, i * 250);
    setTimeout(() => {
      hint.tile.classList.add("flip-out");
      renderHint(hint);
    }, 245 * (i + 1));
    setTimeout(() => {
      hint.tile.classList.remove("flip-in");
      hint.tile.classList.remove("flip-out");
    }, 510 * (i + 1));
  });
};

// Resets game state and chooses new word
const resetGame = () => {
  gameContainer.innerHTML = "";
  keyboardContainer.innerHTML = "";
  gameState = { ...freshGameState };
  gameboardInit();
  keyboardInit();
  generateAnswer();
};

// Rendering Functions //

// Creates game board squares
const gameboardInit = () => {
  for (let y = 1; y < 7; y++) {
    const gameRow = createElement("div", {
      class: "game-row",
      id: `guess-${y}`,
    });
    for (let x = 1; x < 6; x++) {
      const tile = createElement("div", {
        class: "game-tile",
        id: `guess-${y}-tile-${x}`,
      });
      gameRow.appendChild(tile);
    }
    gameContainer.appendChild(gameRow);
  }
};

// Creates the keyboard buttons
const keyboardInit = () => {
  keyboardButtons.forEach((row) => {
    const keyboardRow = createElement("div", { class: "keyboard-row" });
    row.forEach((key) => {
      const button = createElement("button", {
        class: "keyboard-button",
        id: key,
      });
      if (key === "Backspace") {
        button.appendChild(deleteIcon);
      } else {
        button.innerText = key;
      }
      button.setAttribute("key", key);
      if (key === "Enter") {
        button.classList.add("larger-button");
        button.addEventListener("click", handleEnterClick);
      } else if (key === "Backspace") {
        button.classList.add("larger-button");
        button.addEventListener("click", handleDeleteClick);
      } else {
        button.addEventListener("click", handleKeyboardClick);
      }
      keyboardRow.appendChild(button);
    });
    keyboardContainer.appendChild(keyboardRow);
  });
};

//Renders hints on game tiles one at a time
const renderHint = (hint) => {
  hint.tile.classList.add(hint.class);
  hint.tile.classList.remove(hintKey.active);
};

//Renders hints on keyboard after tile animations
const updateKeyboard = (hints) => {
  setTimeout(() => {
    hints.forEach((hint) => {
      hint.keyboardKey.classList.add(hint.class);
      if (
        hint.keyboardKey.classList.contains(hintKey.partial) &&
        hint.class === hintKey.match
      ) {
        hint.keyboardKey.classList.remove(hintKey.partial);
      }
    });
  }, 1500);
};

// Creates messages for improper input and end of game
const createMessage = (message, isWarning = false) => {
  const row = document.querySelector(`#guess-${gameState.guessCount}`);
  const messageEl = createElement("div", {
    class: "message",
    innerText: message,
  });
  gameContainer.appendChild(messageEl);
  if (isWarning) row.classList.add("shake");
  setTimeout(() => {
    messageEl.remove();
    if (isWarning) row.classList.remove("shake");
  }, 1500);
};

// Creates Statistics elements shown after game
const createStatsElements = () => {
  const { winCount, gameCount, streak } = statistics;
  const statsData = [
    { label: "Played", data: gameCount },
    { label: "Win%", data: Math.round((winCount / gameCount) * 100) },
    { label: "Streak", data: streak },
  ];

  const statsContainer = createElement("div", {
    class: "stats-container",
  });

  statsData.forEach((stat) => {
    const statContainer = createElement("div", {
      class: "stat-container",
    });

    const statValue = createElement("p", {
      class: "stat-value",
      innerText: stat.data,
    });

    const statLabel = createElement("p", {
      class: "stat-label",
      innerText: stat.label,
    });

    statContainer.appendChild(statValue);
    statContainer.appendChild(statLabel);
    statsContainer.appendChild(statContainer);
  });

  return statsContainer;
};

// Creates modal for win/loss info
const createModal = (isWin) => {
  const modalOverlay = createElement("div", { class: "modal-overlay" });

  const modal = createElement("div", { class: "main-modal" });

  const modalClose = closeSettings.cloneNode(true);
  modalClose.id = "modal-close-button";

  const heading = createElement("h2", {
    class: "modal-heading",
    innerText: "Game Over",
  });

  const modalBody = createElement("p", {
    class: "modal-text",
    innerText: `The word was ${gameState.answer.join("")}`,
  });

  const modalStats = createStatsElements();

  const buttonContainer = createElement("div", {
    class: "modal-button-container",
  });

  const newGameButton = createElement("button", {
    class: "modal-button",
    innerText: "New Game",
  });

  const githubButton = createElement("button", {
    class: "modal-button",
    innerText: "Github",
  });

  githubButton.addEventListener("click", () => {
    window.open("https://github.com/kgilla");
  });

  newGameButton.addEventListener("click", () => {
    modalOverlay.remove();
    resetGame();
  });

  modalClose.addEventListener("click", () => {
    modalOverlay.remove();
  });

  documentBody.appendChild(modalOverlay);
  modalOverlay.appendChild(modal);
  modal.appendChild(modalClose);
  buttonContainer.appendChild(newGameButton);
  buttonContainer.appendChild(githubButton);
  modal.appendChild(heading);
  modal.appendChild(modalBody);
  modal.appendChild(modalStats);
  modal.appendChild(buttonContainer);
};

// Creates settings menu
const renderSettings = () => {
  const settingsList = createElement("ul", { class: "settings-menu" });

  settingsItems.forEach((item) => {
    const settingsItem = createElement("li", { class: "menu-item" });

    const textContainer = createElement("div", {
      class: "menu-item-text-container",
    });

    const textHeader = createElement("h2", {
      class: "menu-item-header",
      innerText: item.header,
    });

    const textSubtext = createElement("p", {
      class: "menu-item-subtext",
      innerText: item.subtext,
    });

    const menuButton = createElement("button", {
      class: settingsState[item.state] ? "toggle-active" : "toggle-inactive",
    });
    menuButton.classList.add("menu-item-button");

    const menuSwitch = createElement("span", { class: "menu-switch" });

    menuButton.addEventListener("click", () => {
      menuButton.classList.toggle("toggle-inactive");
      menuButton.classList.toggle("toggle-active");
      settingsState[item.state] = !settingsState[item.state];
      if (item.function) item.function();
    });

    menuButton.appendChild(menuSwitch);
    textContainer.appendChild(textHeader);
    textContainer.appendChild(textSubtext);
    settingsItem.appendChild(textContainer);
    settingsItem.appendChild(menuButton);
    settingsList.appendChild(settingsItem);
  });

  menuContent.appendChild(settingsList);
};

const renderHowTo = () => {
  console.log("jajaja");
};

// Element creation factory
const createElement = (type, attr) => {
  const el = document.createElement(type);
  for (const [key, value] of Object.entries(attr)) {
    key === "class" ? el.classList.add(value) : (el[key] = value);
  }
  return el;
};

// Event listeners

// Handles the click event for all letters
const handleKeyboardClick = (e) => {
  const letter = e.target.getAttribute("key");
  if (gameState.guess.length < 5) {
    const tile = document.querySelector(
      `#guess-${gameState.guessCount}-tile-${gameState.guess.length + 1}`
    );
    tile.innerText = letter;
    tile.classList.add("active");
    gameState.guess += letter;
  }
};

// Handles keyboard key presses
const handleKeyboardPress = (e) => {
  if (validKeys.some((key) => key === e.key)) {
    if (e.key === "Enter") {
      handleEnterClick();
    } else if (e.key === "Backspace") {
      handleDeleteClick();
    } else {
      if (gameState.guess.length < 5) {
        const tile = document.querySelector(
          `#guess-${gameState.guessCount}-tile-${gameState.guess.length + 1}`
        );
        tile.innerText = e.key;
        tile.classList.add("active");
        gameState.guess += e.key;
      }
    }
  }
};

// Attempts to submit
const handleEnterClick = () => {
  const valid = verifyGuess();
  if (valid) {
    const hints = generateHints(gameState.guess);
    flipTiles(hints);
    updateKeyboard(hints);
    gameState.guess = "";
    gameState.guessCount++;
    if (gameState.guessCount > 6 && !gameState.gameover) {
      setTimeout(() => {
        handleGameOver();
      }, 500);
    }
  }
};

// Removes last letter from current word
const handleDeleteClick = () => {
  if (gameState.guess.length > 0) {
    const tile = document.querySelector(
      `#guess-${gameState.guessCount}-tile-${gameState.guess.length}`
    );
    tile.innerText = "";
    tile.classList.remove("active");
    gameState.guess = gameState.guess.slice(0, -1);
  }
};

// Shows overlay and renders inner html
const showOverlay = (header, innerRender) => {
  overlay.classList.remove("hide-settings");
  menuHeading.textContent = header;
  innerRender();
  overlay.classList.add("show-settings");
};

// Removes overlay from view
const closeOverlay = () => {
  overlay.classList.remove("show-settings");
  overlay.classList.add("hide-settings");
  setTimeout(() => {
    menuContent.innerHTML = "";
  }, 300);
};

closeSettings.addEventListener("click", closeOverlay);
scoreButton.addEventListener("click", resetGame);
document.addEventListener("keydown", handleKeyboardPress);

helpButton.addEventListener(
  "click",
  () => {
    showOverlay("How To Play", renderHowTo);
  },
  false
);

settingsToggle.addEventListener(
  "click",
  () => {
    showOverlay("Settings", renderSettings);
  },
  false
);

gameboardInit();
keyboardInit();
generateAnswer();
