// @ts-check
import Game from './classes/Game.js';
import inputManager from './classes/InputManager.js';
import SelectItems from './classes/SelectItems.js';
import domUtils from './domUtils.js';
import Point from './classes/Point.js';
import Line from './classes/Line.js';
import Rect from './classes/Rect.js';
import ContextMenu from './classes/ContextMenu.js';
import pubSub from './classes/PubSub.js';

import { addLocations } from './data/locations.js';
import { addHints } from './data/alwaysHints.js';
import { addMeds } from './data/meds.js';
import { addSongs } from './data/songs.js';
import SelectMedLocation from './classes/SelectMedLocation.js';
import {addSometimesHints} from './data/sometimesHints.js';

const game = new Game({});

game.setInitialize(async function() {
  await this.loadImages(['../assets/map.png']);
});

const map = new Rect(0, 0, 1340, 800);
let wasThereChanges = true;
pubSub.subscribe('new-change', () => {
  wasThereChanges = true;
});

game.setDraw(function() {
  if(wasThereChanges) {
    wasThereChanges = false;
    this.context.clear();
    this.context.drawImage(this.cache.images['../assets/map.png'], map.x, map.y, map.w, map.h);
    for(const line of lines) {
      line.draw(this.context);
    }
  }
});

game.mainloop.start();

const lines = [];
let point1;
let lineColor = '#0000ff';

inputManager.subscribe('click', function(clickEvent) {
  const clickPoint = new Point(clickEvent.pageX, clickEvent.pageY);
  if(
    (
      clickEvent.target.tagName === 'CANVAS' ||
      clickEvent.target.classList.contains('pass-click-through')
    ) &&
    map.isPointInside(clickPoint)
  ) {
    if(point1) {
      lines.push(new Line(point1, clickPoint, lineColor));
      point1 = null;
      pubSub.publish('new-change');
      return;
    }

    point1 = clickPoint;
  }
});

pubSub.subscribe('set-line-color', (color) => {
  lineColor = color;
});
pubSub.subscribe('remove-line', () => {
  lines.pop();
  pubSub.publish('new-change')
});

new SelectItems(domUtils.el('#select-items'));
new SelectMedLocation(domUtils.el('#select-med-location'));
new ContextMenu(domUtils.el('#context-menu'));
addLocations();
addHints();
addMeds();
addSongs();
addSometimesHints();


// ===============================================
let spoilerLog;
const loadSpoilerLog = document.querySelector('#load-spoiler-log');
domUtils.addListener(loadSpoilerLog, 'change', (event) => {
  const file = event.target.files[0];

  if(!file) {
    // handle file not selected
    return;
  }

  console.log(file.type);
  if(file.type !== 'application/json') {
    // handle wrong file type
  }
  console.log(event);

  const reader = new FileReader();
  reader.onload = () => {
    spoilerLog = JSON.parse(reader.result);
    console.log(spoilerLog)
  };
  reader.onerror = (e) => {
    console.log('Error reading file')
    console.log(e)
  };
  reader.readAsText(file);
});

const bosses = [
  'Barinade',
  'Morpha',
  'Phantom Ganon',
  'Queen Gohma',
  'Twinrova',
  'Volvagia'
]
const dungeons = [
  'Deku Tree',
  'Dodongos Cavern',
  'Fire Temple',
  'Forest Temple',
  'Jabu Jabus Belly',
  'Shadow Temple',
  'Spirit Temple',
  'Water Temple',
]
const spoilerLocations = [
  'Bottom of the Well',
  'Colossus',
  'DMC',
  'DMT',
  'Deku Theater',
  'GC',
  'GF',
  'GV',
  'Ganons Castle',
  'Gerudo Training Grounds',
  'Graveyard',
  'HC',
  'HF',
  'Ice Cavern',
  'KF',
  'Kak',
  'LH',
  'LLR',
  'LW',
  'Market',
  'OGC',
  'SFM',
  'ToT',
  'Wasteland',
  'ZD',
  'ZF',
  'ZR'
];
