// @ts-check
import Game from './classes/Game.js';
//import inputManager from './classes/InputManager.js';
import SelectItems from './classes/SelectItems.js';
import domUtils from './domUtils.js';
import ContextMenu from './classes/ContextMenu.js';
import pubSub from './classes/PubSub.js';

import { addLocations } from './data/locations.js';
//import { addHints } from './data/alwaysHints.js';
//import { addMeds } from './data/meds.js';
//import { addSongs } from './data/songs.js';
//import layout from './data/layouts/scrubsS7.js';
import layout from './data/layouts/escapeFromKak.js';
import {addSometimesHints} from './data/sometimesHints.js';
import ToggleableItem from './classes/ToggleableItem.js';
import ProgressiveItem from './classes/ProgressiveItem.js';
//import './trainingMode.js';
//import { recorder } from './recognizer.js';
import './classes/DragAndDropManager.js';
import DisplayItem from './classes/DisplayItem.js';
import TextHint from './classes/TextHint.js';
import Med from './classes/Med.js';
import Text from './classes/Text.js';
import TextLocation from './classes/TextLocation.js';
import Counter from './classes/Counter.js';

const game = new Game({
  canvas: {
    width: 687,
    height: 400,
  }
});

game.setInitialize(async function() {
  await this.loadImages(['./assets/map.png']);
  await this.loadImages(['./assets/location.png']);
});

let wasThereChanges = true;
pubSub.subscribe('new-change', () => {
  wasThereChanges = true;
});

game.setDraw(function() {
  if(wasThereChanges) {
    wasThereChanges = false;
    this.context.clear();
    this.context.drawImage(this.cache.images['./assets/map.png'], this.map.shape.x, this.map.shape.y, this.map.shape.w, this.map.shape.h);
    for(const line of this.map.lines) {
      line.draw(this.context);
    }
  }
});

game.mainloop.start();

new SelectItems(domUtils.el('#select-items'));
new ContextMenu(domUtils.el('#context-menu'));
addLocations();
//addHints();
//addMeds();
//addSongs();
addSometimesHints();

/**
inputManager.subscribe('mousedown', (event) => {
  console.log(event)
  if(event.target.id === 'voice') {
    if(recorder && recorder.start()) {
        console.log('Recording...')
    }
  }
});

inputManager.subscribe('mouseup', (event) => {
  if(event.target.id === 'voice') {
    recorder.stop();
    console.log('Recording stopped!')
  }
});
*/

// Testing new classes
const itemsContainer = document.querySelector('#items');

const createGridElement = (parent, gridEl) => {
  let el;
  switch(gridEl.type) {
    case 'ROW': 
      el = document.createElement('div');
      el.classList.add('row');
      if(gridEl.marginBottom) {
        el.style.marginBottom = gridEl.marginBottom;
      }
      parent.appendChild(el);
      gridEl.content.forEach(gridContentEl => createGridElement(el, gridContentEl));
      break;
    case 'COLUMN':
      el = document.createElement('div');
      el.classList.add('column');
      if(gridEl.marginRight) {
        el.style.marginRight = gridEl.marginRight;
      }
      parent.appendChild(el);
      gridEl.content.forEach(gridContentEl => createGridElement(el, gridContentEl));
      break;
    case 'DISPLAY':
      const displayItem = new DisplayItem(gridEl.id, gridEl.name);
      displayItem.appendTo(parent);
      break;
    case 'TOGGLEABLE':
      const toggleableItem = new ToggleableItem(gridEl.id, gridEl.name);
      toggleableItem.appendTo(parent);
      break;
    case 'PROGRESSIVE':
      const progressiveItem = new ProgressiveItem(gridEl.id, gridEl.name, gridEl.upgrades);
      progressiveItem.appendTo(parent);
      break;
    case 'UNKNOWN':
      const unknownItem = new ToggleableItem(null, null, 'unknown', true);
      unknownItem.appendTo(parent);
      break;
    case 'REWARD':
      const rewardItem = new Med(gridEl.id, gridEl.name);
      rewardItem.appendTo(parent);
      break;
    case 'TEXTHINT':
      const textHint = new TextHint();
      textHint.appendTo(parent);
      break;
    case 'TEXT':
      const text = new Text(gridEl.value);
      text.appendTo(parent);
      break;
    case 'TEXTLOCATION':
      const textLocation = new TextLocation();
      textLocation.appendTo(parent);
      break;
    case 'COUNTER':
      const counter = new Counter(gridEl.name, gridEl.value);
      counter.appendTo(parent);
  }
};


if(layout.backgroundColor) {
  itemsContainer.style.backgroundColor = layout.backgroundColor;
}

if(layout.width) {
  itemsContainer.style.width = layout.width;
}

layout.grid.forEach(gridEl => {
  createGridElement(itemsContainer, gridEl); 
});

