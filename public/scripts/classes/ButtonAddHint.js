import domUtils from '../domUtils.js';
import Item from './Item.js';
import pubSub from './PubSub.js';
import Point from './Point.js';
import inputManager from './InputManager.js';
import ItemRemovedEvent from './events/ItemRemovedEvent.js';
import AlwaysHintMarked from './events/AlwaysHintMarked.js';
import ItemSelectedEvent from './events/ItemSelectedEvent.js';
import ShowSelectItemsEvent from './events/ShowSelectItemsEvent.js';
import ItemAcquiredEvent from './events/ItemAcquiredEvent.js';

export default class ButtonAddHint {
  constructor(elButton, locationId) {
    this.id = crypto.randomUUID();
    this.elButton = elButton;
    this.locationId = locationId;
    this.itemId = null;

    domUtils.addListener(this.elButton, 'click', this.onClick.bind(this));

    inputManager.subscribe('contextmenu', this.onContextMenu.bind(this))


    pubSub.subscribe('item-selected', this.onItemSelected.bind(this));
    pubSub.subscribe('item-acquired', this.onItemAcquired.bind(this));
  }

  /**
    * @param {PointerEvent} clickEvent
    */
  onContextMenu(clickEvent) {
    if(clickEvent.target !== this.elButton) {
      return;
    }

    this.addItem.call(this, 'dead', 'Dead');
  }

  /**
    * @param {PointerEvent} clickEvent
    */
  onClick(clickEvent) {
    pubSub.publish('show-select-items', new ShowSelectItemsEvent(
      this.id, 
      new Point(
        clickEvent.x, 
        clickEvent.y,
      )
    ));
  }

  /**
    * @param {ItemAcquiredEvent} event
    */
  onItemAcquired(event) {
    if(
      event.itemId === 'dead' ||
      !this.item ||
      !this.locationId ||
      !event.locationId ||
      event.buttonId === this.id ||
      event.locationId !== this.locationId ||
      event.itemId !== this.itemId
    ) {
      return;
    }

    this.item.markAcquired.call(this.item);
  }

  /**
    * @param {ItemSelectedEvent} event
    */
  onItemSelected(event) {
    if(event.anchorId !== this.id) {
      return;
    }

    this.addItem.call(this, event.itemId, event.itemName)
  }

  addItem(itemId, itemName) {
    this.item = new Item(this.id, itemId, itemName, this.locationId);
    this.elButton.after(this.item.el());
    this.itemId = itemId;
    this.hide();
    pubSub.subscribe('item-removed', this.onItemRemoved.bind(this), true);

    pubSub.publish('always-hint-marked', new AlwaysHintMarked(this.id, this.locationId, itemId, itemName));
  }

  /**
    * @param {ItemRemovedEvent} event
    */
  onItemRemoved(event) {
    if(event.buttonId !== this.id) {
      pubSub.subscribe('item-removed', this.onItemRemoved.bind(this), true);
      return;
    }

    this.show();
    this.itemId = null;
    this.item = null;
  }

  hide() {
    domUtils.hide(this.elButton);
  }

  show() {
    domUtils.show(this.elButton);
  }
}
