import ButtonAddHint from '../classes/ButtonAddHint.js';
import domUtils from '../domUtils.js';

const sometimesHints = [
  {
    checks: 2
  },
  {
    checks: 2
  },
  {
    checks: 1
  },
  {
    checks: 1
  },
  {
    checks: 1
  },
  {
    checks: 1
  },
  {
    checks: 1
  },
  {
    checks: 1
  },
];

export function addSometimesHints() {
  const hintsEl = domUtils.el('#sometimes-hints');
  sometimesHints.forEach((hint) => {
    const hintContainer = document.createElement('div');
    hintContainer.classList.add('hint-container');
    hintsEl.append(hintContainer);
    for(let i = 0; i < hint.checks; i++) {
      const input = document.createElement('input');
      input.type = 'button';
      input.value = '+';
      hintContainer.append(input);
      new ButtonAddHint(input);
    }
    const inputText = document.createElement('INPUT');
    inputText.type = 'text';
    hintContainer.append(inputText);
  });
}
