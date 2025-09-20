import ButtonAddItem from './classes/ButtonAddItem.js';
import Game from './classes/Game.js';
import InputManager from './classes/InputManager.js';
import SelectItems from './classes/SelectItems.js';
import domUtils from './domUtils.js';
import Point from './classes/Point.js';
import Line from './classes/Line.js';

import locations from './data/locations.js';

const game = new Game({});

game.setInitialize(async function() {
  await this.loadImages(['../assets/map.png']);
});

game.setDraw(function(interpolationPercentage) {
  this.context.clear();
  this.context.drawImage(this.cache.images['../assets/map.png'], 0, 0, 1340, 800);
  for(const line of lines) {
    line.draw(this.context);
  }
});

game.mainloop.start();

const contextMenu = document.querySelector('#context-menu');
const lines = [];
let point1;
let lineColor = '#0000ff';
const selectItems = new SelectItems(domUtils.el('#select-items'));

const inputManager = new InputManager();
inputManager.subscribe('click', function(clickEvent) {
  if(clickEvent.target.tagName === 'CANVAS') {
    console.log('clickEvent: ', clickEvent)
    const newPoint = new Point(clickEvent.pageX, clickEvent.pageY);
    if(point1) {
      lines.push(new Line(point1, newPoint, lineColor));
      point1 = null;
      return;
    }

    point1 = newPoint;
  }
});

inputManager.subscribe('contextmenu', function(clickEvent) {
  domUtils.toggle(contextMenu);
  selectItems.hide();
  contextMenu.style.left = `${clickEvent.x}px`;
  contextMenu.style.top = `${clickEvent.y}px`;
})

domUtils.addListener('#undo', 'click', () => {
  lines.pop();
  domUtils.hide(contextMenu);
});

domUtils.addListener('#foolish', 'click', () => {
  document.querySelectorAll('.remove-location').forEach(el => {
    domUtils.toggle(el);
  })
  selectItems.hide();
  domUtils.hide(contextMenu);
});

const colors = contextMenu.querySelectorAll('.color');
for(const color of colors) {
  domUtils.addListener(color, 'click', function() {
    lineColor = this.style.backgroundColor;
    const selectedColor = contextMenu.querySelector('.selected');
    selectedColor.classList.remove('selected');
    this.classList.add('selected');
  })
}

locations.forEach((location) => {
  const locationItems = document.createElement('div');
  locationItems.id = `${location.id}-items`;
  locationItems.classList.add('items');
  locationItems.innerHTML = `
    <span class="location-name">
      <input class="remove-location hidden" value="X" />${location.name}</span>
    <input id="${location.id}-add-item" type="button" value="+" />
  `;

  document.querySelector('body').append(locationItems);

  domUtils.addListener(locationItems.querySelector('.remove-location'), 'click', () => {
    //locationItems.remove(); 
    locationItems.innerHTML = `
      <span class="location-name">${location.name}</span>
    `;
  });
  new ButtonAddItem(domUtils.el(`#${location.id}-add-item`), domUtils.el(`#${location.id}-items`), selectItems);
});
