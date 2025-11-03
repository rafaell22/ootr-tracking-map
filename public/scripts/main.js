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
import {addSometimesHints} from './data/sometimesHints.js';
import SetLineColorEvent from './classes/events/SetLineColorEvent.js';
//import './trainingMode.js';

const game = new Game({});

game.setInitialize(async function() {
  await this.loadImages(['./assets/map.png']);
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
    this.context.drawImage(this.cache.images['./assets/map.png'], map.x, map.y, map.w, map.h);
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

pubSub.subscribe('show-select-items', () => {
  point1 = null;
})

pubSub.subscribe('set-line-color', /** @param {SetLineColorEvent} event */ (event) => {
  lineColor = event.colorHex;
});
pubSub.subscribe('remove-line', () => {
  lines.pop();
  pubSub.publish('new-change')
});

new SelectItems(domUtils.el('#select-items'));
new ContextMenu(domUtils.el('#context-menu'));
addLocations();
addHints();
addMeds();
addSongs();
addSometimesHints();


// ===============================================
