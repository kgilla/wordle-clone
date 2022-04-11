import words from "./data/words.js";
import allowedGuesses from "./data/allowedGuesses.js";
import {
  keyboardButtons,
  validKeys,
  helpExamples,
  helpParagraph,
  hintKey,
  modalTitles,
  warnings,
  winMessages,
  freshGameState,
  settingsItems,
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

/* Things to do
  2) Add stats graph
*/

// Game State
let state = {
  game: {
    answer: "",
    guess: "",
    guessCount: 1,
    gameover: false,
    guessHistory: [],
    hintHistory: [],
  },
  stats: {
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
  },
  settings: {
    hardmode: false,
    darkmode: false,
  },
};

const saveState = () => {
  window.localStorage.setItem("state", JSON.stringify(state));
};

const loadState = () => {
  const stateSave = JSON.parse(window.localStorage.getItem("state"));
  if (stateSave) {
    state = stateSave;
    const { settings, game } = state;
    console.log(state);
    if (settings.darkmode) document.body.classList.toggle("dark-theme");
    if (game.guessHistory.length && !game.gameover) {
      game.guessHistory.forEach((guess, i) => {
        const hints = generateHints(guess, i + 1);
        hints.forEach((hint) => renderHint(hint));
        updateKeyboard(hints, false);
      });
    }
  }
};

// Game Functions

// Updates stats state
const updateStats = (win) => {
  const { stats } = state;
  if (win) {
    stats.winCount += 1;
    stats.streak += 1;
    stats.guessBreakdown[state.game.guessCount] += 1;
  } else {
    stats.streak = 0;
  }
  stats.gameCount += 1;
  saveState();
};

// Displays final message and pops up modal
const handleGameOver = (win) => {
  state.game.gameover = true;
  updateStats(win);
  createMessage(
    win ? winMessages[state.game.guessCount] : "Better Luck Next Time"
  );
  setTimeout(() => {
    createModal(true, win);
  }, 1500);
};

// Validates guess based on current settings
const verifyGuess = (guess) => {
  if (guess.length < 5) {
    createMessage(warnings.tooShort, true);
    return false;
  } else if (![...allowedGuesses, ...words].some((word) => word === guess)) {
    createMessage(warnings.notWord, true);
    return false;
  } else if (state.settings.hardmode && state.game.hintHistory.length) {
    return validateHardMode(guess);
  } else {
    return true;
  }
};

const validateHardMode = (guess) => {
  let valid = true;
  let letter = "";
  state.game.hintHistory.forEach((hint) => {
    const index = guess.indexOf(hint);
    if (index === -1) {
      valid = false;
      letter = hint;
    }
  });
  if (!valid) createMessage(warnings.mustContain(letter), true);
  return valid;
};

// Checks if every letter is correct
const checkWin = (guess) => {
  const isWin = guess.every((el) => el === "");
  if (isWin) handleGameOver(true);
};

// cycles through current guess and finds all exact matches
const findExactMatches = (guessCopy, answerCopy, hints, row) => {
  guessCopy.forEach((letter, i) => {
    const tile = document.querySelector(
      `#guess-${row || state.game.guessCount}-tile-${i + 1}`
    );
    if (row) tile.innerText = letter;
    const keyboardKey = document.querySelector(`#${letter}`);
    if (letter === state.game.answer[i]) {
      state.game.hintHistory.push(letter);
      answerCopy[i] = "";
      guessCopy[i] = "";
      hints.push({ index: i, tile, keyboardKey, class: hintKey.match });
    }
  });
  return [guessCopy, answerCopy, hints];
};

// cycles through remaining letters and finds partial matches
const findPartialMatches = (guessCopy, answerCopy, hints, row) => {
  guessCopy.forEach((letter, i) => {
    if (letter === "") return;
    const tile = document.querySelector(
      `#guess-${row || state.game.guessCount}-tile-${i + 1}`
    );
    if (row) tile.innerText = letter;
    const keyboardKey = document.querySelector(`#${letter}`);
    const index = answerCopy.findIndex((l) => l === letter);
    if (index !== -1) {
      state.game.hintHistory.push(letter);
      answerCopy[index] = "";
      guessCopy[i] = "";
      hints.push({ index: i, tile, keyboardKey, class: hintKey.partial });
    } else {
      hints.push({ index: i, tile, keyboardKey, class: hintKey.noMatch });
    }
  });
  return hints;
};

// Cycles through guess to reveal hints on gameboard and keyboard
const generateHints = (currentGuess, row) => {
  let guessCopy = currentGuess.split("");
  let answerCopy = [...state.game.answer];
  let hints = [];

  [guessCopy, answerCopy, hints] = findExactMatches(
    guessCopy,
    answerCopy,
    hints,
    row
  );

  checkWin(guessCopy);

  hints = findPartialMatches(guessCopy, answerCopy, hints, row);

  return hints.sort((hintA, hintB) => (hintA.index > hintB.index ? 1 : -1));
};

// Picks answer from pool
const generateAnswer = () => {
  state.game.answer = words[Math.floor(Math.random() * wordCount)].split("");
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
  state.game = { ...freshGameState };
  gameboardInit();
  keyboardInit();
  generateAnswer();
  saveState();
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
const updateKeyboard = (hints, delay = true) => {
  setTimeout(
    () => {
      hints.forEach((hint) => {
        hint.keyboardKey.classList.add(hint.class);
        if (
          hint.keyboardKey.classList.contains(hintKey.partial) &&
          hint.class === hintKey.match
        ) {
          hint.keyboardKey.classList.remove(hintKey.partial);
        }
      });
    },
    delay ? 1500 : 0
  );
};

// Creates messages for improper input and end of game
const createMessage = (message, isWarning = false) => {
  const row = document.querySelector(`#guess-${state.game.guessCount}`);
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
  const { winCount, gameCount, streak } = state.stats;
  const statsData = [
    { label: "Played", data: gameCount },
    { label: "Win%", data: Math.round((winCount / gameCount) * 100 || 0) },
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
const createModal = (gameover, isWin = false) => {
  const modalOverlay = createElement("div", { class: "modal-overlay" });

  const modal = createElement("div", { class: "main-modal" });

  const modalClose = closeSettings.cloneNode(true);
  modalClose.id = "modal-close-button";

  const heading = createElement("h2", {
    class: "modal-heading",
    innerText: gameover
      ? isWin
        ? modalTitles.win
        : modalTitles.loss
      : modalTitles.stats,
  });

  const modalBody = createElement("p", {
    class: "modal-text",
    innerText: `The word was ${state.game.answer.join("")}`,
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
  if (gameover) modal.appendChild(modalBody);
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
      class: state.settings[item.state] ? "toggle-active" : "toggle-inactive",
    });
    menuButton.classList.add("menu-item-button");

    const menuSwitch = createElement("span", { class: "menu-switch" });

    menuButton.addEventListener("click", () => {
      menuButton.classList.toggle("toggle-inactive");
      menuButton.classList.toggle("toggle-active");
      state.settings[item.state] = !state.settings[item.state];
      if (item.function) item.function();
      saveState();
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
  const container = createElement("div", { class: "help-container" });

  const firstParaContainer = createElement("div", {
    class: "help-section",
  });

  const firstPara = createElement("p", {
    class: "help-paragraph",
    innerText: helpParagraph,
  });

  const secondParaContainer = createElement("div", {
    class: "help-section",
  });

  const helpHeading = createElement("h4", {
    class: "help-heading",
    innerText: "Examples",
  });

  secondParaContainer.appendChild(helpHeading);

  helpExamples.forEach(({ word, text }) => {
    const row = createElement("div", { class: "game-row" });

    word.forEach((tile) => {
      const helpTile = createElement("div", {
        class: "game-tile",
        innerText: tile.letter,
      });
      helpTile.classList.add("help-tile");
      if (tile.class) helpTile.classList.add(tile.class);
      row.appendChild(helpTile);
    });

    const para = createElement("p", {
      class: "help-paragraph",
      innerText: text,
    });

    secondParaContainer.appendChild(row);
    secondParaContainer.appendChild(para);
  });

  firstParaContainer.appendChild(firstPara);
  container.appendChild(firstParaContainer);
  container.appendChild(secondParaContainer);
  menuContent.appendChild(container);
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
  if (state.game.guess.length < 5) {
    const tile = document.querySelector(
      `#guess-${state.game.guessCount}-tile-${state.game.guess.length + 1}`
    );
    tile.innerText = letter;
    tile.classList.add("active");
    state.game.guess += letter;
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
      if (state.game.guess.length < 5) {
        const tile = document.querySelector(
          `#guess-${state.game.guessCount}-tile-${state.game.guess.length + 1}`
        );
        tile.innerText = e.key;
        tile.classList.add("active");
        state.game.guess += e.key;
      }
    }
  }
};

// Attempts to submit
const handleEnterClick = () => {
  const valid = verifyGuess(state.game.guess);
  if (valid) {
    const hints = generateHints(state.game.guess);
    flipTiles(hints);
    updateKeyboard(hints);
    state.game.guessHistory.push(state.game.guess);
    state.game.guess = "";
    state.game.guessCount++;
    saveState();
    if (state.game.guessCount > 6 && !state.game.gameover) {
      setTimeout(() => {
        handleGameOver();
      }, 500);
    }
  }
};

// Removes last letter from current word
const handleDeleteClick = () => {
  if (state.game.guess.length > 0) {
    const tile = document.querySelector(
      `#guess-${state.game.guessCount}-tile-${state.game.guess.length}`
    );
    tile.innerText = "";
    tile.classList.remove("active");
    state.game.guess = state.game.guess.slice(0, -1);
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
scoreButton.addEventListener("click", () => {
  createModal(false);
});
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
loadState();
