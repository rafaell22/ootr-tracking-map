// @ts-check
import LocationItems from '../classes/LocationItems.js';
import domUtils from '../domUtils.js';

const locations = [
  { id: 'lon-lon', name: 'Lon Lon Ranch', 
    position: {
      x: 311,
      y: 161,
  }},
  { id: 'lake', name: 'Lake',
    position: {
      x: 260,
      y: 312,
    }
  },
  { id: 'field', name: 'Hyrule Field',
    position: {
      x: 347,
      y: 220,
    }
  },
  { id: 'water-temple', name: 'Water',
    position: {
      x: 253,
      y: 349,
    }
  },
  { id: 'gerudo-valley', name: 'Gerudo Valley', 
    position: {
      x: 163,
      y: 145,
    }
  },
  { id: 'gerudo-fortress', name: 'Gerudo Fortress',
    position: {
      x: 157,
      y: 92,
    }
  },
  { id: 'gerudo-training-grounds', name: 'GTG',
    position: {
      x: 129,
      y: 110,
    }
  },
  { id: 'wastelands', name: 'Wastelands',
    position: {
      x: 86,
      y: 87,
    }
  },
  { id: 'desert-colossus', name: 'Desert',
    position: {
      x: 43,
      y: 87,
    }
  },
  { id: 'spirit-temple', name: 'Spirit',
    position: {
      x: 14,
      y: 64,
    }
  },
  { id: 'hyrule-castle', name: 'Hyrule Castle',
    position: {
      x: 350,
      y: 46,
    }
  },
  { id: 'ganon-castle', name: 'Ganon Cst',
    position: {
      x: 350,
      y: 9,
    }
  },
  { id: 'market', name: 'Market',
    position: {
      x: 329,
      y: 83,
    }
  },
  { id: 'kokiri-forest', name: 'Kokiri Forest',
    position: {
      x: 530,
      y: 230,
    }
  },
  { id: 'deku-tree', name: 'Deku Tree',
    position: {
      x: 606,
      y: 193,
    }
  },
  { id: 'lost-woods', name: 'Lost Woods',
    position: {
      x: 525,
      y: 193,
    }
  },
  { id: 'sacred-forest-meadow', name: 'SFM',
    position: {
      x: 535,
      y: 165,
    }
  },
  { id: 'forest-temple', name: 'Forest',
    position: {
      x: 530,
      y: 147,
    }
  },
  { id: 'kakariko', name: 'Kakariko',
    position: {
      x: 415,
      y: 92,
    }
  },
  { id: 'bottom-of-the-well', name: 'BotWell',
    position: {
      x: 443,
      y: 83,
    }
  },
  { id: 'graveyard', name: 'Graveyard',
    position: {
      x: 479,
      y: 83,
    }
  },
  { id: 'shadow-temple', name: 'Shadow',
    position: {
      x: 508,
      y: 83,
    }
  },
  { id: 'zora-river', name: 'Zora River',
    position: {
      x: 515,
      y: 119,
    }
  },
  { id: 'zora-domain', name: 'Zora Domain',
    position: {
      x: 635,
      y: 110,
    }
  },
  { id: 'zora-fountain', name: 'Zora Fnt',
    position: {
      x: 615,
      y: 73,
    }
  },
  { id: 'ice-cavern', name: 'Ice Cavern',
    position: {
      x: 635,
      y: 37,
    }
  },
  { id: 'jabu-jabu', name: 'Jabu Jabu',
    position: {
      x: 640,
      y: 64,
    }
  },
  { id: 'death-mountain', name: 'Death Mt.',
    position: {
      x: 432,
      y: 57,
    }
  },
  { id: 'death-mountain-crater', name: 'Crater',
    position: {
      x: 440,
      y: 18,
    }
  },
  { id: 'goron-city', name: 'Goron City',
    position: {
      x: 405,
      y: 28,
    }
  },
  { id: 'dodongo-cavern', name: 'Dodongo',
    position: {
      x: 395,
      y: 55,
    }
  },
  { id: 'fire-temple', name: 'Fire Temple',
    position: {
      x: 486,
      y: 18,
    }
  },
];

export const locationItems = {};

export function addLocations() {
  const locationList = domUtils.datalist(locations.map(l => l.name), 'location-list');

  locations.forEach((location) => {
    locationItems[location.id] = new LocationItems(location.id, location.name, location.position);
  });

  document.body.appendChild(locationList);
}
