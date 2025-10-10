import domUtils from '../domUtils.js';
import Item from './Item.js';
import pubSub from './PubSub.js';
import Point from './Point.js';
import inputManager from './InputManager.js';

export default class ButtonAddHint {
  constructor(elButton, locationId) {
    this.id = crypto.randomUUID();
    this.elButton = elButton;
    this.locationId = locationId;
    this.itemId = null;

    domUtils.addListener(this.elButton, 'click', (function(clickEvent) {
      pubSub.publish('show-select-items', this.id, new Point(
        clickEvent.x, 
        clickEvent.y,
      ));
    }).bind(this));

    inputManager.subscribe('contextmenu', (function(clickEvent) {
      if(clickEvent.target !== this.elButton) {
        return;
      }

      this.addItem.call(this, 'dead', 'Dead');
    }).bind(this))


    pubSub.subscribe('item-selected', (function(id, itemId, itemName) {
      if(id !== this.id) {
        return;
      }

      this.addItem.call(this, itemId, itemName)

    }).bind(this))
  }

  addItem(itemId, itemName) {
    const item = new Item(itemId, itemName, this.locationId);
    this.elButton.after(item.el());
    this.itemId = itemId;
    this.hide();
    pubSub.subscribe(`${this.itemId}-item-removed`, (function(locationId) {
      if(locationId !== this.locationId) {
        return;
      }

      this.show();
      this.itemId = null;
    }).bind(this), true);
  }

  hide() {
    domUtils.hide(this.elButton);
  }

  show() {
    domUtils.show(this.elButton);
  }
}
