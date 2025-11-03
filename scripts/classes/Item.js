import domUtils from '../domUtils.js';
import pubSub from './PubSub.js';
import ItemAcquiredEvent from './events/ItemAcquiredEvent.js';
import ItemRemovedEvent from './events/ItemRemovedEvent.js';

export default class Item {
  constructor(buttonId, itemId, itemName, locationId) {
    this.buttonId = buttonId;
    this.itemId = itemId;
    this.name = itemName;
    this.locationId = locationId;
    this.img = document.createElement('img');
    this.img.title = this.name;

    this.addGreyedOutImg();
  }

  addGreyedOutImg() {
    this.img.src = `assets/${this.itemId}-bw_32x32.png`;
    domUtils.addListener.once(this.img, 'click', this.acquire.bind(this));
  }

  addImg() {
    this.img.src = `assets/${this.itemId}_32x32.png`;
  }

  acquire() {
    pubSub.publish('item-acquired', new ItemAcquiredEvent(this.buttonId, this.itemId, this.name, this.locationId));
    this.addImg();
    domUtils.addListener(this.img, 'click', this.remove.bind(this));
  }

  markAcquired() {
    this.addImg();
    domUtils.addListener(this.img, 'click', this.remove.bind(this));
  }

  remove() {
    this.img.remove();
    pubSub.publish('item-removed', new ItemRemovedEvent(this.buttonId, this.itemId, this.name, this.locationId));
  }

  el() {
    return this.img;
  }
}
