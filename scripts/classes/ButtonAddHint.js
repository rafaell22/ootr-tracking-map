import domUtils from '../domUtils.js';
import Item from './Item.js';
import pubSub from './PubSub.js';
import Point from './Point.js';

export default class ButtonAddHint {
  constructor(elButton, location) {
    this.elButton = elButton;
    this.location = location;
    this.itemId = null;

    domUtils.addListener(this.elButton, 'click', (function(clickEvent) {
      pubSub.unsubscribeAll('item-selected');
      pubSub.publish('show-select-items', new Point(
        clickEvent.x, 
        clickEvent.y,
      ));

      const subIdSelect = pubSub.subscribe('item-selected', (function(value, description) {
        const src = value;
        const itemName = description;
        const item = new Item(src, itemName);
        this.elButton.after(item.el());
        this.itemId = src.replace('_32x32.png', '');
        this.hide();
        pubSub.unsubscribe('item-selected', subIdSelect);
        const subId = pubSub.subscribe(`${src.replace('_32x32.png', '')}-item-removed`, (function() {
          this.show();
          this.itemId = null;
          pubSub.unsubscribe(`${src.replace('_32x32.png', '')}-item-removed`, subId);
        }).bind(this));
      }).bind(this))
    }).bind(this));
  }

  hide() {
    domUtils.hide(this.elButton);
  }

  show() {
    domUtils.show(this.elButton);
  }
}
