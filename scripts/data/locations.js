// @ts-check
import LocationItems from '../classes/LocationItems.js';

export const locations = [
  { id: 'lon-lon', name: 'Lon Lon Ranch' },
  { id: 'lake', name: 'Lake' },
  { id: 'field', name: 'Hyrule Field' },
  { id: 'water-temple', name: 'Water' },
  { id: 'gerudo-valley', name: 'Gerudo Valley' },
  { id: 'gerudo-fortress', name: 'Gerudo Fortress' },
  { id: 'gerudo-training-grounds', name: 'GTG' },
  { id: 'wastelands', name: 'Wastelands' },
  { id: 'desert-colossus', name: 'Desert' },
  { id: 'spirit-temple', name: 'Spirit' },
  { id: 'hyrule-castle', name: 'Hyrule Castle' },
  { id: 'ganon-castle', name: 'Ganon Cst' },
  { id: 'market', name: 'Market' },
  { id: 'kokiri-forest', name: 'Kokiri Forest' },
  { id: 'deku-tree', name: 'Deku Tree' },
  { id: 'lost-woods', name: 'Lost Woods' },
  { id: 'sacred-forest-meadow', name: 'SFM' },
  { id: 'forest-temple', name: 'Forest' },
  { id: 'kakariko', name: 'Kakariko' },
  { id: 'bottom-of-the-well', name: 'BotWell' },
  { id: 'graveyard', name: 'Graveyard' },
  { id: 'shadow-temple', name: 'Shadow' },
  { id: 'zora-river', name: 'Zora River' },
  { id: 'zora-domain', name: 'Zora Domain' },
  { id: 'zora-fountain', name: 'Zora Fnt' },
  { id: 'ice-cavern', name: 'Ice Cavern' },
  { id: 'jabu-jabu', name: 'Jabu Jabu' },
  { id: 'death-mountain', name: 'Death Mt.' },
  { id: 'death-mountain-crater', name: 'Crater' },
  { id: 'goron-city', name: 'Goron City' },
  { id: 'dodongo-cavern', name: 'Dodongo' },
  { id: 'fire-temple', name: 'Fire Temple'},
];

export const locationItems = {};

export function addLocations() {
  const locationList = document.createElement('datalist');
  locationList.id = 'location-list';

  locations.forEach((location) => {
    const option = document.createElement('option');
    option.value = location.name;
    locationList.appendChild(option);

    locationItems[location.id] = new LocationItems(location.id, location.name);
  });

  document.body.appendChild(locationList);
}
