import ButtonAddHint from '../classes/ButtonAddHint.js';
import domUtils from '../domUtils.js';

const sometimesHintsLocations = [
		'Biggoron - Claim Check',
		'Composer Torches',
		'Darunia\'s Joy',
		'Frogs in the Rain',
		'Goron City Hammer Chest',
		'Goron Pot',
		'HBA (1000)',
		'Bottom Fountain - Icy Waters',
		'Unfreeze King Zora',
		'Lab Dive',
		'Royal Tomb Torches',
		'Shadow Trial 2',
		'Shoot the Sun',
		'Skull Kid',
		'Sun\'s Song Grave',
		'Target in the Woods',
		'Treasure Chest Game',
		'Valley Rocks',
		'Haunted Wasteland',

		'Fire - Flare Dancer',
		'Fire - Pierre',
		'GTG - Final Reward',
		'GTG - Toilet',
		'Ice - Song',
		'Ice - Treasure',
		'Jabu - Stingers',
		'Shadow - Skull Pot',
		'Left Hand - Mirror Shield',
		'Right Hand - Silver Gauntlets',
		'Water - Central Pillar',
		'Water - Rolling Boulders',
		'Water - River Chest',
		
		'Dampe Race Rewards',
		'Royal Tomb - Song & Torches',
		'Adult Lake - POH & Fishing',
		'Child & Adult Fishing',
		'Bombchu Bowling',
		'Water - Dark Link & River',
		'Domain - Diving & Torches',
		'Hammer Chests - GC & Valley',
		'Hammer Chests - GC',
		'Hammer Chests - Valley',
		'Fire - Pierre & Hammer Chest',
		'Spirit - Right & Left Hands',
		'Spirit - Child Crawl Spaces',
		'Spirit - Adult ZL & Boulder Room',
		'Shadow - Invisible Blade Room',
		'Shadow - Boss Key Room',
		'Fire - Hammer Loop',
		'Darunia & Skull Kid',
		'Gerudo Valley - Crate & Waterfall',
		'Dead Hand in Well',
		'Spirit Trial',
];

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
	const locationsList = domUtils.datalist(sometimesHintsLocations, 'sometimes-hints-locations');

  document.body.appendChild(locationsList);

  const hintsEl = domUtils.el('#sometimes-hints');
  sometimesHints.forEach((hint, index) => {
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
    inputText.setAttribute('list', 'sometimes-hints-locations');
    hintContainer.append(inputText);
  });
}
