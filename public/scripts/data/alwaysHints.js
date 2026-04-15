import ButtonAddHint from '../classes/ButtonAddHint.js';
import domUtils from '../domUtils.js';
//import { alwaysHints } from './s9/alwaysHints.js';
import { alwaysHints } from './scrubs/alwaysHints.js';

export const alwaysHintsButtons = {};

export function addHints() {
  const hintsEl = domUtils.el('#hints');

  alwaysHints.forEach((hint) => {
    const hintContainer = document.createElement('div');
    hintContainer.classList.add('hint-container');
    hintContainer.innerHTML = `
      <img src="./assets/${hint.id}_32x32.png" />
    `;
    hintsEl.append(hintContainer);
    hint.checks.forEach((check) => {
      const input = document.createElement('input');
      input.id = `${check.id}-add-item`;
      input.type = 'button';
      input.value = '+';
      hintContainer.append(input);
      alwaysHintsButtons[check.id] = new ButtonAddHint(input, check.location);
    });
  });

  return alwaysHintsButtons;
};
