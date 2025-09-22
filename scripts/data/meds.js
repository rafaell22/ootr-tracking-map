import Med from '../classes/Med.js';
import domUtils from '../domUtils.js';

const meds = [
  {
    id: 'kokiri-emerald',
    name: 'Kokiri Emerald'
  },
  {
    id: 'goron-ruby',
    name: 'Goron Ruby'
  },
  {
    id: 'zora-sapphire',
    name: 'Zora Sapphire'
  },
  {
    id: 'light-med',
    name: 'Light Med'
  },
  {
    id: 'forest-med',
    name: 'Forest Med'
  },
  {
    id: 'fire-med',
    name: 'Fire Med'
  },
  {
    id: 'water-med',
    name: 'Water Med'
  },
  {
    id: 'shadow-med',
    name: 'Shadow Med'
  },
  {
    id: 'spirit-med',
    name: 'Spirit Med'
  },
];

export function addMeds() {
  const medsContainer = domUtils.el('#meds');
  meds.forEach((medData) => {
    const med = new Med(`../../assets/${medData.id}_32x32.png`, medData.name);
    med.appendTo(medsContainer);
  });
}
