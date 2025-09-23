import domUtils from '../domUtils.js';
import Item from './Item.js';
import pubSub from './PubSub.js';
import Point from './Point.js';

export default class ButtonAddItem {
  constructor(elButton, elItems) {
    this.elButton = elButton;
    this.elItems = elItems;

    domUtils.addListener(this.elButton, 'click', ((clickEvent) => {
      pubSub.unsubscribeAll('item-selected');
      pubSub.publish('show-select-items', new Point(
        clickEvent.x, 
        clickEvent.y,
      ));
      const subId = pubSub.subscribe('item-selected', (function(value, description) {
        const src = value;
        const itemName = description;
        const item = new Item(src, itemName);
        this.elItems.append(item.el());
        pubSub.unsubscribe('item-selected', subId);
      }).bind(this))
    }).bind(this));
  }
}
