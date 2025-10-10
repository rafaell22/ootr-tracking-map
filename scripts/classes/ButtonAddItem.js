import domUtils from '../domUtils.js';
import Item from './Item.js';
import pubSub from './PubSub.js';
import Point from './Point.js';

export default class ButtonAddItem {
  constructor(elButton, elItems, locationId) {
    this.id = crypto.randomUUID();
    this.elButton = elButton;
    this.elItems = elItems;
    this.locationId = locationId;

    domUtils.addListener(this.elButton, 'click', (function(clickEvent) {
      pubSub.publish('show-select-items', this.id, new Point(
        clickEvent.x, 
        clickEvent.y,
      ));
    }).bind(this));


    pubSub.subscribe('item-selected', (function(id, value, description) {
      if(id !== this.id) {
        return;
      }

      const src = value;
      const itemName = description;
      const item = new Item(src, itemName, locationId);
      this.elItems.append(item.el());
    }).bind(this))
  }
}
