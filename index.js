const gameboard = [
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
];

const keyboardButtons = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["enter", "z", "x", "c", "v", "b", "n", "m", "delete"],
];

const gameContainer = document.querySelector("#game-container");
const keyboardContainer = document.querySelector("#keyboard-container");

let guess = "";
let guessCount = 1;
guessHistory = [];

const handleButtonClick = (e) => {
  const letter = e.target.getAttribute("key");
  if (guess.length < 5) {
    tile = document.querySelector(
      `#guess-${guessCount}-tile-${guess.length + 1}`
    );
    tile.innerText = letter.toUpperCase();
    guess += letter;
  }
  console.log(guess);
};

const handleEnterClick = () => {
  guessHistory.push(guess);
  guess = "";
  guessCount++;
};

const handleDeleteClick = () => {
  if (guess.length > 0) {
    tile = document.querySelector(`#guess-${guessCount}-tile-${guess.length}`);
    tile.innerText = "";
    guess = guess.slice(0, -1);
  }
};

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

gameboardInit();
keyboardInit();
