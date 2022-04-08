export const keyboardButtons = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["Enter", "z", "x", "c", "v", "b", "n", "m", "Backspace"],
];

export const validKeys = [
  ...keyboardButtons[0],
  ...keyboardButtons[1],
  ...keyboardButtons[2],
];

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
    function: () => document.body.classList.toggle("dark-theme"),
  },
];

export const hintKey = {
  active: "active",
  match: "match",
  noMatch: "no-match",
  partial: "partial",
};

export const warnings = {
  tooShort: "Not enough letters",
  notWord: "Not in word list",
};

export const winMessages = {
  1: "Genius!",
  2: "Amazing",
  3: "Great Work",
  4: "Pretty Good",
  5: "Close One",
  6: "Phew.",
};

export const freshGameState = {
  answer: "",
  guess: "",
  guessCount: 1,
  gameover: false,
  prevGuesses: [],
};

export const helpParagraph =
  "Guess the SMURDLE in six tries. \n \n Each guess must be a valid five-letter word. Hit the enter button to submit. \n \n After each guess, the color of the tiles will change to show how close your guess was to the word.";

export const helpExamples = [
  {
    word: [
      { letter: "w", class: "match" },
      { letter: "a" },
      { letter: "t" },
      { letter: "c" },
      { letter: "h" },
    ],
    text: "The letter W is in the word and in the correct spot.",
  },
  {
    word: [
      { letter: "p" },
      { letter: "i", class: "partial" },
      { letter: "l" },
      { letter: "l" },
      { letter: "s" },
    ],
    text: "The letter I is in the word but in the wrong spot.",
  },
  {
    word: [
      { letter: "v" },
      { letter: "a" },
      { letter: "g" },
      { letter: "u", class: "no-match" },
      { letter: "e" },
    ],
    text: "The letter U is not in the word in any spot.",
  },
];
