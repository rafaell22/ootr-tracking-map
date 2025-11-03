import domUtils from '../domUtils.js';
import Item from './Item.js';
import pubSub from './PubSub.js';
import Point from './Point.js';
import AlwaysHintMarked from './events/AlwaysHintMarked.js';
import ItemSelectedEvent from './events/ItemSelectedEvent.js';
import ShowSelectItemsEvent from './events/ShowSelectItemsEvent.js';

export default class ButtonAddItem {
  constructor(elButton, elItems, locationId) {
    this.id = crypto.randomUUID();
    this.elButton = elButton;
    this.elItems = elItems;
    this.locationId = locationId;

    domUtils.addListener(this.elButton, 'click', (function(clickEvent) {
      pubSub.publish('show-select-items', new ShowSelectItemsEvent(this.id, new Point(
        clickEvent.x, 
        clickEvent.y,
      )));
    }).bind(this));


    pubSub.subscribe('item-selected', this.onItemSelected.bind(this));

    pubSub.subscribe('always-hint-marked', this.onAlwaysHintMarked.bind(this))
  }

  /**
    * @param {ItemSelectedEvent} event
    */
  onItemSelected(event) {
      if(event.anchorId !== this.id) {
        return;
      }

      this.addItem.call(this, event.itemId, event.itemName);
  }

  /**
    * @param {AlwaysHintMarked} event
    */
  onAlwaysHintMarked(event) {
    if(
      event.hintButtonId !== this.id ||
      event.locationId !== this.locationId ||
      event.itemId === 'dead'
    ) {
      return;
    }

    this.addItem.call(this, event.itemId, event.itemName);
  }

  addItem(itemId, itemName) {
    const item = new Item(this.id, itemId, itemName, this.locationId);
    this.elItems.append(item.el());
  }
}
