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
