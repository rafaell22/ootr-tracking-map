import ButtonAddHint from '../classes/ButtonAddHint.js';
import domUtils from '../domUtils.js';

const alwaysHints = [
  {
    id: 'great-fairy',
    checks: [{
      id: 'hyrule-castle-fairy',
      description: 'HC Great Fairy',
    }, {
      id: 'ganon-castle-fairy',
      description: 'OGC Great Fairy',
    }]
  },
  {
    id: 'skull-mask',
    checks: [{
      id: 'skull-mask-deku-theater',
      description: 'Skull Mask - Deku Teatre',
    }]
  },
  {
    id: 'ice-cavern',
    checks: [{
      id: 'ice-cavern-final-reward',
      description: 'Ice Cavern final reward',
    },
    {
      id: 'ice-cavern-song',
      description: 'Ice Cavern song',
    }]
  },
  {
    id: 'frogs',
    checks: [{
      id: 'frogs-1',
      description: 'Frogs in the rain (storms)',
    }, {
      id: 'frogs-2',
      description: 'Frogs 2 (all songs)',
    }]
  },
  {
    id: 'skulltulas',
    checks: [{
      id: 'twenty-gold-skulls',
      description: '20 golden skulls',
    }, {
      id: 'thirty-gold-skulls',
      description: '30 golden skulls'
    }]
  },
  {
    id: 'bottle-big-poe',
    checks: [{
      id: 'big-poes',
      description: 'Big Poe redeem'
    }]
  }
];

export function addHints() {
  const hintsEl = domUtils.el('#hints');
  alwaysHints.forEach((hint) => {
    const hintContainer = document.createElement('div');
    hintContainer.classList.add('hint-container');
    hintContainer.innerHTML = `
      <img src="../../assets/${hint.id}_32x32.png" />
    `;
    hintsEl.append(hintContainer);
    hint.checks.forEach((check) => {
      const input = document.createElement('input');
      input.id = `${check.id}-add-item`;
      input.type = 'button';
      input.value = '+';
      hintContainer.append(input);
      new ButtonAddHint(input);
    });
  });
}
