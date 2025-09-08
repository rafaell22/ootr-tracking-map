import ButtonAddItem from './classes/ButtonAddItem.js';
import Game from './classes/Game.js';
import InputManager from './classes/InputManager.js';
import SelectItems from './classes/SelectItems.js';
import domUtils from './domUtils.js';
import Point from './classes/Point.js';
import Line from './classes/Line.js';

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

const inputManager = new InputManager();
inputManager.subscribe('click', function(clickEvent) {
  if(clickEvent.target.tagName === 'CANVAS') {
    const newPoint = new Point(clickEvent.x, clickEvent.y);
    if(point1) {
      lines.push(new Line(point1, newPoint));
      point1 = null;
      return;
    }

    point1 = newPoint;
  }
});

inputManager.subscribe('contextmenu', function(clickEvent) {
  domUtils.toggle(contextMenu);
  contextMenu.style.left = `${clickEvent.x}px`;
  contextMenu.style.top = `${clickEvent.y}px`;
  domUtils.addListener.once('#undo', 'click', () => {
    lines.pop();
    domUtils.hide(contextMenu);
  });
})


const selectItems = new SelectItems(domUtils.el('#select-items'));

const lonLonButton = new ButtonAddItem(domUtils.el('#lon-lon-add-item'), domUtils.el('#lon-lon-items'), selectItems);
